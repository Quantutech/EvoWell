import { User, ProviderProfile, UserRole, AuditActionType, AuditResourceType, ClientProfile } from '../types';
import { supabase, isConfigured } from './supabase';
import { mockStore } from './mockStore';
import { SEED_DATA } from './seedData';
import { auditService } from './audit';
import { errorHandler, AppError, ErrorSeverity } from './error-handler';
import { handleRequest } from './serviceUtils';
import { persistence } from './persistence';
import { providerService } from './provider.service';

export interface IAuthService {
  login(email: string, password?: string): Promise<{ user: User; provider?: ProviderProfile; token: string }>;
  register(data: { email: string; password: string; firstName: string; lastName: string; role: UserRole }): Promise<User>;
  logout(): Promise<void>;
}

// Helper to format user from DB row
function formatUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role as UserRole,
    timezone: row.timezone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isDeleted: row.is_deleted
  };
}

// =========================================================
// MOCK IMPLEMENTATION
// =========================================================

class MockAuthService implements IAuthService {
  async login(email: string, password?: string): Promise<{ user: User; provider?: ProviderProfile; token: string }> {
    return handleRequest(async () => {
        // Check both SEED_DATA and mockStore
        let user = SEED_DATA.users.find(u => u.email === email) || mockStore.store.users.find(u => u.email === email);
        
        if (!user) {
             let role = UserRole.CLIENT;
             if (email.toLowerCase().includes('provider')) role = UserRole.PROVIDER;
             if (email.toLowerCase().includes('admin')) role = UserRole.ADMIN;

             user = {
                 id: 'u-demo-temp',
                 email,
                 firstName: 'Demo',
                 lastName: 'User',
                 role: role,
                 createdAt: new Date().toISOString(),
                 updatedAt: new Date().toISOString(),
                 isDeleted: false
             };
        }
        
        let provider: ProviderProfile | undefined;
        if (user.role === UserRole.PROVIDER) {
            // Use providerService to fetch (it handles checking both stores)
            provider = await providerService.getProviderByUserId(user.id);
        }
        
        persistence.setSession('mock-session-token', user.id);
        return { user, provider, token: 'mock-session-token' };
    }, 'login');
  }

  async register(data: { email: string; password: string; firstName: string; lastName: string; role: UserRole }): Promise<User> {
    return handleRequest(async () => {
      const now = new Date().toISOString();
      const userId = `u-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newUser: User = {
        id: userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        createdAt: now,
        updatedAt: now,
        isDeleted: false
      };
      
      mockStore.store.users.push(newUser);
      
      if (data.role === UserRole.PROVIDER) {
        const providerProfile = providerService.createBlankProviderProfile(
          userId, 
          data.firstName, 
          data.lastName, 
          data.email
        );
        await providerService.createProvider(providerProfile); // Uses providerService which handles mock store push
        console.log('✅ Created provider profile:', providerProfile.id, 'Slug:', providerProfile.profileSlug);
      } else if (data.role === UserRole.CLIENT) {
          const clientProfile: ClientProfile = {
              id: `cp-${userId}`,
              userId: userId,
              intakeStatus: 'PENDING',
              documents: [],
              createdAt: now,
              updatedAt: now,
              preferences: { communication: 'email', language: 'English' }
          };
          mockStore.store.clientProfiles.push(clientProfile);
      }
      
      mockStore.save(); // Save users and profiles
      console.log('✅ User registered:', newUser.id, 'Role:', newUser.role);
      return newUser;
    }, 'register');
  }

  async logout(): Promise<void> {
    persistence.clearSession();
  }
}

// =========================================================
// SUPABASE IMPLEMENTATION
// =========================================================

class SupabaseAuthService implements IAuthService {
  
  // Private helper to get user by ID (since we don't depend on ClientService yet)
  private async getUserById(id: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) errorHandler.logError(error, { method: 'getUserById', id });
    return data ? formatUser(data) : undefined;
  }

  async login(email: string, password?: string): Promise<{ user: User; provider?: ProviderProfile; token: string }> {
    return handleRequest(async () => {
        if (password) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw new AppError(error.message, 'AUTH_FAILED', ErrorSeverity.WARNING);
          if (!data.user) throw new AppError('No user data returned', 'AUTH_ERROR');
          
          auditService.log(AuditActionType.LOGIN, AuditResourceType.USER, data.user.id);

          const user = await this.getUserById(data.user.id);
          if (!user) throw new AppError("User profile missing", 'USER_NOT_FOUND');
          
          let provider: ProviderProfile | undefined;
          if (user.role === UserRole.PROVIDER) {
            provider = await providerService.getProviderByUserId(user.id);
            // PERSISTENCE FIX: Cache provider profile to ensure consistency across components
            if (provider) {
                const store = persistence.loadStore();
                const existingIdx = store.providers.findIndex(p => p.id === provider.id);
                if (existingIdx !== -1) {
                    store.providers[existingIdx] = provider;
                } else {
                    store.providers.push(provider);
                }
                persistence.saveStore(store);
            }
          }
          return { user, provider, token: data.session?.access_token || '' };
        } 
        
        // Session Restore
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
            if (!email || sessionData.session.user.email === email) {
                const user = await this.getUserById(sessionData.session.user.id);
                if (!user) throw new AppError("User profile missing", 'USER_NOT_FOUND');
                let provider: ProviderProfile | undefined;
                if (user.role === UserRole.PROVIDER) {
                  provider = await providerService.getProviderByUserId(user.id);
                  // PERSISTENCE FIX: Also cache on restore
                  if (provider) {
                    const store = persistence.loadStore();
                    const providerToCache = provider; // local variable to satisfy TS
                    const existingIdx = store.providers.findIndex(p => p.id === providerToCache.id);
                    if (existingIdx !== -1) {
                        store.providers[existingIdx] = providerToCache;
                    } else {
                        store.providers.push(providerToCache);
                    }
                    persistence.saveStore(store);
                  }
                }
                return { user, provider, token: sessionData.session.access_token };
            }
        }
        throw new AppError("No active session", 'NO_SESSION', ErrorSeverity.INFO);
    }, 'login');
  }

  async register(data: { email: string; password: string; firstName: string; lastName: string; role: UserRole }): Promise<User> {
    return handleRequest(async () => {
      const now = new Date().toISOString();
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { first_name: data.firstName, last_name: data.lastName, role: data.role }
        }
      });
      
      if (authError) throw new AppError(authError.message, 'REGISTRATION_FAILED', ErrorSeverity.ERROR);
      if (!authData.user) throw new AppError('Registration failed', 'REGISTRATION_FAILED');
      
      const userId = authData.user.id;
      
      await (supabase.from('users') as any).insert({
        id: userId, email: data.email, first_name: data.firstName, last_name: data.lastName,
        role: data.role as string, created_at: now, updated_at: now, is_deleted: false
      });
      
      if (data.role === UserRole.PROVIDER) {
        const providerProfile = providerService.createBlankProviderProfile(userId, data.firstName, data.lastName, data.email);
        await providerService.createProvider(providerProfile);
      } else if (data.role === UserRole.CLIENT) {
          // In real implementation, insert to client_profiles
          // await supabase.from('client_profiles').insert({...});
      }
      
      auditService.log(AuditActionType.CREATE, AuditResourceType.USER, userId);
      return { id: userId, email: data.email, firstName: data.firstName, lastName: data.lastName, role: data.role, createdAt: now, updatedAt: now, isDeleted: false };
    }, 'register');
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }
}

export const authService = isConfigured ? new SupabaseAuthService() : new MockAuthService();
