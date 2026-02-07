import { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { api } from '../services/api';
import { adminService } from '../services/admin';
import {
  User, ProviderProfile, BlogPost, ModerationStatus, UserRole
} from '../types';
import { useQuery } from '@tanstack/react-query';

export function useAdminDashboard() {
  const { user, logout } = useAuth();

  const validViews = [
    'overview',
    'messages',
    'users',
    'providers',
    'clients',
    'review',
    'endorsements',
    'testimonials',
    'blogs',
    'jobs',
    'tickets',
    'audit',
    'config',
    'applications',
  ] as const;
  type AdminView = (typeof validViews)[number];

  // Selection / Modal State
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | undefined>(undefined);
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddTestimonialModalOpen, setIsAddTestimonialModalOpen] = useState(false);

  // Filter States
  const [testimonialFilter, setTestimonialFilter] = useState<'all' | 'home' | 'partners'>('all');

  // Blog pagination
  const [blogsPage, setBlogsPage] = useState(1);

  useEffect(() => {
    const hash = window.location.hash || '';
    const query = hash.includes('?') ? hash.split('?')[1] : '';
    const tab = new URLSearchParams(query).get('tab');
    if (tab && validViews.includes(tab as AdminView)) {
      setActiveView(tab as AdminView);
    }
  }, []);

  // React Query Data Fetching
  const { data: stats = { users: 0, providers: 0, pending: 0, openTickets: 0 } } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getStats(),
    enabled: user?.role === UserRole.ADMIN,
    staleTime: 5 * 60 * 1000
  });

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

  const fetchContentData = () => {
    refetchBlogs();
    refetchTestimonials();
  };

  const handleAction = (action: string) => {
    if (action === 'addBlog') {
      setEditingBlog({ title: '', content: '', status: 'DRAFT' });
    } else if (action === 'addUser') {
      setIsAddUserModalOpen(true);
    } else if (action === 'addTestimonial') {
      setIsAddTestimonialModalOpen(true);
    }
  };

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
    if (window.confirm("Are you sure? This cannot be undone.")) {
      await adminService.deleteUser(id);
      setSelectedUser(null);
    }
  };

  const handleSaveBlog = async (blogData: Partial<BlogPost>) => {
    if (!blogData) return;
    if (blogData.id) {
      await api.updateBlog(blogData.id, blogData);
    } else {
      const newPost = {
        ...blogData,
        authorName: 'Admin',
        authorRole: 'Editor',
        publishedAt: new Date().toLocaleDateString(),
        status: 'APPROVED' as const
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

  const handleDeleteTestimonial = async (id: string) => {
    await api.deleteTestimonial(id);
    refetchTestimonials();
  };

  return {
    user,
    logout,
    activeView,
    setActiveView,
    selectedUser,
    setSelectedUser,
    selectedProvider,
    setSelectedProvider,
    editingBlog,
    setEditingBlog,
    isAddUserModalOpen,
    setIsAddUserModalOpen,
    isAddTestimonialModalOpen,
    setIsAddTestimonialModalOpen,
    testimonialFilter,
    setTestimonialFilter,
    blogsPage,
    setBlogsPage,
    stats,
    blogs,
    blogsTotalPages,
    blogsLoading,
    testimonials,
    tickets,
    fetchContentData,
    handleAction,
    handleModerateProvider,
    handleDeleteUser,
    handleSaveBlog,
    handleApproveBlog,
    handleDeleteBlog,
    handleDeleteTestimonial,
    refetchBlogs,
    refetchTestimonials,
  };
}
