import { 
  ProviderProfile, SearchFilters, Specialty, InsuranceCompany, 
  SubscriptionTier, SubscriptionStatus, ModerationStatus, 
  AuditActionType, AuditResourceType, UserRole 
} from '../types';
import { Database } from '../types/supabase';
import { supabase, isConfigured } from './supabase';
import { mockStore } from './mockStore';
import { SEED_DATA } from './seedData';
import { auditService } from './audit';
import { errorHandler, AppError } from './error-handler';
import { handleRequest } from './serviceUtils';
import { persistence } from './persistence';

type RawProvider = Database['public']['Tables']['providers']['Row'];
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
  relevance: number;
  full_count: number;
}

export interface IProviderService {
  search(filters: SearchFilters): Promise<{ providers: ProviderProfile[], total: number }>;
  getProviderById(id: string): Promise<ProviderProfile | undefined>;
  getProviderByUserId(userId: string): Promise<ProviderProfile | undefined>;
  updateProvider(id: string, data: Partial<ProviderProfile>): Promise<ProviderProfile>;
  getAllProviders(params?: { page?: number, limit?: number }): Promise<{ providers: ProviderProfile[], total: number }>;
  getProviderBySlug(slug: string): Promise<ProviderProfile | undefined>;
  fetchProviderBySlugOrId(slugOrId: string): Promise<ProviderProfile | undefined>;
  moderateProvider(id: string, status: ModerationStatus): Promise<void>;
  updateProviderSlug(providerId: string, firstName: string, lastName: string, specialty?: string, city?: string): Promise<string>;
  
  // Helpers exposed for Auth service
  createBlankProviderProfile(userId: string, firstName: string, lastName: string, email: string): ProviderProfile;
  createProvider(profile: ProviderProfile): Promise<void>; // For registration
  
  // Metadata
  getAllSpecialties(): Promise<Specialty[]>;
  createSpecialty(name: string): Promise<void>;
  deleteSpecialty(id: string): Promise<void>;
  getAllInsurance(): Promise<InsuranceCompany[]>;
  createInsurance(name: string): Promise<void>;
  deleteInsurance(id: string): Promise<void>;
  getAllLanguages(): Promise<string[]>;
  createLanguage(name: string): Promise<void>;
  deleteLanguage(name: string): Promise<void>;
  getAllGenders(): Promise<string[]>;
  createGender(name: string): Promise<void>;
  deleteGender(name: string): Promise<void>;
}

// =========================================================
// SHARED HELPERS
// =========================================================

function generateProfileSlug(firstName: string, lastName: string, specialty?: string, city?: string): string {
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

function createBlankProviderProfile(userId: string, firstName: string, lastName: string, email: string): ProviderProfile {
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
    headline: ''
  };
}

function formatProvider(row: any): ProviderProfile {
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
    subscriptionTier: row.subscription_tier as SubscriptionTier || SubscriptionTier.FREE,
    subscriptionStatus: row.subscription_status as SubscriptionStatus || SubscriptionStatus.TRIAL,
    moderationStatus: row.moderation_status as ModerationStatus || ModerationStatus.PENDING,
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
    email: row.email
  };
}

function mapSearchRowToProfile(r: SearchRpcResponse): ProviderProfile {
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
    audit: { createdAt: '', updatedAt: '' }
  };
}

async function fallbackMockSearch(filters: SearchFilters): Promise<{ providers: ProviderProfile[], total: number }> {
  let providers = [...SEED_DATA.providers, ...mockStore.store.providers];
  const users = [...SEED_DATA.users, ...mockStore.store.users];
  
  providers = providers.filter((p, index, self) => 
    index === self.findIndex(t => t.id === p.id)
  );
  
  providers = providers.filter(p => 
    p.onboardingComplete === true &&
    p.moderationStatus === ModerationStatus.APPROVED &&
    p.isPublished !== false
  );
  
  if (filters.query) {
     const q = filters.query.toLowerCase();
     providers = providers.filter(p => {
        const u = users.find(user => user.id === p.userId);
        const name = `${p.firstName || u?.firstName || ''} ${p.lastName || u?.lastName || ''}`.toLowerCase();
        return name.includes(q) || p.bio?.toLowerCase().includes(q) || p.professionalTitle?.toLowerCase().includes(q);
     });
  }
  if (filters.specialty) {
     providers = providers.filter(p => p.specialties?.includes(filters.specialty!));
  }
  if (filters.maxPrice) {
     providers = providers.filter(p => (p.pricing?.hourlyRate || 0) <= filters.maxPrice!);
  }
  if (filters.state) {
     providers = providers.filter(p => p.address?.state?.toLowerCase().includes(filters.state!.toLowerCase()));
  }
  
  const enriched = providers.map(p => {
    if (!p.firstName || !p.lastName) {
      const u = users.find(user => user.id === p.userId);
      return { 
        ...p, 
        firstName: p.firstName || u?.firstName || 'Unknown', 
        lastName: p.lastName || u?.lastName || 'Provider' 
      };
    }
    return p;
  });
  
  return { providers: enriched, total: enriched.length };
}

// =========================================================
// MOCK IMPLEMENTATION
// =========================================================

class MockProviderService implements IProviderService {
  createBlankProviderProfile = createBlankProviderProfile;

  async search(filters: SearchFilters): Promise<{ providers: ProviderProfile[], total: number }> {
    return handleRequest(() => fallbackMockSearch(filters), 'search');
  }

  async getProviderById(id: string): Promise<ProviderProfile | undefined> {
    return mockStore.store.providers.find(p => p.id === id) || SEED_DATA.providers.find(p => p.id === id);
  }

  async getProviderByUserId(userId: string): Promise<ProviderProfile | undefined> {
    return mockStore.store.providers.find(p => p.userId === userId) || SEED_DATA.providers.find(p => p.userId === userId);
  }

  async updateProvider(id: string, data: Partial<ProviderProfile>): Promise<ProviderProfile> {
    return handleRequest(async () => {
        // Handle User Name Updates (Sync to 'users')
        if (data.firstName || data.lastName) {
            const provider = await this.getProviderById(id);
            if (provider?.userId) {
                const userIdx = mockStore.store.users.findIndex(u => u.id === provider.userId);
                if (userIdx !== -1) {
                    mockStore.store.users[userIdx] = {
                        ...mockStore.store.users[userIdx],
                        firstName: data.firstName || mockStore.store.users[userIdx].firstName,
                        lastName: data.lastName || mockStore.store.users[userIdx].lastName
                    };
                    mockStore.save();
                }
            }
        }

        const tempIdx = mockStore.store.providers.findIndex(p => p.id === id);
        if (tempIdx !== -1) {
            mockStore.store.providers[tempIdx] = { ...mockStore.store.providers[tempIdx], ...data };
            mockStore.save();
            return mockStore.store.providers[tempIdx];
        }
        const seedProvider = SEED_DATA.providers.find(p => p.id === id);
        if (seedProvider) {
            const updated = { ...seedProvider, ...data };
            mockStore.store.providers.push(updated);
            mockStore.save();
            return updated;
        }
        throw new AppError("Provider not found", "NOT_FOUND");
    }, 'updateProvider');
  }

  async getAllProviders(params?: { page?: number, limit?: number }): Promise<{ providers: ProviderProfile[], total: number }> {
    return handleRequest(async () => {
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const start = (page - 1) * limit;

        const allProviders = [...SEED_DATA.providers, ...mockStore.store.providers];
        const users = [...SEED_DATA.users, ...mockStore.store.users];
        
        const uniqueProviders = allProviders.filter((p, index, self) => 
          index === self.findIndex(t => t.id === p.id)
        );

        const total = uniqueProviders.length;
        const paged = uniqueProviders.slice(start, start + limit);

        const providers = paged.map(p => {
          const user = users.find(u => u.id === p.userId);
          return {
            ...p,
            firstName: p.firstName || user?.firstName || 'Unknown',
            lastName: p.lastName || user?.lastName || 'Provider',
            email: p.email || user?.email,
            isPublished: p.isPublished ?? true 
          };
        });

        return { providers, total };
    }, 'getAllProviders');
  }

  async getProviderBySlug(slug: string): Promise<ProviderProfile | undefined> {
    const tempProvider = mockStore.store.providers.find(p => p.profileSlug === slug);
    if (tempProvider) return tempProvider;
    return SEED_DATA.providers.find(p => p.profileSlug === slug);
  }

  async fetchProviderBySlugOrId(slugOrId: string): Promise<ProviderProfile | undefined> {
      if (!slugOrId) return undefined;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
      const isProviderId = slugOrId.startsWith('prov-');
      
      let provider: ProviderProfile | undefined;
      if (!isUUID && !isProviderId) {
        provider = await this.getProviderBySlug(slugOrId);
        if (provider) return provider;
      }
      provider = await this.getProviderById(slugOrId);
      if (provider) return provider;
      provider = await this.getProviderByUserId(slugOrId);
      if (provider) return provider;
      provider = await this.getProviderBySlug(slugOrId);
      return provider;
  }

  async moderateProvider(id: string, status: ModerationStatus): Promise<void> {
      const idx = mockStore.store.providers.findIndex(p => p.id === id);
      if (idx !== -1) {
        mockStore.store.providers[idx].moderationStatus = status;
        if (status === ModerationStatus.APPROVED) {
            mockStore.store.providers[idx].isPublished = true;
        }
        mockStore.save();
      }
  }

  async updateProviderSlug(providerId: string, firstName: string, lastName: string, specialty?: string, city?: string): Promise<string> {
    const newSlug = generateProfileSlug(firstName, lastName, specialty, city);
    const tempIdx = mockStore.store.providers.findIndex(p => p.id === providerId);
    if (tempIdx !== -1) {
      mockStore.store.providers[tempIdx].profileSlug = newSlug;
      mockStore.save();
    }
    return newSlug;
  }

  async createProvider(profile: ProviderProfile): Promise<void> {
    mockStore.store.providers.push(profile);
    mockStore.save();
  }

  async getAllSpecialties(): Promise<Specialty[]> { return SEED_DATA.specialties; }
  async createSpecialty(name: string): Promise<void> {}
  async deleteSpecialty(id: string): Promise<void> {}
  
  async getAllInsurance(): Promise<InsuranceCompany[]> { return SEED_DATA.insurance; }
  async createInsurance(name: string): Promise<void> {}
  async deleteInsurance(id: string): Promise<void> {}

  async getAllLanguages(): Promise<string[]> { return mockStore.store.languages; }
  async createLanguage(name: string): Promise<void> {
      if (!mockStore.store.languages.includes(name)) {
          mockStore.store.languages.push(name);
          mockStore.save();
      }
  }
  async deleteLanguage(name: string): Promise<void> {
      mockStore.store.languages = mockStore.store.languages.filter(l => l !== name);
      mockStore.save();
  }

  async getAllGenders(): Promise<string[]> { return mockStore.store.genders; }
  async createGender(name: string): Promise<void> {
      if (!mockStore.store.genders.includes(name)) {
          mockStore.store.genders.push(name);
          mockStore.save();
      }
  }
  async deleteGender(name: string): Promise<void> {
      mockStore.store.genders = mockStore.store.genders.filter(g => g !== name);
      mockStore.save();
  }
}

// =========================================================
// SUPABASE IMPLEMENTATION
// =========================================================

class SupabaseProviderService implements IProviderService {
  createBlankProviderProfile = createBlankProviderProfile;

  async search(filters: SearchFilters): Promise<{ providers: ProviderProfile[], total: number }> {
    return handleRequest(async () => {
        auditService.log(AuditActionType.SEARCH, AuditResourceType.PROVIDER, undefined, filters);

        try {
            const { data: rows, error: rpcError } = await supabase.rpc('search_providers', {
                search_query: filters.query || null,
                filter_specialty: filters.specialty || null,
                filter_state: filters.state || null,
                filter_max_price: filters.maxPrice || null,
                filter_day: filters.day || null,
                result_limit: filters.limit || 20,
                result_offset: filters.offset || 0
            } as any) as any;

            if (rpcError) {
                console.warn("Search RPC Error, falling back to mock:", rpcError.message);
                return fallbackMockSearch(filters);
            }

            if (!rows || rows.length === 0) {
                // If RPC returns empty, it might be due to strict filtering or no data
                // But if it's a 400 error disguised as empty, we might want fallback?
                // Let's assume empty means empty for now unless total count logic is added
                return { providers: [], total: 0 };
            }

            const providers = rows.map((r: SearchRpcResponse) => mapSearchRowToProfile(r));
            const total = rows[0]?.full_count || 0;

            return { providers, total };
        } catch (e) {
            console.warn("Search exception, falling back to mock:", e);
            return fallbackMockSearch(filters);
        }
    }, 'search');
  }

  async getProviderById(id: string): Promise<ProviderProfile | undefined> {
    // 1. Try Supabase first
    const { data: providerData, error } = await (supabase.from('providers') as any)
      .select('*')
      .eq('id', id)
      .maybeSingle(); 

    if (providerData && !error) {
        // Fetch user data to enrich
        const { data: userData } = await (supabase.from('users') as any)
            .select('first_name, last_name, email')
            .eq('id', providerData.user_id)
            .single();
            
        return formatProvider({ ...providerData, ...userData });
    }

    // 2. Fallback to Mock Store (Robust Fallback)
    const mock = mockStore.store.providers.find(p => p.id === id) || SEED_DATA.providers.find(p => p.id === id);
    if (mock) return mock;

    // 3. Fallback to Placeholder (Prevention of crash)
    // Only if it looks like a valid ID request but nothing found
    if (id) {
        console.warn(`Provider ${id} not found in DB or Mock. Generating placeholder.`);
        return {
            id: id,
            userId: `u-${id}`,
            firstName: 'Unknown',
            lastName: 'Provider',
            professionalTitle: 'Licensed Professional',
            professionalCategory: 'Mental Health',
            tagline: 'Professional Service Provider',
            bio: 'This provider profile is currently unavailable or loading.',
            imageUrl: `https://ui-avatars.com/api/?name=Provider&background=e2e8f0&color=475569`,
            yearsExperience: 0,
            education: '',
            educationHistory: [],
            gallery: [],
            languages: ['English'],
            appointmentTypes: [],
            durations: [],
            specialties: [],
            licenses: [],
            certificates: [],
            availability: { days: [], hours: [], schedule: [], blockedDates: [] },
            onboardingComplete: true,
            address: { street: '', city: '', state: '', zip: '', country: 'USA' },
            subscriptionTier: SubscriptionTier.FREE,
            subscriptionStatus: SubscriptionStatus.ACTIVE,
            moderationStatus: ModerationStatus.APPROVED,
            isPublished: true,
            digitalProducts: [],
            servicePackages: [],
            insuranceAccepted: [],
            paymentMethodsAccepted: [],
            pricing: { hourlyRate: 0, slidingScale: false },
            compliance: { termsAccepted: true, verificationAgreed: true },
            security: { question: '', answer: '' },
            metrics: { views: 0, inquiries: 0 },
            metricsHistory: [],
            audit: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            profileSlug: id,
            email: 'provider@example.com'
        };
    }

    return undefined;
  }

  async getProviderByUserId(userId: string): Promise<ProviderProfile | undefined> {
    const { data: providerData, error } = await (supabase.from('providers') as any).select('*').eq('user_id', userId).single();
    if (error && error.code !== 'PGRST116') {
        errorHandler.logError(error, { method: 'getProviderByUserId', userId });
    }
    
    if (providerData) {
        const { data: userData } = await (supabase.from('users') as any)
            .select('first_name, last_name, email')
            .eq('id', userId)
            .single();
            
        return formatProvider({ ...providerData, ...userData });
    }
    
    return undefined;
  }

  async updateProvider(id: string, data: Partial<ProviderProfile>): Promise<ProviderProfile> {
    return handleRequest(async () => {
        // 1. Handle User Name Updates (Sync to 'users' table)
        if (data.firstName !== undefined || data.lastName !== undefined) {
          const { data: provider } = await (supabase.from('providers') as any)
            .select('user_id')
            .eq('id', id)
            .single();

          if (provider?.user_id) {
            const userUpdates: any = {};
            if (data.firstName !== undefined) userUpdates.first_name = data.firstName;
            if (data.lastName !== undefined) userUpdates.last_name = data.lastName;

            const { error: userError } = await (supabase.from('users') as any)
              .update(userUpdates)
              .eq('id', provider.user_id);

            if (userError) {
              console.error('Error syncing provider name to users table:', userError);
            }
          }
        }

        const { error } = await (supabase.from('providers') as any).update({
          professional_title: data.professionalTitle,
          bio: data.bio,
          tagline: data.tagline,
          image_url: data.imageUrl,
          years_experience: data.yearsExperience,
          hourly_rate: data.pricing?.hourlyRate,
          sliding_scale: data.pricing?.slidingScale,
          min_fee: data.pricing?.minFee,
          max_fee: data.pricing?.maxFee,
          address_street: data.address?.street,
          address_city: data.address?.city,
          address_state: data.address?.state,
          address_zip: data.address?.zip,
          phone: data.phone,
          website: data.website,
          pronouns: data.pronouns,
          is_published: data.isPublished,
          onboarding_complete: data.onboardingComplete,
          updated_at: new Date().toISOString()
        }).eq('id', id);
        
        if (error) throw error;
        
        return (await this.getProviderById(id))!;
    }, 'updateProvider');
  }

  async getAllProviders(params?: { page?: number, limit?: number }): Promise<{ providers: ProviderProfile[], total: number }> {
    return handleRequest(async () => {
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // Step 1: Fetch providers with range
      const { data: providers, error: provError, count } = await (supabase.from('providers') as any)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (provError) throw provError;
      if (!providers || providers.length === 0) return { providers: [], total: 0 };

      // Step 2: Fetch corresponding users
      const userIds = providers.map((p: any) => p.user_id).filter(Boolean);
      
      const { data: users, error: userError } = await (supabase.from('users') as any)
        .select('id, first_name, last_name, email, role')
        .in('id', userIds);

      const userMap = (users || []).reduce((acc: any, u: any) => {
        acc[u.id] = u;
        return acc;
      }, {});

      const result = providers.map((p: any) => {
        const user = userMap[p.user_id] || {};
        return formatProvider({ ...p, ...user });
      });

      return { providers: result, total: count || result.length };
    }, 'getAllProviders');
  }

  async getProviderBySlug(slug: string): Promise<ProviderProfile | undefined> {
    const { data, error } = await (supabase.from('providers') as any)
      .select('*')
      .eq('profile_slug', slug)
      .maybeSingle(); // Changed from single() to avoid 406 errors on no rows
      
    if (error) {
      console.warn(`getProviderBySlug(${slug}) failed:`, error.message);
      return undefined;
    }
    return data ? formatProvider(data) : undefined;
  }

  async fetchProviderBySlugOrId(slugOrId: string): Promise<ProviderProfile | undefined> {
      // Logic same as mock but calling this.getProviderBySlug/Id
      if (!slugOrId) return undefined;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
      const isProviderId = slugOrId.startsWith('prov-');
      
      let provider: ProviderProfile | undefined;
      if (!isUUID && !isProviderId) {
        provider = await this.getProviderBySlug(slugOrId);
        if (provider) return provider;
      }
      provider = await this.getProviderById(slugOrId);
      if (provider) return provider;
      provider = await this.getProviderByUserId(slugOrId);
      if (provider) return provider;
      provider = await this.getProviderBySlug(slugOrId);
      return provider;
  }

  async moderateProvider(id: string, status: ModerationStatus): Promise<void> {
    const updates: any = { moderation_status: status };
    if (status === ModerationStatus.APPROVED) {
        updates.is_published = true;
    }
    await (supabase.from('providers') as any).update(updates).eq('id', id); 
  }

  async updateProviderSlug(providerId: string, firstName: string, lastName: string, specialty?: string, city?: string): Promise<string> {
    const newSlug = generateProfileSlug(firstName, lastName, specialty, city);
    await (supabase.from('providers') as any).update({ profile_slug: newSlug }).eq('id', providerId);
    return newSlug;
  }

  async createProvider(profile: ProviderProfile): Promise<void> {
     // Used during registration
     const { error } = await (supabase.from('providers') as any).insert({
          id: profile.id, user_id: profile.userId, professional_title: '', professional_category: 'Mental Health Provider',
          years_experience: 0, bio: '', tagline: '', image_url: profile.imageUrl, hourly_rate: 150,
          sliding_scale: false, onboarding_complete: false, subscription_tier: 'FREE', subscription_status: 'TRIAL',
          moderation_status: 'PENDING', is_published: false, profile_slug: profile.profileSlug,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      });
      if (error) throw error;
  }

  async getAllSpecialties(): Promise<Specialty[]> { return SEED_DATA.specialties; }
  async createSpecialty(name: string): Promise<void> { await (supabase.from('specialties') as any).insert({ id: `s-${Date.now()}`, name, slug: name.toLowerCase() }); }
  async deleteSpecialty(id: string): Promise<void> { await (supabase.from('specialties') as any).delete().eq('id', id); }

  async getAllInsurance(): Promise<InsuranceCompany[]> { return SEED_DATA.insurance; }
  async createInsurance(name: string): Promise<void> {}
  async deleteInsurance(id: string): Promise<void> {}

  async getAllLanguages(): Promise<string[]> { return []; } // Prod logic missing in original
  async createLanguage(name: string): Promise<void> {}
  async deleteLanguage(name: string): Promise<void> {}

  async getAllGenders(): Promise<string[]> { return []; }
  async createGender(name: string): Promise<void> {}
  async deleteGender(name: string): Promise<void> {}
}

export const providerService = isConfigured ? new SupabaseProviderService() : new MockProviderService();
