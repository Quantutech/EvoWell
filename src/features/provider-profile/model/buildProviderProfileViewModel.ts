import {
  BlogPost,
  Endorsement,
  ProviderAvailabilityStatus,
  ProviderProfile,
  ProviderProfileTheme,
} from '@/types';
import {
  PROVIDER_AVAILABILITY_STATUS_META,
  ProviderProfileSectionKey,
  resolveProviderProfileTheme,
} from '@/types/ui/providerProfile';

const DEFAULT_EXPECTATIONS = [
  'A clear first session to understand goals and fit',
  'A collaborative plan that respects your pace and context',
  'Practical tools you can use between sessions',
];

const DEFAULT_TRUST_MICROCOPY = 'Evidence-informed care • Verified profile';

const SECTIONS: Array<{ key: ProviderProfileSectionKey; label: string; elementId: string }> = [
  { key: 'introduction', label: 'Introduction', elementId: 'section-introduction' },
  { key: 'credentials', label: 'Credentials', elementId: 'section-credentials' },
  { key: 'endorsements', label: 'Endorsements', elementId: 'section-endorsements' },
  { key: 'media', label: 'Media', elementId: 'section-media' },
  { key: 'articles', label: 'Articles', elementId: 'section-articles' },
  { key: 'location', label: 'Location', elementId: 'section-location' },
];

export interface ProviderProfileViewModel {
  theme: ProviderProfileTheme;
  seo: {
    title: string;
    description: string;
    url: string;
  };
  sections: Array<{ key: ProviderProfileSectionKey; label: string; elementId: string }>;
  identity: {
    fullName: string;
    pronouns?: string;
    credentialLine: string;
    trustMicrocopy: string;
    positioningLine: string;
    isVerified: boolean;
    experienceYears?: number;
    status: {
      value: ProviderAvailabilityStatus;
      label: string;
      badgeClassName: string;
    };
    sessionFormats: string[];
    availabilityMicrocopy: string;
    headline?: string;
  };
  introduction: {
    lead: string;
    expectations: string[];
    disclaimer: string;
    specialties: string[];
    agesServed: string[];
    languages: string[];
  };
  credentials: {
    education: Array<{ degree: string; institution: string; year?: string }>;
    licenses: Array<{ state: string; number?: string; verified: boolean }>;
    verificationMicrocopy: string;
  };
  endorsements: {
    items: Endorsement[];
    emptyTitle: string;
    emptyCopy: string;
  };
  media: {
    items: Array<{
      id: string;
      type: 'Video' | 'Podcast' | 'Interview';
      title: string;
      source?: string;
      href?: string;
    }>;
    emptyCopy: string;
  };
  articles: {
    items: Array<{
      id: string;
      slug: string;
      title: string;
      excerpt: string;
      publishedAt?: string;
    }>;
    disclaimer: string;
  };
  location: {
    hasMap: boolean;
    addressLine: string;
    cityStateLine: string;
    accessibilityNotes?: string;
  };
  booking: {
    title: string;
    secureLabel: string;
    policyMicrocopy: string;
    rateLabel: string;
    supportsSlidingScale: boolean;
  };
}

interface BuildProviderProfileViewModelInput {
  provider: ProviderProfile;
  endorsements: Endorsement[];
  blogs: BlogPost[];
  specialtyNameById?: (id: string) => string;
}

function getAvailabilityStatus(provider: ProviderProfile): ProviderAvailabilityStatus {
  if (provider.availabilityStatus) return provider.availabilityStatus;
  return provider.acceptingNewClients === false ? 'NOT_ACCEPTING' : 'ACCEPTING';
}

function getSessionFormats(provider: ProviderProfile): string[] {
  if (provider.appointmentTypes?.length) {
    return Array.from(new Set(provider.appointmentTypes.map((type) => String(type))));
  }

  const hasAddress = Boolean(provider.address?.city || provider.address?.street);
  return hasAddress ? ['Online', 'In-person'] : ['Online'];
}

function getCredentialLine(provider: ProviderProfile): string {
  return provider.professionalTitle || provider.professionalCategory || 'Provider';
}

function isLikelyCredentialText(value: string): boolean {
  const normalized = value.toLowerCase().trim();
  return (
    normalized.includes(',') ||
    /\b(phd|md|lcsw|lmft|psy[d]?|psychologist|psychiatrist|therapist|counselor)\b/.test(
      normalized,
    )
  );
}

function getProviderName(provider: ProviderProfile): string {
  const firstName = (provider.firstName || '').trim();
  const lastName = (provider.lastName || '').trim();
  if (
    firstName &&
    lastName &&
    !isLikelyCredentialText(firstName) &&
    !isLikelyCredentialText(lastName)
  ) {
    return `${firstName} ${lastName}`;
  }

  if (provider.email) {
    const local = provider.email.split('@')[0] || '';
    const cleaned = local
      .replace(/[\.\-_]+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' ');
    if (cleaned) return cleaned;
  }

  return 'Provider';
}

function mapMediaType(type: string): 'Video' | 'Podcast' | 'Interview' {
  const value = type.toLowerCase();
  if (value.includes('podcast') || value === 'audio') return 'Podcast';
  if (value.includes('interview')) return 'Interview';
  return 'Video';
}

export function buildProviderProfileViewModel({
  provider,
  endorsements,
  blogs,
  specialtyNameById,
}: BuildProviderProfileViewModelInput): ProviderProfileViewModel {
  const name = getProviderName(provider);
  const specialtyNames = (provider.specialties || []).map((value) =>
    specialtyNameById ? specialtyNameById(value) : value,
  );
  const primaryFocus = specialtyNames[0] || 'their wellness goals';
  const availabilityStatus = getAvailabilityStatus(provider);
  const statusMeta = PROVIDER_AVAILABILITY_STATUS_META[availabilityStatus];
  const sessionFormats = getSessionFormats(provider);

  const mediaLinks = (provider.mediaLinks || []).map((item, index) => ({
    id: `media-link-${index}`,
    type: mapMediaType(item.type),
    title: item.title,
    href: item.url,
  }));
  const mediaAppearances = (provider.mediaAppearances || provider.media || []).map((item) => ({
    id: item.id,
    type: mapMediaType(item.type),
    title: item.title,
    source: item.description,
    href: item.link,
  }));
  const mediaItems = [...mediaLinks, ...mediaAppearances];

  const visibleLicenses = (provider.licenses || []).map((license) => ({
    state: license.state,
    number: provider.showLicenseNumber ? license.number : undefined,
    verified: license.verified,
  }));

  const leadSentence =
    provider.headline ||
    `${name} supports clients with a focus on ${primaryFocus}. Their style is practical and centered on evidence-informed approaches.`;

  const descriptionSource = provider.tagline || provider.bio || leadSentence;
  const description = descriptionSource.length > 150
    ? `${descriptionSource.slice(0, 147)}...`
    : descriptionSource;

  return {
    theme: resolveProviderProfileTheme(provider.profileTheme, provider.profileTemplate),
    seo: {
      title: `${name} | ${getCredentialLine(provider)} | EvoWell Provider`,
      description: `View ${name}'s verified profile, specialties, availability, and booking options on EvoWell.`
        .slice(0, 155),
      url: `/provider/${provider.profileSlug || provider.id}`,
    },
    sections: SECTIONS,
    identity: {
      fullName: name,
      pronouns: provider.pronouns,
      credentialLine: getCredentialLine(provider),
      trustMicrocopy: DEFAULT_TRUST_MICROCOPY,
      positioningLine:
        provider.tagline ||
        `A practical, compassionate approach for people navigating ${primaryFocus}.`,
      isVerified: provider.moderationStatus === 'APPROVED',
      experienceYears: provider.yearsExperience > 0 ? provider.yearsExperience : undefined,
      status: {
        value: availabilityStatus,
        label: statusMeta.label,
        badgeClassName: statusMeta.badgeClassName,
      },
      sessionFormats,
      availabilityMicrocopy:
        'Availability and services vary. Always confirm fit during the first session.',
      headline: provider.headline,
    },
    introduction: {
      lead: leadSentence,
      expectations: DEFAULT_EXPECTATIONS,
      disclaimer: 'This profile is informational and not medical advice.',
      specialties: specialtyNames,
      agesServed: provider.agesServed || provider.worksWith || [],
      languages: provider.languages || [],
    },
    credentials: {
      education: (provider.educationHistory || []).map((item) => ({
        degree: item.degree,
        institution: item.university,
        year: item.year,
      })),
      licenses: visibleLicenses,
      verificationMicrocopy: 'Verification supports transparency but is not a guarantee of outcomes.',
    },
    endorsements: {
      items: endorsements.filter((endorsement) => endorsement.endorsementType === 'peer'),
      emptyTitle: 'Endorsements coming soon',
      emptyCopy:
        "This provider hasn't added endorsements yet. You can still review credentials, approach, and availability.",
    },
    media: {
      items: mediaItems,
      emptyCopy: 'No media added yet.',
    },
    articles: {
      items: blogs.map((blog) => ({
        id: blog.id,
        slug: blog.slug,
        title: blog.title,
        excerpt: blog.summary || description,
        publishedAt: blog.publishedAt,
      })),
      disclaimer: 'Articles are educational and not medical advice.',
    },
    location: {
      hasMap: Boolean(provider.address?.lat || provider.address?.lng || provider.address?.city),
      addressLine: provider.address?.street || 'Address details are available on request.',
      cityStateLine: [provider.address?.city, provider.address?.state].filter(Boolean).join(', '),
      accessibilityNotes: provider.accessibilityNotes,
    },
    booking: {
      title: 'Book appointment',
      secureLabel: 'Secure booking',
      policyMicrocopy:
        'No payment is collected until confirmed. Cancellation policy is shown at checkout.',
      rateLabel: `$${provider.pricing?.hourlyRate || 0} / session`,
      supportsSlidingScale: provider.pricing?.slidingScale || false,
    },
  };
}
