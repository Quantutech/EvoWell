import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { UserManagementUser } from '../types/user.types';
import { UserDataTable } from '../components/UserDataTable/UserDataTable';
import { InlineEditCell } from '../components/UserDataTable/InlineEditCell';
import { useUserFilters } from '../hooks/useUserFilters';
import { useBulkActions } from '../hooks/useBulkActions';
import { AdvancedFilters } from '../components/TableFilters';
import { UserRole } from '@/types';

interface UserManagementViewProps {
  onAddUser?: () => void;
  onEditUser?: (user: UserManagementUser) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ onAddUser, onEditUser }) => {
  const { filters, updateFilter, clearFilters } = useUserFilters();
  const bulkActions = useBulkActions<UserManagementUser>();
  const { isProcessing, progress, executeBulkAction } = bulkActions;

  // Mock data for demonstration
  const data: UserManagementUser[] = useMemo(() => [
    { id: '1', email: 'admin@evowell.com', firstName: 'John', lastName: 'Doe', role: UserRole.ADMIN, status: 'ACTIVE', createdAt: new Date().toISOString() },
    { id: '2', email: 'dr.smith@example.com', firstName: 'Jane', lastName: 'Smith', role: UserRole.PROVIDER, status: 'PENDING', createdAt: new Date().toISOString() },
    { id: '3', email: 'client@example.com', firstName: 'Bob', lastName: 'Wilson', role: UserRole.CLIENT, status: 'ACTIVE', createdAt: new Date().toISOString() },
  ], []);

  const columns = useMemo<ColumnDef<UserManagementUser, any>[]>(() => [
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
      accessorKey: 'firstName',
      header: 'Name',
      cell: info => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{info.row.original.firstName} {info.row.original.lastName}</span>
          <span className="text-[10px] text-slate-400 font-mono">{info.row.original.email}</span>
        </div>
      )
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: info => (
        <InlineEditCell 
          value={info.getValue()} 
          type="select"
          options={[
            { label: 'Admin', value: UserRole.ADMIN },
            { label: 'Provider', value: UserRole.PROVIDER },
            { label: 'Client', value: UserRole.CLIENT },
          ]}
          onSave={async (newRole) => {
            console.log(`Updating user ${info.row.original.id} to role ${newRole}`);
            // await adminService.updateUserRole(info.row.original.id, newRole as UserRole);
          }}
        />
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => (
        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
          info.getValue() === 'ACTIVE' ? 'bg-green-100 text-green-700' :
          info.getValue() === 'PENDING' ? 'bg-amber-100 text-amber-700' :
          'bg-slate-100 text-slate-600'
        }`}>
          {info.getValue()}
        </span>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: info => new Date(info.getValue()).toLocaleDateString()
    }
  ], []);

  const handleBulkAction = async (action: string, selectedRows: UserManagementUser[]) => {
    if (action === 'delete') {
      await executeBulkAction(selectedRows, {
        name: 'Delete',
        actionFn: async (user: UserManagementUser) => {
            console.log(`Deleting user ${user.id}`);
            // await adminService.deleteUser(user.id);
        }
      });
    } else if (action === 'export') {
      console.log('Exporting users to CSV:', selectedRows);
      alert(`Exporting ${selectedRows.length} users to CSV...`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900">User Management</h2>
        <button 
          onClick={onAddUser}
          className="bg-brand-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all"
        >
          + Add User
        </button>
      </div>

      <AdvancedFilters 
        filters={filters}
        onUpdate={updateFilter}
        onClear={clearFilters}
      />

      {isProcessing && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2">
           <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Processing Bulk Action...</span>
              <span className="text-[10px] font-black text-brand-600">{progress}%</span>
           </div>
           <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
           </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <UserDataTable 
          data={data} 
          columns={columns} 
          onBulkAction={handleBulkAction}
          onRowClick={onEditUser}
        />
      </div>
    </div>
  );
};
