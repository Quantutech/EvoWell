import { faker } from '@faker-js/faker';
import { User, ProviderProfile, BlogPost, Testimonial, Specialty } from '../types';
import { UserRole, SubscriptionTier, SubscriptionStatus, ModerationStatus, AppointmentType } from '../types/enums';

export const createMockUser = (role: UserRole = UserRole.CLIENT): User => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    id: faker.string.uuid(),
    email: faker.internet.email({ firstName, lastName }),
    firstName,
    lastName,
    role,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    isDeleted: false
  };
};

export const createMockProvider = (user: User, specialties: string[]): ProviderProfile => {
  return {
    id: `prov-${user.id}`,
    userId: user.id,
    professionalTitle: faker.person.jobTitle(),
    professionalCategory: faker.helpers.arrayElement(['Mental Health', 'Wellness Coach', 'Nutritionist']),
    npi: faker.string.numeric(10),
    yearsExperience: faker.number.int({ min: 1, max: 30 }),
    education: `${faker.helpers.arrayElement(['PhD', 'MS', 'MA'])} in ${faker.person.jobArea()}, ${faker.company.name()}`,
    educationHistory: [
      { degree: 'Degree', university: faker.company.name(), year: faker.date.past().getFullYear().toString() }
    ],
    bio: faker.lorem.paragraphs(2),
    tagline: faker.company.catchPhrase(),
    imageUrl: faker.image.avatar(),
    gallery: [faker.image.urlLoremFlickr({ category: 'medical' })],
    languages: faker.helpers.arrayElements(['English', 'Spanish', 'Mandarin', 'French'], { min: 1, max: 2 }),
    appointmentTypes: faker.helpers.arrayElements(Object.values(AppointmentType), { min: 1, max: 2 }),
    durations: [30, 50, 60],
    specialties: faker.helpers.arrayElements(specialties, { min: 1, max: 3 }),
    licenses: [{ state: faker.location.state({ abbreviated: true }), number: faker.string.alphanumeric(8), verified: true }],
    certificates: [faker.company.buzzNoun()],
    availability: {
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      hours: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'],
      schedule: [],
      blockedDates: []
    },
    onboardingComplete: true,
    subscriptionTier: faker.helpers.arrayElement(Object.values(SubscriptionTier)),
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    moderationStatus: ModerationStatus.APPROVED,
    isPublished: true,
    digitalProducts: [],
    servicePackages: [],
    insuranceAccepted: ['Aetna', 'Cigna', 'BlueCross BlueShield'],
    paymentMethodsAccepted: ['Credit Card'],
    pricing: { hourlyRate: faker.number.int({ min: 80, max: 250 }), slidingScale: faker.datatype.boolean() },
    compliance: { termsAccepted: true, verificationAgreed: true },
    security: { question: 'Pet', answer: 'Rover' },
    metrics: { views: faker.number.int({ min: 10, max: 5000 }), inquiries: faker.number.int({ min: 0, max: 100 }) },
    metricsHistory: [],
    audit: { createdAt: user.createdAt, updatedAt: user.updatedAt },
    profileSlug: faker.helpers.slugify(user.firstName + ' ' + user.lastName).toLowerCase(),
    rating: faker.number.float({ min: 4.0, max: 5.0, fractionDigits: 1 }),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip: faker.location.zipCode(),
      country: 'USA',
      lat: faker.location.latitude({ min: 25, max: 48 }),
      lng: faker.location.longitude({ min: -124, max: -70 })
    }
  };
};

export const createMockBlog = (author: ProviderProfile): BlogPost => {
  return {
    id: faker.string.uuid(),
    slug: faker.helpers.slugify(faker.lorem.sentence(5)).toLowerCase(),
    title: faker.lorem.sentence(8),
    summary: faker.lorem.paragraph(),
    content: `<p>${faker.lorem.paragraphs(3, '</p><p>')}</p>`,
    category: faker.helpers.arrayElement(['Mental Health', 'Wellness', 'Lifestyle', 'Nutrition']),
    authorName: `${faker.person.firstName()} ${faker.person.lastName()}`,
    authorRole: author.professionalTitle,
    authorImage: author.imageUrl,
    readTime: `${faker.number.int({ min: 2, max: 10 })} min read`,
    imageUrl: faker.image.urlLoremFlickr({ category: 'nature' }),
    publishedAt: faker.date.recent().toISOString(),
    status: 'APPROVED',
    isFeatured: faker.datatype.boolean(),
    providerId: author.id
  };
};

export const generateMockData = (count: number = 25) => {
  const users: User[] = [];
  const providers: ProviderProfile[] = [];
  const blogs: BlogPost[] = [];
  const specialties = ['s-anxiety', 's-depression', 's-trauma', 's-nutrition', 's-adhd'];

  for (let i = 0; i < count; i++) {
    const user = createMockUser(UserRole.PROVIDER);
    users.push(user);
    const provider = createMockProvider(user, specialties);
    providers.push(provider);
    if (i < 5) {
      blogs.push(createMockBlog(provider));
    }
  }

  // Add some clients
  for (let i = 0; i < count; i++) {
    users.push(createMockUser(UserRole.CLIENT));
  }

  return { users, providers, blogs };
};
