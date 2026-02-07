import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProviderPatients from '../../../src/components/dashboard/tabs/ProviderPatients';
import { AppointmentStatus, AppointmentType } from '../../../src/types';

const mockGetProviderClientNote = vi.fn();
const mockUpsertProviderClientNote = vi.fn();

vi.mock('@/App', () => ({
  useAuth: () => ({
    provider: { id: 'prov-1' },
  }),
}));

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock('@/services/api', () => ({
  api: {
    getProviderClientNote: (...args: unknown[]) => mockGetProviderClientNote(...args),
    upsertProviderClientNote: (...args: unknown[]) => mockUpsertProviderClientNote(...args),
  },
}));

vi.mock('../../../src/components/booking/AppointmentCard', () => ({
  __esModule: true,
  default: ({ appointment }: any) => (
    <div data-testid="appointment-card">{appointment.id}</div>
  ),
}));

describe('ProviderPatients', () => {
  beforeEach(() => {
    mockGetProviderClientNote.mockResolvedValue('Initial clinical note');
    mockUpsertProviderClientNote.mockResolvedValue(undefined);
  });

  it('builds patient registry from appointment data and allows searching', async () => {
    render(
      <ProviderPatients
        appointments={[
          {
            id: 'appt-1',
            providerId: 'prov-1',
            clientId: 'u-client-1',
            dateTime: new Date().toISOString(),
            durationMinutes: 60,
            status: AppointmentStatus.PENDING,
            type: AppointmentType.VIDEO,
            paymentStatus: 'pending',
            client: { firstName: 'Alice', lastName: 'Miller', email: 'alice@example.com' },
          },
          {
            id: 'appt-2',
            providerId: 'prov-1',
            clientId: 'u-client-2',
            dateTime: new Date(Date.now() - 86_400_000).toISOString(),
            durationMinutes: 60,
            status: AppointmentStatus.COMPLETED,
            type: AppointmentType.PHONE,
            paymentStatus: 'paid',
            client: { firstName: 'Brian', lastName: 'Stone', email: 'brian@example.com' },
          },
        ]}
        availability={{ days: [], hours: [], schedule: [], blockedDates: [] }}
        onUpdateAvailability={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Patient Registry/i }));

    expect(screen.getByText('Alice Miller')).toBeInTheDocument();
    expect(screen.getByText('Brian Stone')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Search patients by name or email...'), {
      target: { value: 'alice' },
    });

    expect(screen.getByText('Alice Miller')).toBeInTheDocument();
    expect(screen.queryByText('Brian Stone')).not.toBeInTheDocument();
  });

  it('loads and saves provider notes for a selected client', async () => {
    render(
      <ProviderPatients
        appointments={[
          {
            id: 'appt-1',
            providerId: 'prov-1',
            clientId: 'u-client-1',
            dateTime: new Date().toISOString(),
            durationMinutes: 60,
            status: AppointmentStatus.CONFIRMED,
            type: AppointmentType.VIDEO,
            paymentStatus: 'pending',
            client: { firstName: 'Alice', lastName: 'Miller', email: 'alice@example.com' },
          },
        ]}
        availability={{ days: [], hours: [], schedule: [], blockedDates: [] }}
        onUpdateAvailability={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Patient Registry/i }));
    fireEvent.click(screen.getByText('Alice Miller'));

    const noteBox = await screen.findByPlaceholderText('Private note for this client...');
    expect(noteBox).toHaveValue('Initial clinical note');

    fireEvent.change(noteBox, { target: { value: 'Updated provider note' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Note/i }));

    await waitFor(() => {
      expect(mockUpsertProviderClientNote).toHaveBeenCalledWith(
        'prov-1',
        'u-client-1',
        'Updated provider note',
      );
    });
  });
});
