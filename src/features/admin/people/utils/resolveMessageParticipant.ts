import { Conversation, User } from '../../../../types';

interface ResolveConversationParticipantParams {
  conversation: Conversation;
  currentUserId?: string | null;
  usersById: Record<string, User>;
}

export function resolveConversationParticipantDisplayName({
  conversation,
  currentUserId,
  usersById,
}: ResolveConversationParticipantParams): string {
  const { participant_1_id: p1, participant_2_id: p2 } = conversation;

  const otherParticipantId =
    currentUserId && p1 === currentUserId
      ? p2
      : currentUserId && p2 === currentUserId
        ? p1
        : p1;

  const otherUser = usersById[otherParticipantId];
  if (otherUser) {
    const fullName = `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim();
    if (fullName.length > 0) return fullName;
    if (otherUser.email) return otherUser.email;
  }

  return `User: ${otherParticipantId}`;
}
