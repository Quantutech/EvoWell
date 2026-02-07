import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin';

export const useAdminStats = () => {
  const queryKey = ['adminStats'];

  const query = useQuery({
    queryKey,
    queryFn: () => adminService.getStats(),
    refetchInterval: 30000, // Poll every 30s as a fallback
    staleTime: 10000,
  });

  return query;
};
