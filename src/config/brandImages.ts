export interface BrandImageAsset {
  src: string;
  fallbackSrc?: string;
  alt: string;
}

export const brandImages = {
  about: {
    hero: {
      src: '/images/brand/about/hero-clinical.svg',
      fallbackSrc:
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
      alt: 'Clinical illustration',
    },
    team: [
      {
        src: '/images/brand/about/team-01.svg',
        fallbackSrc:
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800',
        alt: 'Team member portrait 1',
      },
      {
        src: '/images/brand/about/team-02.svg',
        fallbackSrc:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
        alt: 'Team member portrait 2',
      },
      {
        src: '/images/brand/about/team-03.svg',
        fallbackSrc:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
        alt: 'Team member portrait 3',
      },
      {
        src: '/images/brand/about/team-04.svg',
        fallbackSrc:
          'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800',
        alt: 'Team member portrait 4',
      },
      {
        src: '/images/brand/about/team-05.svg',
        fallbackSrc:
          'https://images.unsplash.com/photo-1598550874175-4d7112ee7f38?auto=format&fit=crop&q=80&w=800',
        alt: 'Team member portrait 5',
      },
      {
        src: '/images/brand/about/team-06.svg',
        fallbackSrc:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
        alt: 'Team member portrait 6',
      },
    ] as const,
  },
  maps: {
    usSilhouette: {
      src: '/images/brand/maps/us-silhouette.svg',
      fallbackSrc:
        'https://upload.wikimedia.org/wikipedia/commons/1/1a/Blank_US_Map_%28states_only%29.svg',
      alt: 'US map silhouette',
    },
    worldFallback: {
      src: '/images/brand/maps/world-fallback.svg',
      fallbackSrc:
        'https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg',
      alt: 'World map fallback',
    },
  },
} as const;

