import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '@/types';
import { api } from '@/services/api';
import { useRealtimeMessages } from '@/hooks/useRealtime';
import { useToast } from '@/contexts/ToastContext';

interface SupportChatProps {
  user: User;
  title: string;
  statusLabel: string;
  activeColor: 'brand' | 'blue';
}

const SupportChat: React.FC<SupportChatProps> = ({ user, title, statusLabel, activeColor }) => {
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const { messages, isLoading: messagesLoading } = useRealtimeMessages(conversationId);

  const themeColors = {
    brand: {
      ping: 'bg-green-400',
      dot: 'bg-green-500',
      bubble: 'bg-brand-600',
      text: 'text-brand-200',
      ring: 'focus:ring-brand-500/20',
      border: 'focus:border-brand-500',
    },
    blue: {
      ping: 'bg-blue-400',
      dot: 'bg-blue-500',
      bubble: 'bg-blue-600',
      text: 'text-blue-200',
      ring: 'focus:ring-blue-500/20',
      border: 'focus:border-blue-500',
    },
  };

  const theme = themeColors[activeColor];

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const users = await api.getAllUsers();
        const admin = users.find(
          (candidate) => candidate.role === UserRole.ADMIN && candidate.id !== user.id,
        );

        if (!admin) {
          setConversationId(null);
          return;
        }

        const conversation = await api.getOrCreateConversation(user.id, admin.id);
        setConversationId(conversation.id);
      } catch (error) {
        console.error('Chat init failed', error);
        setConversationId(null);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [user.id]);

  useEffect(() => {
    if (!conversationId || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.receiver_id === user.id && !lastMessage.is_read) {
      api.markAsRead(conversationId, user.id).catch((error) => {
        console.error('Failed to mark support message as read', error);
      });
    }
  }, [conversationId, messages, user.id]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversationId) return;

    const text = inputValue.trim();
    setInputValue('');

    try {
      await api.sendMessage({
        conversationId,
        senderId: user.id,
        text,
      });
    } catch (error) {
      console.error(error);
      addToast('error', 'Failed to send message.');
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme.ping}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${theme.dot}`}></span>
            </span>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{statusLabel}</p>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-grow p-8 overflow-y-auto custom-scrollbar space-y-6 bg-slate-50"
      >
        {isLoading || messagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse text-slate-400 font-bold text-xs uppercase tracking-widest">Connecting...</div>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.sender_id === user.id;
            return (
              <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                  isMe
                    ? `${theme.bubble} text-white rounded-br-none`
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                }`}>
                  <p className="text-sm font-medium leading-relaxed">{message.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-2 ${isMe ? theme.text : 'text-slate-300'}`}>
                    <p className="text-[9px] font-bold uppercase tracking-widest">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {!isLoading && !messagesLoading && messages.length === 0 && (
          <div className="text-center text-slate-400 text-xs mt-10">Start a conversation with support.</div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <form onSubmit={handleSendMessage} className="flex gap-4">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={`flex-grow bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 ${theme.ring} ${theme.border} outline-none transition-all placeholder:text-slate-400`}
            placeholder="Type your message..."
            disabled={!conversationId}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !conversationId}
            className="bg-slate-900 text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupportChat;
