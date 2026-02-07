import React, { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User, UserRole } from '@/types';
import { adminService, AccountStatus, GetUsersParams } from '@/services/admin';
import { useToast } from '@/contexts/ToastContext';
import { Skeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui';
import { AdminTableLayout } from '@/components/dashboard/tabs/admin/AdminTableLayout';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useAdminUsers } from '../hooks/useAdminUsers';

interface UsersPeopleTabProps {
  onAddUser?: () => void;
  onSelectUser?: (user: User) => void;
}

const PAGE_SIZE = 20;

export const UsersPeopleTab: React.FC<UsersPeopleTabProps> = ({
  onAddUser,
  onSelectUser,
}) => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AccountStatus>('ALL');

  const search = useDebouncedValue(searchInput, 300);

  const params = useMemo<GetUsersParams>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      role: roleFilter === 'ALL' ? undefined : roleFilter,
      status: statusFilter,
      includeDeleted: true,
    }),
    [page, search, roleFilter, statusFilter],
  );

  const { data, isLoading } = useAdminUsers(params);

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      adminService.updateUserRole(userId, role),
    onSuccess: () => {
      addToast('success', 'User role updated.');
      queryClient.invalidateQueries({ queryKey: ['adminPeople'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update role.';
      addToast('error', message);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: ({ userId, suspend }: { userId: string; suspend: boolean }) =>
      adminService.setUserSuspended(userId, suspend),
    onSuccess: (_, variables) => {
      addToast('success', variables.suspend ? 'User suspended.' : 'User reactivated.');
      queryClient.invalidateQueries({ queryKey: ['adminPeople'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update status.';
      addToast('error', message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      addToast('success', 'User deleted.');
      queryClient.invalidateQueries({ queryKey: ['adminPeople'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to delete user.';
      addToast('error', message);
    },
  });

  const users = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const handleChangeRole = async (user: User, role: UserRole) => {
    if (user.role === role) return;
    if (!window.confirm(`Change ${user.firstName} ${user.lastName} role to ${role}?`)) return;
    roleMutation.mutate({ userId: user.id, role });
  };

  const handleSuspendToggle = (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    const suspend = !user.isDeleted;
    const action = suspend ? 'suspend' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`)) return;
    suspendMutation.mutate({ userId: user.id, suspend });
  };

  const handleDelete = (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) return;
    deleteMutation.mutate(user.id);
  };

  const header = (
    <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900">Users</h3>
          <p className="text-xs text-slate-500">Cross-role account operations and identity management.</p>
        </div>
        {onAddUser && (
          <button
            onClick={onAddUser}
            className="bg-brand-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all"
          >
            + Add User
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px]">
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <Select
          ariaLabel="Filter users by role"
          value={roleFilter}
          onChange={(nextValue) => {
            setRoleFilter(nextValue as 'ALL' | UserRole);
            setPage(1);
          }}
          options={[
            { value: 'ALL', label: 'All Roles' },
            { value: UserRole.ADMIN, label: 'Admin' },
            { value: UserRole.PROVIDER, label: 'Provider' },
            { value: UserRole.CLIENT, label: 'Client' },
          ]}
          className="w-[150px]"
        />

        <Select
          ariaLabel="Filter users by account status"
          value={statusFilter}
          onChange={(nextValue) => {
            setStatusFilter(nextValue as 'ALL' | AccountStatus);
            setPage(1);
          }}
          options={[
            { value: 'ALL', label: 'All Status' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'SUSPENDED', label: 'Suspended' },
          ]}
          className="w-[160px]"
        />
      </div>
    </div>
  );

  return (
    <AdminTableLayout
      header={header}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      isLoading={isLoading}
    >
      <table className="w-full text-left whitespace-nowrap">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <tr key={index}>
                <td className="px-6 py-4"><Skeleton className="h-4 w-36 mb-2" /><Skeleton className="h-3 w-24" /></td>
                <td className="px-6 py-4"><Skeleton className="h-8 w-28 rounded-lg" /></td>
                <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
              </tr>
            ))
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">No users found.</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => onSelectUser?.(user)}
              >
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={user.role}
                    onChange={(e) => handleChangeRole(user, e.target.value as UserRole)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest"
                  >
                    <option value={UserRole.ADMIN}>Admin</option>
                    <option value={UserRole.PROVIDER}>Provider</option>
                    <option value={UserRole.CLIENT}>Client</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    user.isDeleted ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {user.isDeleted ? 'SUSPENDED' : 'ACTIVE'}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleSuspendToggle(user, e)}
                    className="text-amber-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                  >
                    {user.isDeleted ? 'Reactivate' : 'Suspend'}
                  </button>
                  <button
                    onClick={(e) => handleDelete(user, e)}
                    className="text-red-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </AdminTableLayout>
  );
};
