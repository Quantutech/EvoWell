import {
  ProviderProfile,
  SubscriptionTier,
  SubscriptionStatus,
  ModerationStatus,
} from '../../types';
import { resolveProviderProfileTheme } from '../../types/ui/providerProfile';
import { supabase, isConfigured } from '../supabase';
import { mockStore } from '../mockStore';
import { SEED_DATA } from '../../data/seed';

interface SearchRpcResponse {
  id: string;
  user_id: string;
  professional_title: string;
  bio: string;
  image_url: string;
  hourly_rate: number;
  sliding_scale: boolean;
  address_city: string;
  address_state: string;
  first_name: string;
  last_name: string;
  specialties: string[];
  languages: string[];
  active_days: string[];
  years_experience: number;
  availability_status?: 'ACCEPTING' | 'WAITLIST' | 'NOT_ACCEPTING';
  profile_template?: 'CLASSIC' | 'ELEVATED';
  profile_theme?: 'MIDNIGHT' | 'FOREST' | 'OCEAN' | 'SLATE';
  relevance: number;
  full_count: number;
}

function withProviderDefaults(provider?: ProviderProfile): ProviderProfile | undefined {
  if (!provider) return undefined;
  return {
    ...provider,
    profileTemplate: provider.profileTemplate || 'CLASSIC',
    profileTheme: resolveProviderProfileTheme(provider.profileTheme, provider.profileTemplate),
    availabilityStatus:
      provider.availabilityStatus ||
      (provider.acceptingNewClients === false ? 'NOT_ACCEPTING' : 'ACCEPTING'),
    accessibilityNotes: provider.accessibilityNotes || '',
    showLicenseNumber: provider.showLicenseNumber || false,
  };
}

function isLikelyCredentialText(value?: string): boolean {
  if (!value) return false;
  const normalized = value.toLowerCase().trim();
  return (
    normalized.includes(',') ||
    /\b(phd|md|lcsw|lmft|psy[d]?|psychologist|psychiatrist|therapist|counselor)\b/.test(
      normalized,
    )
  );
}

function enrichProviderWithUser(provider?: ProviderProfile): ProviderProfile | undefined {
  if (!provider) return undefined;

  const mergedUsers = [...SEED_DATA.users, ...mockStore.store.users];
  const linkedUser = mergedUsers.find((user) => user.id === provider.userId);
  const providerFirstName = provider.firstName?.trim() || '';
  const providerLastName = provider.lastName?.trim() || '';

  const hasValidProviderName =
    Boolean(providerFirstName && providerLastName) &&
    !isLikelyCredentialText(providerFirstName) &&
    !isLikelyCredentialText(providerLastName);

  return {
    ...provider,
    firstName: hasValidProviderName
      ? providerFirstName
      : linkedUser?.firstName || providerFirstName,
    lastName: hasValidProviderName ? providerLastName : linkedUser?.lastName || providerLastName,
    email: provider.email || linkedUser?.email,
  };
}

export function formatProvider(row: any): ProviderProfile {
  return {
    id: row.id,
    userId: row.user_id,
    professionalTitle: row.professional_title || '',
    professionalCategory: row.professional_category || 'Mental Health Provider',
    npi: row.npi,
    yearsExperience: row.years_experience || 0,
    education: row.education || '',
    educationHistory: [],
    bio: row.bio || '',
    tagline: row.tagline || '',
    imageUrl: row.image_url || '',
    gallery: [],
    languages: [],
    appointmentTypes: [],
    durations: [50],
    specialties: [],
    licenses: [],
    certificates: [],
    availability: { days: [], hours: [], schedule: [], blockedDates: [] },
    onboardingComplete: row.onboarding_complete || false,
    address: {
      street: row.address_street || '',
      city: row.address_city || '',
      state: row.address_state || '',
      zip: row.address_zip || '',
      country: 'USA'
    },
    phone: row.phone,
    website: row.website,
    social: {},
    subscriptionTier: row.subscription_tier || 'FREE',
    subscriptionStatus: row.subscription_status || 'TRIAL',
    moderationStatus: row.moderation_status || 'PENDING',
    isPublished: row.is_published || false,
    digitalProducts: [],
    servicePackages: [],
    insuranceAccepted: [],
    paymentMethodsAccepted: [],
    pricing: {
      hourlyRate: row.hourly_rate || 150,
      slidingScale: row.sliding_scale || false,
      minFee: row.min_fee,
      maxFee: row.max_fee
    },
    compliance: { termsAccepted: true, verificationAgreed: true },
    security: { question: '', answer: '' },
    metrics: { views: 0, inquiries: 0 },
    metricsHistory: [],
    audit: { createdAt: row.created_at, updatedAt: row.updated_at },
    profileSlug: row.profile_slug,
    pronouns: row.pronouns,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    profileTemplate: row.profile_template || 'CLASSIC',
    profileTheme: resolveProviderProfileTheme(row.profile_theme, row.profile_template),
    availabilityStatus:
      row.availability_status ||
      (row.accepting_new_clients === false ? 'NOT_ACCEPTING' : 'ACCEPTING'),
    accessibilityNotes: row.accessibility_notes || '',
    showLicenseNumber: row.show_license_number || false,
  };
}

export function mapSearchRowToProfile(r: SearchRpcResponse): ProviderProfile {
  return {
    id: r.id,
    userId: r.user_id,
    firstName: r.first_name,
    lastName: r.last_name,
    professionalTitle: r.professional_title || '',
    professionalCategory: 'Mental Health Provider',
    yearsExperience: r.years_experience || 0,
    education: '',
    educationHistory: [],
    bio: r.bio || '',
    tagline: '',
    imageUrl: r.image_url || '',
    gallery: [],
    languages: r.languages || [],
    appointmentTypes: [],
    durations: [],
    specialties: r.specialties || [],
    licenses: [],
    certificates: [],
    availability: { days: r.active_days || [], hours: [], schedule: [], blockedDates: [] },
    onboardingComplete: true,
    address: { street: '', city: r.address_city || '', state: r.address_state || '', zip: '', country: 'USA' },
    subscriptionTier: SubscriptionTier.FREE,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    moderationStatus: ModerationStatus.APPROVED,
    isPublished: true,
    digitalProducts: [],
    servicePackages: [],
    insuranceAccepted: [],
    paymentMethodsAccepted: [],
    pricing: { hourlyRate: r.hourly_rate, slidingScale: r.sliding_scale },
    compliance: { termsAccepted: true, verificationAgreed: true },
    security: { question: '', answer: '' },
    metrics: { views: 0, inquiries: 0 },
    metricsHistory: [],
    audit: { createdAt: '', updatedAt: '' },
    profileTemplate: r.profile_template || 'CLASSIC',
    profileTheme: resolveProviderProfileTheme(r.profile_theme, r.profile_template),
    availabilityStatus: r.availability_status || 'ACCEPTING',
    accessibilityNotes: '',
    showLicenseNumber: false,
  };
}

export class ProviderApi {
  static async getById(id: string): Promise<ProviderProfile | undefined> {
    if (!isConfigured) {
        return withProviderDefaults(
          enrichProviderWithUser(
            mockStore.store.providers.find(p => p.id === id) || SEED_DATA.providers.find(p => p.id === id),
          ),
        );
    }
    const { data: providerData, error } = await (supabase.from('providers') as any).select('*').eq('id', id).maybeSingle();
    if (providerData && !error) {
        const { data: userData } = await (supabase.from('users') as any).select('first_name, last_name, email').eq('id', providerData.user_id).single();
        return formatProvider({ ...providerData, ...userData });
    }
    return undefined;
  }

  static async getByUserId(userId: string): Promise<ProviderProfile | undefined> {
    if (!isConfigured) {
        return withProviderDefaults(
          enrichProviderWithUser(
            mockStore.store.providers.find(p => p.userId === userId) ||
            SEED_DATA.providers.find(p => p.userId === userId),
          ),
        );
    }
    const { data: providerData } = await (supabase.from('providers') as any).select('*').eq('user_id', userId).maybeSingle();
    if (providerData) {
        const { data: userData } = await (supabase.from('users') as any).select('first_name, last_name, email').eq('id', userId).single();
        return formatProvider({ ...providerData, ...userData });
    }
    return undefined;
  }
}
