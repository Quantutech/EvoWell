import { useQuery } from '@tanstack/react-query';
import { adminService, GetUsersParams } from '@/services/admin';

export function useAdminUsers(params: GetUsersParams) {
  return useQuery({
    queryKey: ['adminPeople', 'users', params],
    queryFn: () => adminService.getUsers(params),
    placeholderData: (previous) => previous,
  });
}
