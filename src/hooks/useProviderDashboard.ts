import { useState, useEffect } from 'react';
import { useAuth, useNavigation } from '@/App';
import { api } from '@/services/api';
import { ProviderProfile, Appointment, Specialty, BlogPost, SubscriptionTier } from '@/types';
import { storageService } from '@/services/storageService';

export function useProviderDashboard() {
  const { user, provider, login } = useAuth();
  const { navigate } = useNavigation();

  // Data States
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  // Edit States
  const [editForm, setEditForm] = useState<ProviderProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Onboarding guard
  useEffect(() => {
    if (user && !provider) {
      navigate('/onboarding');
      return;
    }
    if (provider && !provider.onboardingComplete) {
      navigate('/onboarding');
      return;
    }
  }, [user, provider, navigate]);

  // Initialize edit form when provider loads
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

      const { profileTemplate: _legacyTemplate, ...editableProfile } = editForm;
      const payload: Partial<ProviderProfile> = {
        ...editableProfile,
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

  const handleUpgradePlan = async (tier: SubscriptionTier) => {
    if (!editForm || !user || !provider) return;
    setEditForm({ ...editForm, subscriptionTier: tier });
    await api.updateProvider(provider.id, { subscriptionTier: tier });
    await login(user.email);
  };

  return {
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
  };
}
