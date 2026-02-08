import type { IconName } from '@/components/ui/iconPaths';

export interface ProviderGuidePageContent {
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
  whatYouGet: {
    title: string;
    subhead: string;
    cards: Array<{
      title: string;
      copy: string;
      icon: IconName;
      imageKey: 'trust' | 'tools' | 'match' | 'exchange';
    }>;
  };
  onboardingSteps: {
    title: string;
    subhead: string;
    button: string;
    steps: Array<{
      step: string;
      title: string;
      copy: string;
      microcopy: string;
      icon: IconName;
    }>;
  };
  verification: {
    title: string;
    subhead: string;
    itemsTitle: string;
    items: string[];
    microcopy: string;
    cta: string;
  };
  profileTips: {
    title: string;
    subhead: string;
    bullets: string[];
  };
  evo: {
    title: string;
    subhead: string;
    safety: string;
    cta: string;
  };
  finalCta: {
    title: string;
    subhead: string;
    primaryCta: string;
    secondaryCta: string;
    microcopy: string;
  };
  disclaimer: string;
}

export const providerGuidePageContent: ProviderGuidePageContent = {
  seo: {
    title: 'Apply to EvoWell | Provider Onboarding & Verification',
    description:
      'Create your provider profile, submit verification, set your sliding-scale membership, and go live—built for trust and ease.',
  },
  hero: {
    eyebrow: 'Provider Onboarding',
    title: 'Start your journey with EvoWell.',
    subhead:
      'Create a verified presence, simplify your workflow, and grow your practice—without complicated tools or long-term commitments.',
    primaryCta: 'Start Application',
    secondaryCta: 'See how verification works',
    microcopy:
      'Sliding-scale membership • Verification for trust • Change your price anytime',
  },
  whatYouGet: {
    title: 'Built for real practice life.',
    subhead:
      'Less admin. More clarity. A platform that supports how you work.',
    cards: [
      {
        title: 'A profile clients can trust',
        copy:
          'Verified credentials and clear details so the right clients can find and book you.',
        icon: 'shield',
        imageKey: 'trust',
      },
      {
        title: 'Tools that reduce busywork',
        copy:
          'Scheduling, messaging, payments, and templates—organized in one clean dashboard.',
        icon: 'dashboard',
        imageKey: 'tools',
      },
      {
        title: 'Discovery that’s designed to match',
        copy:
          'Filters that matter: specialty, language, modality, location, availability, insurance (if applicable).',
        icon: 'search',
        imageKey: 'match',
      },
      {
        title: 'Earn beyond sessions',
        copy:
          'Publish resources in the Provider Exchange—templates, guides, toolkits, and courses.',
        icon: 'folder',
        imageKey: 'exchange',
      },
    ],
  },
  onboardingSteps: {
    title: 'Go live in a few steps.',
    subhead: 'You can save progress and return anytime.',
    button: 'Start Application',
    steps: [
      {
        step: 'Step 1',
        title: 'Create your account',
        copy: 'Set up your login and basic profile details.',
        microcopy: 'Takes ~2 minutes.',
        icon: 'userPlus',
      },
      {
        step: 'Step 2',
        title: 'Build your provider profile',
        copy:
          'Add specialties, modalities, languages, location, availability, rates, and accepted insurance (if applicable).',
        microcopy: 'A stronger profile improves discovery.',
        icon: 'settings',
      },
      {
        step: 'Step 3',
        title: 'Submit verification',
        copy:
          'Upload required credentials for review so clients can trust who they’re booking with.',
        microcopy:
          'Verification protects providers and clients. Review times vary.',
        icon: 'lock',
      },
      {
        step: 'Step 4',
        title: 'Set your sliding-scale price & go live',
        copy:
          'Choose your membership price within a range. Adjust anytime as your practice changes.',
        microcopy: 'Same core access across the scale.',
        icon: 'chart',
      },
    ],
  },
  verification: {
    title: 'Verification keeps the network credible.',
    subhead:
      'We verify providers to protect trust and reduce misinformation. EvoWell is built for evidence-informed care and transparent credentials.',
    itemsTitle: 'What we may request',
    items: [
      'License or certification (where applicable)',
      'Identity confirmation',
      'Practice details (website, clinic, or professional profile)',
    ],
    microcopy:
      'Requirements vary by specialty and location. If something is unclear, our team will contact you.',
    cta: 'Learn about verification',
  },
  profileTips: {
    title: 'Make your profile easy to say “yes” to.',
    subhead:
      'Small details make a big difference in whether someone books.',
    bullets: [
      'Use a clear specialty statement (who you help + what you focus on)',
      'Add languages, availability, and preferred session formats',
      'Be transparent about rates and policies',
      'Add a short “what to expect” paragraph to reduce friction',
      'Keep your bio human—credible, not clinical jargon',
    ],
  },
  evo: {
    title: 'Meet Evo—your navigation assistant.',
    subhead:
      'Evo helps you move faster inside EvoWell: profile setup, dashboard navigation, templates, and publishing in the Exchange.',
    safety:
      'Evo is not a medical professional and does not provide medical advice, diagnosis, or treatment.',
    cta: 'Chat with Evo',
  },
  finalCta: {
    title: 'Ready to go live?',
    subhead:
      'Join a provider-first platform built for trust, ease, and sustainable growth—on a sliding scale that respects where you are.',
    primaryCta: 'Start Application',
    secondaryCta: 'Create Provider Profile',
    microcopy: 'No long-term contracts • Change your price anytime',
  },
  disclaimer:
    'EvoWell supports provider discovery and practice operations. Evo and platform content are informational only and are not medical advice. For emergencies, contact local emergency services.',
};

