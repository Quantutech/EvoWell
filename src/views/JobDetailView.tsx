import React, { useState, useEffect } from 'react';
import { useNavigation } from '../App';
import Breadcrumb from '../components/Breadcrumb';
import { api } from '../services/api';
import { JobPosting } from '../types';
import { Section, Container } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button, Card, Badge } from '../components/ui';

const JobDetailView: React.FC<{ jobId: string }> = ({ jobId }) => {
  const { navigate } = useNavigation();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', linkedin: '', resumeName: '', coverLetter: ''
  });

  useEffect(() => {
    api.getJobById(jobId).then(data => {
      setJob(data || null);
      setLoading(false);
    });
  }, [jobId]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationStatus('submitting');
    try {
      await api.applyToJob(jobId, form);
      setTimeout(() => { setApplicationStatus('success'); }, 1500);
    } catch (error) {
      alert("Something went wrong. Please try again.");
      setApplicationStatus('idle');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, resumeName: e.target.files[0].name });
    }
  };

  if (loading) return <div className="pt-40 text-center text-slate-400 animate-pulse font-black uppercase tracking-widest">Loading Position...</div>;
  if (!job) return <div className="pt-40 text-center text-slate-400 font-medium">Job posting not found. <Button variant="ghost" onClick={() => navigate('#/careers')}>Back to Careers</Button></div>;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
      <Breadcrumb items={[{ label: 'Careers', href: '#/careers' }, { label: job.title }]} />

      <Section spacing="sm">
        <Container>
          {/* Header Card */}
          <Card variant="default" size="lg" className="mb-10 text-center lg:text-left relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50/50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
             
             <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div>
                   <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                      <Badge variant="brand">{job.department}</Badge>
                      <Badge variant="neutral">{job.location}</Badge>
                   </div>
                   <Heading level={1} className="mb-4">{job.title}</Heading>
                   <Label variant="badge" color="muted">Posted {job.postedAt} • {job.type}</Label>
                </div>
                <Button 
                   onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}
                   variant="brand"
                   className="mx-auto lg:mx-0"
                >
                   Apply Now
                </Button>
             </div>
          </Card>

          <div className="grid lg:grid-cols-3 gap-10 items-start">
             
             {/* Job Details */}
             <div className="lg:col-span-2 space-y-8">
                <Card variant="default" size="lg" className="space-y-10">
                   <section>
                      <Heading level={3} className="mb-6">About the Role</Heading>
                      <Text variant="lead">{job.description}</Text>
                   </section>

                   <section>
                      <Heading level={3} className="mb-6">Responsibilities</Heading>
                      <ul className="space-y-4">
                         {job.responsibilities.map((res, i) => (
                            <li key={i} className="flex gap-4 items-start group">
                               <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-brand-100 transition-colors">
                                  <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                               </div>
                               <Text>{res}</Text>
                            </li>
                         ))}
                      </ul>
                   </section>

                   <section>
                      <Heading level={3} className="mb-6">Requirements</Heading>
                      <ul className="space-y-4">
                         {job.requirements.map((req, i) => (
                            <li key={i} className="flex gap-4 items-start group">
                               <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-slate-100 transition-colors">
                                  <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                               </div>
                               <Text>{req}</Text>
                            </li>
                         ))}
                      </ul>
                   </section>
                </Card>
             </div>

             {/* Application Form */}
             <div className="lg:col-span-1 relative">
                <Card id="application-form" variant="elevated" className="sticky top-32">
                   {applicationStatus === 'success' ? (
                      <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                         <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                         </div>
                         <Heading level={3} className="mb-2">Application Sent!</Heading>
                         <Text className="mb-8">Thank you for your interest. We'll be in touch soon.</Text>
                         <Button variant="ghost" onClick={() => navigate('#/careers')}>View other roles</Button>
                      </div>
                   ) : (
                      <form onSubmit={handleApply} className="space-y-6">
                         <Heading level={3} className="mb-2">Apply for this Job</Heading>
                         
                         <div className="space-y-2">
                            <Label className="ml-1">First Name</Label>
                            <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="Jane" />
                         </div>
                         
                         <div className="space-y-2">
                            <Label className="ml-1">Last Name</Label>
                            <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="Doe" />
                         </div>

                         <div className="space-y-2">
                            <Label className="ml-1">Email</Label>
                            <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="jane@example.com" />
                         </div>

                         <div className="space-y-2">
                            <Label className="ml-1">LinkedIn URL</Label>
                            <input required value={form.linkedin} onChange={e => setForm({...form, linkedin: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="linkedin.com/in/jane" />
                         </div>

                         <div className="space-y-2">
                            <Label className="ml-1">Resume/CV</Label>
                            <label className="flex items-center justify-center w-full px-4 py-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-all">
                               <div className="text-center">
                                  {form.resumeName ? (
                                     <Text variant="small" weight="bold" color="brand">{form.resumeName}</Text>
                                  ) : (
                                     <div className="space-y-1">
                                        <svg className="w-6 h-6 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                        <Label variant="badge" color="muted">Upload PDF</Label>
                                     </div>
                                  )}
                               </div>
                               <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                            </label>
                         </div>

                         <div className="space-y-2">
                            <Label className="ml-1">Cover Letter</Label>
                            <textarea rows={4} value={form.coverLetter} onChange={e => setForm({...form, coverLetter: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500/20 resize-none" placeholder="Tell us why you're a great fit..." />
                         </div>

                         <Button 
                            fullWidth
                            variant="primary"
                            disabled={applicationStatus === 'submitting'}
                            loading={applicationStatus === 'submitting'}
                         >
                            {applicationStatus === 'submitting' ? 'Submitting...' : 'Submit Application'}
                         </Button>
                      </form>
                   )}
                </Card>
             </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default JobDetailView;