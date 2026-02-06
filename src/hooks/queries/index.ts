
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from '../../services/api';
import { SearchFilters, UserRole } from '../../types';

// --- Keys ---
export const queryKeys = {
  users: {
    all: ['users'] as const,
    detail: (id: string) => [...queryKeys.users.all, id] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
  },
  providers: {
    all: ['providers'] as const,
    detail: (id: string) => [...queryKeys.providers.all, id] as const,
    byUser: (userId: string) => [...queryKeys.providers.all, 'byUser', userId] as const,
    search: (filters: SearchFilters) => [...queryKeys.providers.all, 'search', filters] as const,
  },
  appointments: {
    all: ['appointments'] as const,
    byUser: (userId: string, role: UserRole) => [...queryKeys.appointments.all, userId, role] as const,
  },
  blogs: {
    all: ['blogs'] as const,
    detail: (slug: string) => [...queryKeys.blogs.all, slug] as const,
  },
  specialties: {
    all: ['specialties'] as const,
  }
};

// --- User Queries ---

export const useUserById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => api.getUserById(id),
    enabled: !!id,
  });
};

export const useAllUsers = () => {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => api.getAllUsers(),
  });
};

// --- Provider Queries ---

export const useProvider = (id: string) => {
  return useQuery({
    queryKey: queryKeys.providers.detail(id),
    queryFn: () => api.getProviderById(id),
    enabled: !!id,
  });
};

export const useProviderByUserId = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.providers.byUser(userId),
    queryFn: () => api.getProviderByUserId(userId),
    enabled: !!userId,
  });
};

export const useProviderBySlugOrId = (slugOrId: string) => {
  return useQuery({
    queryKey: queryKeys.providers.detail(slugOrId),
    queryFn: () => api.fetchProviderBySlugOrId(slugOrId),
    enabled: !!slugOrId,
  });
};

export const useProvidersSearch = (filters: SearchFilters) => {
  return useQuery({
    queryKey: queryKeys.providers.search(filters),
    queryFn: () => api.search(filters),
    placeholderData: keepPreviousData,
  });
};

export const useAllProviders = () => {
  return useQuery({
    queryKey: queryKeys.providers.all,
    queryFn: () => api.getAllProviders(),
  });
};

// --- Appointment Queries ---

export const useAppointments = (userId: string, role: UserRole) => {
  return useQuery({
    queryKey: queryKeys.appointments.byUser(userId, role),
    queryFn: () => api.getAppointmentsForUser(userId, role),
    enabled: !!userId && !!role,
  });
};

// --- Blog Queries ---

export const useBlogPosts = () => {
  return useQuery({
    queryKey: queryKeys.blogs.all,
    queryFn: () => api.getAllBlogs(),
  });
};

export const useBlogBySlug = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.blogs.detail(slug),
    queryFn: () => api.getBlogBySlug(slug),
    enabled: !!slug,
  });
};

// --- Config Queries ---

export const useSpecialties = () => {
  return useQuery({
    queryKey: queryKeys.specialties.all,
    queryFn: () => api.getAllSpecialties(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};
