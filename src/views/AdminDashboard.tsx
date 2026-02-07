import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { ModerationStatus, ProviderProfile, UserRole } from '../types';
import AdminDashboardLayout from '../components/dashboard/AdminDashboardLayout';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

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
  const queryClient = useQueryClient();
  const normalizedView = activeView === 'applications' ? 'providers' : activeView;
  const defaultProviderStatus =
    activeView === 'applications' ? ModerationStatus.PENDING : 'ALL';

  const { data: messageUsers = [] } = useQuery({
    queryKey: ['adminMessagesUsers'],
    queryFn: () => api.getAllUsers(),
    enabled: normalizedView === 'messages' && !!user && user.role === UserRole.ADMIN,
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
      {normalizedView === 'overview' && <AdminOverviewTab />}

      {normalizedView === 'messages' && <AdminMessagesTab users={messageUsers} />}

      {normalizedView === 'users' && (
        <UsersPeopleTab
          onAddUser={() => setIsAddUserModalOpen(true)}
          onSelectUser={(selected) => {
            setSelectedProvider(undefined);
            setSelectedUser(selected);
          }}
        />
      )}

      {normalizedView === 'clients' && <ClientsPeopleTab />}

      {normalizedView === 'providers' && (
        <ProvidersPeopleTab
          defaultStatus={defaultProviderStatus}
          onSelectProvider={handleSelectProvider}
        />
      )}

      {normalizedView === 'review' && <AdminContentReviewTab />}

      {normalizedView === 'endorsements' && <AdminEndorsementsTab />}

      {normalizedView === 'testimonials' && (
        <AdminTestimonialsTab
          testimonials={testimonials}
          filter={testimonialFilter}
          setFilter={setTestimonialFilter}
          onDelete={async (id: string) => { await api.deleteTestimonial(id); refetchTestimonials(); }}
        />
      )}

      {normalizedView === 'blogs' && <ContentManagementView />}

      {normalizedView === 'jobs' && <AdminJobsTab />}

      {normalizedView === 'tickets' && <AdminTicketsTab tickets={tickets} />}

      {normalizedView === 'audit' && <AdminAuditTab />}

      {normalizedView === 'config' && <AdminConfigTab />}

      {normalizedView === 'config' && <ResetDataButton />}

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
