import { 
  ProviderProfile, SubscriptionTier, SubscriptionStatus, ModerationStatus
} from '../../types';

export function generateProfileSlug(firstName: string, lastName: string, specialty?: string, city?: string): string {
  const slugify = (str: string) => str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const parts: string[] = [];
  parts.push(slugify(firstName));
  parts.push(slugify(lastName));
  
  if (city && city.length > 0) {
    const cityAbbreviations: Record<string, string> = {
      'new york': 'nyc', 'los angeles': 'la', 'san francisco': 'sf',
      'chicago': 'chi', 'boston': 'bos', 'seattle': 'sea',
      'denver': 'den', 'atlanta': 'atl', 'miami': 'mia',
      'portland': 'pdx', 'philadelphia': 'phl', 'austin': 'atx'
    };
    const cityLower = city.toLowerCase();
    const abbr = cityAbbreviations[cityLower] || slugify(city).substring(0, 3);
    parts.push(abbr);
  } else if (specialty) {
    const specWord = specialty.split(/[\s&,]+/)[0];
    parts.push(slugify(specWord));
  }
  
  const uniqueSuffix = Date.now().toString(36).slice(-3);
  parts.push(uniqueSuffix);
  
  return parts.join('-');
}

export function createBlankProviderProfile(userId: string, firstName: string, lastName: string, email: string): ProviderProfile {
  const now = new Date().toISOString();
  const profileId = `prov-${userId}`;
  const slug = generateProfileSlug(firstName, lastName);
  
  return {
    id: profileId,
    userId: userId,
    firstName: firstName,
    lastName: lastName,
    email: email,
    professionalTitle: '',
    professionalCategory: 'Mental Health Provider',
    npi: '',
    yearsExperience: 0,
    education: '',
    educationHistory: [],
    bio: '',
    tagline: '',
    imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=10b981&color=fff&size=200&bold=true`,
    gallery: [],
    languages: ['English'],
    appointmentTypes: [],
    durations: [50],
    specialties: [],
    licenses: [],
    certificates: [],
    availability: {
      days: [],
      hours: [],
      schedule: [
        { day: 'Mon', active: false, timeRanges: [] },
        { day: 'Tue', active: false, timeRanges: [] },
        { day: 'Wed', active: false, timeRanges: [] },
        { day: 'Thu', active: false, timeRanges: [] },
        { day: 'Fri', active: false, timeRanges: [] },
        { day: 'Sat', active: false, timeRanges: [] },
        { day: 'Sun', active: false, timeRanges: [] },
      ],
      blockedDates: []
    },
    onboardingComplete: false,
    address: { street: '', city: '', state: '', zip: '', country: 'USA' },
    phone: '',
    website: '',
    social: {},
    subscriptionTier: SubscriptionTier.FREE,
    subscriptionStatus: SubscriptionStatus.TRIAL,
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    moderationStatus: ModerationStatus.PENDING,
    isPublished: false,
    digitalProducts: [],
    servicePackages: [],
    insuranceAccepted: [],
    paymentMethodsAccepted: ['Credit Card'],
    pricing: { hourlyRate: 150, slidingScale: false, minFee: 0, maxFee: 0 },
    businessInfo: { businessName: '', taxId: '', businessAddress: '', stripeAccountId: '', stripeStatus: 'pending' },
    compliance: { termsAccepted: false, verificationAgreed: false },
    security: { question: '', answer: '' },
    metrics: { views: 0, inquiries: 0 },
    metricsHistory: [],
    mediaAppearances: [],
    worksWith: [],
    gender: '',
    audit: { createdAt: now, updatedAt: now },
    profileSlug: slug,
    pronouns: '',
    therapeuticApproaches: [],
    agesServed: [],
    acceptingNewClients: true,
    consultationFee: 0,
    freeConsultation: true,
    videoUrl: '',
    headline: '',
    profileTemplate: 'CLASSIC',
    profileTheme: 'MIDNIGHT',
    availabilityStatus: 'ACCEPTING',
    accessibilityNotes: '',
    showLicenseNumber: false,
  };
}
