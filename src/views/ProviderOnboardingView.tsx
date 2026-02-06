import React, { useState, useEffect } from 'react';
import { useAuth, useNavigation } from '@/App';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/services/api';
import { ProviderProfile, AppointmentType, Specialty, ModerationStatus } from '@/types';
import { storageService } from '@/services/storageService';
import ScheduleBuilder from '@/components/ScheduleBuilder';
import { Select } from '@/components/ui';
import { US_STATES, AGE_GROUPS } from '@/data/constants';

// --- Shared Constants ---
const LANGUAGES_LIST = [
  'English', 'Spanish', 'Mandarin', 'French', 'German', 'Hindi', 'Arabic', 'Portuguese', 'Bengali', 'Russian',
  'Japanese', 'Punjabi', 'Wu', 'Javanese', 'Korean', 'Vietnamese', 'Telugu', 'Marathi', 'Tamil', 'Turkish',
  'Urdu', 'Italian', 'Thai', 'Gujarati', 'Persian', 'Polish', 'Pashto', 'Kannada', 'Malayalam', 'Sundanese',
  'Hausa', 'Odia', 'Burmese', 'Hakka', 'Ukrainian', 'Bhojpuri', 'Tagalog', 'Yoruba', 'Maithili', 'Uzbek',
  'Sindhi', 'Amharic', 'Fula', 'Romanian', 'Oromo', 'Igbo', 'Azerbaijani', 'Dutch', 'Kurdish', 'Greek',
  'Hebrew', 'Swedish', 'Czech', 'Sign Language (ASL)'
];

const MultiSelect = ({ label, options, selected, onChange, placeholder }: { label: string, options: string[], selected: string[], onChange: (val: string[]) => void, placeholder: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSelection = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="space-y-2 relative">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium cursor-pointer flex flex-wrap gap-2 items-center min-h-[56px]"
        >
          {selected.length === 0 && <span className="text-slate-400">{placeholder}</span>}
          {selected.map(s => (
            <span key={s} className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
              {s}
              <button
                onClick={(e) => { e.stopPropagation(); toggleSelection(s); }}
                className="hover:text-red-500 font-bold"
              >
                ×
              </button>
            </span>
          ))}
          <div className="ml-auto text-slate-400">
            <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar p-2">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => toggleSelection(opt)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${selected.includes(opt) ? 'bg-brand-50 text-brand-600' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                {opt}
                {selected.includes(opt) && <span className="float-right">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProviderOnboardingView: React.FC = () => {
  const { provider, user, login } = useAuth();
  const { navigate } = useNavigation();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProviderProfile | null>(provider);
  const [isSaving, setIsSaving] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [specialtiesList, setSpecialtiesList] = useState<Specialty[]>([]);

  // Restore progress from local storage
  useEffect(() => {
    if (provider?.id) {
      const key = `provider_onboarding_${provider.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const { formData: savedData, step: savedStep } = JSON.parse(saved);
          if (savedData) {
            setFormData(prev => ({ ...prev, ...savedData }));
            addToast('info', 'Restored your previous session');
          }
          if (savedStep) setStep(savedStep);
        } catch (e) {
          console.error("Failed to restore onboarding progress", e);
        }
      }
    }
  }, [provider?.id]);

  // Auto-save progress
  useEffect(() => {
    if (provider?.id && formData) {
      const key = `provider_onboarding_${provider.id}`;
      localStorage.setItem(key, JSON.stringify({ formData, step }));
    }
  }, [formData, step, provider?.id]);

  useEffect(() => {
    api.getAllSpecialties().then(setSpecialtiesList);
  }, []);

  const handleSaveExit = () => {
    if (provider?.id && formData) {
      const key = `provider_onboarding_${provider.id}`;
      localStorage.setItem(key, JSON.stringify({ formData, step }));
      addToast('success', 'Progress saved. You can resume later.');
      navigate('/console');
    }
  };

  if (!formData || !user) return null;

  const totalSteps = 6;

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const updateField = (path: string, value: any) => {
    const newData = { ...formData };
    const parts = path.split('.');
    let current: any = newData;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    setFormData(newData);
  };

  const toggleList = (field: keyof ProviderProfile, value: any) => {
    const list = [...(formData[field] as any[])];
    const index = list.indexOf(value);
    if (index > -1) list.splice(index, 1);
    else list.push(value);
    setFormData({ ...formData, [field]: list });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        console.log('Uploading to bucket: provider-assets');
        const url = await storageService.uploadFile(
          file,
          `avatars/${formData.id}/${Date.now()}_${file.name}`
        );
        updateField('imageUrl', url);
        addToast('success', 'Profile image uploaded!');
      } catch (e: any) {
        console.error("Upload failed", e);
        if (e.message?.includes('Bucket not found')) {
          addToast('error', 'Storage bucket not found. Please create "provider-assets" bucket in Supabase Storage.');
        } else {
          addToast('error', 'Failed to upload image.');
        }
      }
    }
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      const newCertificates = [...formData.certificates];

      if (idFile) {
        const idUrl = await storageService.uploadFile(idFile, `verification/${formData.id}/id_${Date.now()}`);
        newCertificates.push(`ID_DOC:${idUrl}`);
      }
      if (licenseFile) {
        const licenseUrl = await storageService.uploadFile(licenseFile, `verification/${formData.id}/license_${Date.now()}`);
        newCertificates.push(`LICENSE_DOC:${licenseUrl}`);
      }

      await api.updateProvider(formData.id, {
        ...formData,
        certificates: newCertificates,
        onboardingComplete: true,
        moderationStatus: ModerationStatus.PENDING
      });

      // Clear local storage on success
      localStorage.removeItem(`provider_onboarding_${formData.id}`);

      await login(user.email);
      addToast('success', 'Profile submitted for review!');
      navigate('/console');
    } catch (e) {
      console.error('Submission error:', e);
      addToast('error', "Failed to save profile. Please check all clinical fields.");
    } finally {
      setIsSaving(false);
    }
  };

  // Extract user name safely
  const getUserName = () => {
    const userAny = user as any;
    const firstName = userAny.firstName || user?.email?.split('@')[0] || '';
    const lastName = userAny.lastName || '';
    return { firstName, lastName };
  };

  const { firstName, lastName } = getUserName();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-32 pb-20 px-6">
      <div className="max-w-4xl w-full bg-white rounded-brand shadow-2xl border border-slate-100 overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-slate-100 flex">
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} className={`flex-1 transition-all duration-500 ${step > i ? 'bg-blue-500' : ''}`} />
          ))}
        </div>

        <div className="p-10 lg:p-16">
          <header className="mb-10">
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Practice Initialization • Step {step} of {totalSteps}</p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {step === 1 && "Clinical Identity"}
              {step === 2 && "Practice Location"}
              {step === 3 && "Services & Expertise"}
              {step === 4 && "Clinical Schedule"}
              {step === 5 && "Biography & Approach"}
              {step === 6 && "Identity Verification"}
            </h1>
          </header>

          <div className="space-y-8 min-h-[400px]">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <p className="text-slate-500 font-medium">Define your professional standing on the TeleWellness Hub.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                    <input
                      value={formData.firstName || ''}
                      onChange={e => updateField('firstName', e.target.value)}
                      placeholder="Jane"
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                    <input
                      value={formData.lastName || ''}
                      onChange={e => updateField('lastName', e.target.value)}
                      placeholder="Doe"
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-8">
                  <div className="relative w-24 h-24 rounded-full bg-slate-100 overflow-hidden border-4 border-white shadow-lg shrink-0 group">
                    {formData.imageUrl && !formData.imageUrl.includes('pravatar') ? (
                      <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-[9px] font-bold text-white uppercase tracking-widest">Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Profile Photo</h3>
                    <p className="text-xs text-slate-500">Professional headshot required.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Professional Title</label>
                    <input
                      value={formData.professionalTitle || ''}
                      onChange={e => updateField('professionalTitle', e.target.value)}
                      placeholder="e.g., Clinical Psychologist"
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Select
                      label="Category"
                      value={formData.professionalCategory || ''}
                      onChange={(val) => updateField('professionalCategory', val)}
                      placeholder="Select category"
                      options={[
                        'Mental Health Provider',
                        'Wellness Coach',
                        'Clinical Consultant'
                      ]}
                    />
                  </div>
                </div>

                <MultiSelect
                  label="Languages Spoken"
                  placeholder="Select languages..."
                  options={LANGUAGES_LIST}
                  selected={formData.languages || []}
                  onChange={(val) => updateField('languages', val)}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <p className="text-slate-500 font-medium">Where is your practice physically based?</p>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Phone</label>
                  <input
                    value={formData.phone || ''}
                    onChange={e => updateField('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Office Address</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Street Address</label>
                      <input
                        value={formData.address?.street || ''}
                        onChange={e => updateField('address.street', e.target.value)}
                        placeholder="123 Wellness Ave, Suite 400"
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</label>
                        <input
                          value={formData.address?.city || ''}
                          onChange={e => updateField('address.city', e.target.value)}
                          placeholder="City"
                          className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Select 
                          label="State"
                          options={US_STATES}
                          value={formData.address?.state || ''}
                          onChange={val => updateField('address.state', val)}
                          placeholder="Select State"
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zip Code</label>
                        <input
                          value={formData.address?.zip || ''}
                          onChange={e => updateField('address.zip', e.target.value)}
                          placeholder="12345"
                          className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <p className="text-slate-500 font-medium">Set your availability formats and financial parameters.</p>

                <MultiSelect
                  label="Clinical Specialties"
                  placeholder="Select specialties..."
                  options={specialtiesList.map(s => s.name)}
                  selected={formData.specialties?.map(id => specialtiesList.find(s => s.id === id)?.name || id) || []}
                  onChange={(names) => {
                    const ids = names.map(n => specialtiesList.find(s => s.name === n)?.id || n);
                    updateField('specialties', ids);
                  }}
                />

                <MultiSelect
                  label="Ages Served"
                  placeholder="Select age groups..."
                  options={AGE_GROUPS}
                  selected={formData.agesServed || []}
                  onChange={(val) => updateField('agesServed', val)}
                />

                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Session Formats</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[AppointmentType.VIDEO, AppointmentType.PHONE, AppointmentType.IN_PERSON].map(type => (
                      <label key={type} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 cursor-pointer transition-all ${(formData.appointmentTypes || []).includes(type) ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={(formData.appointmentTypes || []).includes(type)}
                          onChange={() => toggleList('appointmentTypes', type)}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Pricing Model</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standard Hourly Rate ($)</label>
                      <input
                        type="number"
                        value={formData.pricing?.hourlyRate || 0}
                        onChange={e => updateField('pricing.hourlyRate', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none"
                      />
                    </div>

                    <div className="bg-brand-50/50 p-6 rounded-3xl border border-brand-100">
                      <div className="flex items-center gap-4 mb-4">
                        <input
                          type="checkbox"
                          id="sliding"
                          checked={formData.pricing?.slidingScale || false}
                          onChange={e => updateField('pricing.slidingScale', e.target.checked)}
                          className="w-5 h-5 rounded border-slate-200 text-blue-500 focus:ring-blue-500"
                        />
                        <div>
                          <label htmlFor="sliding" className="text-xs font-bold text-slate-900 uppercase tracking-widest cursor-pointer block">Offer Sliding Scale</label>
                          <p className="text-[10px] text-slate-500 leading-tight mt-1">Make care accessible by setting a flexible fee range.</p>
                        </div>
                      </div>

                      {(formData.pricing?.slidingScale) && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                          <div>
                            <label className="text-[9px] font-bold text-brand-600 uppercase tracking-widest mb-1 block">Min Fee ($)</label>
                            <input
                              type="number"
                              value={formData.pricing?.minFee || 0}
                              onChange={e => updateField('pricing.minFee', parseInt(e.target.value) || 0)}
                              className="w-full bg-white border border-brand-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-brand-500/20 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-brand-600 uppercase tracking-widest mb-1 block">Max Fee ($)</label>
                            <input
                              type="number"
                              value={formData.pricing?.maxFee || 0}
                              onChange={e => updateField('pricing.maxFee', parseInt(e.target.value) || 0)}
                              className="w-full bg-white border border-brand-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-brand-500/20 outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4">
                <p className="text-slate-500 font-medium mb-8">Set your recurring weekly availability.</p>
                <ScheduleBuilder
                  value={formData.availability || []}
                  onChange={(val) => updateField('availability', val)}
                />
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <p className="text-slate-500 font-medium">Describe your approach to potential patients.</p>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Practice Tagline</label>
                  <input
                    value={formData.tagline || ''}
                    onChange={e => updateField('tagline', e.target.value)}
                    placeholder="e.g. Empowering resilience through evidence-based care."
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detailed Bio</label>
                  <textarea
                    rows={6}
                    value={formData.bio || ''}
                    onChange={e => updateField('bio', e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none resize-none"
                    placeholder="Share your history, credentials, and philosophy..."
                  />
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <p className="text-slate-500 font-medium">To protect our community, we require identity verification.</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-300 hover:border-blue-400 transition-colors text-center cursor-pointer relative">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-1">{idFile ? 'ID Uploaded ✓' : 'Upload Government ID'}</p>
                    <p className="text-xs text-slate-400">Driver's License or Passport</p>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setIdFile(e.target.files?.[0] || null)} />
                  </div>

                  <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-300 hover:border-blue-400 transition-colors text-center cursor-pointer relative">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-1">{licenseFile ? 'License Uploaded ✓' : 'Upload Medical License'}</p>
                    <p className="text-xs text-slate-400">State Board Certification</p>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setLicenseFile(e.target.files?.[0] || null)} />
                  </div>
                </div>

                <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-slate-200 rounded-2xl overflow-hidden shrink-0">
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-900">{firstName} {lastName}</p>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{formData.professionalTitle || 'Healthcare Provider'}</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">
                        {formData.address?.city || 'City'}, {formData.address?.state || 'State'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-blue-100 flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="acceptFinal"
                      checked={formData.compliance?.termsAccepted || false}
                      onChange={e => updateField('compliance.termsAccepted', e.target.checked)}
                      className="w-5 h-5 rounded border-blue-200 text-blue-500 focus:ring-blue-500"
                    />
                    <label htmlFor="acceptFinal" className="text-xs font-bold text-slate-700 uppercase tracking-widest cursor-pointer">Agree to clinical directory protocols</label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-50">
            <div className="flex items-center gap-6">
              <button onClick={handleSaveExit} className="text-[10px] font-black text-slate-400 hover:text-blue-500 uppercase tracking-[0.2em] transition-colors">Save & Exit</button>
              {step > 1 && (
                <button onClick={prevStep} className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-[0.2em] transition-colors">Go Back</button>
              )}
            </div>

            {step < totalSteps ? (
              <button onClick={nextStep} className="bg-blue-500 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-600 transition-all">Continue Setup</button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={isSaving || !formData.compliance?.termsAccepted || !idFile || !licenseFile}
                className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all disabled:opacity-50"
                title={`Ready: ${!isSaving && formData.compliance?.termsAccepted && idFile && licenseFile ? 'YES' : 'NO'}`}
              >
                {isSaving ? 'Synchronizing...' : 'Submit for Review'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderOnboardingView;