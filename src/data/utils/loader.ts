import { seedUsers, seedProviders, seedBlogs, seedSpecialties, seedTestimonials } from '../seed/core';
import { generateMockData } from '../mock/factories';
import {
  Conversation,
  Endorsement,
  Message,
  UserRole,
  ConfigCatalog,
  ConfigEntry,
  ConfigCatalogKey,
  UserRoleAssignment,
  PermissionOverride,
  ProviderEntitlementOverride,
  AppointmentType,
} from '../../types';
import { SEED_DATA } from '../seed';

function toConversations(messages: Message[]): Conversation[] {
  const map = new Map<string, Conversation>();

  for (const message of messages) {
    const existing = map.get(message.conversation_id);
    const timestamp = message.created_at;

    if (!existing) {
      map.set(message.conversation_id, {
        id: message.conversation_id,
        participant_1_id: message.sender_id,
        participant_2_id: message.receiver_id,
        last_message_at: timestamp,
        created_at: timestamp,
      });
      continue;
    }

    if (new Date(timestamp).getTime() > new Date(existing.last_message_at).getTime()) {
      existing.last_message_at = timestamp;
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime(),
  );
}

function migrateLegacyMessages(): Message[] {
  const legacyRaw = localStorage.getItem('evowell_messages');
  if (!legacyRaw) return [];

  try {
    const legacy = JSON.parse(legacyRaw);
    if (!Array.isArray(legacy)) return [];

    return legacy
      .map((item: any) => {
        if (!item) return null;
        const sender = item.sender_id || item.senderId;
        const receiver = item.receiver_id || item.receiverId;
        const content = item.content || item.text;
        const conversationId = item.conversation_id || item.conversationId || item.roomId;
        const createdAt = item.created_at || item.createdAt || item.timestamp;

        if (!sender || !receiver || !content || !conversationId) {
          return null;
        }

        return {
          id: item.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          conversation_id: conversationId,
          sender_id: sender,
          receiver_id: receiver,
          content,
          is_read: Boolean(item.is_read ?? item.read),
          created_at: createdAt || new Date().toISOString(),
        } as Message;
      })
      .filter(Boolean) as Message[];
  } catch (error) {
    console.error('Failed to migrate legacy messages', error);
    return [];
  }
}

function defaultCatalogs(): ConfigCatalog[] {
  return [
    { key: 'specialties', label: 'Specialties', description: 'Clinical specialty taxonomy.' },
    { key: 'insurance', label: 'Insurance', description: 'Insurance providers accepted by clinicians.' },
    { key: 'languages', label: 'Languages', description: 'Supported language list for users/providers.' },
    { key: 'genders', label: 'Genders', description: 'User profile gender options.' },
    { key: 'blog_categories', label: 'Blog Categories', description: 'Content categories for editorial workflows.' },
    { key: 'exchange_categories', label: 'Exchange Categories', description: 'Provider exchange marketplace categories.' },
    { key: 'exchange_tags', label: 'Exchange Tags', description: 'Search tags for provider exchange resources.' },
    { key: 'appointment_types', label: 'Appointment Types', description: 'Session type options.' },
    { key: 'intake_statuses', label: 'Intake Statuses', description: 'Client intake status labels.' },
    { key: 'moderation_reasons', label: 'Moderation Reasons', description: 'Reusable moderation reason dictionary.' },
    { key: 'notification_templates', label: 'Notification Templates', description: 'System notification templates.' },
  ];
}

function toConfigEntries(
  catalogKey: ConfigCatalogKey,
  rows: Array<{ code: string; label: string }>,
): ConfigEntry[] {
  const now = new Date().toISOString();
  return rows.map((row, index) => ({
    id: `${catalogKey}-${row.code}`.toLowerCase(),
    catalogKey,
    code: row.code,
    label: row.label,
    status: 'ACTIVE',
    sortOrder: index + 1,
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  }));
}

function defaultConfigEntries(): ConfigEntry[] {
  const specialtyEntries = toConfigEntries(
    'specialties',
    SEED_DATA.specialties.map((item) => ({ code: item.slug || item.id, label: item.name })),
  );

  const insuranceEntries = toConfigEntries(
    'insurance',
    SEED_DATA.insurance.map((item) => ({ code: item.id, label: item.name })),
  );

  const languageEntries = toConfigEntries(
    'languages',
    ['English', 'Spanish', 'Mandarin', 'French', 'German'].map((label) => ({
      code: label.toUpperCase().replace(/\s+/g, '_'),
      label,
    })),
  );

  const genderEntries = toConfigEntries(
    'genders',
    ['Male', 'Female', 'Non-Binary', 'Prefer not to say'].map((label) => ({
      code: label.toUpperCase().replace(/[\s-]+/g, '_'),
      label,
    })),
  );

  const blogCategoryEntries = toConfigEntries(
    'blog_categories',
    SEED_DATA.categories.map((item) => ({ code: item.slug || item.id, label: item.name })),
  );

  const exchangeCategoryEntries = toConfigEntries(
    'exchange_categories',
    [
      { code: 'MENTAL_HEALTH', label: 'Mental Health' },
      { code: 'WELLNESS', label: 'Wellness' },
      { code: 'NUTRITION', label: 'Nutrition' },
      { code: 'LIFESTYLE', label: 'Lifestyle' },
      { code: 'PRACTICE_OPS', label: 'Practice Operations' },
    ],
  );

  const exchangeTagEntries = toConfigEntries(
    'exchange_tags',
    [
      { code: 'CBT', label: 'CBT' },
      { code: 'TRAUMA', label: 'Trauma' },
      { code: 'WORKSHEET', label: 'Worksheet' },
      { code: 'GUIDE', label: 'Guide' },
      { code: 'CLINICAL', label: 'Clinical' },
    ],
  );

  const appointmentTypeEntries = toConfigEntries(
    'appointment_types',
    Object.values(AppointmentType).map((label) => ({
      code: label.toUpperCase().replace(/\s+/g, '_'),
      label,
    })),
  );

  const intakeStatusEntries = toConfigEntries('intake_statuses', [
    { code: 'PENDING', label: 'Pending' },
    { code: 'COMPLETED', label: 'Completed' },
  ]);

  const moderationReasonEntries = toConfigEntries('moderation_reasons', [
    { code: 'MISSING_CREDENTIALS', label: 'Missing credentials' },
    { code: 'CONTENT_QUALITY', label: 'Content quality issue' },
    { code: 'COMPLIANCE', label: 'Compliance concern' },
    { code: 'DUPLICATE_SUBMISSION', label: 'Duplicate submission' },
  ]);

  const notificationTemplateEntries = toConfigEntries('notification_templates', [
    { code: 'APPOINTMENT_CONFIRMED', label: 'Appointment confirmed' },
    { code: 'APPOINTMENT_CANCELLED', label: 'Appointment cancelled' },
    { code: 'MESSAGE_RECEIVED', label: 'Message received' },
    { code: 'BLOG_REVIEW_DECISION', label: 'Blog review decision' },
  ]);

  return [
    ...specialtyEntries,
    ...insuranceEntries,
    ...languageEntries,
    ...genderEntries,
    ...blogCategoryEntries,
    ...exchangeCategoryEntries,
    ...exchangeTagEntries,
    ...appointmentTypeEntries,
    ...intakeStatusEntries,
    ...moderationReasonEntries,
    ...notificationTemplateEntries,
  ];
}

const isProd = (import.meta as any).env?.PROD;
const isDev = (import.meta as any).env?.DEV;

export const loadInitialData = () => {
  // Check if we already have data in localStorage
  const stored = localStorage.getItem('evowell_mock_store');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Auto-clear on 1 week in production
      if (isProd && parsed.lastUpdated) {
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - parsed.lastUpdated > oneWeek) {
          console.log('🕒 Production data expired, resetting...');
          localStorage.removeItem('evowell_mock_store');
        } else {
          return parsed;
        }
      } else {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse stored mock data', e);
    }
  }

  console.log(`🌱 Loading initial data (${isProd ? 'Production' : 'Development'} mode)...`);

  let users = [...seedUsers];
  let providers = [...seedProviders];
  let blogs = [...seedBlogs];

  if (isDev) {
    // In Dev, add 25-30 realistic mock records
    const mock = generateMockData(25);
    users = [...users, ...mock.users];
    providers = [...providers, ...mock.providers];
    blogs = [...blogs, ...mock.blogs];
  } else {
    // In Prod/Staging, keep it minimal as requested (5 providers, 3 blogs)
    // We already have some in seed, add a few more from factory if needed
    const extraMock = generateMockData(4); // To reach ~5 providers total
    users = [...users, ...extraMock.users.slice(0, 4)];
    providers = [...providers, ...extraMock.providers.slice(0, 4)];
    blogs = [...blogs, ...extraMock.blogs.slice(0, 2)];
  }

  // Generate Mock Endorsements
  const endorsements: Endorsement[] = [];
  const admins = users.filter(u => u.role === UserRole.ADMIN);
  const providerUsers = users.filter(u => u.role === UserRole.PROVIDER);

  // 1. Grant EvoWell endorsements to top providers
  providers.slice(0, 3).forEach(p => {
      const admin = admins[0] || { id: 'admin-1', firstName: 'Evo', lastName: 'Admin' };
      endorsements.push({
          id: `end-evo-${p.id}`,
          endorsedProviderId: p.id,
          endorserUserId: admin.id,
          endorserRole: 'admin',
          endorsementType: 'evowell',
          reason: 'clinical_expertise',
          createdAt: new Date().toISOString()
      });
  });

  // 2. Grant Peer endorsements
  providers.forEach((target, i) => {
      // Pick 2-5 random peers to endorse
      const peerCount = 2 + (i % 4); 
      // Ensure we don't pick self and exist
      const peers = providerUsers
          .filter(u => u.id !== target.userId)
          .sort(() => 0.5 - Math.random())
          .slice(0, peerCount);

      peers.forEach(peerUser => {
          // Find provider profile for this peer user
          const peerProfile = providers.find(p => p.userId === peerUser.id);
          if (peerProfile) {
              endorsements.push({
                  id: `end-peer-${target.id}-${peerUser.id}`,
                  endorsedProviderId: target.id,
                  endorserUserId: peerUser.id,
                  endorserRole: 'provider',
                  endorsementType: 'peer',
                  reason: ['clinical_expertise', 'professional_collaboration', 'ethical_practice', 'strong_outcomes'][Math.floor(Math.random() * 4)] as any,
                  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
                  endorser: {
                      firstName: peerUser.firstName,
                      lastName: peerUser.lastName,
                      professionalTitle: peerProfile.professionalTitle,
                      imageUrl: peerProfile.imageUrl,
                      profileSlug: peerProfile.profileSlug
                  }
              });
          }
      });
  });

  const legacyMessages = migrateLegacyMessages();
  const seededMessages = [...SEED_DATA.messages, ...legacyMessages];

  const initialStore = {
    users,
    providers,
    blogs,
    specialties: seedSpecialties,
    testimonials: seedTestimonials,
    clientProfiles: [...SEED_DATA.clientProfiles],
    appointments: [...SEED_DATA.appointments],
    messages: seededMessages,
    conversations: toConversations(seededMessages),
    notifications: [],
    clientJournalEntries: [],
    providerClientNotes: [],
    userRoleAssignments: [] as UserRoleAssignment[],
    userPermissionOverrides: [] as PermissionOverride[],
    providerEntitlementOverrides: [] as ProviderEntitlementOverride[],
    configCatalogs: defaultCatalogs(),
    configEntries: defaultConfigEntries(),
    endorsements,
    lastUpdated: Date.now(),
    isDemoMode: true
  };

  localStorage.setItem('evowell_mock_store', JSON.stringify(initialStore));
  return initialStore;
};
