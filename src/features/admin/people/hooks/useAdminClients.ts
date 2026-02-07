import { useQuery } from '@tanstack/react-query';
import { adminService, GetClientsParams } from '@/services/admin';

export function useAdminClients(params: GetClientsParams) {
  return useQuery({
    queryKey: ['adminPeople', 'clients', params],
    queryFn: () => adminService.getClients(params),
    placeholderData: (previous) => previous,
  });
}
