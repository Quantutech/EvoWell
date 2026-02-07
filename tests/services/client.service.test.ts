import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clientService } from '../../src/services/client.service';
import { mockStore } from '../../src/services/mockStore';
import { UserRole } from '../../src/types';

describe('ClientService', () => {
  let snapshot: string;

  beforeEach(() => {
    snapshot = JSON.stringify(mockStore.store);
  });

  afterEach(() => {
    mockStore.store = JSON.parse(snapshot);
    mockStore.save();
  });

  it('sends messages and clears unread count after markAsRead', async () => {
    const sender = mockStore.store.users[0];
    const receiver = mockStore.store.users[1];

    const conversation = await clientService.getOrCreateConversation(sender.id, receiver.id);
    const message = await clientService.sendMessage({
      conversationId: conversation.id,
      senderId: sender.id,
      text: 'Test support message',
    });

    expect(message.conversation_id).toBe(conversation.id);
    expect(message.sender_id).toBe(sender.id);
    expect(message.receiver_id).toBe(receiver.id);

    const unreadBefore = await clientService.getUnreadCount(receiver.id);
    expect(unreadBefore).toBeGreaterThan(0);

    await clientService.markAsRead(conversation.id, receiver.id);
    const unreadAfter = await clientService.getUnreadCount(receiver.id);

    expect(unreadAfter).toBe(0);
  });

  it('persists and returns journal entries in descending order', async () => {
    const user = mockStore.store.users.find((candidate) => candidate.role === UserRole.CLIENT);
    expect(user).toBeTruthy();

    await clientService.addClientJournalEntry(user!.id, 'First entry');
    await new Promise((resolve) => setTimeout(resolve, 5));
    await clientService.addClientJournalEntry(user!.id, 'Second entry');

    const entries = await clientService.getClientJournalEntries(user!.id);

    expect(entries.length).toBeGreaterThanOrEqual(2);
    expect(entries[0].note).toBe('Second entry');
    expect(entries[1].note).toBe('First entry');
  });
});
