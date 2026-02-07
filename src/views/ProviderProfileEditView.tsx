import React, { useState } from 'react';
import { useAuth, useNavigation } from '@/App';
import { api } from '@/services/api';
import { storageService } from '@/services/storageService';
import { 
  ProviderProfile, 
  SubscriptionTier, 
  AppointmentType,
  ModerationStatus
} from '@/types';
import ScheduleBuilder from '@/components/ScheduleBuilder';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';

// Separate Input Component to prevent focus loss
const FormInput = ({ label, value, onChange, type = "text", placeholder = "" }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <input 
      type={type} 
      value={value || ''} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder} 
      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none" 
    />
  </div>
);

const ProviderProfileEditView: React.FC = () => {
  const { provider, user, login } = useAuth();
  const { navigate } = useNavigation();
  const [formData, setFormData] = useState<ProviderProfile | null>(provider);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');

  if (!formData || !user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateProvider(formData.id, formData);
      await login(user.email);
      navigate('#/dashboard');
    } catch (e) {
      alert("Failed to save changes. Please check all fields.");
    } finally {
      setIsSaving(false);
    }
  };

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
    if (!file) return;

    setIsSaving(true); // Lock UI interactions during upload
    try {
      const url = await storageService.uploadFile(file, `avatars/${user.id}/${Date.now()}_${file.name}`);
      updateField('imageUrl', url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Image upload failed. Please ensure the file is under 2MB and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { id: 'personal', name: 'Personal Identity' },
    { id: 'professional', name: 'Clinical Details' },
    { id: 'contact', name: 'Practice Contact' },
    { id: 'sessions', name: 'Session Config' },
    { id: 'subscription', name: 'Billing Tier' },
    { id: 'products', name: 'Digital Marketplace' },
    { id: 'media', name: 'Media Library' },
    { id: 'pricing', name: 'Insurance & Rates' },
    { id: 'compliance', name: 'Legal & Compliance' }
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 pt-32 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="lg:w-72 shrink-0 sticky top-32 h-fit">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Practice Editor</h3>
            <nav className="space-y-2">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeSection === s.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </nav>
            <div className="mt-10 pt-8 border-t border-slate-50">
              <button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:opacity-95 disabled:opacity-50 transition-all">
                {isSaving ? 'Syncing...' : 'Save & Exit'}
              </button>
              <button onClick={() => navigate('#/dashboard')} className="w-full mt-3 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-[0.2em] py-2">
                Discard Changes
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-grow space-y-8 max-w-4xl">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{sections.find(s => s.id === activeSection)?.name}</h1>
              <p className="text-slate-500 mt-1 font-medium">Update your professional profile in real-time.</p>
            </div>
            <div className="text-right hidden sm:block">
              <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${formData.moderationStatus === ModerationStatus.APPROVED ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                {formData.moderationStatus === ModerationStatus.APPROVED ? '✓ Verified' : 'Vetting'}
              </span>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeSection === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormInput label="Professional Tagline" value={formData.tagline} onChange={(v: any) => updateField('tagline', v)} placeholder="Brief elevator pitch..." />
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Image</label>
                  <div className="flex gap-4 items-center">
                    <img src={formData.imageUrl} className="w-12 h-12 rounded-xl object-cover bg-slate-100" alt="Preview" />
                    <label className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs font-bold cursor-pointer hover:bg-slate-100 transition-colors text-slate-600">
                      {isSaving ? 'Uploading...' : 'Upload New'}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isSaving} />
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biography</label>
                  <textarea rows={6} value={formData.bio} onChange={e => updateField('bio', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none resize-none" />
                </div>
              </div>
            )}

            {activeSection === 'professional' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormInput label="Professional Title" value={formData.professionalTitle} onChange={(v: any) => updateField('professionalTitle', v)} />
                <FormInput label="Education / Degrees" value={formData.education} onChange={(v: any) => updateField('education', v)} />
                <FormInput label="NPI Number" value={formData.npi} onChange={(v: any) => updateField('npi', v)} />
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Years Experience</label>
                   <input type="number" value={formData.yearsExperience} onChange={e => updateField('yearsExperience', parseInt(e.target.value))} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none" />
                </div>
              </div>
            )}

            {activeSection === 'contact' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormInput label="Office Phone" value={formData.phone} onChange={(v: any) => updateField('phone', v)} />
                </div>
                
                <div className="pt-6 border-t border-slate-50 space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Office Address</h3>
                  <AddressAutocomplete 
                    value={formData.address}
                    onChange={(addr) => updateField('address', addr)}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</label>
                      <input value={formData.address?.city || ''} readOnly className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 text-sm font-medium text-slate-500 cursor-not-allowed outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State</label>
                      <input value={formData.address?.state || ''} readOnly className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 text-sm font-medium text-slate-500 cursor-not-allowed outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zip Code</label>
                      <input value={formData.address?.zip || ''} readOnly className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 text-sm font-medium text-slate-500 cursor-not-allowed outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'sessions' && (
              <div className="space-y-10">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Appointment Types</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[AppointmentType.VIDEO, AppointmentType.PHONE, AppointmentType.IN_PERSON, AppointmentType.CHAT].map(t => (
                      <label key={t} className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${formData.appointmentTypes.includes(t) ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                        <input type="checkbox" checked={formData.appointmentTypes.includes(t)} onChange={() => toggleList('appointmentTypes', t)} className="w-5 h-5 rounded border-slate-200 text-blue-600 focus:ring-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t}</span>
                      </label>
                    ))}
                  </div>
                  
                  <hr className="border-slate-100 my-8"/>
                  
                  <ScheduleBuilder 
                    value={formData.availability}
                    onChange={(val) => updateField('availability', val)}
                  />
                </div>
              </div>
            )}

            {activeSection === 'subscription' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[SubscriptionTier.FREE, SubscriptionTier.PROFESSIONAL, SubscriptionTier.PREMIUM].map(tier => (
                  <button key={tier} onClick={() => updateField('subscriptionTier', tier)} className={`p-8 rounded-3xl border-2 text-center transition-all ${formData.subscriptionTier === tier ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Tier Plan</p>
                    <p className="text-lg font-black text-slate-900">{tier}</p>
                  </button>
                ))}
              </div>
            )}

            {activeSection === 'media' && (
               <div className="space-y-8">
                  <p className="text-sm text-slate-500">Manage videos and audio resources linked to your profile.</p>
                  <button onClick={() => {
                    const m = formData.media || [];
                    updateField('media', [...m, { id: `m-${Date.now()}`, type: 'video', title: 'New Resource', description: '', imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600' }]);
                  }} className="bg-blue-600 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest">Add Media Item</button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formData.media?.map((m, i) => (
                      <div key={m.id} className="bg-slate-50 p-6 rounded-3xl space-y-4 border border-slate-100">
                        <FormInput label="Resource Title" value={m.title} onChange={(v: any) => updateField(`media.${i}.title`, v)} />
                        <FormInput label="Thumbnail URL" value={m.imageUrl} onChange={(v: any) => updateField(`media.${i}.imageUrl`, v)} />
                        <div className="flex justify-end">
                           <button onClick={() => {
                             const list = [...formData.media!];
                             list.splice(i, 1);
                             updateField('media', list);
                           }} className="text-red-500 font-black text-[10px] uppercase tracking-widest">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            )}

            {activeSection === 'pricing' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormInput label="Standard Hourly Rate ($)" value={formData.pricing.hourlyRate} onChange={(v: any) => updateField('pricing.hourlyRate', parseInt(v))} type="number" />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insurance Partners</label>
                    <input placeholder="e.g. Aetna, Cigna (Comma separated)" value={formData.insuranceAccepted.join(', ')} onChange={e => updateField('insuranceAccepted', e.target.value.split(',').map(s => s.trim()))} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none" />
                  </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                   <div className="flex items-center gap-4 mb-6">
                      <input type="checkbox" id="slidingScaleEdit" checked={formData.pricing.slidingScale} onChange={e => updateField('pricing.slidingScale', e.target.checked)} className="w-5 h-5 rounded border-slate-200 text-blue-500 focus:ring-blue-500" />
                      <div>
                         <label htmlFor="slidingScaleEdit" className="text-sm font-bold text-slate-900 cursor-pointer block">Enable Sliding Scale</label>
                         <p className="text-xs text-slate-500">Allow clients to pay within a range based on financial ability.</p>
                      </div>
                   </div>
                   
                   {formData.pricing.slidingScale && (
                      <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                         <FormInput label="Minimum Fee ($)" value={formData.pricing.minFee} onChange={(v: any) => updateField('pricing.minFee', parseInt(v))} type="number" />
                         <FormInput label="Maximum Fee ($)" value={formData.pricing.maxFee} onChange={(v: any) => updateField('pricing.maxFee', parseInt(v))} type="number" />
                      </div>
                   )}
                </div>
              </div>
            )}

            {activeSection === 'compliance' && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 space-y-4">
                  <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">Legal Status</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">Your account must maintain an active NPI registration and valid state board licensure to remain indexed on the TeleWellness Hub.</p>
                  <div className="flex items-center gap-4 pt-4">
                    <input type="checkbox" id="vAgreed" checked={formData.compliance.verificationAgreed} onChange={e => updateField('compliance.verificationAgreed', e.target.checked)} className="w-5 h-5 rounded border-blue-200 text-blue-500 focus:ring-blue-500" />
                    <label htmlFor="vAgreed" className="text-xs font-bold text-slate-700 uppercase tracking-widest cursor-pointer">Agree to manual verification auditing</label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-10 text-center text-slate-400 font-medium italic">
            Save your progress to reflect these changes across the directory.
          </div>
        </main>
      </div>
    </div>
  );
};
export default ProviderProfileEditView;