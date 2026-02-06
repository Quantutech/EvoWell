
import React from 'react';
import { SupportTicket, TicketStatus } from '../../../../types';

interface AdminTicketsTabProps {
  tickets: SupportTicket[];
}

const AdminTicketsTab: React.FC<AdminTicketsTabProps> = ({ tickets }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
        <div className="p-8 border-b border-slate-100">
            <h3 className="text-xl font-black text-slate-900">Support Requests</h3>
        </div>
        <div className="divide-y divide-slate-100">
            {tickets.map(t => (
                <div key={t.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-slate-900">{t.subject}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${t.status === TicketStatus.OPEN ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{t.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{t.message}</p>
                    <p className="text-[9px] text-slate-400">User ID: {t.userId}</p>
                </div>
            ))}
            {tickets.length === 0 && <div className="p-12 text-center text-slate-400 italic">No tickets found.</div>}
        </div>
    </div>
  );
};

export default AdminTicketsTab;
