import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ClientDashboard from '../../../src/views/ClientDashboard';
import { UserRole } from '../../../src/types';

const mockGetAppointmentsForUser = vi.fn();
const mockGetClientProfile = vi.fn();
const mockGetClientJournalEntries = vi.fn();
const mockAddClientJournalEntry = vi.fn();
const mockUpdateClientProfile = vi.fn();
const mockUpdateUser = vi.fn();
const mockUploadFile = vi.fn();
const mockGetSavedProviders = vi.fn();
const mockAddToast = vi.fn();
const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock('@/App', () => ({
  useAuth: () => ({
    user: {
      id: 'u-client-001',
      email: 'alice@example.com',
      firstName: 'Alice',
      lastName: 'Miller',
      role: UserRole.CLIENT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    },
    login: (...args: unknown[]) => mockLogin(...args),
  }),
  useNavigation: () => ({
    navigate: (...args: unknown[]) => mockNavigate(...args),
  }),
}));

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ addToast: (...args: unknown[]) => mockAddToast(...args) }),
}));

vi.mock('@/components/dashboard/ClientDashboardLayout', () => ({
  __esModule: true,
  default: ({
    children,
    onTabChange,
  }: {
    children: React.ReactNode;
    onTabChange: (tab: string) => void;
  }) => (
    <div>
      <button onClick={() => onTabChange('home')}>My Health</button>
      <button onClick={() => onTabChange('journal')}>Health Journal</button>
      <button onClick={() => onTabChange('documents')}>Documents</button>
      <button onClick={() => onTabChange('wellness')}>Wellness Tracker</button>
      {children}
    </div>
  ),
}));

vi.mock('@/components/dashboard/tabs/client/ClientSupportTab', () => ({
  __esModule: true,
  default: () => <div>Support Tab</div>,
}));

vi.mock('@/components/dashboard/tabs/ClientSavedProviders', () => ({
  __esModule: true,
  default: () => <div>Saved Providers</div>,
}));

vi.mock('@/components/ui/AddressAutocomplete', () => ({
  __esModule: true,
  default: () => <div>Address Autocomplete</div>,
}));

vi.mock('@/components/ui/ProfileImage', () => ({
  __esModule: true,
  default: () => <div>ProfileImage</div>,
}));

vi.mock('@/services/api', () => ({
  api: {
    getAppointmentsForUser: (...args: unknown[]) => mockGetAppointmentsForUser(...args),
    getClientProfile: (...args: unknown[]) => mockGetClientProfile(...args),
    getClientJournalEntries: (...args: unknown[]) => mockGetClientJournalEntries(...args),
    addClientJournalEntry: (...args: unknown[]) => mockAddClientJournalEntry(...args),
    updateClientProfile: (...args: unknown[]) => mockUpdateClientProfile(...args),
    updateUser: (...args: unknown[]) => mockUpdateUser(...args),
  },
}));

vi.mock('@/services/storageService', () => ({
  storageService: {
    uploadFile: (...args: unknown[]) => mockUploadFile(...args),
  },
}));

vi.mock('@/services/wishlist.service', () => ({
  wishlistService: {
    getSavedProviders: (...args: unknown[]) => mockGetSavedProviders(...args),
  },
}));

function renderView() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ClientDashboard />
    </QueryClientProvider>,
  );
}

describe('ClientDashboard dynamic flows', () => {
  beforeEach(() => {
    const now = Date.now();
    mockGetAppointmentsForUser.mockResolvedValue([
      {
        id: 'appt-1',
        providerId: 'prov-1',
        clientId: 'u-client-001',
        dateTime: new Date(now + 5 * 60 * 1000).toISOString(),
        durationMinutes: 60,
        status: 'CONFIRMED',
        type: 'Video',
        paymentStatus: 'paid',
        meetingLink: 'https://meet.example.com/room-1',
      },
    ]);

    mockGetClientProfile.mockResolvedValue({
      id: 'cp-1',
      userId: 'u-client-001',
      intakeStatus: 'COMPLETED',
      documents: [
        {
          type: 'INTAKE_FORM',
          url: 'https://files.example.com/intake.pdf',
          uploadedAt: new Date(now - 3600_000).toISOString(),
        },
      ],
      habits: [],
      wellnessLog: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    mockGetClientJournalEntries.mockResolvedValue([
      {
        id: 'journal-1',
        userId: 'u-client-001',
        note: 'Initial journal note',
        createdAt: new Date(now - 1800_000).toISOString(),
      },
    ]);

    mockAddClientJournalEntry.mockResolvedValue({
      id: 'journal-2',
      userId: 'u-client-001',
      note: 'Follow-up note',
      createdAt: new Date().toISOString(),
    });

    mockUpdateClientProfile.mockResolvedValue(undefined);
    mockUpdateUser.mockResolvedValue(undefined);
    mockUploadFile.mockResolvedValue('https://files.example.com/new-upload.pdf');
    mockGetSavedProviders.mockResolvedValue([]);
    mockAddToast.mockReset();
    mockNavigate.mockReset();
    mockLogin.mockResolvedValue(undefined);
  });

  it('saves journal entries from the dynamic journal tab', async () => {
    renderView();

    fireEvent.click(screen.getByText('Health Journal'));
    expect(await screen.findByText(/Initial journal note/i)).toBeInTheDocument();

    fireEvent.change(
      screen.getByPlaceholderText('How are you feeling today? Any breakthroughs or challenges?'),
      { target: { value: 'Follow-up note' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Securely Save Entry' }));

    await waitFor(() => {
      expect(mockAddClientJournalEntry).toHaveBeenCalledWith('u-client-001', 'Follow-up note');
    });
  });

  it('uploads documents dynamically and persists via profile mutation', async () => {
    const { container } = renderView();

    fireEvent.click(screen.getByText('Documents'));
    await screen.findByText('My Documents');

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    const file = new File(['test content'], 'lab-report.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalled();
      expect(mockUpdateClientProfile).toHaveBeenCalled();
    });
  });
});
