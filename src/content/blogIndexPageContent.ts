export interface BlogIndexPageContent {
  seo: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subhead: string;
    microcopy: string;
  };
  heroLinks: {
    support: string;
    providers: string;
  };
  featured: {
    badge: string;
    cta: string;
  };
  filters: {
    allLabel: string;
    searchPlaceholder: string;
    searchHelper: string;
    clear: string;
    viewAll: string;
  };
  grid: {
    cta: string;
    authorFallback: string;
  };
  emptyStates: {
    noPosts: {
      title: string;
      copy: string;
      cta: string;
    };
    noMatches: {
      title: string;
      copy: string;
      clearFilters: string;
      viewAll: string;
    };
  };
  newsletter: {
    title: string;
    copy: string;
    placeholder: string;
    button: string;
    microcopy: string;
    successTitle: string;
    successCopy: string;
  };
  disclaimer: string;
}

export const blogIndexPageContent: BlogIndexPageContent = {
  seo: {
    title: 'Resources & Insights | EvoWell Blog',
    description:
      'Evidence-informed ideas, practical wellness strategies, and updates from the EvoWell community.',
  },
  hero: {
    eyebrow: 'Our Blog',
    title: 'Resources & Insights',
    subhead:
      'Evidence-informed ideas, practical wellness strategies, and updates from the EvoWell community.',
    microcopy: 'Educational content only — not medical advice.',
  },
  heroLinks: {
    support: 'Looking for support? Browse the Provider Directory →',
    providers: 'Are you a provider? Learn about EvoWell for Providers →',
  },
  featured: {
    badge: 'Featured',
    cta: 'Read article',
  },
  filters: {
    allLabel: 'All',
    searchPlaceholder: 'Search articles…',
    searchHelper: 'Try “sleep”, “burnout”, “CBT”, “nutrition”',
    clear: 'Clear',
    viewAll: 'View all',
  },
  grid: {
    cta: 'Read more',
    authorFallback: 'EvoWell Editorial',
  },
  emptyStates: {
    noPosts: {
      title: 'Articles are coming soon.',
      copy:
        'We’re building a library of evidence-informed resources for providers and people seeking support. Check back soon—or subscribe for updates.',
      cta: 'Subscribe',
    },
    noMatches: {
      title: 'No matches found.',
      copy: 'Try a different keyword or clear filters.',
      clearFilters: 'Clear filters',
      viewAll: 'View all',
    },
  },
  newsletter: {
    title: 'Stay ahead of the curve',
    copy:
      'Evidence-informed insights, provider spotlights, and new resources — delivered weekly.',
    placeholder: 'your@email.com',
    button: 'Subscribe',
    microcopy: 'No spam. Unsubscribe anytime.',
    successTitle: "You're on the list!",
    successCopy: 'Check your inbox for a confirmation.',
  },
  disclaimer:
    'Articles are for informational and educational purposes only and are not medical advice. If you’re in crisis or experiencing an emergency, contact local emergency services.',
};
