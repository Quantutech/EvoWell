import React from 'react';
import { useAdminStats } from '../../../../hooks/queries/useAdminStats';
import { StatWidget } from '../../improved/StatWidget';

const AdminOverviewTab: React.FC = () => {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget 
          label="Total Users" 
          queryKey="adminStats" 
          queryFn={async () => stats?.users || 0} 
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          color="bg-slate-900"
        />
        <StatWidget 
          label="Active Providers" 
          queryKey="adminStats" 
          queryFn={async () => stats?.providers || 0} 
          icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          color="bg-brand-600"
        />
        <StatWidget 
          label="Open Tickets" 
          queryKey="adminStats" 
          queryFn={async () => stats?.openTickets || 0} 
          icon="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          color="bg-blue-500"
        />
        <StatWidget 
          label="Pending Approval" 
          queryKey="adminStats" 
          queryFn={async () => stats?.pending || 0} 
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          color="bg-amber-500"
          drillDownId="applications"
        />
      </div>

      {/* Activity Feed Placeholder */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Recent System Activity</h3>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="flex-grow">
                <p className="text-xs font-bold text-slate-900">New provider application submitted</p>
                <p className="text-[10px] text-slate-500 uppercase font-black">2 hours ago</p>
              </div>
              <button className="text-[10px] font-black uppercase text-brand-600 hover:underline">View</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewTab;
