import React, { useState, useEffect } from 'react';
import { SettingInput, MultiSelect } from '@/components/dashboard/DashboardComponents';
import { ProviderProfile, Specialty, User } from '@/types';
import { LANGUAGES_LIST } from '@/components/dashboard/constants';
import { getCommonTimezones, getUserTimezone } from '@/utils/timezone';
import { Select } from '@/components/ui';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import { US_STATES, AGE_GROUPS } from '@/data/constants';

interface ProviderSettingsProps {
  editForm: ProviderProfile;
  user: User;
  updateField: (path: string, value: any) => void;
  handleSaveProfile: () => void;
  isSaving: boolean;
  saveMessage: string;
  specialtiesList: Specialty[];
  handleAiBio: () => void;
  aiLoading: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProviderSettings: React.FC<ProviderSettingsProps> = ({ 
  editForm, user, updateField, handleSaveProfile, isSaving, saveMessage, specialtiesList, handleAiBio, aiLoading, handleImageUpload 
}) => {
  const [settingsSubTab, setSettingsSubTab] = useState<'profile' | 'practice' | 'business'>('profile');
  const [newDegree, setNewDegree] = useState({ degree: '', university: '', year: '' });
  const [availableTimezones, setAvailableTimezones] = useState<string[]>([]);

  useEffect(() => {
    setAvailableTimezones(getCommonTimezones());
    // Auto-detect if not set
    if (!editForm.timezone) {
      updateField('timezone', getUserTimezone());
    }
  }, []);

  const addEducation = () => {
    if (!newDegree.degree || !newDegree.university) return;
    const current = editForm?.educationHistory || [];
    updateField('educationHistory', [...current, { ...newDegree }]);
    setNewDegree({ degree: '', university: '', year: '' });
  };

  const removeEducation = (idx: number) => {
    const current = [...(editForm?.educationHistory || [])];
    current.splice(idx, 1);
    updateField('educationHistory', current);
  };

  // Helper for Media Links
  const addMediaLink = () => {
    const current = editForm.mediaLinks || [];
    updateField('mediaLinks', [...current, { title: '', url: '', type: 'video' }]);
  };

  const updateMediaLink = (idx: number, field: string, value: string) => {
    const current = [...(editForm.mediaLinks || [])];
    current[idx] = { ...current[idx], [field]: value };
    updateField('mediaLinks', current);
  };

  const removeMediaLink = (idx: number) => {
    const current = [...(editForm.mediaLinks || [])];
    current.splice(idx, 1);
    updateField('mediaLinks', current);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       {/* Success Message Banner */}
       {saveMessage && (
          <div className="bg-green-500 text-white px-6 py-4 rounded-2xl font-bold text-sm shadow-lg text-center sticky top-24 z-30 mb-6">
             {saveMessage}
          </div>
       )}

       <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[800px] flex flex-col md:flex-row">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-72 bg-slate-50 border-r border-slate-200 p-6 flex flex-col gap-2">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Profile Management</h3>
             
             <button
                onClick={() => setSettingsSubTab('profile')}
                className={`text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                   settingsSubTab === 'profile' 
                   ? 'bg-slate-900 text-white shadow-md' 
                   : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
             >
                Public Profile
             </button>
             <button
                onClick={() => setSettingsSubTab('practice')}
                className={`text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                   settingsSubTab === 'practice' 
                   ? 'bg-slate-900 text-white shadow-md' 
                   : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
             >
                Practice Details
             </button>
             <button
                onClick={() => setSettingsSubTab('business')}
                className={`text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                   settingsSubTab === 'business' 
                   ? 'bg-slate-900 text-white shadow-md' 
                   : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
             >
                Business & Legal
             </button>

             <div className="mt-auto pt-6 border-t border-slate-200">
                <button onClick={handleSaveProfile} disabled={isSaving} className="w-full bg-brand-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg disabled:opacity-50">
                   {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
             </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 lg:p-10 bg-white pb-32">
             {/* Header */}
             <div className="mb-8 pb-6 border-b border-slate-100">
                <h2 className="text-2xl font-black text-slate-900">
                   {settingsSubTab === 'profile' && 'Public Profile'}
                   {settingsSubTab === 'practice' && 'Practice Details'}
                   {settingsSubTab === 'business' && 'Business & Compliance'}
                </h2>
             </div>

             {/* Tab Content */}
             <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                {settingsSubTab === 'profile' && (
                   <div className="space-y-10">
                      {/* Image & Basic Info */}
                      <div className="flex flex-col md:flex-row gap-8 items-start">
                         <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center w-full md:w-auto flex-shrink-0">
                            <div className="relative w-32 h-32 mx-auto mb-4 group">
                               <img src={editForm.imageUrl} className="w-full h-full rounded-full object-cover border-4 border-white shadow-md" alt="Profile" />
                               <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                  <span className="text-white text-xs font-bold uppercase">Change</span>
                                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                               </label>
                            </div>
                            <button onClick={() => updateField('imageUrl', `https://i.pravatar.cc/300?u=${user.id}`)} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest">Remove Photo</button>
                         </div>
                         
                         <div className="flex-1 w-full space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                <SettingInput 
                                  label="First Name" 
                                  value={editForm.firstName || ''} 
                                  onChange={(v: string) => updateField('firstName', v)} 
                                  placeholder="First name"
                                />
                                <SettingInput 
                                  label="Last Name" 
                                  value={editForm.lastName || ''} 
                                  onChange={(v: string) => updateField('lastName', v)} 
                                  placeholder="Last name"
                                />
                             </div>
                             
                             <SettingInput label="Professional Title" value={editForm.professionalTitle} onChange={(v: string) => updateField('professionalTitle', v)} />
                             
                             <div className="grid grid-cols-2 gap-4">
                                <SettingInput label="Years Experience" value={editForm.yearsExperience} onChange={(v: string) => updateField('yearsExperience', parseInt(v))} />
                                <SettingInput label="Pronouns" value={editForm.pronouns} onChange={(v: string) => updateField('pronouns', v)} placeholder="e.g. She/Her" />
                             </div>
                         </div>
                      </div>

                      {/* Bio */}
                      <div className="space-y-2">
                          <div className="flex justify-between items-center">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biography</label>
                             <button onClick={handleAiBio} disabled={aiLoading} className="flex items-center gap-1 text-[9px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md hover:bg-brand-100 transition-colors">
                                <span className="text-lg leading-none">✨</span> {aiLoading ? 'Writing...' : 'AI Assist'}
                             </button>
                          </div>
                          <textarea rows={6} value={editForm.bio} onChange={(e) => updateField('bio', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20 resize-none leading-relaxed" />
                       </div>

                      {/* Education & Credentials */}
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Education History</label>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                               {(editForm.educationHistory || []).map((edu, i) => (
                                  <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                     <div>
                                        <p className="text-xs font-bold text-slate-900">{edu.degree}</p>
                                        <p className="text-[10px] text-slate-500">{edu.university} {edu.year ? `(${edu.year})` : ''}</p>
                                     </div>
                                     <button onClick={() => removeEducation(i)} className="text-slate-400 hover:text-red-500">×</button>
                                  </div>
                               ))}
                               <div className="grid grid-cols-3 gap-2">
                                  <input value={newDegree.degree} onChange={e => setNewDegree({...newDegree, degree: e.target.value})} placeholder="Degree (e.g. PhD)" className="bg-white border-none rounded-lg px-3 py-2 text-xs font-bold outline-none" />
                                  <input value={newDegree.university} onChange={e => setNewDegree({...newDegree, university: e.target.value})} placeholder="University" className="bg-white border-none rounded-lg px-3 py-2 text-xs font-bold outline-none" />
                                  <div className="flex gap-2">
                                     <input value={newDegree.year} onChange={e => setNewDegree({...newDegree, year: e.target.value})} placeholder="Year" className="w-16 bg-white border-none rounded-lg px-3 py-2 text-xs font-bold outline-none" />
                                     <button onClick={addEducation} className="flex-1 bg-slate-900 text-white rounded-lg text-xs font-bold">Add</button>
                                  </div>
                               </div>
                            </div>
                         </div>

                         <MultiSelect label="Languages Spoken" placeholder="Select languages..." options={LANGUAGES_LIST} selected={editForm.languages} onChange={(val) => updateField('languages', val)} />
                         <MultiSelect label="Clinical Specialties" placeholder="Select specialties..." options={specialtiesList.map(s => s.name)} selected={editForm.specialties.map(id => specialtiesList.find(s => s.id === id)?.name || id)} onChange={(names) => { const ids = names.map(n => specialtiesList.find(s => s.name === n)?.id || n); updateField('specialties', ids); }} />
                         <MultiSelect label="Ages Served" placeholder="Select age groups..." options={AGE_GROUPS} selected={editForm.agesServed || []} onChange={(val) => updateField('agesServed', val)} />
                      </div>
                   </div>
                )}

                {settingsSubTab === 'practice' && (
                   <div className="space-y-10">
                      <div className="space-y-6">
                         <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Physical Location</h4>
                         
                         {/* Timezone Selector */}
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Practice Timezone</label>
                            <Select 
                              options={availableTimezones}
                              value={editForm.timezone || getUserTimezone()} 
                              onChange={(val) => updateField('timezone', val)}
                              className="w-full"
                              placeholder="Select Timezone"
                            />
                            <p className="text-[9px] text-slate-400 ml-1">Your availability will be based on this timezone.</p>
                         </div>

                         {/* Updated Phone Field */}
                         <SettingInput label="Office Phone" value={editForm.phoneNumber || editForm.phone} onChange={(v: string) => { updateField('phoneNumber', v); updateField('phone', v); }} placeholder="(555) 123-4567" />
                         
                         <AddressAutocomplete 
                            value={editForm.address}
                            onChange={(addr) => updateField('address', addr)}
                            label="Office Address"
                         />

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                               <input value={editForm.address?.city || ''} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 cursor-not-allowed outline-none" />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                               <input value={editForm.address?.state || ''} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 cursor-not-allowed outline-none" />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zip Code</label>
                               <input value={editForm.address?.zip || ''} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 cursor-not-allowed outline-none" />
                            </div>
                         </div>
                      </div>
                      
                      <div className="space-y-6">
                         <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Digital Presence</h4>
                         <SettingInput label="Public Website" value={editForm.website} onChange={(v: string) => updateField('website', v)} placeholder="https://..." />
                         
                         {/* Media Links Section */}
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Media & Resources</label>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                               {(editForm.mediaLinks || []).map((link, i) => (
                                  <div key={i} className="flex gap-2 items-center">
                                     <input 
                                        value={link.title} 
                                        onChange={e => updateMediaLink(i, 'title', e.target.value)} 
                                        placeholder="Title" 
                                        className="flex-1 bg-white rounded-lg px-3 py-2 text-xs font-bold outline-none"
                                     />
                                     <input 
                                        value={link.url} 
                                        onChange={e => updateMediaLink(i, 'url', e.target.value)} 
                                        placeholder="URL" 
                                        className="flex-1 bg-white rounded-lg px-3 py-2 text-xs font-bold outline-none"
                                     />
                                     <select 
                                        value={link.type} 
                                        onChange={e => updateMediaLink(i, 'type', e.target.value)}
                                        className="bg-white rounded-lg px-2 py-2 text-xs font-bold outline-none w-20"
                                     >
                                        <option value="video">Video</option>
                                        <option value="podcast">Podcast</option>
                                        <option value="article">Article</option>
                                     </select>
                                     <button onClick={() => removeMediaLink(i)} className="text-red-400 hover:text-red-600 font-bold px-2">×</button>
                                  </div>
                               ))}
                               <button onClick={addMediaLink} className="w-full py-2 bg-white border border-slate-200 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors">
                                  + Add Media Link
                               </button>
                            </div>
                         </div>

                         <SettingInput label="LinkedIn Profile" value={editForm.social?.linkedin} onChange={(v: string) => updateField('social.linkedin', v)} />
                         <div className="grid grid-cols-2 gap-4">
                            <SettingInput label="Instagram" value={editForm.social?.instagram} onChange={(v: string) => updateField('social.instagram', v)} />
                            <SettingInput label="Twitter" value={editForm.social?.twitter} onChange={(v: string) => updateField('social.twitter', v)} />
                         </div>
                      </div>
                   </div>
                )}

                {settingsSubTab === 'business' && (
                   <div className="space-y-10">
                      <div className="space-y-6">
                         <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Legal Entity</h4>
                         <SettingInput label="Legal Business Name" value={editForm.businessInfo?.businessName} onChange={(v: string) => updateField('businessInfo.businessName', v)} />
                         <SettingInput label="Tax ID / EIN" value={editForm.businessInfo?.taxId} onChange={(v: string) => updateField('businessInfo.taxId', v)} />
                         
                         {/* Business Address Section */}
                         <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                            <AddressAutocomplete 
                               value={editForm.businessAddress}
                               onChange={(addr) => updateField('businessAddress', addr)}
                               label="Registered Business Address"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                                  <input value={editForm.businessAddress?.city || ''} readOnly className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-500 cursor-not-allowed outline-none" />
                               </div>
                               <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                                  <input value={editForm.businessAddress?.state || ''} readOnly className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-500 cursor-not-allowed outline-none" />
                               </div>
                               <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zip Code</label>
                                  <input value={editForm.businessAddress?.zip || ''} readOnly className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-500 cursor-not-allowed outline-none" />
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Clinical Licensure</h4>
                         <SettingInput label="NPI Number" value={editForm.npi} onChange={(v: string) => updateField('npi', v)} />
                         <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">License Verification</p>
                            {editForm.licenses.map((lic, i) => (
                               <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 mb-2 last:mb-0">
                                  <span className="text-xs font-bold text-slate-700">{lic.state} - {lic.number}</span>
                                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${lic.verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{lic.verified ? 'Verified' : 'Pending'}</span>
                               </div>
                            ))}
                            <button className="w-full text-center text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-2 hover:text-blue-600">+ Upload New License</button>
                         </div>
                      </div>
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

export default ProviderSettings;
