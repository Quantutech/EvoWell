import React, { useState, useEffect } from 'react';
import { JobPosting } from '@/types';
import { api } from '@/services/api';

const AdminJobsTab: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editJob, setEditJob] = useState<Partial<JobPosting>>({});

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await api.getAllJobs();
      setJobs(data);
    } catch (e) {
      console.error("Failed to load jobs", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.createJob(editJob); // Helper handles both create/update via localStorage overwrite strategy in api.ts
      setIsEditing(false);
      setEditJob({});
      fetchJobs();
    } catch (e) {
      alert("Failed to save job");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this job?")) {
        await api.deleteJob(id);
        fetchJobs();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
         <div>
            <h3 className="text-xl font-black text-slate-900">Career Opportunities</h3>
            <p className="text-slate-500 text-xs mt-1">Manage open positions.</p>
         </div>
         <button onClick={() => setIsEditing(true)} className="bg-brand-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-brand-600 transition-all">+ Post Job</button>
      </div>

      {isEditing && (
        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-4">Job Details</h4>
            <div className="grid gap-4">
                <input value={editJob.title || ''} onChange={e => setEditJob({...editJob, title: e.target.value})} placeholder="Job Title" className="w-full p-3 rounded-xl border border-slate-200" />
                <div className="grid grid-cols-2 gap-4">
                    <input value={editJob.department || ''} onChange={e => setEditJob({...editJob, department: e.target.value})} placeholder="Department" className="w-full p-3 rounded-xl border border-slate-200" />
                    <input value={editJob.location || ''} onChange={e => setEditJob({...editJob, location: e.target.value})} placeholder="Location" className="w-full p-3 rounded-xl border border-slate-200" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input value={editJob.type || ''} onChange={e => setEditJob({...editJob, type: e.target.value})} placeholder="Type (Full-time)" className="w-full p-3 rounded-xl border border-slate-200" />
                </div>
                <textarea value={editJob.description || ''} onChange={e => setEditJob({...editJob, description: e.target.value})} placeholder="Description" className="w-full p-3 rounded-xl border border-slate-200 h-32" />
                <div className="flex gap-2 justify-end">
                    <button onClick={() => setIsEditing(false)} className="px-6 py-3 text-slate-500 font-bold text-xs uppercase">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-3 bg-brand-500 text-white rounded-xl font-bold text-xs uppercase">Save Job</button>
                </div>
            </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
         <div className="divide-y divide-slate-100">
            {jobs.map(job => (
               <div key={job.id} className="p-6 flex justify-between items-center hover:bg-slate-50">
                  <div>
                     <h4 className="font-bold text-slate-900">{job.title}</h4>
                     <p className="text-xs text-slate-500">{job.department} • {job.location} • {job.type}</p>
                  </div>
                  <button onClick={() => handleDelete(job.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
               </div>
            ))}
            {jobs.length === 0 && <div className="p-12 text-center text-slate-400 italic">No active job listings.</div>}
         </div>
      </div>
    </div>
  );
};

export default AdminJobsTab;
