import React from 'react';
import { BarChart, DonutChart } from '@/components/dashboard/DashboardComponents';
import { MOCK_REVENUE_DATA, MOCK_DEMOGRAPHICS } from '@/components/dashboard/constants';
import { useAuth } from '@/App';
import { ModerationStatus } from '@/types';

const ProviderOverview: React.FC = () => {
  const { provider } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Verification Banner */}
      {provider?.moderationStatus === ModerationStatus.PENDING && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
           <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           </div>
           <div>
              <h4 className="text-sm font-bold text-amber-800">Verification Pending</h4>
              <p className="text-xs text-amber-700 mt-1">Your profile is under review. You will be visible in the directory once approved.</p>
           </div>
        </div>
      )}
      {provider?.moderationStatus === ModerationStatus.APPROVED && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
           <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
           </div>
           <div>
              <h4 className="text-sm font-bold text-green-800">Profile Active</h4>
              <p className="text-xs text-green-700 mt-1">Your profile is live and visible to patients.</p>
           </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
            { label: 'Total Revenue', value: '$32,450', trend: '+12%', color: 'text-slate-900', icon: '💰' },
            { label: 'Active Patients', value: '42', trend: '+4', color: 'text-brand-600', icon: '👥' },
            { label: 'Completion Rate', value: '94%', trend: '+1.2%', color: 'text-blue-600', icon: '📈' },
            { label: 'Patient Satisfaction', value: '4.9/5', trend: 'stable', color: 'text-amber-500', icon: '⭐' }
         ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-start justify-between">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                  <h3 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h3>
                  <p className="text-[10px] font-bold text-green-500 mt-1">{stat.trend}</p>
               </div>
               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl">{stat.icon}</div>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Revenue Chart */}
         <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-lg font-black text-slate-900">Revenue Trends</h3>
               <select className="bg-slate-50 border-none rounded-lg text-xs font-bold px-3 py-2 text-slate-500 outline-none">
                  <option>Last 6 Months</option>
                  <option>Year to Date</option>
               </select>
            </div>
            <BarChart data={MOCK_REVENUE_DATA} />
         </div>

         {/* Patient Demographics */}
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-lg font-black text-slate-900 mb-8">Patient Status</h3>
            <div className="flex-grow flex items-center justify-center mb-4">
               <DonutChart data={MOCK_DEMOGRAPHICS} />
            </div>
            <div className="space-y-3">
               {MOCK_DEMOGRAPHICS.map((d, i) => (
                  <div key={i} className="flex justify-between items-center">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                        <span className="text-xs font-bold text-slate-600">{d.label}</span>
                     </div>
                     <span className="text-xs font-black text-slate-900">{d.value}%</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default ProviderOverview;