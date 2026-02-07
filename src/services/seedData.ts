
import { 
  User, ProviderProfile, BlogPost, Testimonial, 
  Appointment, SupportTicket, Message, Specialty, 
  InsuranceCompany, BlogCategory, JobPosting, 
  UserRole, SubscriptionTier, SubscriptionStatus, 
  ModerationStatus, AppointmentType, TicketStatus,
  SessionFormat, AppointmentStatus, WellnessEntry, Habit, ClientProfile, Resource
} from '../types';

// --- Constants for Relational Integrity ---
const ADMIN_ID = 'u-admin-001';
const PROV_ID_1 = 'u-prov-001'; // Dr. Sarah Chen
const PROV_ID_2 = 'u-prov-002'; // Dr. Marcus Thorne
const PROV_ID_3 = 'u-prov-003'; // Elena Vance
const PROV_ID_4 = 'u-prov-004'; // Dr. James Wilson
const CLIENT_ID_1 = 'u-client-001'; // Alice
const CLIENT_ID_2 = 'u-client-002'; // Bob
const CLIENT_ID_3 = 'u-client-003'; // Charlie

// Test IDs
const TEST_ADMIN_ID = 'test-admin';
const TEST_PROV_ID = 'test-provider';
const TEST_CLIENT_ID = 'test-client';

const MOCK_WELLNESS_LOG: WellnessEntry[] = [
  { id: 'w1', date: '2026-02-01', mood: 4, energy: 3, sleepHours: 7, notes: 'Felt a bit anxious in the morning.' },
  { id: 'w2', date: '2026-02-02', mood: 5, energy: 4, sleepHours: 8, notes: 'Great sleep, productive day.' },
  { id: 'w3', date: '2026-02-03', mood: 3, energy: 2, sleepHours: 6, notes: 'Stressful meeting today.' },
  { id: 'w4', date: '2026-02-04', mood: 4, energy: 5, sleepHours: 7.5 },
  { id: 'w5', date: '2026-02-05', mood: 5, energy: 4, sleepHours: 8 },
  { id: 'w6', date: '2026-02-06', mood: 4, energy: 4, sleepHours: 7 },
];

const MOCK_HABITS: Habit[] = [
  { id: 'h1', name: 'Water Intake', target: 8, current: 6, unit: 'glasses', color: '#3b82f6' },
  { id: 'h2', name: 'Exercise', target: 30, current: 45, unit: 'mins', color: '#10b981' },
  { id: 'h3', name: 'Meditation', target: 10, current: 5, unit: 'mins', color: '#8b5cf6' },
  { id: 'h4', name: 'Reading', target: 20, current: 15, unit: 'pages', color: '#f59e0b' },
];

const clientProfiles: ClientProfile[] = [
  {
    id: `cp-${CLIENT_ID_1}`,
    userId: CLIENT_ID_1,
    intakeStatus: 'COMPLETED',
    documents: [],
    bio: 'Looking for holistic wellness strategies.',
    dateOfBirth: '1992-05-15',
    gender: 'Female',
    pronouns: 'She/Her',
    wellnessLog: MOCK_WELLNESS_LOG,
    habits: MOCK_HABITS,
    preferences: { communication: 'email', language: 'English' },
    createdAt: '2023-06-01T12:00:00Z',
    updatedAt: '2023-06-01T12:00:00Z'
  }
];

const SPECIALTY_ANXIETY = 's-anxiety';
const SPECIALTY_DEPRESSION = 's-depression';
const SPECIALTY_TRAUMA = 's-trauma';
const SPECIALTY_NUTRITION = 's-nutrition';
const SPECIALTY_ADHD = 's-adhd';
const SPECIALTY_RELATIONSHIPS = 's-relationships';
const SPECIALTY_SLEEP = 's-sleep';
const SPECIALTY_PERFORMANCE = 's-performance';

// --- 1. Users ---
const users: User[] = [
  // --- TEST USERS (For Manual Testing) ---
  {
    id: TEST_ADMIN_ID,
    email: 'admin-test@evowell.com',
    firstName: 'Test',
    lastName: 'Admin',
    role: UserRole.ADMIN,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false
  },
  {
    id: TEST_PROV_ID,
    email: 'provider@evowell.com',
    firstName: 'Test',
    lastName: 'Provider',
    role: UserRole.PROVIDER,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false
  },
  {
    id: TEST_CLIENT_ID,
    email: 'client@evowell.com',
    firstName: 'Test',
    lastName: 'Client',
    role: UserRole.CLIENT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false
  },
  // --- END TEST USERS ---

  {
    id: ADMIN_ID,
    email: 'admin@evowell.com',
    firstName: 'System',
    lastName: 'Admin',
    role: UserRole.ADMIN,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    isDeleted: false
  },
  {
    id: PROV_ID_1,
    email: 'sarah.chen@evowell.com',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: UserRole.PROVIDER,
    createdAt: '2023-02-15T10:00:00Z',
    updatedAt: '2023-11-20T14:30:00Z',
    isDeleted: false
  },
  {
    id: PROV_ID_2,
    email: 'marcus.thorne@evowell.com',
    firstName: 'Marcus',
    lastName: 'Thorne',
    role: UserRole.PROVIDER,
    createdAt: '2023-03-10T09:00:00Z',
    updatedAt: '2023-12-01T11:00:00Z',
    isDeleted: false
  },
  {
    id: PROV_ID_3,
    email: 'elena.vance@evowell.com',
    firstName: 'Elena',
    lastName: 'Vance',
    role: UserRole.PROVIDER,
    createdAt: '2023-01-20T15:00:00Z',
    updatedAt: '2023-10-05T16:20:00Z',
    isDeleted: false
  },
  {
    id: PROV_ID_4,
    email: 'james.wilson@evowell.com',
    firstName: 'James',
    lastName: 'Wilson',
    role: UserRole.PROVIDER,
    createdAt: '2023-05-12T08:00:00Z',
    updatedAt: '2023-09-15T09:45:00Z',
    isDeleted: false
  },
  {
    id: CLIENT_ID_1,
    email: 'alice.m@gmail.com',
    firstName: 'Alice',
    lastName: 'Miller',
    role: UserRole.CLIENT,
    createdAt: '2023-06-01T12:00:00Z',
    updatedAt: '2023-06-01T12:00:00Z',
    isDeleted: false
  },
  {
    id: CLIENT_ID_2,
    email: 'bob.davis@yahoo.com',
    firstName: 'Bob',
    lastName: 'Davis',
    role: UserRole.CLIENT,
    createdAt: '2023-07-15T14:30:00Z',
    updatedAt: '2023-08-20T10:00:00Z',
    isDeleted: false
  },
  {
    id: CLIENT_ID_3,
    email: 'charlie.t@outlook.com',
    firstName: 'Charlie',
    lastName: 'Thompson',
    role: UserRole.CLIENT,
    createdAt: '2023-08-01T09:15:00Z',
    updatedAt: '2023-08-01T09:15:00Z',
    isDeleted: false
  }
];

// --- 2. Specialties ---
const specialties: Specialty[] = [
  { id: SPECIALTY_ANXIETY, name: 'Anxiety & Panic Disorders', slug: 'anxiety' },
  { id: SPECIALTY_DEPRESSION, name: 'Depression & Mood', slug: 'depression' },
  { id: SPECIALTY_TRAUMA, name: 'Trauma & PTSD', slug: 'trauma' },
  { id: SPECIALTY_NUTRITION, name: 'Integrative Nutrition', slug: 'nutrition' },
  { id: SPECIALTY_ADHD, name: 'ADHD & Neurodivergence', slug: 'adhd' },
  { id: SPECIALTY_RELATIONSHIPS, name: 'Couples & Relationships', slug: 'relationships' },
  { id: SPECIALTY_SLEEP, name: 'Sleep Medicine', slug: 'sleep' },
  { id: SPECIALTY_PERFORMANCE, name: 'Peak Performance', slug: 'performance' }
];

// --- 3. Insurance ---
const insurance: InsuranceCompany[] = [
  { id: 'ins-aetna', name: 'Aetna' },
  { id: 'ins-cigna', name: 'Cigna' },
  { id: 'ins-bcbs', name: 'BlueCross BlueShield' },
  { id: 'ins-uhc', name: 'UnitedHealthcare' },
  { id: 'ins-kaiser', name: 'Kaiser Permanente' },
  { id: 'ins-medicare', name: 'Medicare' }
];

// --- 4. Providers ---
const providers: ProviderProfile[] = [
  // --- TEST PROVIDER PROFILE ---
  {
    id: 'prov-test',
    userId: TEST_PROV_ID,
    professionalTitle: 'PhD, Clinical Psychologist',
    professionalCategory: 'Mental Health',
    npi: '0000000000',
    yearsExperience: 5,
    education: 'PhD Clinical Psychology',
    educationHistory: [
      { degree: 'PhD', university: 'Test University', year: '2020' }
    ],
    bio: 'This is a test provider profile generated for QA purposes.',
    tagline: 'Testing the future of care.',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
    gallery: [],
    languages: ['English'],
    appointmentTypes: [AppointmentType.VIDEO],
    durations: [50],
    specialties: [SPECIALTY_ANXIETY],
    licenses: [{ state: 'CA', number: 'TEST-001', verified: true }],
    certificates: [],
    availability: {
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
      schedule: [
        { day: 'Mon', active: true, timeRanges: [{ start: '09:00', end: '17:00' }] },
        { day: 'Tue', active: true, timeRanges: [{ start: '09:00', end: '17:00' }] },
        { day: 'Wed', active: true, timeRanges: [{ start: '09:00', end: '17:00' }] },
        { day: 'Thu', active: true, timeRanges: [{ start: '09:00', end: '17:00' }] },
        { day: 'Fri', active: true, timeRanges: [{ start: '09:00', end: '17:00' }] },
      ],
      blockedDates: []
    },
    onboardingComplete: true,
    address: { street: '123 Test St', city: 'Test City', state: 'CA', zip: '90000', country: 'USA' },
    phone: '(555) 000-0000',
    website: 'https://evowell.test',
    social: { linkedin: '#' },
    subscriptionTier: SubscriptionTier.PROFESSIONAL,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    moderationStatus: ModerationStatus.APPROVED,
    isPublished: true,
    digitalProducts: [],
    servicePackages: [],
    insuranceAccepted: ['Aetna'],
    paymentMethodsAccepted: ['Credit Card'],
    pricing: { hourlyRate: 150, slidingScale: true, minFee: 100, maxFee: 150 },
    businessInfo: { businessName: 'Test Practice', taxId: '00-0000000', businessAddress: 'Test Addr', stripeAccountId: 'acct_test', stripeStatus: 'active' },
    compliance: { termsAccepted: true, verificationAgreed: true },
    security: { question: 'Test', answer: 'Test' },
    metrics: { views: 0, inquiries: 0 },
    metricsHistory: [],
    audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    gender: 'Other',
    worksWith: ['Adults'],
    profileSlug: 'dr-test-provider',
    pronouns: 'They/Them',
    videoUrl: 'https://www.youtube.com/watch?v=hnT1WfiU5GU&t=4s'
  },
  // --- END TEST PROVIDER ---

  {
    id: `prov-${PROV_ID_1}`,
    userId: PROV_ID_1,
    professionalTitle: 'PhD, Clinical Psychologist',
    professionalCategory: 'Mental Health',
    npi: '1234567890',
    yearsExperience: 12,
    education: 'PhD in Clinical Psychology, Stanford University',
    educationHistory: [
      { degree: 'PhD Clinical Psychology', university: 'Stanford University', year: '2011' },
      { degree: 'BS Psychology', university: 'UCLA', year: '2007' }
    ],
    bio: 'Dr. Sarah Chen is a licensed clinical psychologist specializing in anxiety disorders and cognitive behavioral therapy (CBT). With over a decade of experience in both hospital and private practice settings, she helps high-functioning professionals navigate stress, burnout, and anxiety. Her approach is data-driven yet deeply compassionate, focusing on practical tools for immediate relief and long-term resilience.',
    tagline: 'Evidence-based strategies for the modern anxious mind.',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800',
    gallery: ['https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&q=80&w=800'],
    languages: ['English', 'Mandarin'],
    appointmentTypes: [AppointmentType.VIDEO, AppointmentType.IN_PERSON],
    durations: [50],
    specialties: [SPECIALTY_ANXIETY, SPECIALTY_DEPRESSION, SPECIALTY_PERFORMANCE],
    licenses: [{ state: 'CA', number: 'PSY-23451', verified: true }, { state: 'NY', number: '023145', verified: true }],
    certificates: ['CBT Certified'],
    availability: {
      days: ['Mon', 'Tue', 'Thu'],
      hours: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'],
      schedule: [
        { day: 'Mon', active: true, timeRanges: [{ start: '09:00', end: '16:00' }] },
        { day: 'Tue', active: true, timeRanges: [{ start: '09:00', end: '16:00' }] },
        { day: 'Wed', active: false, timeRanges: [] },
        { day: 'Thu', active: true, timeRanges: [{ start: '10:00', end: '18:00' }] },
        { day: 'Fri', active: false, timeRanges: [] },
        { day: 'Sat', active: false, timeRanges: [] },
        { day: 'Sun', active: false, timeRanges: [] },
      ],
      blockedDates: ['2024-12-25', '2025-01-01']
    },
    onboardingComplete: true,
    address: { street: '450 Sutter St', city: 'San Francisco', state: 'CA', zip: '94108', country: 'USA' },
    phone: '(415) 555-0123',
    website: 'https://drsarahchen.com',
    social: { linkedin: 'https://linkedin.com/in/sarahchen', twitter: 'https://twitter.com/drchen' },
    subscriptionTier: SubscriptionTier.PROFESSIONAL,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    moderationStatus: ModerationStatus.APPROVED,
    isPublished: true,
    digitalProducts: [],
    servicePackages: [
      { 
        id: 'pkg-1', 
        providerId: `prov-${PROV_ID_1}`, 
        name: 'Anxiety Relief Bundle', 
        description: '4 sessions + digital workbook', 
        // Fixed: removed invalid property 'price'
        priceCents: 60000,
        sessionsIncluded: 4, 
        durationMinutes: 50,
        // Fixed: removed invalid property 'active'
        isActive: true
      },
      { 
        id: 'pkg-2', 
        providerId: `prov-${PROV_ID_1}`,
        name: 'Single Consultation', 
        description: 'One-time assessment', 
        // Fixed: removed invalid property 'price'
        priceCents: 17500,
        sessionsIncluded: 1, 
        durationMinutes: 50,
        // Fixed: removed invalid property 'active'
        isActive: true
      }
    ],
    insuranceAccepted: ['Aetna', 'BlueCross BlueShield'],
    paymentMethodsAccepted: ['Credit Card', 'HSA/FSA'],
    pricing: { hourlyRate: 175, slidingScale: true, minFee: 100, maxFee: 175 },
    businessInfo: { businessName: 'Chen Clinical Services Inc.', taxId: '99-1234567', businessAddress: '450 Sutter St, SF, CA', stripeAccountId: 'acct_12345', stripeStatus: 'active' },
    compliance: { termsAccepted: true, verificationAgreed: true },
    security: { question: 'Pet', answer: 'Rover' },
    metrics: { views: 1250, inquiries: 45 },
    metricsHistory: [],
    mediaAppearances: [
      { id: 'med-1', type: 'video', title: 'TEDx: The Anxious Generation', link: 'https://youtube.com', imageUrl: 'https://images.unsplash.com/photo-1478737270239-2fccd2c7862a?auto=format&fit=crop&q=80&w=800' }
    ],
    audit: { createdAt: '2023-02-15T10:00:00Z', updatedAt: '2023-11-20T14:30:00Z' },
    gender: 'Female',
    email: 'sarah.chen@evowell.com',
    worksWith: ['Adults', 'Executives'],
    // New Fields Task 2
    profileSlug: 'dr-sarah-chen-clinical-psychologist',
    pronouns: 'She/Her',
    businessAddress: { street: '450 Sutter St Suite 200', city: 'San Francisco', state: 'CA', zip: '94108', country: 'USA', lat: 37.7892, lng: -122.4091 },
    phoneNumber: '(415) 555-0199',
    mediaLinks: [
      { title: 'Understanding Anxiety', url: 'https://youtube.com/watch?v=example1', type: 'video' },
      { title: 'The Anxious Mind Podcast', url: 'https://spotify.com/example1', type: 'podcast' }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=hnT1WfiU5GU&t=4s'
  },
  {
    id: `prov-${PROV_ID_2}`,
    userId: PROV_ID_2,
    professionalTitle: 'MD, Psychiatrist',
    professionalCategory: 'Mental Health',
    npi: '9876543210',
    yearsExperience: 20,
    education: 'MD, Harvard Medical School',
    educationHistory: [
      { degree: 'MD', university: 'Harvard Medical School', year: '2003' },
      { degree: 'Residency', university: 'Johns Hopkins', year: '2007' }
    ],
    bio: 'Dr. Marcus Thorne is a board-certified psychiatrist with a focus on treatment-resistant depression and complex PTSD. He combines psychopharmacology with psychodynamic therapy to treat the whole person, not just the symptoms. Dr. Thorne believes in a collaborative model of care, working closely with therapists and other specialists.',
    tagline: 'Compassionate psychiatry for complex needs.',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
    gallery: [],
    languages: ['English', 'Spanish'],
    appointmentTypes: [AppointmentType.VIDEO, AppointmentType.PHONE],
    durations: [30, 60],
    specialties: [SPECIALTY_DEPRESSION, SPECIALTY_TRAUMA, SPECIALTY_ADHD],
    licenses: [{ state: 'NY', number: 'MD-887766', verified: true }],
    certificates: [],
    availability: {
      days: ['Wed', 'Thu', 'Fri'],
      hours: ['13:00', '14:00', '15:00', '16:00', '17:00'],
      schedule: [
        { day: 'Mon', active: false, timeRanges: [] },
        { day: 'Tue', active: false, timeRanges: [] },
        { day: 'Wed', active: true, timeRanges: [{ start: '13:00', end: '18:00' }] },
        { day: 'Thu', active: true, timeRanges: [{ start: '13:00', end: '18:00' }] },
        { day: 'Fri', active: true, timeRanges: [{ start: '13:00', end: '17:00' }] },
        { day: 'Sat', active: false, timeRanges: [] },
        { day: 'Sun', active: false, timeRanges: [] },
      ],
      blockedDates: []
    },
    onboardingComplete: true,
    address: { street: '100 Park Ave', city: 'New York', state: 'NY', zip: '10017', country: 'USA' },
    phone: '(212) 555-9988',
    website: 'https://thornepsychiatry.com',
    social: { linkedin: 'https://linkedin.com/in/marcusthorne' },
    subscriptionTier: SubscriptionTier.PREMIUM,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    moderationStatus: ModerationStatus.APPROVED,
    isPublished: true,
    digitalProducts: [],
    servicePackages: [],
    insuranceAccepted: ['Medicare', 'Cigna', 'UnitedHealthcare'],
    paymentMethodsAccepted: ['Credit Card'],
    pricing: { hourlyRate: 350, slidingScale: false },
    businessInfo: { businessName: 'Thorne Medical PLLC', taxId: '12-3456789', businessAddress: '100 Park Ave, NY, NY', stripeAccountId: 'acct_67890', stripeStatus: 'active' },
    compliance: { termsAccepted: true, verificationAgreed: true },
    security: { question: 'City', answer: 'Boston' },
    metrics: { views: 3200, inquiries: 80 },
    metricsHistory: [],
    audit: { createdAt: '2023-03-10T09:00:00Z', updatedAt: '2023-12-01T11:00:00Z' },
    gender: 'Male',
    email: 'marcus.thorne@evowell.com',
    worksWith: ['Adults', 'Seniors'],
    // New Fields Task 2
    profileSlug: 'dr-marcus-thorne-psychiatrist',
    pronouns: 'He/Him',
    businessAddress: { street: '100 Park Ave Floor 5', city: 'New York', state: 'NY', zip: '10017', country: 'USA', lat: 40.7516, lng: -73.9776 },
    phoneNumber: '(212) 555-9989',
    mediaLinks: [
      { title: 'New Perspectives on Trauma', url: 'https://podcast.example.com/thorne', type: 'podcast' }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=hnT1WfiU5GU&t=4s'
  },
  {
    id: `prov-${PROV_ID_3}`,
    userId: PROV_ID_3,
    professionalTitle: 'Holistic Wellness Coach',
    professionalCategory: 'Wellness Coach',
    npi: undefined, // Coaches might not have NPI
    yearsExperience: 8,
    education: 'Certified Health Coach, IIN',
    educationHistory: [
      { degree: 'Health Coach Cert', university: 'Institute for Integrative Nutrition', year: '2015' }
    ],
    bio: 'Elena Vance bridges the gap between mental and physical well-being. As a certified wellness coach and yoga instructor, she helps clients manage stress through mindfulness, movement, and lifestyle design. Her sessions are practical, energizing, and focused on creating sustainable daily habits.',
    tagline: 'Designing a life of balance and vitality.',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
    gallery: [],
    languages: ['English', 'French'],
    appointmentTypes: [AppointmentType.VIDEO, AppointmentType.CHAT],
    durations: [45],
    specialties: [SPECIALTY_SLEEP, SPECIALTY_NUTRITION, SPECIALTY_ANXIETY],
    licenses: [],
    certificates: ['RYT-200 Yoga Alliance', 'IIN Health Coach'],
    availability: {
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      hours: ['07:00', '08:00', '18:00', '19:00'],
      schedule: [],
      blockedDates: []
    },
    onboardingComplete: true,
    address: { street: 'Remote', city: 'Austin', state: 'TX', zip: '78701', country: 'USA' },
    phone: '(512) 555-4433',
    subscriptionTier: SubscriptionTier.PROFESSIONAL,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    moderationStatus: ModerationStatus.APPROVED,
    isPublished: true,
    digitalProducts: [],
    servicePackages: [
      { 
        id: 'pkg-coach-1', 
        providerId: `prov-${PROV_ID_3}`,
        name: '30-Day Reset', 
        description: 'Weekly coaching + daily check-ins', 
        // Fixed: removed invalid property 'price'
        priceCents: 29900,
        sessionsIncluded: 4, 
        durationMinutes: 45,
        // Fixed: removed invalid property 'active'
        isActive: true
      }
    ],
    insuranceAccepted: [],
    paymentMethodsAccepted: ['Credit Card', 'PayPal'],
    pricing: { hourlyRate: 100, slidingScale: true, minFee: 75, maxFee: 100 },
    businessInfo: { businessName: 'Vance Wellness LLC', taxId: '88-7766554', businessAddress: 'Austin, TX', stripeAccountId: 'acct_wellness', stripeStatus: 'active' },
    compliance: { termsAccepted: true, verificationAgreed: true },
    security: { question: 'Color', answer: 'Blue' },
    metrics: { views: 800, inquiries: 20 },
    metricsHistory: [],
    audit: { createdAt: '2023-01-20T15:00:00Z', updatedAt: '2023-10-05T16:20:00Z' },
    gender: 'Female',
    email: 'elena.vance@evowell.com',
    worksWith: ['Young Adults', 'Women'],
    // New Fields Task 2
    profileSlug: 'elena-vance-wellness-coach',
    pronouns: 'She/Her',
    businessAddress: { street: '200 Congress Ave', city: 'Austin', state: 'TX', zip: '78701', country: 'USA', lat: 30.2645, lng: -97.7443 },
    phoneNumber: '(512) 555-4434',
    mediaLinks: [
      { title: 'Daily Mindfulness Routine', url: 'https://youtube.com/watch?v=mindful', type: 'video' },
      { title: 'Wellness Weekly Blog', url: 'https://medium.com/@elenav', type: 'article' }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=hnT1WfiU5GU&t=4s'
  },
  {
    id: `prov-${PROV_ID_4}`,
    userId: PROV_ID_4,
    professionalTitle: 'Clinical Nutritionist, RD',
    professionalCategory: 'Nutritionist',
    npi: '5678901234',
    yearsExperience: 5,
    education: 'MS Nutrition, Columbia University',
    educationHistory: [],
    bio: 'James Wilson is a Registered Dietitian who understands the powerful link between gut health and mental health. He works with clients to optimize their diet for mood stability, energy, and cognitive focus.',
    tagline: 'Fueling your mind through food.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    gallery: [],
    languages: ['English'],
    appointmentTypes: [AppointmentType.VIDEO],
    durations: [60],
    specialties: [SPECIALTY_NUTRITION, SPECIALTY_DEPRESSION],
    licenses: [{ state: 'NY', number: 'RD-998877', verified: false }], // Testing pending verif
    certificates: [],
    availability: { days: ['Tue', 'Thu'], hours: [], schedule: [], blockedDates: [] },
    onboardingComplete: true,
    subscriptionTier: SubscriptionTier.FREE,
    subscriptionStatus: SubscriptionStatus.TRIAL,
    moderationStatus: ModerationStatus.PENDING, // Testing pending status
    isPublished: false,
    digitalProducts: [],
    servicePackages: [],
    insuranceAccepted: ['Aetna'],
    paymentMethodsAccepted: ['Credit Card'],
    pricing: { hourlyRate: 150, slidingScale: false },
    businessInfo: undefined,
    compliance: { termsAccepted: true, verificationAgreed: true },
    security: { question: 'Car', answer: 'Ford' },
    metrics: { views: 100, inquiries: 2 },
    metricsHistory: [],
    audit: { createdAt: '2023-05-12T08:00:00Z', updatedAt: '2023-09-15T09:45:00Z' },
    gender: 'Male',
    worksWith: ['Adults', 'Athletes'],
    // New Fields Task 2
    profileSlug: 'james-wilson-clinical-nutritionist',
    pronouns: 'He/Him',
    businessAddress: { street: '500 Broadway', city: 'New York', state: 'NY', zip: '10012', country: 'USA', lat: 40.7247, lng: -73.9996 },
    phoneNumber: '(212) 555-1235',
    mediaLinks: [
      { title: 'Nutrition for Cognitive Focus', url: 'https://youtube.com/watch?v=nutrition', type: 'video' }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=hnT1WfiU5GU&t=4s'
  }
];

// --- 5. Blog Posts ---
const blogs: BlogPost[] = [
  {
    id: 'blog-1',
    slug: 'science-of-sleep',
    title: 'The Science of Sleep: Why It Matters for Mental Health',
    summary: 'Understanding the bidirectional relationship between sleep quality and emotional regulation. Practical tips for better rest.',
    content: '<p>Sleep is not just a passive state of rest; it is an active period of neurological repair...</p><h3>The REM Cycle</h3><p>During REM sleep, our brains process emotional memories...</p>',
    category: 'Wellness',
    authorName: 'Dr. Sarah Chen',
    authorRole: 'Clinical Psychologist',
    authorImage: providers[1].imageUrl, // Adjusted index
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&q=80&w=800',
    publishedAt: 'Oct 12, 2023',
    status: 'APPROVED',
    isFeatured: true,
    providerId: providers[1].id
  },
  {
    id: 'blog-2',
    slug: 'nutrition-and-mood',
    title: 'Gut-Brain Axis: How Food Affects Your Mood',
    summary: 'Exploring the connection between the microbiome and neurotransmitter production. What to eat for better mental clarity.',
    content: '<p>95% of your serotonin is produced in your gastrointestinal tract...</p>',
    category: 'Nutrition',
    authorName: 'James Wilson',
    authorRole: 'Clinical Nutritionist',
    authorImage: providers[4].imageUrl, // Adjusted index
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
    publishedAt: 'Nov 05, 2023',
    status: 'APPROVED',
    providerId: providers[4].id
  },
  {
    id: 'blog-3',
    slug: 'mindfulness-at-work',
    title: 'Micro-Mindfulness for Busy Professionals',
    summary: 'You don\'t need 20 minutes to meditate. Learn how 30-second resets can lower cortisol levels instantly.',
    content: '<p>Stress in the corporate world is endemic...</p>',
    category: 'Lifestyle',
    authorName: 'Elena Vance',
    authorRole: 'Wellness Coach',
    authorImage: providers[3].imageUrl, // Adjusted index
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    publishedAt: 'Dec 01, 2023',
    status: 'PENDING', // Testing pending status
    providerId: providers[3].id
  },
  {
    id: 'blog-4',
    slug: 'understanding-trauma',
    title: 'Understanding Complex Trauma',
    summary: 'Distinguishing between PTSD and C-PTSD, and the pathways to recovery through somatic experiencing.',
    content: '<p>Trauma is not just in the event, but in the nervous system...</p>',
    category: 'Mental Health',
    authorName: 'Dr. Marcus Thorne',
    authorRole: 'Psychiatrist',
    authorImage: providers[2].imageUrl, // Adjusted index
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1620065406085-7d8d21b5f7e6?auto=format&fit=crop&q=80&w=800',
    publishedAt: 'Jan 10, 2024',
    status: 'APPROVED',
    providerId: providers[2].id
  },
  {
    id: 'blog-5',
    slug: 'benefits-of-coaching',
    title: 'Therapy vs. Coaching: Which Do You Need?',
    summary: 'A breakdown of the differences between clinical therapy and goal-oriented coaching.',
    content: '<p>While therapy often looks back to heal, coaching looks forward to build...</p>',
    category: 'Wellness',
    authorName: 'Elena Vance',
    authorRole: 'Wellness Coach',
    authorImage: providers[3].imageUrl, // Adjusted index
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&q=80&w=800',
    publishedAt: 'Feb 15, 2024',
    status: 'APPROVED',
    providerId: providers[3].id
  },
  {
    id: 'blog-6',
    slug: 'digital-detox',
    title: 'The Art of the Digital Detox',
    summary: 'Reclaiming your attention span in an economy designed to distract you.',
    content: '<p>Screen time is correlated with higher rates of anxiety...</p>',
    category: 'Lifestyle',
    authorName: 'EvoWell Editorial',
    authorRole: 'Admin',
    authorImage: 'https://i.pravatar.cc/150?u=admin',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&q=80&w=800',
    publishedAt: 'Mar 01, 2024',
    status: 'APPROVED'
  }
];

// --- 6. Testimonials ---
const testimonials: Testimonial[] = [
  {
    id: 't-1',
    author: 'Michael R.',
    role: 'Patient since 2023',
    text: 'Finding Dr. Chen was a turning point. The matching process was seamless, and I felt understood from the first session.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    page: 'home'
  },
  {
    id: 't-2',
    author: 'Jennifer K.',
    role: 'Provider Network',
    text: 'EvoWell has simplified my practice management. I spend less time on billing and more time with patients.',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    page: 'partners'
  },
  {
    id: 't-3',
    author: 'David L.',
    role: 'Patient',
    text: 'The ability to check insurance eligibility instantly saved me so much headache. Highly recommend.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    page: 'home'
  },
  {
    id: 't-4',
    author: 'Wellness Co.',
    role: 'Strategic Partner',
    text: 'Partnering with EvoWell gave us access to a highly qualified network of professionals. A game changer for our employee benefits program.',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    page: 'partners'
  },
  {
    id: 't-5',
    author: 'Sarah J.',
    role: 'Patient',
    text: 'I love that I can see both therapists and nutritionists in one place. Holistic care is finally accessible.',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    page: 'home'
  },
  {
    id: 't-6',
    author: 'BetterHealth Inc.',
    role: 'Sponsor',
    text: 'The sponsorship opportunities are well-targeted and effective. We saw great engagement from the provider community.',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    page: 'partners'
  }
];

// --- 7. Appointments ---
const appointments: Appointment[] = [
  {
    id: 'appt-1',
    providerId: `prov-${PROV_ID_1}`,
    clientId: CLIENT_ID_1,
    dateTime: '2026-03-15T09:00:00', 
    status: AppointmentStatus.CONFIRMED,
    type: AppointmentType.VIDEO,
    paymentStatus: 'paid',
    durationMinutes: 60
  },
  {
    id: 'appt-2',
    providerId: `prov-${PROV_ID_1}`,
    clientId: CLIENT_ID_1,
    dateTime: '2026-02-01T09:00:00', // Past
    status: AppointmentStatus.COMPLETED,
    type: AppointmentType.IN_PERSON,
    paymentStatus: 'paid',
    durationMinutes: 60
  },
  {
    id: 'appt-3',
    providerId: `prov-${PROV_ID_2}`,
    clientId: CLIENT_ID_2,
    dateTime: '2026-03-20T14:00:00',
    status: AppointmentStatus.PENDING,
    type: AppointmentType.VIDEO,
    paymentStatus: 'pending',
    durationMinutes: 60
  },
  {
    id: 'appt-4',
    providerId: `prov-${PROV_ID_3}`,
    clientId: CLIENT_ID_3,
    dateTime: '2026-03-18T10:00:00',
    status: AppointmentStatus.CONFIRMED,
    type: AppointmentType.PHONE,
    paymentStatus: 'paid',
    durationMinutes: 45
  },
  {
    id: 'appt-5',
    providerId: `prov-${PROV_ID_1}`,
    clientId: CLIENT_ID_2,
    dateTime: '2026-02-02T15:00:00', // Past
    status: AppointmentStatus.CANCELLED,
    type: AppointmentType.VIDEO,
    paymentStatus: 'exempted',
    durationMinutes: 60
  },
  {
    id: 'appt-new-pending',
    providerId: `prov-${PROV_ID_1}`,
    clientId: CLIENT_ID_3,
    dateTime: '2026-04-01T10:00:00',
    status: AppointmentStatus.PENDING,
    type: AppointmentType.IN_PERSON,
    paymentStatus: 'pending',
    durationMinutes: 60
  },
  {
    id: 'appt-alice-past-1',
    providerId: `prov-${PROV_ID_1}`,
    clientId: CLIENT_ID_1,
    dateTime: '2026-01-15T14:00:00',
    status: AppointmentStatus.COMPLETED,
    type: AppointmentType.VIDEO,
    paymentStatus: 'paid',
    durationMinutes: 50
  },
  {
    id: 'appt-alice-past-2',
    providerId: `prov-${PROV_ID_2}`,
    clientId: CLIENT_ID_1,
    dateTime: '2026-01-20T10:00:00',
    status: AppointmentStatus.COMPLETED,
    type: AppointmentType.VIDEO,
    paymentStatus: 'paid',
    durationMinutes: 30
  },
  {
    id: 'appt-alice-future-2',
    providerId: `prov-${PROV_ID_1}`,
    clientId: CLIENT_ID_1,
    dateTime: '2026-03-25T11:00:00',
    status: AppointmentStatus.CONFIRMED,
    type: AppointmentType.VIDEO,
    paymentStatus: 'paid',
    durationMinutes: 50
  },
  // Ensure TEST_PROV_ID also has data for manual testing
  {
    id: 'appt-test-pending',
    providerId: 'prov-test',
    clientId: CLIENT_ID_1,
    dateTime: '2026-04-02T14:00:00',
    status: AppointmentStatus.PENDING,
    paymentStatus: 'pending',
    durationMinutes: 60
  },
  {
    id: 'appt-test-confirmed',
    providerId: 'prov-test',
    clientId: CLIENT_ID_2,
    dateTime: '2026-04-03T10:00:00',
    status: AppointmentStatus.CONFIRMED,
    paymentStatus: 'paid',
    durationMinutes: 60
  }
];

// --- 8. Support Tickets ---
const tickets: SupportTicket[] = [
  {
    id: 'ticket-1',
    userId: PROV_ID_1,
    subject: 'Billing Issue',
    message: 'I am having trouble syncing my Stripe account.',
    status: TicketStatus.OPEN,
    createdAt: '2024-03-10T10:00:00Z',
    responses: []
  },
  {
    id: 'ticket-2',
    userId: CLIENT_ID_1,
    subject: 'Login Trouble',
    message: 'I forgot my password and the reset link is not working.',
    status: TicketStatus.CLOSED,
    createdAt: '2024-02-15T09:00:00Z',
    responses: [
      { id: 'resp-1', senderId: ADMIN_ID, message: 'Password reset manually. Check your email.', createdAt: '2024-02-15T10:00:00Z' }
    ]
  },
  {
    id: 'ticket-3',
    userId: PROV_ID_4,
    subject: 'Profile Verification',
    message: 'How long does the NPI check take?',
    status: TicketStatus.OPEN,
    createdAt: '2024-03-12T14:00:00Z'
  },
  {
    id: 'ticket-4',
    userId: CLIENT_ID_2,
    subject: 'Insurance Question',
    message: 'Do you accept Cigna for nutrition?',
    status: TicketStatus.OPEN,
    createdAt: '2024-03-11T11:00:00Z'
  }
];

// --- 9. Messages ---
const messages: Message[] = [
  // Thread 1: Alice (Client) <-> Sarah (Provider)
  {
    id: 'msg-1',
    conversation_id: `thread-${[CLIENT_ID_1, PROV_ID_1].sort().join('-')}`,
    sender_id: CLIENT_ID_1,
    receiver_id: PROV_ID_1,
    content: 'Hi Dr. Chen, I am interested in your anxiety relief bundle.',
    created_at: '2024-03-01T09:00:00Z',
    is_read: true
  },
  {
    id: 'msg-2',
    conversation_id: `thread-${[CLIENT_ID_1, PROV_ID_1].sort().join('-')}`,
    sender_id: PROV_ID_1,
    receiver_id: CLIENT_ID_1,
    content: 'Hello Alice, I would be happy to help. Have you had a consultation before?',
    created_at: '2024-03-01T09:30:00Z',
    is_read: true
  },
  {
    id: 'msg-3',
    conversation_id: `thread-${[CLIENT_ID_1, PROV_ID_1].sort().join('-')}`,
    sender_id: CLIENT_ID_1,
    receiver_id: PROV_ID_1,
    content: 'No, this would be my first time.',
    created_at: '2024-03-01T09:35:00Z',
    is_read: true
  },
  {
    id: 'msg-4',
    conversation_id: `thread-${[CLIENT_ID_1, PROV_ID_1].sort().join('-')}`,
    sender_id: PROV_ID_1,
    receiver_id: CLIENT_ID_1,
    content: 'Great. Please book an initial intake session through the calendar.',
    created_at: '2024-03-01T09:40:00Z',
    is_read: false // Alice hasn't read this yet
  },

  // Thread 2: Bob (Client) <-> Marcus (Provider)
  {
    id: 'msg-5',
    conversation_id: `thread-${[CLIENT_ID_2, PROV_ID_2].sort().join('-')}`,
    sender_id: CLIENT_ID_2,
    receiver_id: PROV_ID_2,
    content: 'Dr. Thorne, do you have any evening availability?',
    created_at: '2024-03-05T18:00:00Z',
    is_read: true
  },
  {
    id: 'msg-6',
    conversation_id: `thread-${[CLIENT_ID_2, PROV_ID_2].sort().join('-')}`,
    sender_id: PROV_ID_2,
    receiver_id: CLIENT_ID_2,
    content: 'Hi Bob, I strictly work 1-6pm. I can refer you to a colleague if needed.',
    created_at: '2024-03-06T09:00:00Z',
    is_read: true
  },

  // Thread 3: Sarah (Provider) <-> System (Admin)
  {
    id: 'msg-7',
    conversation_id: `thread-${[PROV_ID_1, 'system'].sort().join('-')}`,
    sender_id: PROV_ID_1,
    receiver_id: 'system',
    content: 'Hello support, I need to update my NPI number.',
    created_at: '2024-02-20T10:00:00Z',
    is_read: true
  },
  {
    id: 'msg-8',
    conversation_id: `thread-${[PROV_ID_1, 'system'].sort().join('-')}`,
    sender_id: 'system',
    receiver_id: PROV_ID_1,
    content: 'Hi Sarah, you can do that in the Settings tab under Business & Compliance.',
    created_at: '2024-02-20T10:05:00Z',
    is_read: true
  },
  {
    id: 'msg-9',
    conversation_id: `thread-${[PROV_ID_1, 'system'].sort().join('-')}`,
    sender_id: PROV_ID_1,
    receiver_id: 'system',
    content: 'Found it, thank you!',
    created_at: '2024-02-20T10:10:00Z',
    is_read: true
  }
];

// --- 10. Job Postings ---
const jobs: JobPosting[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote (US)',
    type: 'Full-time',
    postedAt: '2 days ago',
    description: 'We are looking for a Senior React Engineer to lead our frontend architecture.',
    responsibilities: ['Build reusable components', 'Optimize performance', 'Mentor juniors'],
    requirements: ['5+ years React', 'TypeScript mastery', 'Tailwind CSS']
  },
  {
    id: 'job-2',
    title: 'Clinical Operations Manager',
    department: 'Operations',
    location: 'New York, NY',
    type: 'Full-time',
    postedAt: '1 week ago',
    description: 'Oversee our provider network and ensure clinical quality standards.',
    responsibilities: ['Vetting new providers', 'Manage support team', 'Ensure compliance'],
    requirements: ['Clinical background', 'Operations experience', 'Strong communication']
  },
  {
    id: 'job-3',
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Contract',
    postedAt: '3 days ago',
    description: 'Help us design the future of tele-wellness interfaces.',
    responsibilities: ['User research', 'UI/UX design', 'Prototyping'],
    requirements: ['Figma expert', 'Healthcare experience preferred', 'Portfolio required']
  }
];

// --- 11. Blog Categories ---
const blogCategories: BlogCategory[] = [
  { id: 'cat-1', name: 'Mental Health', slug: 'mental-health' },
  { id: 'cat-2', name: 'Wellness', slug: 'wellness' },
  { id: 'cat-3', name: 'Nutrition', slug: 'nutrition' },
  { id: 'cat-4', name: 'Lifestyle', slug: 'lifestyle' },
  { id: 'cat-5', name: 'Design', slug: 'design' },
  { id: 'cat-6', name: 'Product', slug: 'product' }
];

// --- 12. Resources (Provider Exchange) ---
const resources: Resource[] = [
  {
    id: 'res-1',
    providerId: `u-prov-001`,
    slug: 'cbt-worksheet-for-anxiety',
    title: 'CBT Worksheet for Anxiety',
    shortDescription: 'A practical worksheet to identify and challenge negative thought patterns.',
    fullDescription: '# CBT Worksheet\n\nThis worksheet helps you identify cognitive distortions...\n\n## Instructions\n1. Write down the trigger event.\n2. Identify your automatic thought.',
    type: 'worksheet',
    categories: ['cat-1'], // Mental Health
    languages: ['English'],
    accessType: 'free',
    currency: 'USD',
    deliveryType: 'download',
    fileUrl: 'https://example.com/cbt-worksheet.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    previewImages: [],
    tags: ['CBT', 'Anxiety', 'Worksheet'],
    status: 'published',
    moderationStatus: 'approved',
    visibility: 'public',
    createdAt: '2023-11-15T10:00:00Z',
    updatedAt: '2023-11-15T10:00:00Z',
    downloads: 120,
    views: 450
  },
  {
    id: 'res-2',
    providerId: `u-prov-003`,
    slug: '7-day-mindfulness-course',
    title: '7-Day Mindfulness Course',
    shortDescription: 'A daily audio guide to building a mindfulness habit.',
    fullDescription: '# 7-Day Mindfulness\n\n## Day 1: Breath\nFocus on the sensation of breathing...',
    type: 'course',
    categories: ['cat-2'], // Wellness
    languages: ['English'],
    accessType: 'paid',
    price: 4900, // $49.00
    currency: 'USD',
    deliveryType: 'external_link',
    externalUrl: 'https://teachable.com/mindfulness',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    previewImages: [],
    tags: ['Mindfulness', 'Audio', 'Course'],
    status: 'published',
    moderationStatus: 'approved',
    visibility: 'public',
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-10T14:00:00Z',
    downloads: 45,
    views: 890
  },
  {
    id: 'res-3',
    providerId: `u-prov-002`,
    slug: 'clinical-assessment-template',
    title: 'Clinical Assessment Template',
    shortDescription: 'Professional intake form and mental status examination template for private practice.',
    fullDescription: '# Clinical Assessment Template\n\nStreamline your intake process with this comprehensive template...',
    type: 'template',
    categories: ['cat-1', 'cat-6'], // Mental Health, Product
    languages: ['English'],
    accessType: 'paid',
    price: 2500,
    currency: 'USD',
    deliveryType: 'download',
    fileUrl: 'https://example.com/assessment-template.docx',
    thumbnailUrl: 'https://images.unsplash.com/photo-1454165833767-131f726b449c?auto=format&fit=crop&q=80&w=800',
    previewImages: [],
    tags: ['Clinical', 'Template', 'Intake'],
    status: 'published',
    moderationStatus: 'approved',
    visibility: 'public',
    createdAt: '2023-12-05T09:00:00Z',
    updatedAt: '2023-12-05T09:00:00Z',
    downloads: 88,
    views: 320
  },
  {
    id: 'res-4',
    providerId: `u-prov-001`,
    slug: 'trauma-informed-yoga-guide',
    title: 'Trauma-Informed Yoga Guide',
    shortDescription: 'A 20-page illustrated guide on integrating somatic yoga into trauma therapy.',
    fullDescription: '# Trauma-Informed Yoga\n\nThis guide covers the intersection of somatic experiencing and yoga...',
    type: 'guide',
    categories: ['cat-1', 'cat-2'], // Mental Health, Wellness
    languages: ['English', 'Spanish'],
    accessType: 'free',
    currency: 'USD',
    deliveryType: 'download',
    fileUrl: 'https://example.com/yoga-guide.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    previewImages: [],
    tags: ['Yoga', 'Trauma', 'Somatic'],
    status: 'published',
    moderationStatus: 'approved',
    visibility: 'public',
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z',
    downloads: 210,
    views: 1200
  },
  {
    id: 'res-5',
    providerId: `u-prov-004`,
    slug: 'anti-inflammatory-meal-plan',
    title: 'Anti-Inflammatory Meal Plan',
    shortDescription: '14-day clinical nutrition plan designed to reduce systemic inflammation and improve mood.',
    fullDescription: '# 14-Day Anti-Inflammatory Plan\n\nDetailed recipes and clinical reasoning for each ingredient...',
    type: 'course',
    categories: ['cat-3'], // Nutrition
    languages: ['English'],
    accessType: 'paid',
    price: 3500,
    currency: 'USD',
    deliveryType: 'external_link',
    externalUrl: 'https://jamesnutrition.com/plan',
    thumbnailUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
    previewImages: [],
    tags: ['Nutrition', 'Diet', 'Mood'],
    status: 'published',
    moderationStatus: 'approved',
    visibility: 'public',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-01T08:00:00Z',
    downloads: 30,
    views: 150
  },
  {
    id: 'res-6',
    providerId: `u-prov-001`,
    slug: 'sleep-hygiene-checklist',
    title: 'Sleep Hygiene Checklist',
    shortDescription: 'A simple, evidence-based checklist for better sleep quality.',
    fullDescription: '# Sleep Hygiene Checklist\n\nOptimize your sleep environment and daily habits for restorative rest...',
    type: 'worksheet',
    categories: ['cat-2'], // Wellness
    languages: ['English'],
    accessType: 'free',
    currency: 'USD',
    deliveryType: 'download',
    fileUrl: 'https://example.com/sleep-hygiene.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541781777621-af13b7a5a503?auto=format&fit=crop&q=80&w=800',
    previewImages: [],
    tags: ['Sleep', 'Wellness', 'Checklist'],
    status: 'published',
    moderationStatus: 'approved',
    visibility: 'public',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
    downloads: 340,
    views: 1100
  },
  {
    id: 'res-7',
    providerId: `u-prov-002`,
    slug: 'depression-symptom-tracker',
    title: 'Depression Symptom Tracker',
    shortDescription: 'Weekly mood and symptom tracking log for individuals with depression.',
    fullDescription: '# Depression Symptom Tracker\n\nThis tool allows you to monitor your mood and identify triggers over time...',
    type: 'worksheet',
    categories: ['cat-1'], // Mental Health
    languages: ['English', 'Spanish'],
    accessType: 'free',
    currency: 'USD',
    deliveryType: 'download',
    fileUrl: 'https://example.com/mood-tracker.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&q=80&w=800',
    previewImages: [],
    tags: ['Mood', 'Depression', 'Tracking'],
    status: 'published',
    moderationStatus: 'approved',
    visibility: 'public',
    createdAt: '2024-02-15T11:00:00Z',
    updatedAt: '2024-02-15T11:00:00Z',
    downloads: 215,
    views: 950
  },
  {
    id: 'res-8',
    providerId: `u-prov-003`,
    slug: 'holistic-productivity-toolkit',
    title: 'Holistic Productivity Toolkit',
    shortDescription: 'A set of Notion templates and guides for balanced productivity.',
    fullDescription: '# Holistic Productivity\n\nManage your energy, not just your time. Includes 3 Notion templates...',
    type: 'toolkit',
    categories: ['cat-4', 'cat-6'], // Lifestyle, Product
    languages: ['English'],
    accessType: 'paid',
    price: 3900,
    currency: 'USD',
    deliveryType: 'external_link',
    externalUrl: 'https://notion.so/wellness-toolkit',
    thumbnailUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800',
    previewImages: [],
    tags: ['Notion', 'Productivity', 'Wellness'],
    status: 'published',
    moderationStatus: 'approved',
    visibility: 'public',
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-02-20T09:00:00Z',
    downloads: 65,
    views: 420
  },
  {
    id: 'res-9',
    providerId: `u-prov-001`,
    slug: 'anxiety-exposure-hierarchy',
    title: 'Anxiety Exposure Hierarchy',
    shortDescription: 'A template for building an exposure hierarchy for phobias and social anxiety.',
    fullDescription: '# Exposure Hierarchy\n\nBreak down your fears into manageable steps. A core component of CBT...',
    type: 'template',
    categories: ['cat-1'], // Mental Health
    languages: ['English'],
    accessType: 'free',
    currency: 'USD',
    deliveryType: 'download',
    fileUrl: 'https://example.com/exposure-hierarchy.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    previewImages: [],
    tags: ['CBT', 'Anxiety', 'Exposure'],
    status: 'published',
    moderationStatus: 'approved',
    visibility: 'public',
    createdAt: '2024-02-25T14:00:00Z',
    updatedAt: '2024-02-25T14:00:00Z',
    downloads: 180,
    views: 600
  },
  {
    id: 'res-10',
    providerId: `u-prov-002`,
    slug: 'medication-management-log',
    title: 'Medication Management Log',
    shortDescription: 'Clinical tool for tracking medication adherence and side effects.',
    fullDescription: '# Medication Log\n\nEnsure clinical compliance and monitor therapeutic response with this log...',
    type: 'worksheet',
    categories: ['cat-1'], // Mental Health
    languages: ['English'],
    accessType: 'free',
    currency: 'USD',
    deliveryType: 'download',
    fileUrl: 'https://example.com/med-log.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
    previewImages: [],
    tags: ['Medication', 'Clinical', 'Tracking'],
    status: 'published',
    moderationStatus: 'approved',
    visibility: 'public',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
    downloads: 95,
    views: 280
  },
  {
    id: 'res-11',
    providerId: `u-prov-003`,
    slug: 'morning-routine-mood-board',
    title: 'Morning Routine Mood Board',
    shortDescription: 'Visual guide to designing a calming and energizing morning routine.',
    fullDescription: '# Morning Routine Mood Board\n\nVisual inspiration and structured steps to reclaim your mornings...',
    type: 'mood_board',
    categories: ['cat-2', 'cat-4'], // Wellness, Lifestyle
    languages: ['English'],
    accessType: 'free',
    currency: 'USD',
    deliveryType: 'external_link',
    externalUrl: 'https://pinterest.com/morning-routine',
    thumbnailUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800',
    previewImages: [],
    tags: ['Visual', 'Lifestyle', 'Morning'],
    status: 'published',
    moderationStatus: 'approved',
    visibility: 'public',
    createdAt: '2024-03-05T08:00:00Z',
    updatedAt: '2024-03-05T08:00:00Z',
    downloads: 250,
    views: 1500
  },
  {
    id: 'res-12',
    providerId: `u-prov-001`,
    slug: 'boundary-setting-guide',
    title: 'Boundary Setting Guide',
    shortDescription: 'Scripts and strategies for setting healthy boundaries in personal and professional life.',
    fullDescription: '# Boundary Setting Guide\n\nLearn the language of "No". Includes 20+ scripts for difficult conversations...',
    type: 'guide',
    categories: ['cat-4'], // Lifestyle
    languages: ['English'],
    accessType: 'paid',
    price: 1500,
    currency: 'USD',
    deliveryType: 'download',
    fileUrl: 'https://example.com/boundaries.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    previewImages: [],
    tags: ['Relationships', 'Boundaries', 'Guide'],
    status: 'published',
    moderationStatus: 'approved',
    visibility: 'public',
    createdAt: '2024-03-10T11:00:00Z',
    updatedAt: '2024-03-10T11:00:00Z',
    downloads: 130,
    views: 800
  },
  {
    id: 'res-13',
    providerId: `u-prov-004`,
    slug: 'gut-health-assessment',
    title: 'Gut Health Assessment',
    shortDescription: 'Clinical screening tool for identifying potential digestive issues related to mood.',
    fullDescription: '# Gut Health Assessment\n\nAnalyze your digestive health and its impact on your mental well-being...',
    type: 'assessment',
    categories: ['cat-3'], // Nutrition
    languages: ['English'],
    accessType: 'free',
    currency: 'USD',
    deliveryType: 'download',
    fileUrl: 'https://example.com/gut-assessment.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=800',
    previewImages: [],
    tags: ['Nutrition', 'Gut Health', 'Assessment'],
    status: 'published',
    moderationStatus: 'approved',
    visibility: 'public',
    createdAt: '2024-03-15T09:00:00Z',
    updatedAt: '2024-03-15T09:00:00Z',
    downloads: 55,
    views: 220
  },
  {
    id: 'res-14',
    providerId: `u-prov-001`,
    slug: 'mindful-breathing-audio-guide',
    title: 'Mindful Breathing Audio Guide',
    shortDescription: '10-minute guided breathing session for acute panic relief.',
    fullDescription: '# Panic Relief Audio\n\nFollow along with this 10-minute session to de-escalate physiological panic symptoms...',
    type: 'audio',
    categories: ['cat-1', 'cat-2'], // Mental Health, Wellness
    languages: ['English'],
    accessType: 'free',
    currency: 'USD',
    deliveryType: 'external_link',
    externalUrl: 'https://soundcloud.com/panic-relief',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=800',
    previewImages: [],
    tags: ['Panic', 'Anxiety', 'Audio'],
    status: 'published',
    moderationStatus: 'approved',
    visibility: 'public',
    createdAt: '2024-03-20T16:00:00Z',
    updatedAt: '2024-03-20T16:00:00Z',
    downloads: 400,
    views: 2000
  },
  {
    id: 'res-15',
    providerId: `u-prov-002`,
    slug: 'trauma-narrative-template',
    title: 'Trauma Narrative Template',
    shortDescription: 'Structured framework for processing traumatic events through expressive writing.',
    fullDescription: '# Trauma Narrative\n\nA clinical tool based on TF-CBT principles for processing trauma safely...',
    type: 'template',
    categories: ['cat-1'], // Mental Health
    languages: ['English'],
    accessType: 'free',
    currency: 'USD',
    deliveryType: 'download',
    fileUrl: 'https://example.com/trauma-narrative.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800',
    previewImages: [],
    tags: ['Trauma', 'TF-CBT', 'Writing'],
    status: 'published',
    moderationStatus: 'approved',
    visibility: 'public',
    createdAt: '2024-03-25T13:00:00Z',
    updatedAt: '2024-03-25T13:00:00Z',
    downloads: 145,
    views: 560
  }
];

export const SEED_DATA = {
  users,
  providers,
  clientProfiles,
  specialties,
  insurance,
  blogs,
  testimonials,
  appointments,
  tickets,
  messages,
  jobs,
  categories: blogCategories,
  resources
};
