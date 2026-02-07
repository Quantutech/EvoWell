import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminMessagesTab from '../../../src/components/dashboard/tabs/admin/AdminMessagesTab';
import { User, UserRole } from '../../../src/types';

const mockGetConversations = vi.fn();
const mockSendMessage = vi.fn();
const mockMarkAsRead = vi.fn();
const mockUseRealtimeMessages = vi.fn();

vi.mock('@/App', () => ({
  useAuth: () => ({
    user: {
      id: 'u-admin-001',
      email: 'admin@evowell.com',
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    },
  }),
}));

vi.mock('@/hooks/useRealtime', () => ({
  useRealtimeMessages: (...args: unknown[]) => mockUseRealtimeMessages(...args),
}));

vi.mock('@/services/api', () => ({
  api: {
    getConversations: (...args: unknown[]) => mockGetConversations(...args),
    sendMessage: (...args: unknown[]) => mockSendMessage(...args),
    markAsRead: (...args: unknown[]) => mockMarkAsRead(...args),
  },
}));

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

function createUsers(): User[] {
  return [
    {
      id: 'u-admin-001',
      email: 'admin@evowell.com',
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    },
    {
      id: 'u-client-001',
      email: 'alice@example.com',
      firstName: 'Alice',
      lastName: 'Miller',
      role: UserRole.CLIENT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    },
  ];
}

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminMessagesTab users={createUsers()} />
    </QueryClientProvider>,
  );
}

describe('AdminMessagesTab', () => {
  beforeEach(() => {
    mockGetConversations.mockResolvedValue([
      {
        id: 'conv-1',
        participant_1_id: 'u-admin-001',
        participant_2_id: 'u-client-001',
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ]);

    mockUseRealtimeMessages.mockReturnValue({
      messages: [
        {
          id: 'msg-1',
          conversation_id: 'conv-1',
          sender_id: 'u-client-001',
          receiver_id: 'u-admin-001',
          content: 'Need help with my account.',
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ],
      isLoading: false,
    });

    mockSendMessage.mockResolvedValue({
      id: 'msg-2',
      conversation_id: 'conv-1',
      sender_id: 'u-admin-001',
      receiver_id: 'u-client-001',
      content: 'Happy to help.',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    mockMarkAsRead.mockResolvedValue(undefined);
  });

  it('resolves participant identity with real user names', async () => {
    renderComponent();

    expect(await screen.findByText('Alice Miller')).toBeInTheDocument();
    expect(screen.queryByText('Unknown User')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith('conv-1', 'u-admin-001');
    });
  });

  it('sends a reply using the selected conversation', async () => {
    renderComponent();

    await screen.findByText('Alice Miller');

    fireEvent.change(screen.getByPlaceholderText('Type a message...'), {
      target: { value: 'Thanks for reaching out.' },
    });
    const sendButton = screen.getByRole('button', { name: 'Send' });
    const form = sendButton.closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        senderId: 'u-admin-001',
        text: 'Thanks for reaching out.',
      });
    });
  });
});
