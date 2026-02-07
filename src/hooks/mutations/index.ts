import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { ProviderProfile, User, Appointment, UserRole } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { queryKeys } from '../queries';

// --- Provider Mutations ---

export const useUpdateProvider = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProviderProfile> }) => 
      api.updateProvider(id, data),
    onSuccess: (updatedProvider) => {
      addToast('success', 'Provider profile updated successfully');
      
      // Invalidate specific provider queries
      queryClient.invalidateQueries({ queryKey: queryKeys.providers.detail(updatedProvider.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.providers.byUser(updatedProvider.userId) });
      // Invalidate search results as data changed
      queryClient.invalidateQueries({ queryKey: queryKeys.providers.search({}) });
    },
  });
};

export const useModerateProvider = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) => 
      api.moderateProvider(id, status),
    onSuccess: (_, variables) => {
      addToast('success', 'Provider status updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.providers.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.providers.all });
    }
  });
};

// --- User Mutations ---

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => 
      api.updateUser(id, data),
    onSuccess: (updatedUser) => {
      addToast('success', 'User profile updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(updatedUser.id) });
    }
  });
};

// --- Appointment Mutations ---

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ providerId, clientId, time }: { providerId: string; clientId: string; time: string }) =>
      api.bookAppointment(providerId, clientId, time),
    onSuccess: (_, variables) => {
      addToast('success', 'Appointment booked successfully');
      // Invalidate appointments for both provider (need to map providerId to userId usually, but here we might just invalidate all appointments for safety or refetch specifics)
      // Since we don't strictly know the provider's userId here easily without a lookup, we might rely on the specific key invalidation in the components or invalidate general lists
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
    }
  });
};

// --- Blog Mutations ---

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: any) => api.createBlog(data),
    onSuccess: () => {
      addToast('success', 'Blog post created');
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
    }
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateBlog(id, data),
    onSuccess: (_, variables) => {
      addToast('success', 'Blog post updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.detail(variables.id) });
    }
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteBlog(id),
    onSuccess: () => {
      addToast('success', 'Blog post deleted');
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
    }
  });
};

// Aliases for backward compatibility
export const useCreateBlogPost = useCreateBlog;
export const useUpdateBlogPost = useUpdateBlog;
export const useDeleteBlogPost = useDeleteBlog;