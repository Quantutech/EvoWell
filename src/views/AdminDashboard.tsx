import React from 'react';
import { api } from '../services/api';
import { UserRole } from '../types';
import AdminDashboardLayout from '../components/dashboard/AdminDashboardLayout';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

// Tabs
import AdminOverviewTab from '../components/dashboard/tabs/admin/AdminOverviewTab';
import AdminMessagesTab from '../components/dashboard/tabs/admin/AdminMessagesTab';
import { UserManagementView } from '../features/admin/user-management/views/UserManagementView';
import { PractitionersTab } from '../features/admin/user-management/views/PractitionersTab';
import { ContentManagementView } from '../features/admin/content-management/views/ContentManagementView';
import AdminTestimonialsTab from '../components/dashboard/tabs/admin/AdminTestimonialsTab';
import AdminTicketsTab from '../components/dashboard/tabs/admin/AdminTicketsTab';
import AdminConfigTab from '../components/dashboard/tabs/admin/AdminConfigTab';
import AdminAuditTab from '../components/dashboard/tabs/admin/AdminAuditTab';
import AdminApplicationsTab from '../components/dashboard/tabs/admin/AdminApplicationsTab';
import AdminContentReviewTab from '../components/dashboard/tabs/admin/AdminContentReviewTab';
import AdminEndorsementsTab from '../components/dashboard/tabs/admin/AdminEndorsementsTab';
import AdminClientsTab from '../components/dashboard/tabs/admin/AdminClientsTab';
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

  if (!user || user.role !== UserRole.ADMIN) return null;

  return (
    <AdminDashboardLayout
      user={user}
      activeView={activeView}
      setActiveView={setActiveView}
      onLogout={logout}
      onAction={handleAction}
    >
      {activeView === 'overview' && <AdminOverviewTab />}

      {activeView === 'messages' && <AdminMessagesTab users={[]} />}

      {activeView === 'users' && (
        <UserManagementView
          onAddUser={() => setIsAddUserModalOpen(true)}
          onEditUser={(u) => setSelectedUser(u as any)}
        />
      )}

      {activeView === 'clients' && <AdminClientsTab />}

      {activeView === 'providers' && (
        <PractitionersTab
          onAddSpecialist={() => setIsAddUserModalOpen(true)}
        />
      )}

      {activeView === 'applications' && <AdminApplicationsTab />}

      {activeView === 'review' && <AdminContentReviewTab />}

      {activeView === 'endorsements' && <AdminEndorsementsTab />}

      {activeView === 'testimonials' && (
        <AdminTestimonialsTab
          testimonials={testimonials}
          filter={testimonialFilter}
          setFilter={setTestimonialFilter}
          onDelete={async (id: string) => { await api.deleteTestimonial(id); refetchTestimonials(); }}
        />
      )}

      {activeView === 'blogs' && <ContentManagementView />}

      {activeView === 'jobs' && <AdminJobsTab />}

      {activeView === 'tickets' && <AdminTicketsTab tickets={tickets} />}

      {activeView === 'audit' && <AdminAuditTab />}

      {activeView === 'config' && <AdminConfigTab />}

      {activeView === 'config' && <ResetDataButton />}

      {isAddUserModalOpen && (
        <AddUserModal
          onClose={() => setIsAddUserModalOpen(false)}
          onSuccess={() => { fetchContentData(); }}
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
          onRefresh={fetchContentData}
          onModerate={handleModerateProvider}
          onDeleteUser={handleDeleteUser}
        />
      )}
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
