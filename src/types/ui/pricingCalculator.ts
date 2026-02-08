import { SubscriptionTier } from '@/types';

export type SlidingScaleAnchor = 'ACCESS' | 'SUSTAIN' | 'SPONSOR';

export interface SlidingScaleTierDefinition {
  anchor: SlidingScaleAnchor;
  title: string;
  badge: 'Minimum' | 'Recommended' | 'Supporter';
  description: string;
  summaryMessage: string;
  monthlyPrice: number;
  annualPrice: number;
}

export type SlidingScaleTierMap = Record<SubscriptionTier, SlidingScaleTierDefinition>;
