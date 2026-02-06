
import React from 'react';
import DashboardLayout from './DashboardLayout';
import { User, ProviderProfile, ModerationStatus } from '../../types';
import { useNavigation } from '../../App';

interface ProviderDashboardLayoutProps {
  user: User;
  provider: ProviderProfile;
  activeTab: string;
  onTabChange: (id: string) => void;
  editForm: ProviderProfile;
  handlePublishToggle: () => void;
  profileIncomplete: boolean;
  children: React.ReactNode;
}

const ProviderDashboardLayout: React.FC<ProviderDashboardLayoutProps> = ({
  user, provider, activeTab, onTabChange, editForm, handlePublishToggle, profileIncomplete, children
}) => {
  const { navigate } = useNavigation();

  const sidebarLinks = [
    { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'schedule', label: 'Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'patients', label: 'Patients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'articles', label: 'Articles & Insights', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l5 5v11a2 2 0 01-2 2z' },
    { id: 'documents', label: 'Documents', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  const handlePreviewProfile = () => {
    // Safety check for provider ID
    if (!provider || !provider.id) {
      console.error('❌ Cannot preview: Provider ID missing', provider);
      alert("Your provider profile hasn't been initialized yet. Please contact support.");
      return;
    }

    console.log('👁️ Opening preview for provider:', provider.id);
    
    // Prefer slug if available for cleaner URL
    const identifier = provider.profileSlug || provider.id;
    
    // Construct URL robustly
    const url = `${window.location.origin}${window.location.pathname}#/provider/${identifier}`;
    
    window.open(url, '_blank');
  };

  const headerActions = (
    <div className="flex items-center gap-4">
       <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile:</span>
          <button 
             onClick={handlePublishToggle} 
             className={`text-xs font-bold transition-colors ${editForm.isPublished ? 'text-green-600' : 'text-slate-400'}`}
          >
             {editForm.isPublished ? 'PUBLISHED' : 'HIDDEN'}
          </button>
          <div 
             onClick={handlePublishToggle}
             className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${editForm.isPublished ? 'bg-green-500' : 'bg-slate-200'}`}
          >
             <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${editForm.isPublished ? 'translate-x-4' : ''}`}></div>
          </div>
       </div>
       
       <button 
          onClick={handlePreviewProfile}
          disabled={!provider?.id}
          className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
       >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          Preview
       </button>

       {profileIncomplete && activeTab !== 'settings' && (
       <button 
          onClick={() => onTabChange('settings')}
          className="bg-brand-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:bg-brand-600 transition-all animate-bounce"
       >
          Complete Setup
       </button>
       )}
    </div>
  );

  return (
    <DashboardLayout
      user={user}
      role="provider"
      navItems={sidebarLinks}
      activeTab={activeTab}
      onTabChange={onTabChange}
      themeColor="bg-brand-600"
      headerActions={headerActions}
    >
      {children}
    </DashboardLayout>
  );
};

export default ProviderDashboardLayout;
