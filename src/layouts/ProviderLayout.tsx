import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useNavigation } from '@/App';
import { UserRole } from '@/types';
import ProviderDashboardLayout from '@/components/dashboard/ProviderDashboardLayout';
import { useProviderDashboard } from '@/hooks/useProviderDashboard';

// Tabs
import ProviderOverview from '@/components/dashboard/tabs/ProviderOverview';
import ProviderFinancials from '@/components/dashboard/tabs/ProviderFinancials';
import ProviderSettings from '@/components/dashboard/tabs/ProviderSettings';
import ProviderArticles from '@/components/dashboard/tabs/ProviderArticles';
import ProviderSupport from '@/components/dashboard/tabs/ProviderSupport';
import ProviderPatients from '@/components/dashboard/tabs/ProviderPatients';
import ProviderDocuments from '@/components/dashboard/tabs/ProviderDocuments';
import ProviderAvailability from '@/components/dashboard/tabs/ProviderAvailability';
import ProviderResourcesTab from '@/components/dashboard/tabs/ProviderResourcesTab';
import { ProviderSubscriptionTab } from '@/components/dashboard/tabs/ProviderSubscriptionTab';

const ProviderLayout: React.FC = () => {
  const { navigate } = useNavigation();
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[2] || 'overview';

  const {
    user,
    provider,
    editForm,
    appointments,
    blogs,
    specialties,
    isSaving,
    saveMessage,
    aiLoading,
    updateField,
    handleSaveProfile,
    handleAiBio,
    handleImageUpload,
    togglePublishAndSave,
    handleUpgradePlan,
    fetchData,
  } = useProviderDashboard();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== UserRole.PROVIDER) return <Navigate to="/portal" replace />;

  if (!provider || !provider.onboardingComplete || !editForm) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full"></div>
        <div className="text-slate-500 uppercase font-bold text-xs tracking-widest">
          Preparing Dashboard...
        </div>
      </div>
    );
  }

  return (
    <ProviderDashboardLayout
      user={user}
      provider={provider}
      activeTab={activeTab}
      onTabChange={(tab) => navigate(`/console/${tab}`)}
      editForm={editForm}
      handlePublishToggle={togglePublishAndSave}
      profileIncomplete={!provider.onboardingComplete}
    >
      {activeTab === 'overview' && <ProviderOverview />}

      {activeTab === 'availability' && (
        <ProviderAvailability
          availability={editForm.availability}
          onUpdateAvailability={(val: any) => updateField('availability', val)}
          onSave={handleSaveProfile}
        />
      )}

      {activeTab === 'patients' && (
        <ProviderPatients
          appointments={appointments}
          availability={editForm.availability}
          onUpdateAvailability={(val: any) => updateField('availability', val)}
          onSave={handleSaveProfile}
          onRefresh={fetchData}
        />
      )}

      {activeTab === 'resources' && <ProviderResourcesTab />}

      {activeTab === 'documents' && <ProviderDocuments />}

      {activeTab === 'financials' && (
        <ProviderFinancials
          editForm={editForm}
          updateField={updateField}
          handleSaveProfile={handleSaveProfile}
        />
      )}

      {activeTab === 'settings' && (
        <ProviderSettings
          editForm={editForm}
          user={user}
          updateField={updateField}
          handleSaveProfile={handleSaveProfile}
          isSaving={isSaving}
          saveMessage={saveMessage}
          specialtiesList={specialties}
          handleAiBio={handleAiBio}
          aiLoading={aiLoading}
          handleImageUpload={handleImageUpload}
        />
      )}

      {activeTab === 'articles' && (
        <ProviderArticles
          providerBlogs={blogs}
          provider={provider}
          user={user}
          onRefresh={fetchData}
        />
      )}

      {activeTab === 'support' && <ProviderSupport user={user} />}

      {activeTab === 'subscription' && (
        <ProviderSubscriptionTab
          provider={provider}
          onUpgrade={handleUpgradePlan}
        />
      )}
    </ProviderDashboardLayout>
  );
};

export default ProviderLayout;
