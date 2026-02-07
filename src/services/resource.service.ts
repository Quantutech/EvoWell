import { Resource, ResourceModerationStatus } from '../types';
import { SEED_DATA } from '../data/seed';
import { mockStore } from './mockStore';
import { handleRequest } from './serviceUtils';
import { supabase, isConfigured } from './supabase';
import { providerService } from './provider.service';
import { entitlementService } from './entitlements';

export interface IResourceService {
  getAllResources(): Promise<Resource[]>;
  getResourceById(id: string): Promise<Resource | undefined>;
  getResourceBySlug(slug: string): Promise<Resource | undefined>;
  fetchResourceBySlugOrId(slugOrId: string): Promise<Resource | undefined>;
  getResourcesByProvider(providerId: string): Promise<Resource[]>;
  createResource(resource: Resource): Promise<void>;
  updateResource(id: string, updates: Partial<Resource>): Promise<void>;
  deleteResource(id: string): Promise<void>;
  searchResources(filters: any): Promise<Resource[]>;
  moderateResource(id: string, status: ResourceModerationStatus): Promise<void>;
}

async function assertProviderCanAuthorExchange(providerId?: string): Promise<void> {
  if (!providerId) return;

  const canAuthor = await entitlementService.canUseFeature(providerId, 'feature.exchange.author');
  if (!canAuthor) {
    throw new Error('Your subscription does not include Provider Exchange publishing.');
  }
}

async function assertProviderCanPublishPaid(
  providerId?: string,
  accessType?: Resource['accessType'],
): Promise<void> {
  if (!providerId || accessType !== 'paid') return;

  const canPublishPaid = await entitlementService.canUseFeature(
    providerId,
    'feature.exchange.publish_paid',
  );
  if (!canPublishPaid) {
    throw new Error('Paid Exchange listings require a Professional or Premium package.');
  }
}

class MockResourceService implements IResourceService {
  private get resources(): Resource[] {
    const storeResources = (mockStore.store as any).resources || [];
    const seedResources = (SEED_DATA as any).resources || [];
    const hiddenIds = (mockStore.store as any).hiddenResourceIds || [];
    
    const map = new Map<string, Resource>();
    seedResources.forEach((r: Resource) => map.set(r.id, r));
    storeResources.forEach((r: Resource) => map.set(r.id, r));
    
    return Array.from(map.values()).filter(r => !hiddenIds.includes(r.id));
  }

  async getAllResources(): Promise<Resource[]> {
    return handleRequest(async () => this.resources, 'getAllResources');
  }

  async getResourceById(id: string): Promise<Resource | undefined> {
    return handleRequest(async () => {
        const res = this.resources.find(r => r.id === id);
        if (res) {
            // Support both provider ID (prov-...) and user ID
            let provider = await providerService.getProviderById(res.providerId);
            if (!provider) {
                provider = await providerService.getProviderByUserId(res.providerId);
            }

            if (provider) {
                return {
                    ...res,
                    provider: {
                        firstName: provider.firstName || 'Unknown',
                        lastName: provider.lastName || 'Provider',
                        professionalTitle: provider.professionalTitle || 'Specialist',
                        imageUrl: provider.imageUrl || '',
                        bio: provider.bio || '',
                        email: provider.email || 'provider@evowell.com'
                    }
                };
            }
        }
        return res;
    }, 'getResourceById');
  }

  async getResourceBySlug(slug: string): Promise<Resource | undefined> {
    const res = this.resources.find(r => r.slug === slug);
    if (res) return this.getResourceById(res.id);
    return undefined;
  }

  async fetchResourceBySlugOrId(slugOrId: string): Promise<Resource | undefined> {
      if (!slugOrId) return undefined;
      const isId = slugOrId.startsWith('res-');
      if (isId) return this.getResourceById(slugOrId);
      return this.getResourceBySlug(slugOrId);
  }

  async getResourcesByProvider(providerId: string): Promise<Resource[]> {
    return handleRequest(async () => this.resources.filter(r => r.providerId === providerId), 'getResourcesByProvider');
  }

  async createResource(resource: Resource): Promise<void> {
    return handleRequest(async () => {
      await assertProviderCanAuthorExchange(resource.providerId);
      await assertProviderCanPublishPaid(resource.providerId, resource.accessType);

      const current = (mockStore.store as any).resources || [];
      (mockStore.store as any).resources = [...current, resource];
      mockStore.save();
    }, 'createResource');
  }

  async updateResource(id: string, updates: Partial<Resource>): Promise<void> {
    return handleRequest(async () => {
      const existing = this.resources.find((resource) => resource.id === id);
      const providerId = updates.providerId || existing?.providerId;
      const nextAccessType = updates.accessType || existing?.accessType;

      await assertProviderCanAuthorExchange(providerId);
      await assertProviderCanPublishPaid(providerId, nextAccessType);

      const storeResources = (mockStore.store as any).resources || [];
      const mockIndex = storeResources.findIndex((r: Resource) => r.id === id);
      
      if (mockIndex !== -1) {
          storeResources[mockIndex] = { ...storeResources[mockIndex], ...updates };
          (mockStore.store as any).resources = [...storeResources];
      } else {
          const seedItem = (SEED_DATA as any).resources?.find((r: Resource) => r.id === id);
          if (seedItem) {
              (mockStore.store as any).resources = [...storeResources, { ...seedItem, ...updates }];
          }
      }
      mockStore.save();
    }, 'updateResource');
  }

  async deleteResource(id: string): Promise<void> {
    return handleRequest(async () => {
        const existing = this.resources.find((resource) => resource.id === id);
        await assertProviderCanAuthorExchange(existing?.providerId);

        const storeResources = (mockStore.store as any).resources || [];
        (mockStore.store as any).resources = storeResources.filter((r: Resource) => r.id !== id);
        
        const hidden = (mockStore.store as any).hiddenResourceIds || [];
        if (!hidden.includes(id)) {
            (mockStore.store as any).hiddenResourceIds = [...hidden, id];
        }
        mockStore.save();
    }, 'deleteResource');
  }

  async searchResources(filters: any): Promise<Resource[]> {
    return handleRequest(async () => {
        let results = this.resources;

        if (filters.query) {
            const q = filters.query.toLowerCase();
            results = results.filter(r => 
                r.title.toLowerCase().includes(q) || 
                r.shortDescription.toLowerCase().includes(q)
            );
        }
        if (filters.type) {
            results = results.filter(r => r.type === filters.type);
        }
        if (filters.accessType) {
            results = results.filter(r => r.accessType === filters.accessType);
        }
        if (filters.category) {
            results = results.filter(r => r.categories.includes(filters.category));
        }
        
        return results;
    }, 'searchResources');
  }

  async moderateResource(id: string, status: ResourceModerationStatus): Promise<void> {
      await this.updateResource(id, { moderationStatus: status });
  }
}

class SupabaseResourceService implements IResourceService {
  async getAllResources(): Promise<Resource[]> {
    const { data, error } = await (supabase.from('resources') as any).select('*');
    if (error) throw error;
    return data as any;
  }

  async getResourceById(id: string): Promise<Resource | undefined> {
    const { data, error } = await (supabase.from('resources') as any).select('*').eq('id', id).single();
    if (error) return undefined;
    return data as any;
  }

  async getResourceBySlug(slug: string): Promise<Resource | undefined> {
    const { data, error } = await (supabase.from('resources') as any).select('*').eq('slug', slug).single();
    if (error) return undefined;
    return data as any;
  }

  async fetchResourceBySlugOrId(slugOrId: string): Promise<Resource | undefined> {
      if (!slugOrId) return undefined;
      const isId = slugOrId.startsWith('res-') || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
      if (isId) return this.getResourceById(slugOrId);
      return this.getResourceBySlug(slugOrId);
  }

  async getResourcesByProvider(providerId: string): Promise<Resource[]> {
    const { data, error } = await (supabase.from('resources') as any).select('*').eq('provider_id', providerId);
    if (error) throw error;
    return data as any;
  }

  async createResource(resource: Resource): Promise<void> {
    await assertProviderCanAuthorExchange(resource.providerId);
    await assertProviderCanPublishPaid(resource.providerId, resource.accessType);

    const { error } = await (supabase.from('resources') as any).insert(resource as any);
    if (error) throw error;
  }

  async updateResource(id: string, updates: Partial<Resource>): Promise<void> {
    const existing = await this.getResourceById(id);
    const providerId = updates.providerId || existing?.providerId;
    const nextAccessType = updates.accessType || existing?.accessType;

    await assertProviderCanAuthorExchange(providerId);
    await assertProviderCanPublishPaid(providerId, nextAccessType);

    const { error } = await (supabase.from('resources') as any).update(updates as any).eq('id', id);
    if (error) throw error;
  }

  async deleteResource(id: string): Promise<void> {
    const existing = await this.getResourceById(id);
    await assertProviderCanAuthorExchange(existing?.providerId);

    const { error } = await (supabase.from('resources') as any).delete().eq('id', id);
    if (error) throw error;
  }

  async searchResources(filters: any): Promise<Resource[]> {
    let query = (supabase.from('resources') as any).select('*');
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.accessType) query = query.eq('access_type', filters.accessType);
    
    const { data, error } = await query;
    if (error) throw error;
    return data as any;
  }

  async moderateResource(id: string, status: ResourceModerationStatus): Promise<void> {
      await this.updateResource(id, { moderationStatus: status });
  }
}

export const resourceService = isConfigured ? new SupabaseResourceService() : new MockResourceService();
