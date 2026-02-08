import { 
  ProviderProfile, SearchFilters, Specialty, InsuranceCompany, 
  SubscriptionTier, SubscriptionStatus, ModerationStatus, UserRole
} from '../../types';
import { mockStore } from '../mockStore';
import { SEED_DATA } from '../../data/seed';
import { handleRequest } from '../serviceUtils';
import { AppError } from '../error-handler';
import { IProviderService } from '../provider.service';
import { createBlankProviderProfile, generateProfileSlug } from './provider.profile';
import { fallbackMockSearch } from './provider.search';
import { ProviderApi } from './provider.api';
import { resolveProviderProfileTheme } from '../../types/ui/providerProfile';

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

export class MockProviderService implements IProviderService {
  createBlankProviderProfile = createBlankProviderProfile;

  async search(filters: SearchFilters): Promise<{ providers: ProviderProfile[], total: number }> {
    return handleRequest(() => fallbackMockSearch(filters), 'search');
  }

  async getProviderById(id: string): Promise<ProviderProfile | undefined> {
    return ProviderApi.getById(id);
  }

  async getProviderByUserId(userId: string): Promise<ProviderProfile | undefined> {
    return ProviderApi.getByUserId(userId);
  }

  async updateProvider(id: string, data: Partial<ProviderProfile>): Promise<ProviderProfile> {
    return handleRequest(async () => {
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

        // Seed order is retained, but mutable mock rows override seeded duplicates.
        const providersById = new Map<string, ProviderProfile>();
        for (const provider of SEED_DATA.providers) {
          providersById.set(provider.id, provider);
        }
        for (const provider of mockStore.store.providers) {
          providersById.set(provider.id, provider);
        }
        const uniqueProviders = Array.from(providersById.values());

        const usersById = new Map<string, (typeof SEED_DATA.users)[number]>();
        for (const user of SEED_DATA.users) {
          usersById.set(user.id, user);
        }
        for (const user of mockStore.store.users) {
          usersById.set(user.id, user);
        }

        const total = uniqueProviders.length;
        const paged = uniqueProviders.slice(start, start + limit);

        const providers = paged.map(p => {
          const user = usersById.get(p.userId);
          const providerFirstName = p.firstName?.trim() || '';
          const providerLastName = p.lastName?.trim() || '';
          const hasValidProviderName =
            Boolean(providerFirstName && providerLastName) &&
            !isLikelyCredentialText(providerFirstName) &&
            !isLikelyCredentialText(providerLastName);

          return {
            ...p,
            firstName: hasValidProviderName
              ? providerFirstName
              : user?.firstName || providerFirstName || 'Unknown',
            lastName: hasValidProviderName
              ? providerLastName
              : user?.lastName || providerLastName || 'Provider',
            email: p.email || user?.email,
            isPublished: p.isPublished ?? true,
            profileTemplate: p.profileTemplate || 'CLASSIC',
            profileTheme: resolveProviderProfileTheme(p.profileTheme, p.profileTemplate),
            availabilityStatus:
              p.availabilityStatus || (p.acceptingNewClients === false ? 'NOT_ACCEPTING' : 'ACCEPTING'),
            accessibilityNotes: p.accessibilityNotes || '',
            showLicenseNumber: p.showLicenseNumber || false,
          };
        });

        return { providers, total };
    }, 'getAllProviders');
  }

  async getProviderBySlug(slug: string): Promise<ProviderProfile | undefined> {
    const tempProvider = mockStore.store.providers.find(p => p.profileSlug === slug);
    const seedProvider = SEED_DATA.providers.find(p => p.profileSlug === slug);
    const provider = tempProvider || seedProvider;
    if (!provider) return undefined;
    return this.getProviderById(provider.id);
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
        return;
      }

      const seedProvider = SEED_DATA.providers.find((provider) => provider.id === id);
      if (!seedProvider) return;

      mockStore.store.providers.push({
        ...seedProvider,
        moderationStatus: status,
        isPublished: status === ModerationStatus.APPROVED ? true : seedProvider.isPublished,
      });
      mockStore.save();
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
