
import { supabase, isConfigured } from './supabase';
import { Appointment, AvailabilitySlot, ProviderProfile, Availability } from '../types';
import { api } from './api';
import { startOfDay, endOfDay, addMinutes, isBefore, format, parseISO } from 'date-fns';
import { formatInTimezone } from '../utils/timezone';
import { SEED_DATA } from './seedData';

class AppointmentService {
  
  /**
   * Calculates available slots for a provider given a date range.
   * Merges provider schedule, blocked dates, and existing appointments.
   */
  async getProviderAvailability(
    providerId: string, 
    date: Date,
    durationMinutes: number = 60
  ): Promise<AvailabilitySlot[]> {
    if (!isConfigured) return this.mockAvailability(date);

    // 1. Fetch Provider Profile for Schedule & Blocked Dates
    const provider = await api.getProviderById(providerId);
    if (!provider) throw new Error('Provider not found');

    const availability = provider.availability;
    const timezone = provider.timezone || 'UTC';

    // 2. Fetch Existing Appointments for the day
    const startRange = startOfDay(date).toISOString();
    const endRange = endOfDay(date).toISOString();
    
    const { data: existingAppts } = await supabase
      .from('appointments')
      .select('date_time, duration_minutes')
      .eq('provider_id', providerId)
      .neq('status', 'CANCELLED')
      .neq('status', 'REJECTED')
      .gte('date_time', startRange)
      .lte('date_time', endRange);

    // 3. Calculate Slots
    const slots: AvailabilitySlot[] = [];
    const dayName = format(date, 'EEE'); // "Mon", "Tue", etc.
    
    // Find schedule for this day
    const daySchedule = availability.schedule.find(s => s.day === dayName && s.active);
    
    // Check blocked dates
    const isBlocked = availability.blockedDates.some(
      blockedDate => new Date(blockedDate).toDateString() === date.toDateString()
    );

    if (!daySchedule || isBlocked) return [];

    // Generate all potential slots from timeRanges
    for (const range of daySchedule.timeRanges) {
      // Parse "09:00" to actual Date objects for the target day
      const rangeStart = this.parseTimeOnDate(date, range.start);
      const rangeEnd = this.parseTimeOnDate(date, range.end);
      
      let cursor = rangeStart;

      while (addMinutes(cursor, durationMinutes) <= rangeEnd) {
        const slotEnd = addMinutes(cursor, durationMinutes);
        
        // Check collision with existing appointments
        const isOverlap = existingAppts?.some(appt => {
          const apptStart = new Date(appt.date_time);
          const apptEnd = addMinutes(apptStart, appt.duration_minutes || 60);
          
          return (
            (cursor >= apptStart && cursor < apptEnd) || // Slot starts inside appt
            (slotEnd > apptStart && slotEnd <= apptEnd) || // Slot ends inside appt
            (cursor <= apptStart && slotEnd >= apptEnd) // Slot encompasses appt
          );
        });

        // Check if in past
        const isPast = isBefore(cursor, new Date());

        if (!isOverlap && !isPast) {
          slots.push({
            start: cursor,
            end: slotEnd,
            available: true
          });
        }

        // Increment cursor
        cursor = addMinutes(cursor, durationMinutes); // Or smaller increments (e.g. 30) for more options
      }
    }

    return slots;
  }

  private parseTimeOnDate(date: Date, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  /**
   * Books an appointment using a secure RPC call to handle locking.
   */
  async bookAppointment(data: {
    providerId: string;
    clientId: string;
    dateTime: Date;
    durationMinutes: number;
    servicePackageId?: string;
    notes?: string;
    amountCents?: number;
  }): Promise<string> {
    if (!isConfigured) return 'mock-appt-id';

    const { data: apptId, error } = await supabase.rpc('book_appointment', {
      p_provider_id: data.providerId,
      p_client_id: data.clientId,
      p_datetime: data.dateTime.toISOString(),
      p_duration: data.durationMinutes,
      p_service_package_id: data.servicePackageId || null,
      p_amount_cents: data.amountCents || 0,
      p_notes: data.notes || ''
    });

    if (error) throw error;
    return apptId;
  }

  async updateMeetingLink(appointmentId: string, link: string): Promise<void> {
    if (!isConfigured) {
        const appt = SEED_DATA.appointments.find(a => a.id === appointmentId);
        if (appt) {
            appt.meetingLink = link;
        }
        return;
    }
    const { error } = await supabase
      .from('appointments')
      .update({ meeting_link: link })
      .eq('id', appointmentId);
    
    if (error) throw error;
  }

  async updateStatus(appointmentId: string, status: string): Promise<void> {
    if (!isConfigured) {
        // Mock success
        const appt = SEED_DATA.appointments.find(a => a.id === appointmentId);
        if (appt) {
            (appt as any).status = status;
        }
        return;
    }

    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId);

    if (error) throw error;
  }

  async cancelAppointment(appointmentId: string, reason: string): Promise<void> {
    if (!isConfigured) return;

    const { error } = await supabase
      .from('appointments')
      .update({ 
        status: 'CANCELLED', 
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (error) throw error;
  }

  async rescheduleAppointment(appointmentId: string, newDateTime: Date): Promise<void> {
    if (!isConfigured) return;

    // Use RPC if available for checking, or just update and let exclusion constraint fail if overlap
    // For simplicity, updating directly, relying on constraint.
    const { error } = await supabase
      .from('appointments')
      .update({
        date_time: newDateTime.toISOString(),
        status: 'PENDING' // Reset to pending if needed or keep confirmed depending on policy
      })
      .eq('id', appointmentId);

    if (error) throw error;
  }

  // --- Mock Fallback ---
  private mockAvailability(date: Date): AvailabilitySlot[] {
    const slots: AvailabilitySlot[] = [];
    for (let i = 9; i < 17; i++) {
      const start = new Date(date);
      start.setHours(i, 0, 0, 0);
      const end = addMinutes(start, 60);
      if (Math.random() > 0.3) { // Randomly available
        slots.push({ start, end, available: true });
      }
    }
    return slots;
  }
}

export const appointmentService = new AppointmentService();
