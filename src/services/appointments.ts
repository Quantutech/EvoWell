import { supabase, isConfigured } from './supabase';
import { AppointmentStatus, AvailabilitySlot } from '../types';
import { api } from './api';
import { startOfDay, endOfDay, addMinutes, isBefore, format } from 'date-fns';
import { mockStore } from './mockStore';
import { notificationService } from './notifications';
import { realtimeHub } from './realtime/hub';
import { AppError, ErrorSeverity } from './error-handler';

class AppointmentService {
  private ensureCollections() {
    const store = mockStore.store as any;
    if (!Array.isArray(store.appointments)) {
      store.appointments = [];
    }
  }

  private parseTimeOnDate(date: Date, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  private hasCollision(
    providerId: string,
    dateTime: Date,
    durationMinutes: number,
    excludeAppointmentId?: string,
  ): boolean {
    const start = dateTime.getTime();
    const end = start + durationMinutes * 60 * 1000;

    return mockStore.store.appointments.some((appointment) => {
      if (appointment.providerId !== providerId) return false;
      if (excludeAppointmentId && appointment.id === excludeAppointmentId) return false;
      if (
        appointment.status === AppointmentStatus.CANCELLED ||
        appointment.status === AppointmentStatus.REJECTED
      ) {
        return false;
      }

      const otherStart = new Date(appointment.dateTime).getTime();
      const otherEnd = otherStart + (appointment.durationMinutes || 60) * 60 * 1000;
      return start < otherEnd && end > otherStart;
    });
  }

  private async notifyStatusChange(appointmentId: string, status: string) {
    const appointment = mockStore.store.appointments.find((item) => item.id === appointmentId);
    if (!appointment) return;

    const provider = mockStore.store.providers.find((item) => item.id === appointment.providerId);

    await notificationService.createNotification({
      userId: appointment.clientId,
      type: 'appointment',
      title: 'Appointment Updated',
      message: `Your appointment status is now ${status}.`,
      link: '/portal',
    });

    if (provider) {
      await notificationService.createNotification({
        userId: provider.userId,
        type: 'appointment',
        title: 'Appointment Updated',
        message: `Appointment ${appointmentId} is now ${status}.`,
        link: '/console/patients',
      });
    }
  }

  async getProviderAvailability(
    providerId: string,
    date: Date,
    durationMinutes: number = 60,
  ): Promise<AvailabilitySlot[]> {
    // 1. Fetch Provider Profile for Schedule & Blocked Dates
    const provider = await api.getProviderById(providerId);
    if (!provider) throw new Error('Provider not found');

    const availability = provider.availability;

    // 2. Fetch Existing Appointments for the day
    const startRange = startOfDay(date);
    const endRange = endOfDay(date);

    let existingAppointments: Array<{ date_time: string; duration_minutes?: number }> = [];

    if (!isConfigured) {
      this.ensureCollections();
      existingAppointments = mockStore.store.appointments
        .filter(
          (appointment) =>
            appointment.providerId === providerId &&
            appointment.status !== AppointmentStatus.CANCELLED &&
            appointment.status !== AppointmentStatus.REJECTED,
        )
        .filter((appointment) => {
          const dateTime = new Date(appointment.dateTime);
          return dateTime >= startRange && dateTime <= endRange;
        })
        .map((appointment) => ({
          date_time: appointment.dateTime,
          duration_minutes: appointment.durationMinutes,
        }));
    } else {
      const { data: existingAppts } = await supabase
        .from('appointments')
        .select('date_time, duration_minutes')
        .eq('provider_id', providerId)
        .neq('status', 'CANCELLED')
        .neq('status', 'REJECTED')
        .gte('date_time', startRange.toISOString())
        .lte('date_time', endRange.toISOString());

      existingAppointments = (existingAppts as any[]) || [];
    }

    // 3. Calculate Slots
    const slots: AvailabilitySlot[] = [];
    const dayName = format(date, 'EEE');

    const daySchedule = availability.schedule.find((schedule) => schedule.day === dayName && schedule.active);

    const isBlocked = availability.blockedDates.some(
      (blockedDate) => new Date(blockedDate).toDateString() === date.toDateString(),
    );

    if (!daySchedule || isBlocked) return [];

    for (const range of daySchedule.timeRanges) {
      const rangeStart = this.parseTimeOnDate(date, range.start);
      const rangeEnd = this.parseTimeOnDate(date, range.end);

      let cursor = rangeStart;

      while (addMinutes(cursor, durationMinutes) <= rangeEnd) {
        const slotEnd = addMinutes(cursor, durationMinutes);

        const isOverlap = existingAppointments.some((appointment) => {
          const appointmentStart = new Date(appointment.date_time);
          const appointmentEnd = addMinutes(appointmentStart, appointment.duration_minutes || 60);

          return (
            (cursor >= appointmentStart && cursor < appointmentEnd) ||
            (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
            (cursor <= appointmentStart && slotEnd >= appointmentEnd)
          );
        });

        const isPast = isBefore(cursor, new Date());

        if (!isOverlap && !isPast) {
          slots.push({
            start: cursor,
            end: slotEnd,
            available: true,
          });
        }

        cursor = addMinutes(cursor, durationMinutes);
      }
    }

    return slots;
  }

  async bookAppointment(data: {
    providerId: string;
    clientId: string;
    dateTime: Date;
    durationMinutes: number;
    servicePackageId?: string;
    notes?: string;
    amountCents?: number;
  }): Promise<string> {
    if (!isConfigured) {
      this.ensureCollections();

      if (this.hasCollision(data.providerId, data.dateTime, data.durationMinutes)) {
        throw new AppError(
          'Requested slot is no longer available.',
          'APPOINTMENT_COLLISION',
          ErrorSeverity.WARNING,
        );
      }

      const appointmentId = `appt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      mockStore.store.appointments.push({
        id: appointmentId,
        providerId: data.providerId,
        clientId: data.clientId,
        dateTime: data.dateTime.toISOString(),
        durationMinutes: data.durationMinutes,
        status: AppointmentStatus.PENDING,
        paymentStatus: (data.amountCents || 0) > 0 ? 'pending' : 'exempted',
        amountCents: data.amountCents,
        servicePackageId: data.servicePackageId,
        notes: data.notes,
        createdAt: new Date().toISOString(),
      });

      mockStore.save();

      const provider = mockStore.store.providers.find((item) => item.id === data.providerId);
      if (provider) {
        await notificationService.createNotification({
          userId: provider.userId,
          type: 'appointment',
          title: 'New Appointment Request',
          message: 'A client requested a new session.',
          link: '/console/patients',
        });
      }

      await notificationService.createNotification({
        userId: data.clientId,
        type: 'appointment',
        title: 'Appointment Requested',
        message: 'Your appointment request has been sent.',
        link: '/portal',
      });

      realtimeHub.publish('appointments', {
        action: 'created',
        appointmentId,
        providerId: data.providerId,
        clientId: data.clientId,
      });

      return appointmentId;
    }

    const { data: apptId, error } = await (supabase.rpc as any)('book_appointment', {
      p_provider_id: data.providerId,
      p_client_id: data.clientId,
      p_datetime: data.dateTime.toISOString(),
      p_duration: data.durationMinutes,
      p_service_package_id: data.servicePackageId || null,
      p_amount_cents: data.amountCents || 0,
      p_notes: data.notes || '',
    });

    if (error) throw error;
    return apptId;
  }

  async updateMeetingLink(appointmentId: string, link: string): Promise<void> {
    if (!isConfigured) {
      this.ensureCollections();
      const idx = mockStore.store.appointments.findIndex((appointment) => appointment.id === appointmentId);
      if (idx !== -1) {
        mockStore.store.appointments[idx] = {
          ...mockStore.store.appointments[idx],
          meetingLink: link,
        };
        mockStore.save();
        realtimeHub.publish('appointments', {
          action: 'updated',
          appointmentId,
          field: 'meetingLink',
          value: link,
        });
      }
      return;
    }

    const { error } = await (supabase
      .from('appointments') as any)
      .update({ meeting_link: link })
      .eq('id', appointmentId);

    if (error) throw error;
  }

  async updateStatus(appointmentId: string, status: string): Promise<void> {
    if (!isConfigured) {
      this.ensureCollections();
      const idx = mockStore.store.appointments.findIndex((appointment) => appointment.id === appointmentId);
      if (idx !== -1) {
        mockStore.store.appointments[idx] = {
          ...mockStore.store.appointments[idx],
          status: status as AppointmentStatus,
        };
        mockStore.save();
        await this.notifyStatusChange(appointmentId, status);
        realtimeHub.publish('appointments', {
          action: 'status-updated',
          appointmentId,
          status,
        });
      }
      return;
    }

    const { error } = await (supabase
      .from('appointments') as any)
      .update({ status })
      .eq('id', appointmentId);

    if (error) throw error;
  }

  async cancelAppointment(appointmentId: string, reason: string): Promise<void> {
    if (!isConfigured) {
      this.ensureCollections();
      const idx = mockStore.store.appointments.findIndex((appointment) => appointment.id === appointmentId);
      if (idx !== -1) {
        mockStore.store.appointments[idx] = {
          ...mockStore.store.appointments[idx],
          status: AppointmentStatus.CANCELLED,
          notes: reason
            ? `${mockStore.store.appointments[idx].notes || ''}\nCancellation reason: ${reason}`.trim()
            : mockStore.store.appointments[idx].notes,
        };
        mockStore.save();
        await this.notifyStatusChange(appointmentId, AppointmentStatus.CANCELLED);
        realtimeHub.publish('appointments', {
          action: 'status-updated',
          appointmentId,
          status: AppointmentStatus.CANCELLED,
        });
      }
      return;
    }

    const { error } = await (supabase
      .from('appointments') as any)
      .update({
        status: 'CANCELLED',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', appointmentId);

    if (error) throw error;
  }

  async rescheduleAppointment(appointmentId: string, newDateTime: Date): Promise<void> {
    if (!isConfigured) {
      this.ensureCollections();
      const idx = mockStore.store.appointments.findIndex((appointment) => appointment.id === appointmentId);
      if (idx !== -1) {
        const candidate = mockStore.store.appointments[idx];
        if (this.hasCollision(candidate.providerId, newDateTime, candidate.durationMinutes || 60, appointmentId)) {
          throw new AppError(
            'Requested reschedule slot is already booked.',
            'APPOINTMENT_COLLISION',
            ErrorSeverity.WARNING,
          );
        }

        mockStore.store.appointments[idx] = {
          ...mockStore.store.appointments[idx],
          dateTime: newDateTime.toISOString(),
          status: AppointmentStatus.PENDING,
        };
        mockStore.save();
        await this.notifyStatusChange(appointmentId, AppointmentStatus.PENDING);
        realtimeHub.publish('appointments', {
          action: 'rescheduled',
          appointmentId,
          dateTime: newDateTime.toISOString(),
        });
      }
      return;
    }

    const { error } = await (supabase
      .from('appointments') as any)
      .update({
        date_time: newDateTime.toISOString(),
        status: 'PENDING',
      })
      .eq('id', appointmentId);

    if (error) throw error;
  }
}

export const appointmentService = new AppointmentService();
