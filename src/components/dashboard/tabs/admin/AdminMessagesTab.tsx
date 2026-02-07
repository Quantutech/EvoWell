import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Conversation } from '@/types';
import { api } from '@/services/api';
import { useAuth } from '@/App';
import { useRealtimeMessages } from '@/hooks/useRealtime';
import { resolveConversationParticipantDisplayName } from '@/features/admin/people/utils/resolveMessageParticipant';
import { useToast } from '@/contexts/ToastContext';

interface AdminMessagesTabProps {
  users: User[];
}

const AdminMessagesTab: React.FC<AdminMessagesTabProps> = ({ users }) => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const usersById = useMemo(
    () =>
      users.reduce<Record<string, User>>((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {}),
    [users],
  );

  const {
    data: conversations = [],
    isLoading: isConversationsLoading,
  } = useQuery({
    queryKey: ['adminConversations'],
    queryFn: () => api.getConversations(),
    refetchInterval: 15000,
    enabled: !!currentUser,
  });

  const { messages, isLoading: messagesLoading } = useRealtimeMessages(selectedConvId);

  const sendMutation = useMutation({
    mutationFn: (input: { conversationId: string; senderId: string; text: string }) =>
      api.sendMessage(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminConversations'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: ({ conversationId, userId }: { conversationId: string; userId: string }) =>
      api.markAsRead(conversationId, userId),
  });

  useEffect(() => {
    if (!selectedConvId && conversations.length > 0) {
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, selectedConvId]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!selectedConvId || !currentUser || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.receiver_id === currentUser.id && !lastMessage.is_read) {
      markReadMutation.mutate({
        conversationId: selectedConvId,
        userId: currentUser.id,
      });
    }
  }, [messages, selectedConvId, currentUser, markReadMutation]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!replyText.trim() || !selectedConvId || !currentUser) return;

    try {
      await sendMutation.mutateAsync({
        conversationId: selectedConvId,
        senderId: currentUser.id,
        text: replyText.trim(),
      });
      setReplyText('');
    } catch {
      addToast('error', 'Failed to send message.');
    }
  };

  const getOtherParticipant = (conversation: Conversation) =>
    resolveConversationParticipantDisplayName({
      conversation,
      currentUserId: currentUser?.id,
      usersById,
    });

  if (isConversationsLoading) {
    return <div className="p-10 text-center animate-pulse">Loading Inbox...</div>;
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-[700px] flex animate-in fade-in slide-in-from-bottom-2">
      <div className="w-1/3 border-r border-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-black text-slate-900">Inbox</h3>
        </div>
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConvId(conversation.id)}
              className={`w-full text-left p-6 border-b border-slate-50 hover:bg-slate-50 transition-all ${
                selectedConvId === conversation.id ? 'bg-blue-50' : ''
              }`}
            >
              <p className="font-bold text-sm text-slate-900">{getOtherParticipant(conversation)}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {new Date(conversation.last_message_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="w-2/3 flex flex-col bg-slate-50/30">
        {selectedConvId ? (
          <>
            <div ref={scrollRef} className="flex-grow p-8 overflow-y-auto custom-scrollbar space-y-4">
              {messagesLoading ? (
                <div className="text-center text-slate-400 text-xs">Loading history...</div>
              ) : (
                messages.map((message) => {
                  const isMe = message.sender_id === currentUser?.id;
                  return (
                    <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`p-4 max-w-[80%] rounded-2xl text-sm ${
                          isMe
                            ? 'bg-slate-900 text-white'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p
                          className={`text-[9px] mt-2 opacity-70 ${
                            isMe ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-6 bg-white border-t border-slate-100">
              <form onSubmit={handleSend} className="flex gap-4">
                <input
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  className="flex-grow bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Type a message..."
                />
                <button
                  disabled={sendMutation.isPending}
                  className="bg-blue-600 text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-60"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessagesTab;
