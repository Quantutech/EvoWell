import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { appointmentService } from '../../src/services/appointments';
import { mockStore } from '../../src/services/mockStore';
import { UserRole } from '../../src/types';

async function findAvailableSlot(providerId: string, exclude: Set<string> = new Set()) {
  for (let offset = 0; offset < 30; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() + offset);

    const slots = await appointmentService.getProviderAvailability(providerId, date, 60);
    const candidate = slots.find((slot) => !exclude.has(slot.start.toISOString()));
    if (candidate) return candidate.start;
  }

  throw new Error(`No available slots found for provider ${providerId}`);
}

describe('AppointmentService', () => {
  let snapshot: string;

  beforeEach(() => {
    snapshot = JSON.stringify(mockStore.store);
  });

  afterEach(() => {
    mockStore.store = JSON.parse(snapshot);
    mockStore.save();
  });

  it('books appointments in mock mode and blocks slot collisions', async () => {
    const provider = mockStore.store.providers[0];
    const client = mockStore.store.users.find((user) => user.role === UserRole.CLIENT);
    expect(provider).toBeTruthy();
    expect(client).toBeTruthy();

    const slot = await findAvailableSlot(provider.id);
    const appointmentId = await appointmentService.bookAppointment({
      providerId: provider.id,
      clientId: client!.id,
      dateTime: slot,
      durationMinutes: 60,
    });

    const created = mockStore.store.appointments.find((appointment) => appointment.id === appointmentId);
    expect(created).toBeTruthy();
    expect(created?.providerId).toBe(provider.id);

    await expect(
      appointmentService.bookAppointment({
        providerId: provider.id,
        clientId: client!.id,
        dateTime: slot,
        durationMinutes: 60,
      }),
    ).rejects.toMatchObject({ code: 'APPOINTMENT_COLLISION' });
  });

  it('prevents rescheduling into a conflicting slot', async () => {
    const provider = mockStore.store.providers[0];
    const clients = mockStore.store.users.filter((user) => user.role === UserRole.CLIENT);
    expect(provider).toBeTruthy();
    expect(clients.length).toBeGreaterThan(0);

    const slotA = await findAvailableSlot(provider.id);
    const slotB = await findAvailableSlot(provider.id, new Set([slotA.toISOString()]));

    const appointmentA = await appointmentService.bookAppointment({
      providerId: provider.id,
      clientId: clients[0].id,
      dateTime: slotA,
      durationMinutes: 60,
    });
    const appointmentB = await appointmentService.bookAppointment({
      providerId: provider.id,
      clientId: (clients[1] || clients[0]).id,
      dateTime: slotB,
      durationMinutes: 60,
    });

    expect(appointmentA).toBeTruthy();
    expect(appointmentB).toBeTruthy();

    await expect(
      appointmentService.rescheduleAppointment(appointmentB, slotA),
    ).rejects.toMatchObject({ code: 'APPOINTMENT_COLLISION' });
  });
});
