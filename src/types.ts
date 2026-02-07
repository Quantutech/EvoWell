// In supabase.ts
export const isConfigured = false; // Force Mock Mode


export enum UserRole {
  ADMIN = 'ADMIN',
  PROVIDER = 'PROVIDER',
  CLIENT = 'CLIENT'
}

export enum SubscriptionTier {
  FREE = 'FREE',
  PROFESSIONAL = 'PROFESSIONAL',
  PREMIUM = 'PREMIUM'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TRIAL = 'TRIAL'
}

export enum ModerationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum AppointmentType {
  VIDEO = 'Video',
  PHONE = 'Phone',
  IN_PERSON = 'In Person',
  CHAT = 'Chat'
}

export enum SessionFormat {
  IN_PERSON = 'IN_PERSON',
  REMOTE = 'REMOTE'
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  PAID = 'PAID',
  REJECTED = 'REJECTED'
}

export enum TicketStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export enum AuditActionType {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  SEARCH = 'SEARCH',
  ACCESS_DENIED = 'ACCESS_DENIED'
}

export enum AuditResourceType {
  USER = 'user',
  PROVIDER = 'provider',
  APPOINTMENT = 'appointment',
  MESSAGE = 'message',
  PATIENT_RECORD = 'patient_record',
  SYSTEM = 'system',
  BLOG = 'blog'
}

export interface AuditLog {
  id: string;
  user_id: string;
  action_type: AuditActionType;
  resource_type: AuditResourceType;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
  created_at: string;
  user_email?: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  lat?: number;
  lng?: number;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface DaySchedule {
  day: string;
  active: boolean;
  timeRanges: TimeRange[];
}

export interface Availability {
  days: string[];
  hours: string[];
  schedule: DaySchedule[];
  blockedDates: string[];
  timezone?: string;
}

export interface MediaItem {
  id: string;
  type: 'video' | 'audio' | 'link';
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
}

export interface Education {
  degree: string;
  university: string;
  year: string;
}

export interface License {
  state: string;
  number: string;
  verified: boolean;
}

// Fixed: Correct ServicePackage interface matching the expected schema
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
}

export interface WellnessEntry {
  id: string;
  date: string;
  mood: number; // 1-5
  energy: number; // 1-5
  sleepHours: number;
  notes?: string;
}

export interface Habit {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  color: string;
}

export interface ClientProfile {
  id: string;
  userId: string;
  intakeStatus: 'PENDING' | 'COMPLETED';
  documents: { type: string; url: string; uploadedAt: string }[];
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  pronouns?: string;
  imageUrl?: string;
  phoneNumber?: string;
  address?: Address;
  emergencyContact?: { name: string; phone: string; relation: string };
  wellnessLog?: WellnessEntry[];
  habits?: Habit[];
  preferences?: {
    communication: 'email' | 'sms' | 'both';
    language: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  text: string;
  imageUrl: string;
  page: 'home' | 'partners';
}

export interface Appointment {
  id: string;
  providerId: string;
  clientId: string;
  dateTime: string;
  durationMinutes: number;
  status: AppointmentStatus;
  type?: AppointmentType;
  providerTimezone?: string;
  clientTimezone?: string;
  servicePackageId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'exempted';
  paymentIntentId?: string;
  amountCents?: number;
  amount?: number;
  currency?: string;
  notes?: string;
  meetingLink?: string;
  createdAt?: string;
  client?: {
    firstName: string;
    lastName: string;
    email: string;
    imageUrl?: string;
  };
  provider?: {
    professionalTitle: string;
    imageUrl?: string;
  };
}

export interface AvailabilitySlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface SupportTicketResponse {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
  responses?: SupportTicketResponse[];
}

export interface Specialty {
  id: string;
  name: string;
  slug?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  authorName: string;
  authorRole: string;
  authorImage: string;
  readTime: string;
  imageUrl: string;
  publishedAt?: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  isFeatured?: boolean;
  providerId?: string;
  isAiGenerated?: boolean;
  moderationFlags?: string[];
}

export interface InsuranceCompany {
  id: string;
  name: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug?: string;
}

export interface AuthContextType {
  user: User | null;
  provider: ProviderProfile | null;
  token: string | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface SearchFilters {
  specialty?: string;
  query?: string;
  state?: string;
  format?: SessionFormat;
  appointmentTypes?: AppointmentType[];
  gender?: string;
  language?: string;
  maxPrice?: number;
  agesServed?: string[];
  day?: string;
  limit?: number;
  offset?: number;
}

export interface DailyMetric {
  date: string;
  views: number;
  inquiries: number;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  postedAt: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'appointment' | 'system' | 'payment';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
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