import { describe, expect, it } from 'vitest';
import { PRICING_TIERS } from '../../src/config/pricing';
import { SubscriptionTier } from '../../src/types';
import {
  buildSlidingScalePlans,
  computePlanEstimates,
} from '../../src/views/pricingCalculator.logic';

describe('Pricing calculator logic', () => {
  it('maps FREE/PROFESSIONAL/PREMIUM to Access/Sustain/Sponsor anchors', () => {
    const plans = buildSlidingScalePlans(PRICING_TIERS);

    expect(plans).toHaveLength(3);
    expect(plans.find((plan) => plan.id === SubscriptionTier.FREE)?.anchorTitle).toBe(
      'Access (Minimum)',
    );
    expect(
      plans.find((plan) => plan.id === SubscriptionTier.PROFESSIONAL)?.anchorTitle,
    ).toBe('Sustain (Recommended)');
    expect(plans.find((plan) => plan.id === SubscriptionTier.PREMIUM)?.anchorTitle).toBe(
      'Sponsor (Supporter)',
    );
  });

  it('computes monthly and annual values using calculator formulas', () => {
    const plans = buildSlidingScalePlans(PRICING_TIERS);

    const monthly = computePlanEstimates(
      {
        sessionsPerMonth: 40,
        avgSessionRate: 150,
        billingCycle: 'monthly',
      },
      plans,
    );
    const sustainMonthly = monthly.find(
      (plan) => plan.id === SubscriptionTier.PROFESSIONAL,
    );
    expect(sustainMonthly?.membershipCost).toBe(69);
    expect(sustainMonthly?.estimatedMonthlyRevenue).toBe(6000);
    expect(sustainMonthly?.takeHomeEstimate).toBe(5931);
    expect(sustainMonthly?.perSessionCost).toBeCloseTo(1.725, 3);
    expect(sustainMonthly?.effectiveCostPct).toBeCloseTo(1.15, 2);

    const annual = computePlanEstimates(
      {
        sessionsPerMonth: 40,
        avgSessionRate: 150,
        billingCycle: 'annual',
      },
      plans,
    );
    const sustainAnnual = annual.find(
      (plan) => plan.id === SubscriptionTier.PROFESSIONAL,
    );
    expect(sustainAnnual?.membershipCost).toBe(55);
    expect(sustainAnnual?.takeHomeEstimate).toBe(5945);
    expect(sustainAnnual?.perSessionCost).toBeCloseTo(1.375, 3);
    expect(sustainAnnual?.effectiveCostPct).toBeCloseTo(0.917, 3);
  });

  it('handles zero sessions and zero revenue safely', () => {
    const plans = buildSlidingScalePlans(PRICING_TIERS);
    const monthly = computePlanEstimates(
      {
        sessionsPerMonth: 0,
        avgSessionRate: 150,
        billingCycle: 'monthly',
      },
      plans,
    );
    const access = monthly.find((plan) => plan.id === SubscriptionTier.FREE);

    expect(access?.estimatedMonthlyRevenue).toBe(0);
    expect(access?.effectiveCostPct).toBe(0);
    expect(access?.perSessionCost).toBe(0);
    expect(access?.takeHomeEstimate).toBe(-29);
  });
});
