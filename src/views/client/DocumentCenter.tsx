import React, { useState, useEffect } from 'react';
import { useAuth } from '@/App';
import { api } from '@/services/api';
import { storageService } from '@/services/storageService';
import { ClientProfile } from '@/types';

const DocumentCenter: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const p = await api.getClientProfile(user.id);
      setProfile(p || null);
    } catch (e) {
      console.error("Failed to load client profile", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const url = await storageService.uploadFile(file, `clients/${user.id}/docs/${Date.now()}_${file.name}`);
      
      // Update profile
      const newDoc = { type, url, uploadedAt: new Date().toISOString() };
      const currentDocs = profile?.documents || [];
      
      await api.updateClientProfile(user.id, {
        documents: [...currentDocs, newDoc]
      });
      
      await loadProfile(); // Refresh
      alert("Document uploaded successfully.");
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;
  if (loading) return <div className="p-12 text-center text-slate-400">Loading vault...</div>;

  const docs = profile?.documents || [];
  const insurance = docs.filter(d => d.type === 'Insurance Card');
  const idDocs = docs.filter(d => d.type === 'Identification');
  const records = docs.filter(d => d.type === 'Medical Record');

  const UploadSection = ({ title, type, items }: { title: string, type: string, items: any[] }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                <p className="text-xs text-slate-500 mt-1">{items.length} files uploaded</p>
            </div>
            <label className={`cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploading ? 'Uploading...' : 'Upload'}
                <input type="file" className="hidden" onChange={(e) => handleUpload(e, type)} disabled={uploading} />
            </label>
        </div>
        
        <div className="space-y-2">
            {items.length > 0 ? items.map((doc, i) => (
                <a key={i} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors group">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-lg shadow-sm">📄</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">Document {i + 1}</p>
                        <p className="text-[10px] text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            )) : (
                <div className="p-4 text-center border-2 border-dashed border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-400">No documents yet</p>
                </div>
            )}
        </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl">🔒</div>
            <div>
                <h1 className="text-2xl font-black text-slate-900">Secure Document Center</h1>
                <p className="text-slate-500">Manage your private health records and insurance information.</p>
            </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UploadSection title="Insurance Cards" type="Insurance Card" items={insurance} />
            <UploadSection title="Photo ID" type="Identification" items={idDocs} />
            <UploadSection title="Medical Records" type="Medical Record" items={records} />
        </div>
    </div>
  );
};

export default DocumentCenter;
