import React from 'react';
import { UserRole } from '@/types';
import { UserFilters } from '../hooks/useUserFilters';

interface AdvancedFiltersProps {
  filters: UserFilters;
  onUpdate: (key: keyof UserFilters, value: any) => void;
  onClear: () => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ 
  filters, 
  onUpdate, 
  onClear 
}) => {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Filter Users</h3>
        <button 
          onClick={onClear}
          className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-600 transition-colors"
        >
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Role Filter */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Role</label>
          <select 
            value={filters.role}
            onChange={e => onUpdate('role', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
          >
            <option value="">All Roles</option>
            <option value={UserRole.ADMIN}>Admin</option>
            <option value={UserRole.PROVIDER}>Provider</option>
            <option value={UserRole.CLIENT}>Client</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</label>
          <select 
            value={filters.status}
            onChange={e => onUpdate('status', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        {/* Date Range - Start */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered Since</label>
          <input 
            type="date"
            value={filters.dateRange.start || ''}
            onChange={e => onUpdate('dateRange', { ...filters.dateRange, start: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
          />
        </div>

        {/* Date Range - End */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered Before</label>
          <input 
            type="date"
            value={filters.dateRange.end || ''}
            onChange={e => onUpdate('dateRange', { ...filters.dateRange, end: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
          />
        </div>
      </div>
    </div>
  );
};
