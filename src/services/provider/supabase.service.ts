import {
  ProviderProfile, SearchFilters, Specialty, InsuranceCompany,
  SubscriptionTier, SubscriptionStatus, ModerationStatus,
  AuditActionType, AuditResourceType
} from '../../types';
import { supabase } from '../supabase';
import { SEED_DATA } from '../../data/seed';
import { auditService } from '../audit';
import { handleRequest } from '../serviceUtils';
import { IProviderService } from '../provider.service';
import { createBlankProviderProfile, generateProfileSlug } from './provider.profile';
import { formatProvider, mapSearchRowToProfile, ProviderApi } from './provider.api';
import { fallbackMockSearch } from './provider.search';

export class SupabaseProviderService implements IProviderService {
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
                return { providers: [], total: 0 };
            }

            const providers = rows.map((r: any) => mapSearchRowToProfile(r));
            const total = rows[0]?.full_count || 0;

            return { providers, total };
        } catch (e) {
            console.warn("Search exception, falling back to mock:", e);
            return fallbackMockSearch(filters);
        }
    }, 'search');
  }

  async getProviderById(id: string): Promise<ProviderProfile | undefined> {
    const data = await ProviderApi.getById(id);
    if (data) return data;

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
            email: 'provider@example.com',
            profileTemplate: 'CLASSIC',
            profileTheme: 'MIDNIGHT',
            availabilityStatus: 'ACCEPTING',
            accessibilityNotes: '',
            showLicenseNumber: false,
        };
    }

    return undefined;
  }

  async getProviderByUserId(userId: string): Promise<ProviderProfile | undefined> {
    return ProviderApi.getByUserId(userId);
  }

  async updateProvider(id: string, data: Partial<ProviderProfile>): Promise<ProviderProfile> {
    return handleRequest(async () => {
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
          profile_theme: data.profileTheme,
          availability_status: data.availabilityStatus,
          accessibility_notes: data.accessibilityNotes,
          show_license_number: data.showLicenseNumber,
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

      const { data: providers, error: provError, count } = await (supabase.from('providers') as any)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (provError) throw provError;
      if (!providers || providers.length === 0) return { providers: [], total: 0 };

      const userIds = providers.map((p: any) => p.user_id).filter(Boolean);
      
      const { data: users } = await (supabase.from('users') as any)
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
      .maybeSingle();
      
    if (error) {
      console.warn(`getProviderBySlug(${slug}) failed:`, error.message);
      return undefined;
    }
    return data ? formatProvider(data) : undefined;
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
     const { error } = await (supabase.from('providers') as any).insert({
          id: profile.id, user_id: profile.userId, professional_title: '', professional_category: 'Mental Health Provider',
          years_experience: 0, bio: '', tagline: '', image_url: profile.imageUrl, hourly_rate: 150,
          sliding_scale: false, onboarding_complete: false, subscription_tier: 'FREE', subscription_status: 'TRIAL',
          moderation_status: 'PENDING', is_published: false, profile_slug: profile.profileSlug,
          profile_theme: profile.profileTheme || 'MIDNIGHT',
          availability_status: profile.availabilityStatus || 'ACCEPTING',
          accessibility_notes: profile.accessibilityNotes || null,
          show_license_number: profile.showLicenseNumber || false,
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

  async getAllLanguages(): Promise<string[]> { return []; }
  async createLanguage(name: string): Promise<void> {}
  async deleteLanguage(name: string): Promise<void> {}

  async getAllGenders(): Promise<string[]> { return []; }
  async createGender(name: string): Promise<void> {}
  async deleteGender(name: string): Promise<void> {}
}
