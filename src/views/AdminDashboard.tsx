import React, { useState } from 'react';
import { useAuth, useNavigation } from '../App';
import { api } from '../services/api';
import { adminService } from '../services/admin';
import { 
  User, ProviderProfile, BlogPost, Testimonial, SupportTicket, 
  Specialty, InsuranceCompany, BlogCategory, ModerationStatus, 
  UserRole
} from '../types';
import AdminDashboardLayout from '../components/dashboard/AdminDashboardLayout';
import { useQuery } from '@tanstack/react-query';

// Tabs
import AdminOverviewTab from '../components/dashboard/tabs/admin/AdminOverviewTab';
import AdminMessagesTab from '../components/dashboard/tabs/admin/AdminMessagesTab';
import { UserManagementView } from '../features/admin/user-management/views/UserManagementView';
import { PractitionersTab } from '../features/admin/user-management/views/PractitionersTab';
import { ContentManagementView } from '../features/admin/content-management/views/ContentManagementView';
import AdminTestimonialsTab from '../components/dashboard/tabs/admin/AdminTestimonialsTab';
import AdminTicketsTab from '../components/dashboard/tabs/admin/AdminTicketsTab';
import AdminConfigTab from '../components/dashboard/tabs/admin/AdminConfigTab';
import AdminAuditTab from '../components/dashboard/tabs/admin/AdminAuditTab';
import AdminApplicationsTab from '../components/dashboard/tabs/admin/AdminApplicationsTab';
import AdminContentReviewTab from '../components/dashboard/tabs/admin/AdminContentReviewTab';
import AdminEndorsementsTab from '../components/dashboard/tabs/admin/AdminEndorsementsTab';
import AdminClientsTab from '../components/dashboard/tabs/admin/AdminClientsTab';
import AdminJobsTab from '../components/dashboard/tabs/admin/AdminJobsTab';
import { ResetDataButton } from '../components/dashboard/tabs/admin/ResetDataButton';
import AddUserModal from '../components/dashboard/tabs/admin/AddUserModal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { providerProfileSchema } from '../utils/validation-schemas';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { navigate } = useNavigation();
  const [activeView, setActiveView] = useState('overview');
  
  // Selection / Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | undefined>(undefined);
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  
  // Filter States
  const [testimonialFilter, setTestimonialFilter] = useState<'all' | 'home' | 'partners'>('all');

  // Config Input States
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newInsurance, setNewInsurance] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newGender, setNewGender] = useState('');

  // React Query Data Fetching
  const { data: stats = { users: 0, providers: 0, pending: 0, openTickets: 0 } } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getStats(),
    enabled: user?.role === UserRole.ADMIN,
    staleTime: 5 * 60 * 1000
  });

  const [blogsPage, setBlogsPage] = useState(1);
  const { data: blogsData, refetch: refetchBlogs, isLoading: blogsLoading } = useQuery({
    queryKey: ['adminBlogs', blogsPage],
    queryFn: () => api.getAllBlogs({ page: blogsPage, limit: 10 }),
    enabled: user?.role === UserRole.ADMIN
  });
  const blogs = blogsData?.data || [];
  const blogsTotalPages = Math.ceil((blogsData?.total || 0) / 10);

  const { data: testimonials = [], refetch: refetchTestimonials } = useQuery({
    queryKey: ['adminTestimonials'],
    queryFn: () => api.getTestimonials(),
    enabled: user?.role === UserRole.ADMIN
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['adminTickets'],
    queryFn: () => api.getTickets(),
    enabled: user?.role === UserRole.ADMIN
  });

  const { data: specialties = [], refetch: refetchSpecialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => api.getAllSpecialties()
  });

  const { data: insurance = [], refetch: refetchInsurance } = useQuery({
    queryKey: ['insurance'],
    queryFn: () => api.getAllInsurance()
  });

  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getAllBlogCategories()
  });

  const { data: languages = [], refetch: refetchLanguages } = useQuery({
    queryKey: ['languages'],
    queryFn: () => api.getAllLanguages()
  });

  const { data: genders = [], refetch: refetchGenders } = useQuery({
    queryKey: ['genders'],
    queryFn: () => api.getAllGenders()
  });

  const fetchContentData = () => {
    refetchBlogs();
    refetchTestimonials();
    refetchSpecialties();
    refetchInsurance();
    refetchCategories();
    refetchLanguages();
    refetchGenders();
  };

  const handleAction = (action: string) => {
    if (action === 'addBlog') {
        setEditingBlog({ title: '', content: '', status: 'DRAFT' });
    } else if (action === 'addUser') {
        setIsAddUserModalOpen(true);
    }
  };

  // --- Handlers ---

  const handleModerateProvider = async (id: string, status: ModerationStatus) => {
    try {
        await api.moderateProvider(id, status);
        if (selectedProvider && selectedProvider.id === id) {
            setSelectedProvider({ ...selectedProvider, moderationStatus: status });
        }
    } catch (e) {
        console.error("Failed to moderate provider", e);
    }
  };

  const handleDeleteUser = async (id: string) => {
    // Legacy Handler for modal, logic moved to service but modal needs it
    if (window.confirm("Are you sure? This cannot be undone.")) {
        await api.deleteUser(id);
        setSelectedUser(null);
    }
  };

  // Blog Handlers
  const handleSaveBlog = async (blogData: Partial<BlogPost>) => {
    if (!blogData) return;
    
    // Check if updating existing or creating new
    if (blogData.id) {
        await api.updateBlog(blogData.id, blogData);
    } else {
        // Since api.createBlog expects a specific shape (Omit<BlogPost, 'id'>)
        // We ensure we pass the required fields for a new admin post
        const newPost = {
            ...blogData,
            authorName: 'Admin',
            authorRole: 'Editor',
            publishedAt: new Date().toLocaleDateString(),
            status: 'APPROVED' as const // Admins auto-approve their own
        };
        await api.createBlog(newPost as any);
    }
    setEditingBlog(null);
    refetchBlogs();
  };

  const handleApproveBlog = async (id: string) => {
      await api.approveBlog(id);
      refetchBlogs();
  };

  const handleDeleteBlog = async (id: string) => {
      if (window.confirm("Delete this post?")) {
          await api.deleteBlog(id);
          refetchBlogs();
      }
  };

  // Config Handlers
  const handleAddConfig = async (type: 'specialty' | 'insurance' | 'category' | 'language' | 'gender') => {
      if (type === 'specialty' && newSpecialty) {
          await api.createSpecialty(newSpecialty);
          setNewSpecialty('');
          refetchSpecialties();
      } else if (type === 'insurance' && newInsurance) {
          await api.createInsurance(newInsurance);
          setNewInsurance('');
          refetchInsurance();
      } else if (type === 'category' && newCategory) {
          await api.createBlogCategory(newCategory);
          setNewCategory('');
          refetchCategories();
      } else if (type === 'language' && newLanguage) {
          await api.createLanguage(newLanguage);
          setNewLanguage('');
          refetchLanguages();
      } else if (type === 'gender' && newGender) {
          await api.createGender(newGender);
          setNewGender('');
          refetchGenders();
      }
  };

  const handleDeleteConfig = async (type: 'specialty' | 'insurance' | 'category' | 'language' | 'gender', id: string) => {
      if (type === 'specialty') { await api.deleteSpecialty(id); refetchSpecialties(); }
      else if (type === 'insurance') { await api.deleteInsurance(id); refetchInsurance(); }
      else if (type === 'category') { await api.deleteBlogCategory(id); refetchCategories(); }
      else if (type === 'language') { await api.deleteLanguage(id); refetchLanguages(); }
      else if (type === 'gender') { await api.deleteGender(id); refetchGenders(); }
  };

  const handleDeleteTestimonial = async (id: string) => {
      await api.deleteTestimonial(id);
      refetchTestimonials();
  };

  if (!user || user.role !== UserRole.ADMIN) return null;

  return (
    <AdminDashboardLayout 
      user={user} 
      activeView={activeView} 
      setActiveView={setActiveView} 
      onLogout={logout}
      onAction={handleAction}
    >
      {activeView === 'overview' && <AdminOverviewTab />}
      
      {activeView === 'messages' && <AdminMessagesTab users={[]} />}
      
      {activeView === 'users' && (
        <UserManagementView 
          onAddUser={() => setIsAddUserModalOpen(true)}
          onEditUser={(u) => setSelectedUser(u as any)}
        />
      )}

      {activeView === 'clients' && <AdminClientsTab />}
      
      {activeView === 'providers' && (
        <PractitionersTab 
          onAddSpecialist={() => setIsAddUserModalOpen(true)} // Using same modal for now
        />
      )}

      {activeView === 'applications' && <AdminApplicationsTab />}

      {/* New Content Moderation Tab */}
      {activeView === 'review' && <AdminContentReviewTab />}

      {/* Endorsements Management */}
      {activeView === 'endorsements' && <AdminEndorsementsTab />}
      
      {activeView === 'testimonials' && (
        <AdminTestimonialsTab 
            testimonials={testimonials} 
            filter={testimonialFilter} 
            setFilter={setTestimonialFilter} 
            onDelete={handleDeleteTestimonial} 
        />
      )}
      
      {activeView === 'blogs' && <ContentManagementView />}

      {activeView === 'jobs' && <AdminJobsTab />}
      
      {activeView === 'tickets' && <AdminTicketsTab tickets={tickets} />}

      {activeView === 'audit' && <AdminAuditTab />}
      
      {activeView === 'config' && (
        <AdminConfigTab 
            specialties={specialties}
            insurance={insurance}
            categories={categories}
            newSpecialty={newSpecialty}
            setNewSpecialty={setNewSpecialty}
            onAddSpecialty={() => handleAddConfig('specialty')}
            onDeleteSpecialty={(id) => handleDeleteConfig('specialty', id)}
            newInsurance={newInsurance}
            setNewInsurance={setNewInsurance}
            onAddInsurance={() => handleAddConfig('insurance')}
            onDeleteInsurance={(id) => handleDeleteConfig('insurance', id)}
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            onAddCategory={() => handleAddConfig('category')}
            onDeleteCategory={(id) => handleDeleteConfig('category', id)}
            languages={languages}
            newLanguage={newLanguage}
            setNewLanguage={setNewLanguage}
            onAddLanguage={() => handleAddConfig('language')}
            onDeleteLanguage={(id) => handleDeleteConfig('language', id)}
            genders={genders}
            newGender={newGender}
            setNewGender={setNewGender}
            onAddGender={() => handleAddConfig('gender')}
            onDeleteGender={(id) => handleDeleteConfig('gender', id)}
        />
      )}

      {activeView === 'config' && <ResetDataButton />}

      {isAddUserModalOpen && (
        <AddUserModal 
            onClose={() => setIsAddUserModalOpen(false)}
            onSuccess={() => {
                // Refresh data based on current view
                if (activeView === 'users') refetchBlogs(); // Actually refetch users not blogs, but users tab uses internal fetching or prop? 
                // AdminUsersTab fetches internally via AdminService?
                // Wait, AdminUsersTab might need a refresh trigger. 
                // For now, reload the page or rely on react-query invalidation if we used it.
                // AdminService.getUsers is called by useQuery? 
                // No, AdminOverviewTab passes users prop, but AdminUsersTab handles its own data?
                // Let's check AdminUsersTab later. For now just close.
                fetchContentData();
            }}
        />
      )}

      {/* Detail Modal for User/Provider Management */}
      {(selectedUser || selectedProvider) && (
        <DetailModal 
            user={selectedUser!} 
            provider={selectedProvider} 
            onClose={() => { setSelectedUser(null); setSelectedProvider(undefined); }}
            onUpdateProvider={async (id, data) => {
                await api.updateProvider(id, data);
            }}
            onRefresh={fetchContentData}
            onModerate={handleModerateProvider}
            onDeleteUser={handleDeleteUser}
        />
      )}
    </AdminDashboardLayout>
  );
};

// ... DetailModal Component (Kept same as before) ...
const DetailModal = ({ user: u, provider: p, onClose, onUpdateProvider, onRefresh, onModerate, onDeleteUser }: { 
    user: User, 
    provider?: ProviderProfile, 
    onClose: () => void,
    onUpdateProvider: (id: string, data: any) => Promise<void>,
    onRefresh: () => void,
    onModerate: (id: string, status: ModerationStatus) => void,
    onDeleteUser: (id: string) => void
}) => {
    const [tab, setTab] = useState<'actions' | 'edit'>('actions');
    
    const { register, handleSubmit, setValue, watch } = useForm<ProviderProfile>({
        resolver: zodResolver(providerProfileSchema) as any,
        defaultValues: p || undefined
    });

    const editForm = watch();

    const updateAddress = (field: string, value: string) => {
      setValue('businessAddress', { ...(editForm.businessAddress || {}), [field]: value } as any);
    };

  // In the DetailModal component, update the save function:
  const handleSaveDetails = async (data: ProviderProfile) => {
      try {
          await onUpdateProvider(data.id, data);
          alert("Provider details updated.");
          onRefresh();
      } catch (e) {
          alert("Failed to update provider.");
      }
  };

    return (
      <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-black text-slate-900">Manage {u ? u.firstName : 'Provider'}</h2>
             <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setTab('actions')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'actions' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Actions</button>
                {p && <button onClick={() => setTab('edit')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'edit' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Edit Profile</button>}
             </div>
           </div>

           <div className="overflow-y-auto custom-scrollbar flex-grow p-1">
             {tab === 'actions' && (
               <div className="space-y-4">
                  {p && (
                      <>
                        <div className="bg-slate-50 p-4 rounded-xl mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Status</p>
                            <p className={`text-lg font-black ${p.moderationStatus === ModerationStatus.APPROVED ? 'text-green-600' : 'text-amber-600'}`}>{p.moderationStatus}</p>
                        </div>
                        {p.moderationStatus !== ModerationStatus.APPROVED && (
                            <button onClick={() => onModerate(p.id, ModerationStatus.APPROVED)} className="w-full py-3 bg-green-100 text-green-700 rounded-xl font-bold text-xs uppercase hover:bg-green-200 transition-colors">Approve Provider</button>
                        )}
                        {p.moderationStatus !== ModerationStatus.REJECTED && (
                            <button onClick={() => onModerate(p.id, ModerationStatus.REJECTED)} className="w-full py-3 bg-amber-100 text-amber-700 rounded-xl font-bold text-xs uppercase hover:bg-amber-200 transition-colors">Reject Provider</button>
                        )}
                      </>
                  )}
                  {u && <button onClick={() => { onDeleteUser(u.id); onClose(); }} className="w-full py-3 bg-red-100 text-red-700 rounded-xl font-bold text-xs uppercase hover:bg-red-200 transition-colors">Delete User</button>}
                  <button onClick={onClose} className="w-full py-3 border border-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase hover:bg-slate-50 transition-colors">Close</button>
               </div>
             )}

             {tab === 'edit' && editForm && (
               <div className="space-y-6">
                  {/* Identity */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Identity</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Profile Slug</label>
                            <input {...register('profileSlug')} className="w-full bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="dr-name-specialty" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Pronouns</label>
                            <input {...register('pronouns')} className="w-full bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="They/Them" />
                        </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Contact & Web</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                            <input {...register('phoneNumber')} className="w-full bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="(555) 000-0000" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Website</label>
                            <input {...register('website')} className="w-full bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="https://" />
                        </div>
                    </div>
                  </div>

                  {/* Business Address */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Business Address</h4>
                    <input value={editForm.businessAddress?.street || ''} onChange={e => updateAddress('street', e.target.value)} className="w-full bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold outline-none mb-2 focus:ring-2 focus:ring-brand-500/20" placeholder="Street Address" />
                    <div className="grid grid-cols-3 gap-2">
                        <input value={editForm.businessAddress?.city || ''} onChange={e => updateAddress('city', e.target.value)} className="bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="City" />
                        <input value={editForm.businessAddress?.state || ''} onChange={e => updateAddress('state', e.target.value)} className="bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="State" />
                        <input value={editForm.businessAddress?.zip || ''} onChange={e => updateAddress('zip', e.target.value)} className="bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="Zip" />
                    </div>
                  </div>

                  <button onClick={handleSubmit(handleSaveDetails)} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all">Save Changes</button>
               </div>
             )}
           </div>
        </div>
      </div>
    );
};

export default AdminDashboard;
