import { IconName } from '@/components/ui/iconPaths';

export interface HomePageContent {
  seo: {
    title: string;
    description: string;
  };
  hero: {
    title: string;
    subhead: string;
    primaryCta: string;
    secondaryCta: string;
    tertiaryCta: string;
    microcopy: string;
  };
  paths: {
    title: string;
    items: Array<{
      title: string;
      copy: string;
      cta: string;
      icon: IconName;
    }>;
  };
  providerDesignChoice: {
    title: string;
    subhead: string;
    cta: string;
    schemes: Array<{
      name: string;
      copy: string;
    }>;
  };
  howItWorks: {
    title: string;
    steps: Array<{
      title: string;
      copy: string;
      icon: IconName;
    }>;
    cta: string;
  };
  featuredProviders: {
    title: string;
    subhead: string;
    microcopy: string;
    cta: string;
  };
  search: {
    title: string;
    queryPlaceholder: string;
    locationPlaceholder: string;
    cta: string;
  };
  blog: {
    title: string;
    subhead: string;
    cta: string;
    emptyState: string;
  };
  exchange: {
    title: string;
    subhead: string;
    primaryCta: string;
    secondaryCta: string;
    disclaimer: string;
  };
  trust: {
    title: string;
    bullets: string[];
  };
  finalCta: {
    title: string;
    subhead: string;
    primaryCta: string;
    secondaryCta: string;
  };
}

export const homePageContent: HomePageContent = {
  seo: {
    title: 'EvoWell | The Next Evolution in Care',
    description:
      'Find verified wellness providers, explore trusted resources, and use Evo to navigate next steps. Built for trust-designed for ease.',
  },
  hero: {
    title: 'The next evolution in care-built for trust.',
    subhead:
      'Find verified providers, explore resources from the Provider Exchange, and use Evo to navigate next steps. For providers: run your practice and grow sustainably with a provider-first platform.',
    primaryCta: 'Find a Provider',
    secondaryCta: 'For Providers',
    tertiaryCta: 'Chat with Evo',
    microcopy:
      'Verified profiles • Clear filters • Sliding-scale provider membership • No medical advice',
  },
  paths: {
    title: 'Choose your path.',
    items: [
      {
        title: 'For clients',
        copy:
          'Search verified providers by specialty, language, session format, insurance (if available), and availability. Save favorites and book with confidence.',
        cta: 'Browse Directory',
        icon: 'search',
      },
      {
        title: 'For providers',
        copy:
          'Simplify scheduling, messaging, payments, and templates-plus build passive income through the Provider Exchange. Join on a sliding scale and adjust anytime.',
        cta: 'Create Provider Profile',
        icon: 'dashboard',
      },
    ],
  },
  providerDesignChoice: {
    title: 'Provider-first profile personalization.',
    subhead:
      'One trusted profile layout, multiple curated color schemes. Pick the look that matches your brand and switch anytime.',
    cta: 'Create Provider Profile',
    schemes: [
      {
        name: 'Midnight',
        copy: 'Deep navy presentation for high-contrast, premium readability.',
      },
      {
        name: 'Forest',
        copy: 'Calm evergreen look for warm, grounded provider branding.',
      },
      {
        name: 'Ocean',
        copy: 'Fresh blue palette for modern, energetic profile presence.',
      },
      {
        name: 'Slate',
        copy: 'Neutral graphite style for minimal and clinical clarity.',
      },
    ],
  },
  howItWorks: {
    title: 'Clear steps. Less friction.',
    steps: [
      {
        title: 'Search with filters that matter',
        copy:
          'Find providers by specialization, language, location/telehealth, and availability.',
        icon: 'search',
      },
      {
        title: 'Verify trust through transparent profiles',
        copy:
          'Credentials and key details are presented clearly-no guessing games.',
        icon: 'shield',
      },
      {
        title: "Move forward with Evo's help",
        copy:
          'Evo can guide you to the right next step-without pretending to be a clinician.',
        icon: 'chat',
      },
    ],
    cta: 'Chat with Evo',
  },
  featuredProviders: {
    title: 'Featured providers',
    subhead:
      'A growing network of verified professionals across wellness and clinical support.',
    microcopy: 'Availability and services vary by provider.',
    cta: 'View all providers',
  },
  search: {
    title: 'Search by need, specialty, or location.',
    queryPlaceholder: 'Condition, specialty, or provider name',
    locationPlaceholder: 'City, state, or Remote',
    cta: 'Search providers',
  },
  blog: {
    title: 'From the EvoWell blog',
    subhead:
      'Practical insights for clients and providers on trust, care navigation, and sustainable practice growth.',
    cta: 'Read the blog',
    emptyState: 'Fresh articles are on the way.',
  },
  exchange: {
    title: 'Provider Exchange',
    subhead:
      'Educational resources created by verified providers-templates, guides, toolkits, and courses.',
    primaryCta: 'Browse Exchange',
    secondaryCta: 'Sell a Resource',
    disclaimer: 'Resources are informational and not medical advice.',
  },
  trust: {
    title: 'Built with responsibility.',
    bullets: [
      'Verified providers to support transparency',
      'No medical claims or guaranteed outcomes',
      'Evo is for navigation and platform support-not diagnosis or treatment',
    ],
  },
  finalCta: {
    title: 'EvoWell is just getting started. Join early.',
    subhead:
      "If you're a provider, help shape a platform built for your reality. If you're looking for support, explore the directory and use Evo to find your next step.",
    primaryCta: 'For Providers',
    secondaryCta: 'Find a Provider',
  },
};
