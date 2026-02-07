import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { PractitionerDetail } from '../types/user.types';
import { UserDataTable } from '../components/UserDataTable/UserDataTable';
import { InlineEditCell } from '../components/UserDataTable/InlineEditCell';
import { useBulkActions } from '../hooks/useBulkActions';
import { useToast } from '@/contexts/ToastContext';
import { ModerationStatus, UserRole } from '@/types';

interface PractitionersTabProps {
  onAddSpecialist?: () => void;
}

export const PractitionersTab: React.FC<PractitionersTabProps> = ({ onAddSpecialist }) => {
  const { addToast } = useToast();
  const bulkActions = useBulkActions<PractitionerDetail>();
  const { isProcessing, progress, executeBulkAction } = bulkActions;

  // Mock data for Practitioners
  const data: PractitionerDetail[] = useMemo(() => [
    { 
      id: 'p1', 
      email: 'dr.jones@example.com', 
      firstName: 'Indiana', 
      lastName: 'Jones', 
      role: UserRole.PROVIDER, 
      status: 'ACTIVE', 
      createdAt: new Date().toISOString(),
      professionalTitle: 'Psychologist',
      specialties: ['Anxiety', 'Depression'],
      licenseNumber: 'PSY12345',
      licenseState: 'CA',
      moderationStatus: ModerationStatus.APPROVED
    },
    { 
      id: 'p2', 
      email: 'dr.watson@example.com', 
      firstName: 'John', 
      lastName: 'Watson', 
      role: UserRole.PROVIDER, 
      status: 'PENDING', 
      createdAt: new Date().toISOString(),
      professionalTitle: 'Medical Doctor',
      specialties: ['General Practice'],
      licenseNumber: 'MD67890',
      licenseState: 'NY',
      moderationStatus: ModerationStatus.PENDING
    },
  ], []);

  const columns = useMemo<ColumnDef<PractitionerDetail, any>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
      ),
    },
    {
      accessorKey: 'lastName',
      header: 'Practitioner',
      cell: info => (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center font-black text-brand-600">
                {info.row.original.firstName[0]}{info.row.original.lastName[0]}
            </div>
            <div className="flex flex-col">
                <span className="font-black text-slate-900 text-sm">Dr. {info.row.original.firstName} {info.row.original.lastName}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">{info.row.original.professionalTitle}</span>
            </div>
        </div>
      )
    },
    {
      accessorKey: 'licenseNumber',
      header: 'License',
      cell: info => (
        <div className="flex flex-col">
            <span className="text-xs font-mono font-bold text-slate-700">{info.getValue() || 'N/A'}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase">{info.row.original.licenseState || 'N/A'}</span>
        </div>
      )
    },
    {
      accessorKey: 'moderationStatus',
      header: 'Vetting',
      cell: info => (
        <InlineEditCell 
          value={info.getValue()} 
          type="select"
          options={[
            { label: 'Approved', value: ModerationStatus.APPROVED },
            { label: 'Pending', value: ModerationStatus.PENDING },
            { label: 'Rejected', value: ModerationStatus.REJECTED },
          ]}
          onSave={async (newStatus) => {
            addToast('info', `Updating status to ${newStatus}...`);
            // await adminService.moderateProvider(info.row.original.id, newStatus as ModerationStatus);
          }}
        />
      )
    },
    {
        accessorKey: 'specialties',
        header: 'Specialties',
        cell: info => (
            <div className="flex gap-1">
                {info.getValue()?.slice(0, 2).map((s: string) => (
                    <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">{s}</span>
                ))}
                {info.getValue()?.length > 2 && <span className="text-[9px] text-slate-400">+{info.getValue().length - 2}</span>}
            </div>
        )
    }
  ], []);

  const handleBulkAction = async (action: string, selectedRows: PractitionerDetail[]) => {
    if (action === 'delete') {
      await executeBulkAction(selectedRows, {
        name: 'Deletion',
        actionFn: async (p) => { console.log('Deleting', p.id); },
        undoFn: async (p) => { console.log('Restoring', p.id); }
      });
    } else if (action === 'status') {
        const newStatus = window.prompt("Enter new status (APPROVED/PENDING/REJECTED):");
        if (newStatus) {
            await executeBulkAction(selectedRows, {
                name: 'Status Update',
                actionFn: async (p) => { console.log('Updating status of', p.id, 'to', newStatus); }
            });
        }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Practitioner Directory</h2>
            <p className="text-xs text-slate-500 font-medium">Manage medical licenses, specialties, and vetting status.</p>
        </div>
        <div className="flex gap-3">
            <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">Export License Data</button>
            <button 
                onClick={onAddSpecialist}
                className="px-6 py-2.5 bg-brand-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all"
            >
                + Add Specialist
            </button>
        </div>
      </div>

      {isProcessing && (
        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-top-4">
           <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></div>
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Executing Bulk Operations</span>
              </div>
              <span className="text-xs font-black text-brand-500">{progress}%</span>
           </div>
           <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
           </div>
        </div>
      )}

      <UserDataTable 
        data={data} 
        columns={columns} 
        onBulkAction={handleBulkAction}
        onRowClick={(p) => console.log('Opening detail view for', p.id)}
      />
    </div>
  );
};
