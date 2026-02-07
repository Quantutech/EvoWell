import { supabase, isConfigured } from './supabase';
import { handleRequest } from './serviceUtils';
import { WishlistEntry, UserRole, ProviderProfile } from '../types';
import { mockStore } from './mockStore';
import { AppError } from './error-handler';

export interface IWishlistService {
  toggleWishlist(providerId: string): Promise<{ isSaved: boolean }>;
  getSavedProviders(): Promise<WishlistEntry[]>;
  getWishlistedBy(providerId: string): Promise<WishlistEntry[]>;
  checkWishlistStatus(providerIds: string[]): Promise<Record<string, boolean>>;
}

class SupabaseWishlistService implements IWishlistService {
  async toggleWishlist(providerId: string): Promise<{ isSaved: boolean }> {
    return handleRequest(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new AppError('Authentication required', 'UNAUTHORIZED');

      // First check if exists
      const { data: existing } = await (supabase
        .from('provider_wishlists') as any)
        .select('id')
        .eq('provider_id', providerId)
        .eq('client_id', user.id)
        .maybeSingle();

      if (existing) {
        // Delete
        const { error } = await (supabase
          .from('provider_wishlists') as any)
          .delete()
          .eq('id', existing.id);
        
        if (error) throw error;
        return { isSaved: false };
      } else {
        // Insert
        const { error } = await (supabase
          .from('provider_wishlists') as any)
          .insert({
            provider_id: providerId,
            client_id: user.id
          });
        
        if (error) {
            // Check for RLS violation (e.g. provider trying to save)
            if (error.code === '42501') throw new AppError('Permission denied', 'FORBIDDEN');
            throw error;
        }
        return { isSaved: true };
      }
    }, 'toggleWishlist');
  }

  async getSavedProviders(): Promise<WishlistEntry[]> {
    return handleRequest(async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new AppError('Authentication required', 'UNAUTHORIZED');

       const { data, error } = await (supabase
         .from('provider_wishlists') as any)
         .select(`
           *,
           provider:providers (
             *,
             user:users (
                first_name,
                last_name
             )
           )
         `)
         .eq('client_id', user.id)
         .order('created_at', { ascending: false });

        if (error) throw error;
        
        return (data || []).map((item: any) => ({
            id: item.id,
            providerId: item.provider_id,
            clientId: item.client_id,
            createdAt: item.created_at,
            provider: this.mapProviderData(item.provider)
        }));
    }, 'getSavedProviders');
  }

  async getWishlistedBy(providerId: string): Promise<WishlistEntry[]> {
       return handleRequest(async () => {
         const { data, error } = await (supabase
           .from('provider_wishlists') as any)
           .select(`
             *,
             client:users (
               id,
               first_name,
               last_name,
               role
             )
           `)
           .eq('provider_id', providerId)
           .order('created_at', { ascending: false });
           
          if (error) throw error;
          
          return (data || []).map((item: any) => ({
              id: item.id,
              providerId: item.provider_id,
              clientId: item.client_id,
              createdAt: item.created_at,
              client: {
                  id: item.client.id,
                  userId: item.client.id,
                  firstName: item.client.first_name,
                  lastName: item.client.last_name,
                  // Additional enrichment would happen here if we fetched client profiles
              }
          }));
       }, 'getWishlistedBy');
  }

  async checkWishlistStatus(providerIds: string[]): Promise<Record<string, boolean>> {
     return handleRequest(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return {};

        const { data, error } = await (supabase
          .from('provider_wishlists') as any)
          .select('provider_id')
          .eq('client_id', user.id)
          .in('provider_id', providerIds);
        
        if (error) throw error;

        const result: Record<string, boolean> = {};
        providerIds.forEach(id => {
            result[id] = false;
        });
        (data || []).forEach((item: any) => {
            result[item.provider_id] = true;
        });
        return result;

     }, 'checkWishlistStatus');
  }

  private mapProviderData(dbProvider: any): ProviderProfile {
      // Simplified mapping for the card
      // In a real scenario, we might want to share this mapper with provider.service.ts
      return {
          id: dbProvider.id,
          userId: dbProvider.user_id,
          firstName: dbProvider.user?.first_name,
          lastName: dbProvider.user?.last_name,
          professionalTitle: dbProvider.professional_title,
          professionalCategory: dbProvider.professional_category,
          imageUrl: dbProvider.image_url,
          hourlyRate: dbProvider.hourly_rate,
          rating: 0, // Defaults
          reviewCount: 0,
          specialties: [], // This would require another join
          // ... populate required fields with defaults or real data
          yearsExperience: dbProvider.years_experience,
          bio: dbProvider.bio,
          languages: [],
          availability: { days: [], hours: [], schedule: [], blockedDates: [] },
          pricing: {
            hourlyRate: dbProvider.hourly_rate,
            slidingScale: dbProvider.sliding_scale
          },
          address: {
            city: dbProvider.address_city,
            state: dbProvider.address_state,
            street: dbProvider.address_street || '',
            zip: dbProvider.address_zip || '',
            country: 'USA'
          }
      } as unknown as ProviderProfile; 
      // Using 'as unknown as ProviderProfile' because mapping FULL profile from just providers table 
      // is complex without all joins (specialties, etc). 
      // For the wishlist card, we need specific fields.
      // Ideally we fetch properly.
  }
}

class MockWishlistService implements IWishlistService {
  
  private getCurrentUser() {
      const stored = localStorage.getItem('evowell_mock_session');
      let userId = '';
      if (stored) {
          const parsed = JSON.parse(stored);
          userId = parsed.userId;
      }
      return mockStore.store.users.find(u => u.id === userId) || 
             mockStore.store.users.find(u => u.role === UserRole.CLIENT) || // Default to first client
             mockStore.store.users.find(u => u.role === UserRole.ADMIN);
  }

  async toggleWishlist(providerId: string): Promise<{ isSaved: boolean }> {
    return handleRequest(async () => {
      const currentUser = this.getCurrentUser();
      
      if (!currentUser) throw new AppError('Authentication required', 'UNAUTHORIZED');
      
      if (currentUser.role === UserRole.PROVIDER) {
          throw new AppError('Providers cannot save providers', 'FORBIDDEN');
      }

      const existingIdx = mockStore.store.wishlist.findIndex(w => w.providerId === providerId && w.clientId === currentUser.id);
      
      if (existingIdx !== -1) {
          mockStore.store.wishlist.splice(existingIdx, 1);
          mockStore.save();
          return { isSaved: false };
      } else {
          mockStore.store.wishlist.push({
              id: `wl-${Date.now()}`,
              providerId,
              clientId: currentUser.id,
              createdAt: new Date().toISOString()
          });
          mockStore.save();
          return { isSaved: true };
      }
    }, 'toggleWishlist');
  }

  async getSavedProviders(): Promise<WishlistEntry[]> {
      return handleRequest(async () => {
          const currentUser = this.getCurrentUser();
          if (!currentUser) return [];

          const items = mockStore.store.wishlist.filter(w => w.clientId === currentUser.id);
          
          return items.map(item => {
              const provider = mockStore.store.providers.find(p => p.id === item.providerId);
              if (!provider) return item;
              // Enrich provider with user name
              const providerUser = mockStore.store.users.find(u => u.id === provider.userId);
              return {
                  ...item,
                  provider: {
                      ...provider,
                      firstName: providerUser?.firstName,
                      lastName: providerUser?.lastName
                  }
              };
          });
      }, 'getSavedProviders');
  }

  async getWishlistedBy(providerId: string): Promise<WishlistEntry[]> {
      return handleRequest(async () => {
          const items = mockStore.store.wishlist.filter(w => w.providerId === providerId);
          
          return items.map(item => {
              const clientUser = mockStore.store.users.find(u => u.id === item.clientId);
              const clientProfile = mockStore.store.clientProfiles.find(p => p.userId === item.clientId);
              return {
                  ...item,
                  client: {
                      id: item.clientId,
                      userId: item.clientId,
                      firstName: clientUser?.firstName || 'Unknown',
                      lastName: clientUser?.lastName || 'User',
                      imageUrl: clientProfile?.imageUrl,
                      location: clientProfile?.address ? `${clientProfile.address.city}, ${clientProfile.address.state}` : undefined
                  }
              };
          });
      }, 'getWishlistedBy');
  }

  async checkWishlistStatus(providerIds: string[]): Promise<Record<string, boolean>> {
      return handleRequest(async () => {
          const currentUser = this.getCurrentUser();
          const result: Record<string, boolean> = {};
          
          providerIds.forEach(id => {
              result[id] = false;
          });

          if (!currentUser) return result;

          providerIds.forEach(id => {
              const exists = mockStore.store.wishlist.some(w => w.providerId === id && w.clientId === currentUser.id);
              result[id] = exists;
          });
          
          return result;
      }, 'checkWishlistStatus');
  }
}

export const wishlistService = isConfigured ? new SupabaseWishlistService() : new MockWishlistService();
