import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth, useNavigation } from '@/App';
import { api } from '@/services/api';
import { ProviderProfile, Appointment, Specialty, BlogPost, UserRole } from '@/types';
import ProviderDashboardLayout from '@/components/dashboard/ProviderDashboardLayout';
import { storageService } from '@/services/storageService';

// Tabs
import ProviderOverview from '@/components/dashboard/tabs/ProviderOverview';
import ProviderSchedule from '@/components/dashboard/tabs/ProviderSchedule';
import ProviderFinancials from '@/components/dashboard/tabs/ProviderFinancials';
import ProviderSettings from '@/components/dashboard/tabs/ProviderSettings';
import ProviderArticles from '@/components/dashboard/tabs/ProviderArticles';
import ProviderSupport from '@/components/dashboard/tabs/ProviderSupport';
import ProviderPatients from '@/components/dashboard/tabs/ProviderPatients';
import ProviderDocuments from '@/components/dashboard/tabs/ProviderDocuments';
import ProviderAvailability from '@/components/dashboard/tabs/ProviderAvailability';
import { ProviderSubscriptionTab } from '@/components/dashboard/tabs/ProviderSubscriptionTab';
import { SubscriptionTier } from '@/types';

const ProviderLayout: React.FC = () => {
  const { user, provider, login } = useAuth();
  const { navigate } = useNavigation();
  const location = useLocation();
  
  // Extract active tab from URL: /console/schedule -> schedule. Default 'overview'.
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[2] || 'overview';

  // Data States
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  
  // Edit States
  const [editForm, setEditForm] = useState<ProviderProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    // If no provider profile exists, redirect to onboarding
    if (user && !provider) {
      navigate('/onboarding');
      return;
    }
    // If provider exists but onboarding is not complete, redirect to onboarding
    if (provider && !provider.onboardingComplete) {
      navigate('/onboarding');
      return;
    }
  }, [user, provider, navigate]);

  useEffect(() => {
    if (provider) {
      setEditForm(JSON.parse(JSON.stringify(provider)));
      fetchData();
    }
  }, [provider]);

  const fetchData = async () => {
    if (!user || !provider) return;
    try {
      const [apps, b, specs] = await Promise.all([
        api.getAppointmentsForUser(user.id, user.role),
        api.getBlogsByProvider(provider.id),
        api.getAllSpecialties()
      ]);
      setAppointments(apps);
      setBlogs(b);
      setSpecialties(specs);
    } catch (e) {
      console.error("Failed to fetch dashboard data", e);
    }
  };

  const updateField = (path: string, value: any) => {
    if (!editForm) return;
    const newData = { ...editForm };
    if (path.includes('.')) {
        const [parent, child] = path.split('.');
        if ((newData as any)[parent]) {
            (newData as any)[parent] = { ...(newData as any)[parent], [child]: value };
        }
    } else {
        (newData as any)[path] = value;
    }
    setEditForm(newData);
  };

  const handleSaveProfile = async () => {
    if (!editForm || !user) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      if (editForm.educationHistory && editForm.educationHistory.length > 0) {
        editForm.education = editForm.educationHistory.map(e => `${e.degree} from ${e.university}`).join(', ');
      }

      const payload: Partial<ProviderProfile> = {
        ...editForm,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phoneNumber: editForm.phoneNumber,
        website: editForm.website,
        pronouns: editForm.pronouns,
        businessAddress: editForm.businessAddress,
        mediaLinks: editForm.mediaLinks,
        profileSlug: editForm.profileSlug,
        isPublished: editForm.isPublished
      };
      await api.updateProvider(editForm.id, payload);
      await login(user.email);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      alert("Update failed. Please check your inputs.");
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleAiBio = async () => {
    if (!editForm) return;
    setAiLoading(true);
    try {
        const generated = await api.ai.generateContent(`Write a professional biography for a ${editForm.professionalTitle}. Key specialties: ${editForm.specialties.join(', ')}.`);
        updateField('bio', generated);
    } catch (e) {
        alert("AI Generation failed.");
    } finally {
        setAiLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editForm) {
      try {
        const url = await storageService.uploadFile(file, `avatars/${editForm.id}/${Date.now()}`);
        updateField('imageUrl', url);
      } catch (e) {
        console.error("Upload failed", e);
      }
    }
  };

  const togglePublishAndSave = async () => {
      if (!editForm || !user) return;
      const newValue = !editForm.isPublished;
      updateField('isPublished', newValue);
      
      try {
          setIsSaving(true);
          await api.updateProvider(editForm.id, { isPublished: newValue });
          await login(user.email);
          setSaveMessage(newValue ? 'Profile Published!' : 'Profile Hidden');
          setTimeout(() => setSaveMessage(''), 3000);
      } catch (e) {
          alert("Failed to update status.");
          updateField('isPublished', !newValue);
      } finally {
          setIsSaving(false);
      }
  };

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
        />
      )}
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
            onUpgrade={async (tier: SubscriptionTier) => {
                // Optimistic update for UI responsiveness
                if (editForm) {
                    setEditForm({ ...editForm, subscriptionTier: tier });
                }
                await api.updateProvider(provider.id, { subscriptionTier: tier });
                await login(user.email);
            }} 
        />
      )}
    </ProviderDashboardLayout>
  );
};

export default ProviderLayout;
