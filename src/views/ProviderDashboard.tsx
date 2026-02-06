import React, { useState, useEffect } from 'react';
import { useAuth, useNavigation } from '@/App';
import { api } from '@/services/api';
import { ProviderProfile } from '@/types';
import ProviderDashboardLayout from '@/components/dashboard/ProviderDashboardLayout';
import { useQuery } from '@tanstack/react-query';

// Tabs
import ProviderOverview from '@/components/dashboard/tabs/ProviderOverview';
import ProviderSchedule from '@/components/dashboard/tabs/ProviderSchedule';
import ProviderFinancials from '@/components/dashboard/tabs/ProviderFinancials';
import ProviderSettings from '@/components/dashboard/tabs/ProviderSettings';
import ProviderArticles from '@/components/dashboard/tabs/ProviderArticles';
import ProviderSupport from '@/components/dashboard/tabs/ProviderSupport';

const ProviderDashboard: React.FC = () => {
  const { user, provider, login } = useAuth();
  const { navigate } = useNavigation();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Edit States
  const [editForm, setEditForm] = useState<ProviderProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // React Query for Data Fetching
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', user?.id],
    queryFn: () => api.getAppointmentsForUser(user!.id, user!.role),
    enabled: !!user,
    staleTime: 5 * 60 * 1000
  });

  const { data: blogs = [], refetch: refetchBlogs } = useQuery({
    queryKey: ['providerBlogs', provider?.id],
    queryFn: () => api.getBlogsByProvider(provider!.id),
    enabled: !!provider,
    staleTime: 5 * 60 * 1000
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => api.getAllSpecialties(),
    staleTime: 24 * 60 * 60 * 1000 // Cache for 24h
  });

  // ============================================================
  // CRITICAL FIX: Check for onboarding completion
  // ============================================================
  useEffect(() => {
    // If no provider profile exists, redirect to onboarding
    if (user && !provider) {
      console.log('⚠️ No provider profile found, redirecting to onboarding');
      navigate('/onboarding');
      return;
    }
    
    // If provider exists but onboarding is not complete, redirect to onboarding
    if (provider && !provider.onboardingComplete) {
      console.log('⚠️ Provider onboarding incomplete, redirecting');
      navigate('/onboarding');
      return;
    }
  }, [user, provider, navigate]);

  useEffect(() => {
    if (provider) {
      setEditForm(JSON.parse(JSON.stringify(provider)));
    }
  }, [provider]);

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
    // Helper: Format legacy education string from structured history
    if (editForm.educationHistory && editForm.educationHistory.length > 0) {
      editForm.education = editForm.educationHistory.map(e => `${e.degree} from ${e.university}`).join(', ');
    }

    // Construct explicit payload including new Task 3 fields
    const payload: Partial<ProviderProfile> = {
      ...editForm, // Preserve all existing fields
      firstName: editForm.firstName,       // ADD THIS
      lastName: editForm.lastName,         // ADD THIS
      phoneNumber: editForm.phoneNumber,
      website: editForm.website,
      pronouns: editForm.pronouns,
      businessAddress: editForm.businessAddress,
      mediaLinks: editForm.mediaLinks,
      profileSlug: editForm.profileSlug,
      isPublished: editForm.isPublished
    };
    await api.updateProvider(editForm.id, payload);
    await login(user.email); // Refresh session data
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePublishAndSave = async () => {
      if (!editForm || !user) return;
      const newValue = !editForm.isPublished;
      
      // Update local state first for immediate feedback
      updateField('isPublished', newValue);
      
      try {
          setIsSaving(true);
          await api.updateProvider(editForm.id, { isPublished: newValue });
          await login(user.email);
          setSaveMessage(newValue ? 'Profile Published!' : 'Profile Hidden');
          setTimeout(() => setSaveMessage(''), 3000);
      } catch (e) {
          alert("Failed to update status.");
          updateField('isPublished', !newValue); // Revert
      } finally {
          setIsSaving(false);
      }
  };

  // ============================================================
  // CRITICAL FIX: Show loading state while checking
  // ============================================================
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-slate-500 uppercase font-bold text-xs tracking-widest">
          Loading...
        </div>
      </div>
    );
  }

  // If no provider or onboarding not complete, the useEffect above will redirect
  // But we still need to handle the render cycle
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
      onTabChange={setActiveTab}
      editForm={editForm}
      handlePublishToggle={togglePublishAndSave}
      profileIncomplete={!provider.onboardingComplete}
    >
      {activeTab === 'overview' && <ProviderOverview />}
      
      {activeTab === 'schedule' && (
        <ProviderSchedule 
          apps={appointments} 
          availability={editForm.availability} 
          onUpdateAvailability={(val) => updateField('availability', val)}
          onSave={handleSaveProfile}
        />
      )}
      
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
          onRefresh={refetchBlogs} 
        />
      )}
      
      {activeTab === 'support' && <ProviderSupport user={user} />}
    </ProviderDashboardLayout>
  );
};

export default ProviderDashboard;
