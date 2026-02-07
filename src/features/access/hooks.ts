import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/App';
import { api } from '@/services/api';
import { FeatureCode, PermissionCode } from '@/types';
import { derivePermissionsForUser } from './evaluator';

export function useAccess() {
  const { user } = useAuth();

  const localPermissions = useMemo(() => derivePermissionsForUser(user), [user]);

  const { data: remotePermissions } = useQuery({
    queryKey: ['access', 'permissions', user?.id],
    queryFn: () => api.getMyPermissions(user?.id),
    enabled: !!user,
  });

  const permissions = remotePermissions || localPermissions;

  const can = (permission: PermissionCode): boolean => permissions.includes(permission);

  return {
    permissions,
    can,
  };
}

export function useProviderEntitlements(providerId?: string | null) {
  const query = useQuery({
    queryKey: ['provider', 'entitlements', providerId],
    queryFn: () => api.getProviderEntitlements(providerId || ''),
    enabled: !!providerId,
  });

  const canUseFeature = (featureCode: FeatureCode): boolean => {
    return (query.data || []).some((entitlement) => entitlement.featureCode === featureCode && entitlement.enabled);
  };

  return {
    ...query,
    canUseFeature,
  };
}
