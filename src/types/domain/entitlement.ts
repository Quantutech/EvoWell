import { SubscriptionTier } from '../../data/types/enums';

export type FeatureCode =
  | 'feature.blog.author'
  | 'feature.exchange.author'
  | 'feature.exchange.publish_paid'
  | 'feature.analytics.advanced'
  | 'feature.team.seats'
  | 'feature.clients.registry';

export interface Entitlement {
  featureCode: FeatureCode;
  enabled: boolean;
  source: 'tier' | 'override';
}

export interface ProviderEntitlementOverride {
  providerId: string;
  featureCode: FeatureCode;
  enabled: boolean;
  updatedAt: string;
  updatedBy?: string;
}

export interface TierEntitlementTemplate {
  tier: SubscriptionTier;
  features: Record<FeatureCode, boolean>;
}
