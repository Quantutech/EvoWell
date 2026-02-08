import { 
  AppointmentType, SubscriptionTier, SubscriptionStatus, ModerationStatus 
} from '../../data/types/enums';
import { Address, Availability, Education, License, MediaItem } from './common';
import { Endorsement } from './endorsement';

export type ProviderProfileTemplate = 'CLASSIC' | 'ELEVATED';
export type ProviderProfileTheme = 'MIDNIGHT' | 'FOREST' | 'OCEAN' | 'SLATE';
export type ProviderAvailabilityStatus = 'ACCEPTING' | 'WAITLIST' | 'NOT_ACCEPTING';

export interface ServicePackage {
  id: string;
  providerId: string;
  name: string;
  description: string;
  priceCents: number;
  durationMinutes: number;
  sessionsIncluded: number;
  isActive: boolean;
  createdAt?: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  professionalTitle: string;
  professionalCategory: string;
  npi?: string;
  yearsExperience: number;
  education: string;
  educationHistory: Education[];
  bio: string;
  tagline: string;
  imageUrl: string;
  gallery: string[];
  languages: string[];
  appointmentTypes: AppointmentType[];
  durations: number[];
  specialties: string[];
  licenses: License[];
  certificates: string[];
  availability: Availability;
  onboardingComplete: boolean;
  address?: Address;
  phone?: string;
  website?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt?: string;
  moderationStatus: ModerationStatus;
  isPublished: boolean;
  digitalProducts: any[];
  servicePackages: ServicePackage[];
  insuranceAccepted: string[];
  paymentMethodsAccepted: string[];
  pricing: {
    hourlyRate: number;
    slidingScale: boolean;
    minFee?: number;
    maxFee?: number;
  };
  businessInfo?: {
    businessName: string;
    taxId: string;
    businessAddress: string;
    stripeAccountId: string;
    stripeStatus: string;
    stripeChargesEnabled?: boolean;
    stripePayoutsEnabled?: boolean;
    stripeOnboardingComplete?: boolean;
  };
  compliance: {
    termsAccepted: boolean;
    verificationAgreed: boolean;
  };
  security: {
    question: string;
    answer: string;
  };
  metrics: {
    views: number;
    inquiries: number;
  };
  metricsHistory: any[];
  mediaAppearances?: MediaItem[];
  media?: MediaItem[];
  worksWith?: string[];
  gender?: string;
  audit: {
    createdAt: string;
    updatedAt: string;
  };
  averageRating?: number;
  totalReviews?: number;
  profileSlug?: string;
  pronouns?: string;
  businessAddress?: Address;
  phoneNumber?: string;
  mediaLinks?: Array<{
    title: string;
    url: string;
    type: 'video' | 'podcast' | 'article';
  }>;
  timezone?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  therapeuticApproaches?: string[];
  agesServed?: string[];
  acceptingNewClients?: boolean;
  consultationFee?: number;
  freeConsultation?: boolean;
  videoUrl?: string;
  headline?: string;
  endorsements?: {
      evowell: boolean;
      peerCount: number;
      items?: Endorsement[]; 
  };
  /**
   * @deprecated Legacy template selector kept for transition compatibility.
   * Use `profileTheme` for all new writes.
   */
  profileTemplate?: ProviderProfileTemplate;
  profileTheme?: ProviderProfileTheme;
  availabilityStatus?: ProviderAvailabilityStatus;
  accessibilityNotes?: string;
  showLicenseNumber?: boolean;
  rating?: number | string; // Compatibility
  title?: string;
  credentials?: string;
}

export interface Specialty {
  id: string;
  name: string;
  slug?: string;
}

export interface InsuranceCompany {
  id: string;
  name: string;
}

export interface ProviderApplication {
  id: string;
  user_id: string;
  professional_title: string;
  license_number: string;
  license_state: string;
  npi?: string;
  years_experience?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
  created_at: string;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}
