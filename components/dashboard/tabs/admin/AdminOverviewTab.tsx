
import React from 'react';
import { User, ProviderProfile, SupportTicket, TicketStatus, ModerationStatus } from '../../../../types';

interface AdminOverviewTabProps {
  users: User[];
  providers: ProviderProfile[];
  tickets: SupportTicket[];
}

const StatCard = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
  </div>
);

const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ users, providers, tickets }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2">
      <StatCard label="Total Users" value={users.length} color="text-slate-900" />
      <StatCard label="Providers" value={providers.length} color="text-brand-600" />
      <StatCard label="Open Tickets" value={tickets.filter(t => t.status === TicketStatus.OPEN).length} color="text-blue-500" />
      <StatCard label="Pending Approval" value={providers.filter(p => p.moderationStatus === ModerationStatus.PENDING).length} color="text-amber-500" />
    </div>
  );
};

export default AdminOverviewTab;
