import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { BlogPostForm } from '@/types/domain/blog';
import { queryKeys } from '../queries';

export const useBlogMutations = () => {
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: (formData: BlogPostForm) => api.createBlog(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: Partial<BlogPostForm> }) => 
      api.updateBlog(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: string) => api.deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
    },
  });

  return {
    createPost: createPostMutation.mutateAsync,
    updatePost: updatePostMutation.mutateAsync,
    deletePost: deletePostMutation.mutateAsync,
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
  };
};