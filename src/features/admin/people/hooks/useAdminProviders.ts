import { useQuery } from '@tanstack/react-query';
import { adminService, GetProvidersParams } from '@/services/admin';

export function useAdminProviders(params: GetProvidersParams) {
  return useQuery({
    queryKey: ['adminPeople', 'providers', params],
    queryFn: () => adminService.getProviders(params),
    placeholderData: (previous) => previous,
  });
}
