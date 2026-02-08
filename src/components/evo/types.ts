export type EvoRoleContext = 'CLIENT' | 'PROVIDER' | 'BROWSING' | 'ADMIN';
export type ClientIntent = 'FIND_PROVIDER' | 'UNSURE' | 'EXPLORE_RESOURCES' | 'ACCOUNT_HELP' | 'CRISIS';
export type ProviderIntent =
  | 'FINISH_PROFILE'
  | 'SET_AVAILABILITY'
  | 'SET_MEMBERSHIP'
  | 'PUBLISH_RESOURCE'
  | 'TROUBLESHOOT';
export type BrowsingIntent = 'FIND_PROVIDER' | 'LEARN_PLATFORM' | 'EXPLORE_EXCHANGE' | 'BECOME_PROVIDER';
export type EvoSortPreference = 'SOONEST' | 'BUDGET' | 'SPECIALIZATION';
export type EvoSafetyFlag = 'CRISIS' | 'MEDICAL_ADVICE' | 'MEDICATION' | 'LEGAL_FINANCIAL';

export interface UserSignal {
  roleContext?: EvoRoleContext;
  initialRequest?: string;

  clientIntent?: ClientIntent;
  supportNeeds?: string[];
  unsureTopic?: string;
  urgencyState?: 'SAFE' | 'URGENT';
  preferenceFilters?: string[];
  sessionFormat?: 'ONLINE' | 'IN_PERSON' | 'EITHER';
  location?: string;
  preferredLanguage?: string;
  availabilityPreference?: 'EVENINGS' | 'WEEKENDS' | 'FLEXIBLE';
  budgetRange?: 'UNDER_120' | '120_200' | '200_PLUS' | 'NOT_SURE';
  insurancePreference?: 'YES' | 'NO' | 'NOT_SURE';
  insurer?: string;
  providerGenderPreference?: 'FEMALE' | 'MALE' | 'NON_BINARY' | 'NO_PREFERENCE';
  culturalPreference?: string;
  sortPreference?: EvoSortPreference;

  providerIntent?: ProviderIntent;
  providerProfileStatus?:
    | 'NOT_STARTED'
    | 'DRAFTED'
    | 'VERIFICATION_PENDING'
    | 'VERIFIED_NOT_LIVE'
    | 'LIVE';
  providerMembershipNow?: 'YES' | 'NOT_NOW';
  providerStage?: 'EARLY' | 'STEADY' | 'GROWING';
  publishResourceType?: 'WORKSHEET' | 'GUIDE' | 'COURSE' | 'AUDIO_VIDEO' | 'OTHER';
  publishAudience?: 'CLIENTS' | 'PROVIDERS' | 'BOTH';
  publishPricing?: 'FREE' | 'PAID' | 'NOT_SURE';
  publishPrice?: string;
  publishNeedsDisclaimer?: 'YES' | 'NO';
  troubleshootingArea?:
    | 'LOGIN_ACCOUNT'
    | 'PROFILE_NOT_SHOWING'
    | 'BOOKING_AVAILABILITY'
    | 'PAYMENTS_PAYOUTS'
    | 'VERIFICATION'
    | 'MARKETPLACE_PUBLISHING'
    | 'OTHER';
  troubleshootingError?: string;

  browsingIntent?: BrowsingIntent;

  safetyFlags?: EvoSafetyFlag[];
}

export interface QuestionOption {
  label: string;
  value: string;
  isCustom?: boolean;
}

export interface Question {
  id: keyof UserSignal;
  text: string;
  options?: QuestionOption[];
  multiSelect?: boolean;
  allowSkip?: boolean;
  inputType?: 'text';
  placeholder?: string;
  trigger?: (signal: Partial<UserSignal>) => boolean;
}

export interface Recommendation {
  id: string;
  type: 'provider' | 'resource' | 'article' | 'podcast' | 'event' | 'playlist';
  title: string;
  description: string;
  tags: string[];
  languages: string[];
  url: string;
  match_reasons: string[];
  availability?: string;
  cost?: 'free' | 'paid' | 'subscription';
  image?: string;
  providerId?: string;
}
