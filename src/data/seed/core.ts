import { User, ProviderProfile, Specialty, InsuranceCompany, BlogPost, Testimonial, Appointment, JobPosting, BlogCategory, Message, Notification } from '../types';
import { UserRole, SubscriptionTier, SubscriptionStatus, ModerationStatus, AppointmentType, AppointmentStatus, TicketStatus } from '../types/enums';

// HANDCRAFTED SEED DATA (Core/Production-ready)

export const seedUsers: User[] = [
  {
    id: 'u-admin-001',
    email: 'admin@evowell.com',
    firstName: 'System',
    lastName: 'Admin',
    role: UserRole.ADMIN,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    isDeleted: false
  },
  {
    id: 'u-prov-001',
    email: 'sarah.chen@evowell.com',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: UserRole.PROVIDER,
    createdAt: '2023-02-15T10:00:00Z',
    updatedAt: '2023-11-20T14:30:00Z',
    isDeleted: false
  },
  {
    id: 'u-prov-002',
    email: 'marcus.thorne@evowell.com',
    firstName: 'Marcus',
    lastName: 'Thorne',
    role: UserRole.PROVIDER,
    createdAt: '2023-03-10T09:00:00Z',
    updatedAt: '2023-12-01T11:00:00Z',
    isDeleted: false
  },
  {
    id: 'u-client-001',
    email: 'alice.m@gmail.com',
    firstName: 'Alice',
    lastName: 'Miller',
    role: UserRole.CLIENT,
    createdAt: '2023-06-01T12:00:00Z',
    updatedAt: '2023-06-01T12:00:00Z',
    isDeleted: false
  }
];

export const seedSpecialties: Specialty[] = [
  { id: 's-anxiety', name: 'Anxiety & Panic Disorders', slug: 'anxiety' },
  { id: 's-depression', name: 'Depression & Mood', slug: 'depression' },
  { id: 's-trauma', name: 'Trauma & PTSD', slug: 'trauma' },
  { id: 's-nutrition', name: 'Integrative Nutrition', slug: 'nutrition' },
  { id: 's-adhd', name: 'ADHD & Neurodivergence', slug: 'adhd' }
];

export const seedProviders: ProviderProfile[] = [
  {
    id: 'prov-u-prov-001',
    userId: 'u-prov-001',
    professionalTitle: 'PhD, Clinical Psychologist',
    professionalCategory: 'Mental Health',
    npi: '1234567890',
    yearsExperience: 12,
    education: 'PhD in Clinical Psychology, Stanford University',
    educationHistory: [
      { degree: 'PhD Clinical Psychology', university: 'Stanford University', year: '2011' }
    ],
    bio: 'Dr. Sarah Chen is a licensed clinical psychologist specializing in anxiety disorders.',
    tagline: 'Evidence-based strategies for the modern anxious mind.',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800',
    gallery: [],
    languages: ['English', 'Mandarin'],
    appointmentTypes: [AppointmentType.VIDEO],
    durations: [50],
    specialties: ['s-anxiety', 's-depression'],
    licenses: [{ state: 'CA', number: 'PSY-23451', verified: true }],
    certificates: ['CBT Certified'],
    availability: {
      days: ['Mon', 'Tue', 'Thu'],
      hours: ['09:00', '10:00', '11:00'],
      schedule: [
        { day: 'Mon', active: true, timeRanges: [{ start: '09:00', end: '16:00' }] }
      ],
      blockedDates: []
    },
    onboardingComplete: true,
    subscriptionTier: SubscriptionTier.PROFESSIONAL,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    moderationStatus: ModerationStatus.APPROVED,
    isPublished: true,
    digitalProducts: [],
    servicePackages: [],
    insuranceAccepted: ['Aetna', 'BlueCross BlueShield'],
    paymentMethodsAccepted: ['Credit Card'],
    pricing: { hourlyRate: 175, slidingScale: true },
    compliance: { termsAccepted: true, verificationAgreed: true },
    security: { question: 'Pet', answer: 'Rover' },
    metrics: { views: 1250, inquiries: 45 },
    metricsHistory: [],
    audit: { createdAt: '2023-02-15T10:00:00Z', updatedAt: '2023-11-20T14:30:00Z' },
    profileSlug: 'dr-sarah-chen'
  },
  {
    id: 'prov-u-prov-002',
    userId: 'u-prov-002',
    professionalTitle: 'LCSW, Psychotherapist',
    professionalCategory: 'Mental Health',
    npi: '9876543210',
    yearsExperience: 8,
    education: 'MSW, Columbia University',
    educationHistory: [
      { degree: 'Master of Social Work', university: 'Columbia University', year: '2015' }
    ],
    bio: 'Marcus Thorne is a licensed clinical social worker focused on trauma and relationships.',
    tagline: 'Healing through connection and understanding.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    gallery: [],
    languages: ['English', 'Spanish'],
    appointmentTypes: [AppointmentType.VIDEO, AppointmentType.IN_PERSON],
    durations: [50],
    specialties: ['s-trauma', 's-nutrition'],
    licenses: [{ state: 'NY', number: 'LCSW-88776', verified: true }],
    certificates: ['EMDR Trained'],
    availability: {
      days: ['Wed', 'Thu', 'Fri'],
      hours: ['12:00', '13:00', '14:00', '15:00'],
      schedule: [],
      blockedDates: []
    },
    onboardingComplete: true,
    subscriptionTier: SubscriptionTier.PROFESSIONAL,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    moderationStatus: ModerationStatus.APPROVED,
    isPublished: true,
    digitalProducts: [],
    servicePackages: [],
    insuranceAccepted: ['Cigna', 'UnitedHealthcare'],
    paymentMethodsAccepted: ['Credit Card'],
    pricing: { hourlyRate: 150, slidingScale: true },
    compliance: { termsAccepted: true, verificationAgreed: true },
    security: { question: 'City', answer: 'New York' },
    metrics: { views: 800, inquiries: 30 },
    metricsHistory: [],
    audit: { createdAt: '2023-03-10T09:00:00Z', updatedAt: '2023-12-01T11:00:00Z' },
    profileSlug: 'marcus-thorne'
  }
];

export const seedBlogs: BlogPost[] = [
  {
    id: 'blog-1',
    slug: 'science-of-sleep',
    title: 'The Science of Sleep',
    summary: 'Understanding the bidirectional relationship between sleep quality and emotional regulation.',
    content: '<p>Sleep is not just a passive state of rest...</p>',
    category: 'Wellness',
    authorName: 'Dr. Sarah Chen',
    authorRole: 'Clinical Psychologist',
    authorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1541781777621-af13b7a5a503?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2023-10-12',
    status: 'APPROVED',
    isFeatured: true
  }
];

export const seedTestimonials: Testimonial[] = [
  {
    id: 't-1',
    author: 'Michael R.',
    role: 'Patient since 2023',
    text: 'Finding Dr. Chen was a turning point.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    page: 'home'
  }
];
