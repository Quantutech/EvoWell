import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useNavigation } from '@/App';
import { FeatureCode, UserRole } from '@/types';
import ProviderDashboardLayout from '@/components/dashboard/ProviderDashboardLayout';
import { useProviderDashboard } from '@/hooks/useProviderDashboard';
import { useProviderEntitlements } from '@/features/access';

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

const TAB_FEATURE_LOCKS: Partial<Record<string, FeatureCode>> = {
  patients: 'feature.clients.registry',
  articles: 'feature.blog.author',
  resources: 'feature.exchange.author',
};

const FeatureLockedPanel: React.FC<{
  title: string;
  description: string;
  onUpgrade: () => void;
}> = ({ title, description, onUpgrade }) => (
  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-12 text-center space-y-4">
    <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c-1.66 0-3 1.34-3 3v1h6v-1c0-1.66-1.34-3-3-3zm0-9C9.79 2 8 3.79 8 6v2H6v4h12V8h-2V6c0-2.21-1.79-4-4-4zm2 6h-4V6c0-1.1.9-2 2-2s2 .9 2 2v2z" />
      </svg>
    </div>
    <h2 className="text-2xl font-black text-slate-900">{title}</h2>
    <p className="text-sm text-slate-500 max-w-xl mx-auto">{description}</p>
    <button
      onClick={onUpgrade}
      className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-all"
    >
      Upgrade Package
    </button>
  </div>
);

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
  const entitlements = useProviderEntitlements(provider?.id);

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

  const requiredFeature = TAB_FEATURE_LOCKS[activeTab];
  const isTabLocked =
    !!requiredFeature &&
    !entitlements.isLoading &&
    !entitlements.canUseFeature(requiredFeature);

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
      {isTabLocked && (
        <FeatureLockedPanel
          title="Feature Locked by Package"
          description="This workspace is available in higher provider plans. Upgrade your package to unlock full functionality."
          onUpgrade={() => navigate('/console/subscription')}
        />
      )}

      {activeTab === 'overview' && !isTabLocked && <ProviderOverview />}

      {activeTab === 'availability' && (
        <ProviderAvailability
          availability={editForm.availability}
          onUpdateAvailability={(val: any) => updateField('availability', val)}
          onSave={handleSaveProfile}
        />
      )}

      {activeTab === 'patients' && (
        !isTabLocked && (
        <ProviderPatients
          appointments={appointments}
          availability={editForm.availability}
          onUpdateAvailability={(val: any) => updateField('availability', val)}
          onSave={handleSaveProfile}
          onRefresh={fetchData}
        />
        )
      )}

      {activeTab === 'resources' && !isTabLocked && <ProviderResourcesTab />}

      {activeTab === 'documents' && !isTabLocked && <ProviderDocuments />}

      {activeTab === 'financials' && (
        !isTabLocked && (
        <ProviderFinancials
          editForm={editForm}
          updateField={updateField}
          handleSaveProfile={handleSaveProfile}
        />
        )
      )}

      {activeTab === 'settings' && (
        !isTabLocked && (
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
        )
      )}

      {activeTab === 'articles' && (
        !isTabLocked && (
        <ProviderArticles
          providerBlogs={blogs}
          provider={provider}
          user={user}
          onRefresh={fetchData}
        />
        )
      )}

      {activeTab === 'support' && !isTabLocked && <ProviderSupport user={user} />}

      {activeTab === 'subscription' && (
        !isTabLocked && (
        <ProviderSubscriptionTab
          provider={provider}
          onUpgrade={handleUpgradePlan}
        />
        )
      )}
    </ProviderDashboardLayout>
  );
};

export default ProviderLayout;
