import React, { useState, useEffect } from 'react';
import { useNavigation } from '@/App';

interface Command {
  id: string;
  name: string;
  category: string;
  action: () => void;
  icon: string;
  shortcut?: string;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { navigate } = useNavigation();

  const commands: Command[] = [
    { id: 'add-user', name: 'Create New User', category: 'Users', action: () => console.log('Action: Create User'), icon: '👤', shortcut: 'U' },
    { id: 'schedule-post', name: 'Schedule Blog Post', category: 'Content', action: () => console.log('Action: Schedule Post'), icon: '📝', shortcut: 'P' },
    { id: 'audit-logs', name: 'View System Audit Logs', category: 'System', action: () => navigate('#/admin?tab=audit'), icon: '📋', shortcut: 'A' },
    { id: 'health-check', name: 'Run System Health Check', category: 'System', action: () => console.log('Action: Health Check'), icon: '⚡', shortcut: 'H' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredCommands = commands.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-start justify-center pt-[15vh] px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100">
          <div className="relative">
            <input 
              autoFocus
              className="w-full bg-slate-50 rounded-2xl pl-12 pr-4 py-4 text-lg font-bold outline-none focus:ring-4 focus:ring-brand-500/10"
              placeholder="Search commands or data..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
           {filteredCommands.length > 0 ? (
             Object.entries(filteredCommands.reduce((acc, c) => {
                if (!acc[c.category]) acc[c.category] = [];
                acc[c.category].push(c);
                return acc;
             }, {} as Record<string, Command[]>)).map(([category, items]) => (
                <div key={category} className="mb-4">
                   <h4 className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{category}</h4>
                   <div className="space-y-1">
                      {items.map(cmd => (
                        <button 
                          key={cmd.id}
                          onClick={() => { cmd.action(); setIsOpen(false); }}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors group"
                        >
                           <div className="flex items-center gap-4">
                              <span className="text-xl">{cmd.icon}</span>
                              <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{cmd.name}</span>
                           </div>
                           {cmd.shortcut && (
                             <kbd className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-400">⌘{cmd.shortcut}</kbd>
                           )}
                        </button>
                      ))}
                   </div>
                </div>
             ))
           ) : (
             <div className="p-12 text-center text-slate-400 italic">No commands found for "{query}"</div>
           )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
           <div className="flex gap-4">
              <span><kbd className="bg-white border rounded px-1">TAB</kbd> to navigate</span>
              <span><kbd className="bg-white border rounded px-1">ENTER</kbd> to execute</span>
           </div>
           <span>EvoWell Command Center</span>
        </div>
      </div>
    </div>
  );
};
