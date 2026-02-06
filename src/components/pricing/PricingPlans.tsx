import React from 'react';
import { PRICING_TIERS } from '../../config/pricing';
import { Button } from '../ui';
import { SubscriptionTier } from '../../types';

interface PricingPlansProps {
  currentTier?: SubscriptionTier;
  billingCycle?: 'monthly' | 'annual';
  onSelect?: (tier: SubscriptionTier) => void;
  loadingTier?: SubscriptionTier | null;
  publicMode?: boolean; // If true, shows generic CTAs
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ 
  currentTier, 
  billingCycle = 'monthly', 
  onSelect, 
  loadingTier,
  publicMode = false
}) => {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {PRICING_TIERS.map(pkg => {
        const isCurrent = currentTier === pkg.id;
        const price = billingCycle === 'monthly' ? pkg.monthlyPrice : pkg.annualPrice;
        
        return (
          <div 
            key={pkg.id} 
            className={`relative rounded-[2rem] p-8 border transition-all duration-300 flex flex-col ${
              isCurrent 
                ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-[1.02]' 
                : pkg.highlight 
                  ? 'bg-white border-brand-200 ring-4 ring-brand-50 shadow-lg' 
                  : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md'
            }`}
          >
            {pkg.highlight && !isCurrent && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <h3 className={`text-lg font-black mb-2 ${isCurrent ? 'text-white' : 'text-slate-900'}`}>{pkg.name}</h3>
              <p className={`text-sm ${isCurrent ? 'text-slate-400' : 'text-slate-500'}`}>{pkg.tagline}</p>
            </div>

            <div className="mb-8">
              <span className={`text-4xl font-black ${isCurrent ? 'text-white' : 'text-slate-900'}`}>${price}</span>
              <span className={`text-sm font-medium ${isCurrent ? 'text-slate-500' : 'text-slate-400'}`}>/month</span>
            </div>

            <div className="space-y-4 mb-8 flex-grow">
              {pkg.features.map((feature, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isCurrent ? 'bg-slate-800 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
                    ✓
                  </div>
                  <span className={isCurrent ? 'text-slate-300' : 'text-slate-600'}>{feature}</span>
                </div>
              ))}
            </div>

            <Button 
              variant={isCurrent ? 'secondary' : pkg.highlight ? 'brand' : 'primary'}
              className={`w-full ${isCurrent ? 'bg-slate-800 text-white border-none hover:bg-slate-700' : ''}`}
              disabled={isCurrent || (loadingTier !== undefined && loadingTier !== null)}
              onClick={() => onSelect && onSelect(pkg.id as SubscriptionTier)}
            >
              {publicMode 
                ? (price === 0 ? 'Get Started Free' : 'Start 14-Day Trial')
                : (isCurrent ? 'Current Plan' : loadingTier === pkg.id ? 'Processing...' : 'Upgrade')
              }
            </Button>
          </div>
        );
      })}
    </div>
  );
};
