import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Conversation } from '@/types';
import { api } from '@/services/api';
import { useAuth } from '@/App';
import { useRealtimeMessages } from '@/hooks/useRealtime';
import { resolveConversationParticipantDisplayName } from '@/features/admin/people/utils/resolveMessageParticipant';

interface AdminMessagesTabProps {
  users: User[];
}

const AdminMessagesTab: React.FC<AdminMessagesTabProps> = ({ users }) => {
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const usersById = useMemo(
    () =>
      users.reduce<Record<string, User>>((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {}),
    [users],
  );

  // Use Realtime Hook
  const { messages, isLoading: messagesLoading } = useRealtimeMessages(selectedConvId);

  useEffect(() => {
    loadConversations();
    // Poll conversations only (less frequent), messages are realtime
    const interval = setInterval(loadConversations, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      scrollToBottom();
      // Mark latest message as read if I didn't send it
      if (messages.length > 0 && currentUser) {
          const last = messages[messages.length - 1];
          if (last.sender_id !== currentUser.id && !last.is_read && selectedConvId) {
              api.markAsRead(selectedConvId, currentUser.id);
          }
      }
  }, [messages, selectedConvId]);

  const loadConversations = async () => {
      try {
          const data = await api.getConversations(); 
          setConversations(data);
          setLoading(false);
      } catch (e) {
          console.error(e);
      }
  };

  const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!replyText || !selectedConvId || !currentUser) return;
      
      try {
          await api.sendMessage({
              conversationId: selectedConvId,
              senderId: currentUser.id,
              text: replyText
          });
          setReplyText('');
          // No need to reload messages, hook handles INSERT event
      } catch (e) {
          alert("Failed to send");
      }
  };

  const getOtherParticipant = (conv: Conversation) => {
      return resolveConversationParticipantDisplayName({
        conversation: conv,
        currentUserId: currentUser?.id,
        usersById,
      });
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Loading Inbox...</div>;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-[700px] flex animate-in fade-in slide-in-from-bottom-2">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-slate-100 flex flex-col">
            <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900">Inbox</h3>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar">
                {conversations.map(c => (
                    <button 
                        key={c.id} 
                        onClick={() => setSelectedConvId(c.id)}
                        className={`w-full text-left p-6 border-b border-slate-50 hover:bg-slate-50 transition-all ${selectedConvId === c.id ? 'bg-blue-50' : ''}`}
                    >
                        <p className="font-bold text-sm text-slate-900">{getOtherParticipant(c)}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(c.last_message_at).toLocaleDateString()}</p>
                    </button>
                ))}
            </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col bg-slate-50/30">
            {selectedConvId ? (
                <>
                    <div ref={scrollRef} className="flex-grow p-8 overflow-y-auto custom-scrollbar space-y-4">
                        {messagesLoading ? (
                            <div className="text-center text-slate-400 text-xs">Loading history...</div>
                        ) : messages.map(m => {
                            const isMe = m.sender_id === currentUser?.id;
                            return (
                                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-4 max-w-[80%] rounded-2xl text-sm ${isMe ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                                        <p>{m.content}</p>
                                        <p className={`text-[9px] mt-2 opacity-70 ${isMe ? 'text-slate-300' : 'text-slate-400'}`}>
                                            {new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="p-6 bg-white border-t border-slate-100">
                        <form onSubmit={handleSend} className="flex gap-4">
                            <input 
                                value={replyText} 
                                onChange={e => setReplyText(e.target.value)} 
                                className="flex-grow bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" 
                                placeholder="Type a message..." 
                            />
                            <button className="bg-blue-600 text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all">Send</button>
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex-grow flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">Select a conversation</div>
            )}
        </div>
    </div>
  );
};

export default AdminMessagesTab;
