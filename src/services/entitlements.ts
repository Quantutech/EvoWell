import { mockStore } from './mockStore';
import { supabase, isConfigured } from './supabase';
import {
  Entitlement,
  FeatureCode,
  ProviderEntitlementOverride,
  SubscriptionTier,
  TierEntitlementTemplate,
} from '@/types';
import { providerService } from './provider.service';

const TIER_ENTITLEMENTS: TierEntitlementTemplate[] = [
  {
    tier: SubscriptionTier.FREE,
    features: {
      'feature.blog.author': true,
      'feature.exchange.author': true,
      'feature.exchange.publish_paid': false,
      'feature.analytics.advanced': false,
      'feature.team.seats': false,
      'feature.clients.registry': true,
    },
  },
  {
    tier: SubscriptionTier.PROFESSIONAL,
    features: {
      'feature.blog.author': true,
      'feature.exchange.author': true,
      'feature.exchange.publish_paid': true,
      'feature.analytics.advanced': true,
      'feature.team.seats': false,
      'feature.clients.registry': true,
    },
  },
  {
    tier: SubscriptionTier.PREMIUM,
    features: {
      'feature.blog.author': true,
      'feature.exchange.author': true,
      'feature.exchange.publish_paid': true,
      'feature.analytics.advanced': true,
      'feature.team.seats': true,
      'feature.clients.registry': true,
    },
  },
];

function templateForTier(tier: SubscriptionTier): TierEntitlementTemplate {
  return (
    TIER_ENTITLEMENTS.find((item) => item.tier === tier) ||
    TIER_ENTITLEMENTS.find((item) => item.tier === SubscriptionTier.FREE)!
  );
}

function toEntitlements(
  tier: SubscriptionTier,
  overrides: ProviderEntitlementOverride[],
): Entitlement[] {
  const template = templateForTier(tier);
  const features = { ...template.features };

  for (const override of overrides) {
    features[override.featureCode] = override.enabled;
  }

  return (Object.keys(features) as FeatureCode[]).map((featureCode) => {
    const override = overrides.find((item) => item.featureCode === featureCode);
    return {
      featureCode,
      enabled: features[featureCode],
      source: override ? 'override' : 'tier',
    };
  });
}

export interface IEntitlementService {
  getProviderEntitlements(providerId: string): Promise<Entitlement[]>;
  canUseFeature(providerId: string, featureCode: FeatureCode): Promise<boolean>;
  setEntitlementOverride(
    providerId: string,
    featureCode: FeatureCode,
    enabled: boolean,
    updatedBy?: string,
  ): Promise<void>;
}

class MockEntitlementService implements IEntitlementService {
  async getProviderEntitlements(providerId: string): Promise<Entitlement[]> {
    const provider = await providerService.getProviderById(providerId);
    const tier = provider?.subscriptionTier || SubscriptionTier.FREE;
    const overrides = mockStore.store.providerEntitlementOverrides.filter(
      (item) => item.providerId === providerId,
    );

    return toEntitlements(tier, overrides);
  }

  async canUseFeature(providerId: string, featureCode: FeatureCode): Promise<boolean> {
    const entitlements = await this.getProviderEntitlements(providerId);
    return entitlements.some((item) => item.featureCode === featureCode && item.enabled);
  }

  async setEntitlementOverride(
    providerId: string,
    featureCode: FeatureCode,
    enabled: boolean,
    updatedBy?: string,
  ): Promise<void> {
    const record: ProviderEntitlementOverride = {
      providerId,
      featureCode,
      enabled,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    mockStore.store.providerEntitlementOverrides = [
      ...mockStore.store.providerEntitlementOverrides.filter(
        (item) => item.providerId !== providerId || item.featureCode !== featureCode,
      ),
      record,
    ];

    mockStore.save();
  }
}

class SupabaseEntitlementService implements IEntitlementService {
  private fallback = new MockEntitlementService();

  async getProviderEntitlements(providerId: string): Promise<Entitlement[]> {
    if (!supabase) return this.fallback.getProviderEntitlements(providerId);

    try {
      const provider = await providerService.getProviderById(providerId);
      const tier = provider?.subscriptionTier || SubscriptionTier.FREE;
      const { data } = await (supabase.from('provider_entitlement_overrides') as any)
        .select('*')
        .eq('provider_id', providerId);

      const overrides: ProviderEntitlementOverride[] = (data || []).map((item: any) => ({
        providerId,
        featureCode: item.feature_code,
        enabled: Boolean(item.enabled),
        updatedAt: item.updated_at || new Date().toISOString(),
        updatedBy: item.updated_by || undefined,
      }));

      return toEntitlements(tier, overrides);
    } catch {
      return this.fallback.getProviderEntitlements(providerId);
    }
  }

  async canUseFeature(providerId: string, featureCode: FeatureCode): Promise<boolean> {
    const entitlements = await this.getProviderEntitlements(providerId);
    return entitlements.some((item) => item.featureCode === featureCode && item.enabled);
  }

  async setEntitlementOverride(
    providerId: string,
    featureCode: FeatureCode,
    enabled: boolean,
    updatedBy?: string,
  ): Promise<void> {
    if (!supabase) return this.fallback.setEntitlementOverride(providerId, featureCode, enabled, updatedBy);

    try {
      const { error } = await (supabase.from('provider_entitlement_overrides') as any).upsert({
        provider_id: providerId,
        feature_code: featureCode,
        enabled,
        updated_by: updatedBy || null,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch {
      await this.fallback.setEntitlementOverride(providerId, featureCode, enabled, updatedBy);
    }
  }
}

export const entitlementService: IEntitlementService =
  isConfigured && supabase ? new SupabaseEntitlementService() : new MockEntitlementService();
