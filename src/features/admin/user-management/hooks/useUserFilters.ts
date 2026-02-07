import { useState, useMemo } from 'react';
import { UserRole } from '@/types';

export interface UserFilters {
  search: string;
  role: string;
  status: string;
  dateRange: { start: string | null; end: string | null };
}

export const useUserFilters = () => {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    status: '',
    dateRange: { start: null, end: null }
  });

  const updateFilter = (key: keyof UserFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      role: '',
      status: '',
      dateRange: { start: null, end: null }
    });
  };

  return {
    filters,
    updateFilter,
    clearFilters
  };
};
