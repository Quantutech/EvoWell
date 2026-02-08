import type { IconName } from '@/components/ui/iconPaths';

export interface AboutPageContent {
  seo: {
    title: string;
    description: string;
  };
  hero: {
    pageName: string;
    title: string;
    subhead: string;
    primaryCta: string;
    secondaryCta: string;
    microcopy: string;
  };
  why: {
    title: string;
    copy: string;
    copyLine2: string;
  };
  earlyStage: {
    title: string;
    copy: string;
    copyLine2: string;
    microcopy: string;
  };
  pillars: {
    title: string;
    subhead: string;
    items: Array<{
      title: string;
      copy: string;
      icon: IconName;
    }>;
  };
  slidingScale: {
    title: string;
    copy: string;
    bullets: string[];
    microcopy: string;
    cta: string;
  };
  trustSafety: {
    title: string;
    copy: string;
    bullets: string[];
    disclaimer: string;
  };
  participation: {
    title: string;
    copy: string;
    primaryCta: string;
    secondaryCta: string;
    tertiaryCta: string;
  };
}

export const aboutPageContent: AboutPageContent = {
  seo: {
    title: 'About EvoWell | A Provider-First Platform for Wellness Care',
    description:
      'EvoWell is building a provider-first ecosystem for trusted wellness care-practice tools, verified discovery, and a marketplace for provider resources.',
  },
  hero: {
    pageName: 'About',
    title: 'Building a better system for care-starting with providers.',
    subhead:
      'EvoWell is a provider-first platform designed to make practice life simpler, help clients find trusted support, and enable providers to grow sustainably-without sacrificing credibility or independence.',
    primaryCta: 'Explore the Platform',
    secondaryCta: 'For Providers',
    microcopy:
      'Verified network • Sliding-scale membership • Provider Exchange • Evo navigation assistant',
  },
  why: {
    title: 'Why we built EvoWell',
    copy:
      "The wellness and clinical care ecosystem is full of good people-and fragmented tools. Providers are asked to manage scheduling, payments, messaging, documentation, discovery, and content across systems that weren't designed to work together. Clients are left sorting through noise, unclear credentials, and mismatched options.",
    copyLine2:
      'EvoWell is our answer: a platform that respects providers, protects trust, and makes it easier for people to find the right support.',
  },
  earlyStage: {
    title: "We're early-but not new to this space.",
    copy:
      'EvoWell is just getting started. The team behind it has years of experience in and around wellness and health-building tools, supporting providers, and learning what real practice life looks like.',
    copyLine2:
      "We're building carefully and responsibly, prioritizing usability, privacy, and trust over hype. Early versions will evolve quickly, and feedback from providers and clients directly shapes what we build next.",
    microcopy:
      'If something looks "in progress," that is because it is-and we are improving it fast.',
  },
  pillars: {
    title: 'A provider-first ecosystem-by design.',
    subhead: 'EvoWell is built around five practical outcomes.',
    items: [
      {
        title: 'Simplify practice operations',
        copy:
          'Scheduling, messaging, payments, and templates-organized in one place so you spend less time on admin and more time on care.',
        icon: 'dashboard',
      },
      {
        title: 'Make trust visible',
        copy:
          'Verified profiles and clear details help clients make informed choices without wading through noise.',
        icon: 'shield',
      },
      {
        title: 'Help providers grow sustainably',
        copy:
          'Better visibility, clearer fit, and tools that support retention-without manipulative tactics.',
        icon: 'chart',
      },
      {
        title: 'Enable passive income through the Exchange',
        copy:
          'Providers can publish educational resources-templates, worksheets, guides, and courses-so expertise can scale beyond sessions.',
        icon: 'folder',
      },
      {
        title: 'Evo: a navigation assistant (not medical advice)',
        copy:
          'Evo helps users find providers and helps providers navigate their dashboard and workflows-while respecting strict safety boundaries.',
        icon: 'chat',
      },
    ],
  },
  slidingScale: {
    title: 'Why sliding-scale membership matters',
    copy:
      "Providers should not be priced out of modern tools-especially when they are early-stage, rebuilding, or serving communities with limited access. EvoWell uses sliding-scale membership to keep the platform accessible while maintaining secure infrastructure and ongoing support.",
    bullets: [
      'A minimum keeps the platform sustainable',
      'Recommended supports steady product development',
      'Supporter helps subsidize access and accelerates new tools',
    ],
    microcopy:
      'Core access stays the same across the sliding scale. You can change your price anytime.',
    cta: 'See pricing',
  },
  trustSafety: {
    title: 'Built responsibly-because trust is the product.',
    copy:
      "EvoWell is designed for clarity and credibility. We do not allow medical claims or promises of outcomes on the platform or in the Exchange. We verify providers to support transparency, and we keep Evo's role strictly non-clinical.",
    bullets: [
      'Verification supports trust and transparency',
      'Educational resources only-no medical claims',
      'Evo is for navigation and platform help, not diagnosis or treatment',
    ],
    disclaimer:
      'Verification supports trust, but it is not a guarantee of outcomes. Always choose providers based on fit and your needs.',
  },
  participation: {
    title: 'Help shape what EvoWell becomes.',
    copy:
      "If you are a provider, your feedback helps us build tools that actually reduce friction. If you are a client, your feedback helps us improve how people find trusted care.",
    primaryCta: 'Join as a Provider',
    secondaryCta: 'Explore the Directory',
    tertiaryCta: 'Contact us',
  },
};
