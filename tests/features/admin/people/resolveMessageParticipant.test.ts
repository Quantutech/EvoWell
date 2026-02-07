import { describe, expect, it } from 'vitest';
import { resolveConversationParticipantDisplayName } from '../../../../src/features/admin/people/utils/resolveMessageParticipant';
import { Conversation, User, UserRole } from '../../../../src/types';

function createUser(overrides: Partial<User>): User {
  return {
    id: overrides.id || 'user-1',
    email: overrides.email || 'user@example.com',
    firstName: overrides.firstName ?? 'First',
    lastName: overrides.lastName ?? 'Last',
    role: overrides.role || UserRole.CLIENT,
    createdAt: overrides.createdAt || new Date().toISOString(),
    updatedAt: overrides.updatedAt || new Date().toISOString(),
    isDeleted: overrides.isDeleted || false,
  };
}

describe('resolveConversationParticipantDisplayName', () => {
  const conversation: Conversation = {
    id: 'conversation-1',
    participant_1_id: 'admin-id',
    participant_2_id: 'client-id',
    last_message_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  it('returns full name when available', () => {
    const name = resolveConversationParticipantDisplayName({
      conversation,
      currentUserId: 'admin-id',
      usersById: {
        'client-id': createUser({ id: 'client-id', firstName: 'Client', lastName: 'Person', email: 'client@example.com' }),
      },
    });

    expect(name).toBe('Client Person');
  });

  it('falls back to email when name is empty', () => {
    const name = resolveConversationParticipantDisplayName({
      conversation,
      currentUserId: 'admin-id',
      usersById: {
        'client-id': createUser({ id: 'client-id', firstName: '', lastName: '', email: 'client-email-only@example.com' }),
      },
    });

    expect(name).toBe('client-email-only@example.com');
  });

  it('falls back to stable user id label when user is unknown', () => {
    const name = resolveConversationParticipantDisplayName({
      conversation,
      currentUserId: 'admin-id',
      usersById: {},
    });

    expect(name).toBe('User: client-id');
  });
});
