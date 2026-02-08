import type { IconName } from '@/components/ui/iconPaths';

export interface PricingCalculatorPageContent {
  seo: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subhead: string;
    primaryCta: string;
    secondaryCta: string;
    microcopy: string;
  };
  calculatorIntro: {
    title: string;
    subhead: string;
    microcopy: string;
  };
  practicePanel: {
    title: string;
    sessionsLabel: string;
    sessionsHelper: string;
    sessionRateLabel: string;
    sessionRateHelper: string;
    billingCycleLabel: string;
    billingCycleHelper: string;
    estimatedRevenueLabel: string;
    estimatedRevenueMicrocopy: string;
  };
  comparisonPanel: {
    title: string;
    subhead: string;
    microcopy: string;
    membershipLabel: string;
    perSessionLabel: string;
    keepLabel: string;
  };
  selectedPlan: {
    titlePrefix: string;
    monthlyCostLabel: string;
    keepLabel: string;
    effectiveCostLabel: string;
    perSessionCostLabel: string;
    primaryCta: string;
    secondaryCta: string;
    disclaimer: string;
  };
  included: {
    title: string;
    subhead: string;
    cards: Array<{
      title: string;
      copy: string;
      icon: IconName;
    }>;
  };
  whySlidingScale: {
    title: string;
    copy: string;
    bullets: string[];
    microcopy: string;
  };
  faq: {
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  finalCta: {
    title: string;
    subhead: string;
    primaryCta: string;
    secondaryCta: string;
    microcopy: string;
  };
  pageDisclaimer: string;
}

export const pricingCalculatorPageContent: PricingCalculatorPageContent = {
  seo: {
    title: 'EvoWell Pricing | Sliding-Scale Membership for Providers',
    description:
      'Choose a sliding-scale membership price that fits your practice. Same core access at every level-adjust anytime as you grow.',
  },
  hero: {
    eyebrow: 'Sliding-Scale Pricing',
    title: "Pay what's fair. Upgrade when the math says so.",
    subhead:
      'EvoWell uses a sliding-scale membership so more providers can access modern practice tools. Pick your monthly price within a range. Adjust anytime.',
    primaryCta: 'Set My Price',
    secondaryCta: 'Create Provider Profile',
    microcopy:
      'No contracts • Same core access across the scale • Change your price anytime',
  },
  calculatorIntro: {
    title: 'See the plan that fits your practice today.',
    subhead:
      'Adjust your numbers below to estimate your effective monthly cost. EvoWell is designed to pay for itself through time saved, fewer no-shows, and additional income options like the Provider Exchange.',
    microcopy:
      'These estimates are illustrative and depend on your practice. EvoWell does not guarantee specific financial outcomes.',
  },
  practicePanel: {
    title: 'Your Practice',
    sessionsLabel: 'Sessions per month',
    sessionsHelper: 'How many sessions you typically complete.',
    sessionRateLabel: 'Average session rate',
    sessionRateHelper: 'Your average collected amount per session (not list price).',
    billingCycleLabel: 'Billing cycle',
    billingCycleHelper: 'Monthly / Annual (annual may be discounted when available).',
    estimatedRevenueLabel: 'Estimated monthly revenue',
    estimatedRevenueMicrocopy:
      'You can update these assumptions anytime-this tool is here to help you choose a fair membership price.',
  },
  comparisonPanel: {
    title: 'Choose your monthly membership (sliding scale)',
    subhead: 'Same core access at every point on the scale.',
    microcopy:
      'Features do not change across the sliding scale. Your selection helps keep EvoWell accessible while maintaining secure infrastructure.',
    membershipLabel: 'Monthly membership',
    perSessionLabel: 'Effective cost per session',
    keepLabel: 'What you keep',
  },
  selectedPlan: {
    titlePrefix: 'You chose',
    monthlyCostLabel: 'Monthly cost',
    keepLabel: 'You keep',
    effectiveCostLabel: 'Effective cost',
    perSessionCostLabel: 'Per-session cost',
    primaryCta: 'Continue',
    secondaryCta: "Compare what's included",
    disclaimer: 'Estimates are informational only and not financial advice.',
  },
  included: {
    title: 'Included in every plan',
    subhead: 'No hidden fees. No feature paywalls on the essentials.',
    cards: [
      {
        title: 'Secure messaging',
        copy: 'Simple, private communication and follow-ups-built to reduce admin friction.',
        icon: 'chat',
      },
      {
        title: 'Online scheduling',
        copy: 'Availability, booking flow, and reminders designed to protect your time.',
        icon: 'calendar',
      },
      {
        title: 'Payments',
        copy: 'Straightforward billing and payouts-kept out of the way of sessions.',
        icon: 'dollar',
      },
      {
        title: 'Session notes & templates',
        copy: 'Keep documentation organized with reusable templates and structured notes.',
        icon: 'article',
      },
      {
        title: 'Provider visibility',
        copy: 'A verified profile in the EvoWell directory with filters clients actually use.',
        icon: 'shield',
      },
      {
        title: 'Provider Exchange access',
        copy: 'Browse resources immediately-and publish as a verified provider.',
        icon: 'folder',
      },
    ],
  },
  whySlidingScale: {
    title: 'Why sliding scale?',
    copy:
      "Providers are at different stages-new, rebuilding, part-time, or fully booked. Sliding scale keeps EvoWell accessible while protecting the platform's ability to stay secure, responsive, and continuously improving.",
    bullets: [
      'A minimum keeps infrastructure and support sustainable',
      'Recommended supports steady product development',
      'Supporter helps subsidize access for others',
    ],
    microcopy:
      'You can change your price anytime in your dashboard-no explanations required.',
  },
  faq: {
    title: 'Common questions',
    items: [
      {
        question: 'What am I paying for?',
        answer:
          'A secure provider platform: scheduling, messaging, payments, templates/notes, verified discovery, and access to the Provider Exchange ecosystem.',
      },
      {
        question: 'Do features change based on what I pay?',
        answer:
          "Core access stays the same across the sliding scale. If Supporter perks exist, they'll be clearly labeled-and never remove essentials from lower tiers.",
      },
      {
        question: 'Can I change my price later?',
        answer:
          'Yes. Adjust your contribution anytime as your practice changes.',
      },
      {
        question: 'Is there a contract or commitment?',
        answer:
          'No long-term contracts. You can cancel according to the terms shown at checkout.',
      },
      {
        question: 'How does the free trial work?',
        answer:
          'You can explore the platform, build your profile, and test the workflow. If you continue after the trial, you choose your sliding-scale price.',
      },
      {
        question: 'What happens if my practice grows quickly?',
        answer:
          'Nothing breaks. As you grow, you can choose to increase your contribution-or keep it where it is. Sliding scale is designed for real life.',
      },
      {
        question: 'Is this financial advice or a guarantee?',
        answer:
          'No. The calculator provides estimates for planning only. Results vary by provider and practice.',
      },
    ],
  },
  finalCta: {
    title: "Start free. Adjust when you're ready.",
    subhead:
      'Create your provider profile in minutes. Choose a sliding-scale membership that fits today-and update it anytime as you grow.',
    primaryCta: 'Create Provider Profile',
    secondaryCta: 'Set My Price',
    microcopy:
      'Sliding-scale membership • No contracts • Built for sustainable practice',
  },
  pageDisclaimer:
    'The pricing calculator provides estimates for informational purposes only and does not guarantee savings, income, or outcomes. Always evaluate tools based on your specific practice needs.',
};
