import React, { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { ModerationStatus, PermissionCode, ProviderProfile, UserRole } from '../types';
import AdminDashboardLayout from '../components/dashboard/AdminDashboardLayout';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { useAccess } from '@/features/access';

// Tabs
import AdminOverviewTab from '../components/dashboard/tabs/admin/AdminOverviewTab';
import AdminMessagesTab from '../components/dashboard/tabs/admin/AdminMessagesTab';
import { UsersPeopleTab } from '../features/admin/people/views/UsersPeopleTab';
import { ProvidersPeopleTab } from '../features/admin/people/views/ProvidersPeopleTab';
import { ClientsPeopleTab } from '../features/admin/people/views/ClientsPeopleTab';
import { ContentManagementView } from '../features/admin/content-management/views/ContentManagementView';
import AdminTestimonialsTab from '../components/dashboard/tabs/admin/AdminTestimonialsTab';
import AdminTicketsTab from '../components/dashboard/tabs/admin/AdminTicketsTab';
import AdminConfigTab from '../components/dashboard/tabs/admin/AdminConfigTab';
import AdminAuditTab from '../components/dashboard/tabs/admin/AdminAuditTab';
import AdminContentReviewTab from '../components/dashboard/tabs/admin/AdminContentReviewTab';
import AdminEndorsementsTab from '../components/dashboard/tabs/admin/AdminEndorsementsTab';
import AdminJobsTab from '../components/dashboard/tabs/admin/AdminJobsTab';
import { ResetDataButton } from '../components/dashboard/tabs/admin/ResetDataButton';
import AddUserModal from '../components/dashboard/tabs/admin/AddUserModal';
import AddTestimonialModal from '../components/dashboard/tabs/admin/AddTestimonialModal';
import DetailModal from '../components/dashboard/tabs/admin/DetailModal';

const VIEW_PERMISSIONS: Partial<Record<string, PermissionCode>> = {
  overview: 'dashboard.overview.read',
  users: 'people.users.read',
  providers: 'people.providers.read',
  clients: 'people.clients.read',
  review: 'cms.posts.read',
  blogs: 'cms.posts.read',
  testimonials: 'cms.posts.write',
  endorsements: 'exchange.resources.read',
  jobs: 'exchange.resources.read',
  messages: 'support.messages.read',
  tickets: 'support.tickets.read',
  audit: 'compliance.audit.read',
  config: 'platform.config.read',
};

const AdminDashboard: React.FC = () => {
  const {
    user,
    logout,
    activeView,
    setActiveView,
    selectedUser,
    setSelectedUser,
    selectedProvider,
    setSelectedProvider,
    isAddUserModalOpen,
    setIsAddUserModalOpen,
    isAddTestimonialModalOpen,
    setIsAddTestimonialModalOpen,
    testimonialFilter,
    setTestimonialFilter,
    testimonials,
    tickets,
    fetchContentData,
    handleAction,
    handleModerateProvider,
    handleDeleteUser,
    refetchTestimonials,
  } = useAdminDashboard();
  const { can } = useAccess();
  const queryClient = useQueryClient();
  const normalizedView = activeView === 'applications' ? 'providers' : activeView;
  const defaultProviderStatus =
    activeView === 'applications' ? ModerationStatus.PENDING : 'ALL';

  const canAccessView = useMemo(
    () => (view: string) => {
      const required = VIEW_PERMISSIONS[view];
      return !required || can(required);
    },
    [can],
  );

  const firstAllowedView = useMemo(() => {
    const priority = [
      'overview',
      'users',
      'providers',
      'clients',
      'review',
      'blogs',
      'messages',
      'tickets',
      'audit',
      'config',
    ];
    return priority.find((view) => canAccessView(view)) || null;
  }, [canAccessView]);

  useEffect(() => {
    if (!canAccessView(normalizedView) && firstAllowedView) {
      setActiveView(firstAllowedView as any);
    }
  }, [canAccessView, firstAllowedView, normalizedView, setActiveView]);

  const { data: messageUsers = [] } = useQuery({
    queryKey: ['adminMessagesUsers'],
    queryFn: () => api.getAllUsers(),
    enabled:
      normalizedView === 'messages' &&
      !!user &&
      user.role === UserRole.ADMIN &&
      canAccessView('messages'),
  });

  const refreshAdminData = () => {
    fetchContentData();
    queryClient.invalidateQueries({ queryKey: ['adminPeople'] });
  };

  const handleSelectProvider = (provider: ProviderProfile) => {
    setSelectedProvider(provider);
    setSelectedUser({
      id: provider.userId,
      email: provider.email || '',
      firstName: provider.firstName || 'Provider',
      lastName: provider.lastName || '',
      role: UserRole.PROVIDER,
      createdAt: provider.audit?.createdAt || new Date().toISOString(),
      updatedAt: provider.audit?.updatedAt || new Date().toISOString(),
      isDeleted: false,
    });
  };

  if (!user || user.role !== UserRole.ADMIN) return null;

  return (
    <AdminDashboardLayout
      user={user}
      activeView={normalizedView}
      setActiveView={setActiveView}
      onLogout={logout}
      onAction={handleAction}
    >
      {!canAccessView(normalizedView) && (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-10 text-center">
          <h2 className="text-xl font-black text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-500">
            Your staff role does not include permission for this workspace.
          </p>
        </div>
      )}

      {normalizedView === 'overview' && canAccessView('overview') && <AdminOverviewTab />}

      {normalizedView === 'messages' && canAccessView('messages') && (
        <AdminMessagesTab users={messageUsers} />
      )}

      {normalizedView === 'users' && canAccessView('users') && (
        <UsersPeopleTab
          onAddUser={() => setIsAddUserModalOpen(true)}
          onSelectUser={(selected) => {
            setSelectedProvider(undefined);
            setSelectedUser(selected);
          }}
        />
      )}

      {normalizedView === 'clients' && canAccessView('clients') && <ClientsPeopleTab />}

      {normalizedView === 'providers' && canAccessView('providers') && (
        <ProvidersPeopleTab
          defaultStatus={defaultProviderStatus}
          onSelectProvider={handleSelectProvider}
        />
      )}

      {normalizedView === 'review' && canAccessView('review') && <AdminContentReviewTab />}

      {normalizedView === 'endorsements' && canAccessView('endorsements') && <AdminEndorsementsTab />}

      {normalizedView === 'testimonials' && canAccessView('testimonials') && (
        <AdminTestimonialsTab
          testimonials={testimonials}
          filter={testimonialFilter}
          setFilter={setTestimonialFilter}
          onDelete={async (id: string) => { await api.deleteTestimonial(id); refetchTestimonials(); }}
        />
      )}

      {normalizedView === 'blogs' && canAccessView('blogs') && <ContentManagementView />}

      {normalizedView === 'jobs' && canAccessView('jobs') && <AdminJobsTab />}

      {normalizedView === 'tickets' && canAccessView('tickets') && <AdminTicketsTab tickets={tickets} />}

      {normalizedView === 'audit' && canAccessView('audit') && <AdminAuditTab />}

      {normalizedView === 'config' && canAccessView('config') && <AdminConfigTab />}

      {normalizedView === 'config' && canAccessView('config') && <ResetDataButton />}

      {isAddUserModalOpen && (
        <AddUserModal
          onClose={() => setIsAddUserModalOpen(false)}
          onSuccess={refreshAdminData}
        />
      )}

      {isAddTestimonialModalOpen && (
        <AddTestimonialModal
          onClose={() => setIsAddTestimonialModalOpen(false)}
          onSuccess={() => { refetchTestimonials(); }}
        />
      )}

      {(selectedUser || selectedProvider) && (
        <DetailModal
          user={selectedUser!}
          provider={selectedProvider}
          onClose={() => { setSelectedUser(null); setSelectedProvider(undefined); }}
          onUpdateProvider={async (id, data) => { await api.updateProvider(id, data); }}
          onRefresh={refreshAdminData}
          onModerate={async (id, status) => {
            await handleModerateProvider(id, status);
            queryClient.invalidateQueries({ queryKey: ['adminPeople'] });
          }}
          onDeleteUser={handleDeleteUser}
        />
      )}
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
