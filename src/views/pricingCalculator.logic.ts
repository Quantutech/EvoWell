import { SubscriptionTier } from '@/types';
import type { SlidingScaleTierMap } from '@/types/ui/pricingCalculator';

export interface CalculatorInputs {
  sessionsPerMonth: number;
  avgSessionRate: number;
  billingCycle: 'monthly' | 'annual';
}

export interface SlidingScalePlan {
  id: SubscriptionTier;
  anchorTitle: string;
  badge: string;
  description: string;
  summaryMessage: string;
  monthlyPrice: number;
  annualPrice: number;
}

export interface PlanEstimate extends SlidingScalePlan {
  membershipCost: number;
  estimatedMonthlyRevenue: number;
  takeHomeEstimate: number;
  effectiveCostPct: number;
  perSessionCost: number;
}

// Monthly anchor values confirmed by product direction:
// Access: $29, Sustain: $69, Sponsor: $129
export const SLIDING_SCALE_TIER_MAP: SlidingScaleTierMap = {
  [SubscriptionTier.FREE]: {
    anchor: 'ACCESS',
    title: 'Access (Minimum)',
    badge: 'Minimum',
    description: 'For early-stage, rebuilding, or limited caseload.',
    summaryMessage:
      'A solid starting point. You can increase your contribution anytime as your caseload grows.',
    monthlyPrice: 29,
    annualPrice: 23,
  },
  [SubscriptionTier.PROFESSIONAL]: {
    anchor: 'SUSTAIN',
    title: 'Sustain (Recommended)',
    badge: 'Recommended',
    description: 'The most common choice. Supports platform operations and support.',
    summaryMessage: 'The recommended choice-balanced for most providers.',
    monthlyPrice: 69,
    annualPrice: 55,
  },
  [SubscriptionTier.PREMIUM]: {
    anchor: 'SPONSOR',
    title: 'Sponsor (Supporter)',
    badge: 'Supporter',
    description: 'Helps subsidize other providers and funds new tools.',
    summaryMessage:
      'Thank you. Your contribution helps subsidize access and accelerates new features.',
    monthlyPrice: 129,
    annualPrice: 103,
  },
};

export function buildSlidingScalePlans(
  tiers: Array<{ id: SubscriptionTier }>,
): SlidingScalePlan[] {
  return tiers
    .map((tier) => {
      const mapped = SLIDING_SCALE_TIER_MAP[tier.id];
      if (!mapped) {
        return null;
      }

      return {
        id: tier.id,
        anchorTitle: mapped.title,
        badge: mapped.badge,
        description: mapped.description,
        summaryMessage: mapped.summaryMessage,
        monthlyPrice: mapped.monthlyPrice,
        annualPrice: mapped.annualPrice,
      };
    })
    .filter((plan): plan is SlidingScalePlan => plan !== null);
}

export function computePlanEstimates(
  inputs: CalculatorInputs,
  plans: SlidingScalePlan[],
): PlanEstimate[] {
  const estimatedMonthlyRevenue = inputs.sessionsPerMonth * inputs.avgSessionRate;

  return plans.map((plan) => {
    const membershipCost =
      inputs.billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
    const takeHomeEstimate = estimatedMonthlyRevenue - membershipCost;
    const effectiveCostPct =
      estimatedMonthlyRevenue > 0
        ? (membershipCost / estimatedMonthlyRevenue) * 100
        : 0;
    const perSessionCost =
      inputs.sessionsPerMonth > 0
        ? membershipCost / inputs.sessionsPerMonth
        : 0;

    return {
      ...plan,
      membershipCost,
      estimatedMonthlyRevenue,
      takeHomeEstimate,
      effectiveCostPct,
      perSessionCost,
    };
  });
}
