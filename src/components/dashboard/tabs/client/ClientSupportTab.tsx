import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '@/types';
import { api } from '@/services/api';
import { supabase } from '@/services/supabase';

interface ClientSupportTabProps {
  user: User;
}

const ClientSupportTab: React.FC<ClientSupportTabProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initChat();
  }, [user.id]);

  useEffect(() => {
    if (conversationId) {
        const interval = setInterval(loadMessages, 5000);
        return () => clearInterval(interval);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initChat = async () => {
    try {
        // Find admin to chat with (or default system user if defined)
        // For now, grabbing the first admin
        const { data: admin } = await supabase.from('users').select('id').eq('role', 'ADMIN').limit(1).single();
        
        if (admin) {
            const conv = await api.getOrCreateConversation(user.id, admin.id);
            setConversationId(conv.id);
            const msgs = await api.getMessages(conv.id);
            setMessages(msgs);
        }
    } catch (e) {
        console.error("Chat init failed", e);
    } finally {
        setIsLoading(false);
    }
  };

  const loadMessages = async () => {
      if (!conversationId) return;
      const msgs = await api.getMessages(conversationId);
      setMessages(msgs);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversationId) return;

    const text = inputValue;
    setInputValue('');

    try {
      await api.sendMessage({
        conversationId,
        senderId: user.id,
        text
      });
      loadMessages();
    } catch (error) {
      alert("Failed to send message.");
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
           <div>
              <h2 className="text-xl font-black text-slate-900">Patient Support</h2>
              <div className="flex items-center gap-2 mt-1">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                 </span>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Help</p>
              </div>
           </div>
        </div>

        <div ref={scrollRef} className="flex-grow p-8 overflow-y-auto custom-scrollbar space-y-6 bg-slate-50">
           {isLoading ? (
              <div className="flex justify-center items-center h-full">
                 <div className="animate-pulse text-slate-400 font-bold text-xs uppercase tracking-widest">Connecting...</div>
              </div>
           ) : (
              messages.map((msg) => {
                 const isMe = msg.sender_id === user.id;
                 return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                          isMe 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                       }`}>
                          <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                          <p className={`text-[9px] font-bold mt-2 uppercase tracking-widest ${isMe ? 'text-blue-200' : 'text-slate-300'}`}>
                             {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                       </div>
                    </div>
                 );
              })
           )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
           <form onSubmit={handleSendMessage} className="flex gap-4">
              <input 
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 className="flex-grow bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                 placeholder="Type your message..."
                 disabled={!conversationId}
              />
              <button 
                 type="submit" 
                 disabled={!inputValue.trim()}
                 className="bg-slate-900 text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg"
              >
                 Send
              </button>
           </form>
        </div>
    </div>
  );
};

export default ClientSupportTab;