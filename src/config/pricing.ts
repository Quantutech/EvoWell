import { SubscriptionTier } from '../types';

export const PRICING_TIERS = [
  {
    id: SubscriptionTier.FREE,
    name: 'Starter',
    tagline: 'Get listed, get found',
    monthlyPrice: 25,
    annualPrice: 20,
    platformFee: 0, // Removed per request
    clientCap: 15,
    features: [
      'Basic directory listing',
      'Secure messaging',
      'Client dashboard',
      'Up to 15 active clients',
      'Standard support',
    ],
    highlight: false,
  },
  {
    id: SubscriptionTier.PROFESSIONAL,
    name: 'Growth',
    tagline: 'For full-time practitioners',
    monthlyPrice: 99,
    annualPrice: 79,
    platformFee: 0,
    clientCap: Infinity,
    features: [
      'Priority listing placement',
      'HD video sessions',
      'Unlimited active clients',
      'Analytics dashboard',
      'Custom booking link',
    ],
    highlight: true,
  },
  {
    id: SubscriptionTier.PREMIUM,
    name: 'Practice',
    tagline: 'For group practices',
    monthlyPrice: 199,
    annualPrice: 159,
    platformFee: 0,
    clientCap: Infinity,
    features: [
      'Everything in Growth',
      'Up to 5 provider seats',
      'Digital product storefront',
      'White-label booking page',
      'Team analytics & reporting',
    ],
    highlight: false,
  },
];
