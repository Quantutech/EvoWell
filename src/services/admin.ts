import { supabase, isConfigured } from './supabase';
import {
  User,
  ProviderProfile,
  ClientProfile,
  UserRole,
  ModerationStatus,
  SubscriptionTier,
  SubscriptionStatus,
} from '../types';
import { api } from './api';
import { authService } from './auth.service';
import { providerService } from './provider.service';
import { mockStore } from './mockStore';
import { Database } from '../types/supabase'; // Import generated types

type UserRow = Database['public']['Tables']['users']['Row'];
type ProviderRow = Database['public']['Tables']['providers']['Row'];

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProviderApplication {
  id: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  reason?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export type AccountStatus = 'ACTIVE' | 'SUSPENDED';

export interface GetUsersParams {
  page: number;
  pageSize: number;
  search?: string;
  role?: UserRole;
  includeDeleted?: boolean;
  status?: AccountStatus | 'ALL';
}

export interface GetProvidersParams {
  page: number;
  pageSize: number;
  status?: ModerationStatus | 'ALL';
  search?: string;
}

export interface GetClientsParams {
  page: number;
  pageSize: number;
  search?: string;
  intakeStatus?: 'PENDING' | 'COMPLETED' | 'ALL';
}

export interface AdminClientRecord extends User {
  profile?: ClientProfile;
  accountStatus: AccountStatus;
}

class AdminService {
  private toAccountStatus(user: Pick<User, 'isDeleted'>): AccountStatus {
    return user.isDeleted ? 'SUSPENDED' : 'ACTIVE';
  }

  private mapUserRow(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name || '',
      lastName: row.last_name || '',
      role: row.role as UserRole,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isDeleted: row.is_deleted || false,
      timezone: row.timezone || undefined,
    };
  }

  private normalizeGetUsersArgs(
    paramsOrPage: GetUsersParams | number,
    legacyPageSize: number,
    legacySearch?: string,
  ): Required<Pick<GetUsersParams, 'page' | 'pageSize' | 'includeDeleted'>> &
    Pick<GetUsersParams, 'search' | 'role' | 'status'> {
    if (typeof paramsOrPage === 'object') {
      return {
        page: paramsOrPage.page,
        pageSize: paramsOrPage.pageSize,
        search: paramsOrPage.search,
        role: paramsOrPage.role,
        includeDeleted: paramsOrPage.includeDeleted ?? true,
        status: paramsOrPage.status || 'ALL',
      };
    }

    return {
      page: paramsOrPage,
      pageSize: legacyPageSize,
      search: legacySearch,
      role: undefined,
      includeDeleted: true,
      status: 'ALL',
    };
  }

  private normalizeGetProvidersArgs(
    paramsOrPage: GetProvidersParams | number,
    legacyPageSize: number,
    legacyStatus?: string,
  ): Required<Pick<GetProvidersParams, 'page' | 'pageSize'>> &
    Pick<GetProvidersParams, 'status' | 'search'> {
    if (typeof paramsOrPage === 'object') {
      return {
        page: paramsOrPage.page,
        pageSize: paramsOrPage.pageSize,
        status: paramsOrPage.status ?? 'ALL',
        search: paramsOrPage.search,
      };
    }

    return {
      page: paramsOrPage,
      pageSize: legacyPageSize,
      status: (legacyStatus as ModerationStatus | 'ALL' | undefined) || 'ALL',
      search: undefined,
    };
  }

  private async getUserById(userId: string): Promise<User | null> {
    if (!isConfigured || !supabase) {
      const user = mockStore.store.users.find((u) => u.id === userId);
      return user || null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return this.mapUserRow(data as UserRow);
  }

  private async getActiveAdminCount(excludeUserId?: string): Promise<number> {
    if (!isConfigured || !supabase) {
      return mockStore.store.users.filter(
        (u) =>
          u.role === UserRole.ADMIN &&
          !u.isDeleted &&
          (!excludeUserId || u.id !== excludeUserId),
      ).length;
    }

    let query = supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', UserRole.ADMIN)
      .eq('is_deleted', false);

    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }

    const { count } = await query;
    return count || 0;
  }

  private assertCanMutateAdmin(
    user: User | null,
    mutation: 'delete' | 'suspend' | 'demote',
  ) {
    if (!user || user.role !== UserRole.ADMIN) return;
    const suffix =
      mutation === 'delete'
        ? 'delete'
        : mutation === 'suspend'
          ? 'suspend'
          : 'demote';
    throw new Error(`Cannot ${suffix} the last active administrator.`);
  }

  async getStats() {
    if (!isConfigured || !supabase) {
        const users = await api.getAllUsers();
        const providersResponse = await api.getAllProviders({ page: 1, limit: 10000 });
        const providers = providersResponse.providers || [];
        const tickets = await api.getTickets();
        const pending = providers.filter(p => p.moderationStatus === ModerationStatus.PENDING).length;
        const openTickets = tickets.filter(t => t.status !== 'CLOSED').length;
        return { users: users.length, providers: providers.length, pending, openTickets };
    }

    try {
      const [
        { count: usersCount }, 
        { count: providersCount }, 
        { count: pendingCount }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('providers').select('*', { count: 'exact', head: true }),
        supabase.from('providers').select('*', { count: 'exact', head: true }).eq('moderation_status', 'PENDING')
      ]);

      // Tickets are currently mock-only in content service
      const tickets = await api.getTickets();
      const openTickets = tickets.filter(t => t.status !== 'CLOSED').length;

      return {
          users: usersCount || 0,
          providers: providersCount || 0,
          pending: pendingCount || 0,
          openTickets
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return { users: 0, providers: 0, pending: 0, openTickets: 0 };
    }
  }
  
  async getUsers(
    paramsOrPage: GetUsersParams | number = 1,
    legacyPageSize = 20,
    legacySearch?: string,
  ): Promise<PaginatedResponse<User>> {
    const {
      page,
      pageSize,
      search,
      role,
      includeDeleted,
      status,
    } = this.normalizeGetUsersArgs(paramsOrPage, legacyPageSize, legacySearch);

    if (!isConfigured || !supabase) {
      let users = [...mockStore.store.users];
      
      if (search) {
        const q = search.toLowerCase();
        users = users.filter(u => 
          u.email.toLowerCase().includes(q) ||
          u.firstName?.toLowerCase().includes(q) ||
          u.lastName?.toLowerCase().includes(q)
        );
      }

      if (role) {
        users = users.filter((u) => u.role === role);
      }

      if (status === 'ACTIVE') {
        users = users.filter((u) => !u.isDeleted);
      } else if (status === 'SUSPENDED') {
        users = users.filter((u) => u.isDeleted);
      } else if (!includeDeleted) {
        users = users.filter((u) => !u.isDeleted);
      }
      
      users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      const total = users.length;
      const from = (page - 1) * pageSize;
      const paginatedUsers = users.slice(from, from + pageSize);
      
      return {
        data: paginatedUsers,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (status === 'ACTIVE') {
      query = query.eq('is_deleted', false);
    } else if (status === 'SUSPENDED') {
      query = query.eq('is_deleted', true);
    } else if (!includeDeleted) {
      query = query.eq('is_deleted', false);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const users = (data as UserRow[] || []).map((row) => this.mapUserRow(row));

    return {
      data: users,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  }

  async getProviders(
    paramsOrPage: GetProvidersParams | number = 1,
    legacyPageSize = 20,
    legacyStatus?: string,
  ): Promise<PaginatedResponse<ProviderProfile>> {
    const {
      page,
      pageSize,
      status,
      search,
    } = this.normalizeGetProvidersArgs(paramsOrPage, legacyPageSize, legacyStatus);

    if (!isConfigured || !supabase) {
      const response = await api.getAllProviders({ page: 1, limit: 10000 });
      let providers = response.providers || [];
      const users = [...mockStore.store.users];
      
      if (status && status !== 'ALL') {
        providers = providers.filter(p => p.moderationStatus === status);
      }
      
      providers = providers.map(p => {
        const user = users.find(u => u.id === p.userId);
        return {
          ...p,
          firstName: p.firstName || user?.firstName || 'Unknown',
          lastName: p.lastName || user?.lastName || 'Provider',
          email: p.email || user?.email || ''
        };
      });

      if (search) {
        const q = search.toLowerCase();
        providers = providers.filter((p) => {
          const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
          return (
            fullName.includes(q) ||
            p.email?.toLowerCase().includes(q) ||
            p.professionalTitle?.toLowerCase().includes(q)
          );
        });
      }
      
      providers.sort((a, b) => {
        const dateA = new Date(a.audit?.createdAt || 0).getTime();
        const dateB = new Date(b.audit?.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      const total = providers.length;
      const from = (page - 1) * pageSize;
      const paginatedProviders = providers.slice(from, from + pageSize);
      
      return {
        data: paginatedProviders,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('providers')
      .select('*, users(first_name, last_name, email)', { count: 'exact' });

    if (status && status !== 'ALL') {
      query = query.eq('moderation_status', status);
    }

    if (search) {
      query = query.or(`professional_title.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    type ProviderWithUser = ProviderRow & {
      users: { first_name: string; last_name: string; email: string } | null;
    };

    const providers = (data as ProviderWithUser[] || []).map((row) => {
        const user = row.users;
        return {
            id: row.id,
            userId: row.user_id,
            professionalTitle: row.professional_title || '',
            professionalCategory: row.professional_category || 'Mental Health Provider',
            npi: row.npi || undefined,
            yearsExperience: row.years_experience || 0,
            education: '',
            educationHistory: [],
            bio: row.bio || '',
            tagline: row.tagline || '',
            imageUrl: row.image_url || '',
            gallery: [],
            languages: [],
            appointmentTypes: [],
            durations: [],
            specialties: [],
            licenses: [],
            certificates: [],
            availability: { days: [], hours: [], schedule: [], blockedDates: [] },
            onboardingComplete: row.onboarding_complete || false,
            address: undefined,
            phone: row.phone || undefined,
            website: row.website || undefined,
            social: {},
            subscriptionTier: (row.subscription_tier as SubscriptionTier) || SubscriptionTier.FREE,
            subscriptionStatus: (row.subscription_status as SubscriptionStatus) || SubscriptionStatus.TRIAL,
            moderationStatus: (row.moderation_status as ModerationStatus) || ModerationStatus.PENDING,
            isPublished: row.is_published || false,
            digitalProducts: [],
            servicePackages: [],
            insuranceAccepted: [],
            paymentMethodsAccepted: [],
            pricing: {
                hourlyRate: row.hourly_rate || 150,
                slidingScale: row.sliding_scale || false,
                minFee: row.min_fee || undefined,
                maxFee: row.max_fee || undefined
            },
            businessInfo: {
                businessName: row.business_name || '',
                taxId: row.tax_id || '',
                businessAddress: '',
                stripeAccountId: row.stripe_account_id || '',
                stripeStatus: row.stripe_status || ''
            },
            compliance: { termsAccepted: true, verificationAgreed: true },
            security: { question: '', answer: '' },
            metrics: { views: 0, inquiries: 0 },
            metricsHistory: [],
            mediaAppearances: [],
            worksWith: [],
            gender: '',
            audit: {
                createdAt: row.created_at,
                updatedAt: row.updated_at
            },
            profileSlug: row.profile_slug || undefined,
            pronouns: row.pronouns || undefined,
            firstName: user?.first_name || '',
            lastName: user?.last_name || '',
            email: user?.email || ''
        } as ProviderProfile;
    });

    const filtered = search
      ? providers.filter((p) => {
          const q = search.toLowerCase();
          const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
          return (
            fullName.includes(q) ||
            p.email?.toLowerCase().includes(q) ||
            p.professionalTitle?.toLowerCase().includes(q)
          );
        })
      : providers;

    return {
      data: filtered,
      total: search ? filtered.length : count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((search ? filtered.length : count || 0) / pageSize)
    };
  }

  async getClients(params: GetClientsParams): Promise<PaginatedResponse<AdminClientRecord>> {
    const {
      page,
      pageSize,
      search,
      intakeStatus = 'ALL',
    } = params;

    if (!isConfigured || !supabase) {
      const users = [...mockStore.store.users];
      const profilesByUserId = new Map(
        mockStore.store.clientProfiles.map((p) => [p.userId, p]),
      );

      let clients: AdminClientRecord[] = users
        .filter((u) => u.role === UserRole.CLIENT)
        .map((u) => {
          const profile = profilesByUserId.get(u.id);
          return {
            ...u,
            profile,
            accountStatus: this.toAccountStatus(u),
          };
        });

      if (search) {
        const q = search.toLowerCase();
        clients = clients.filter((c) => {
          const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
          return fullName.includes(q) || c.email.toLowerCase().includes(q);
        });
      }

      if (intakeStatus !== 'ALL') {
        clients = clients.filter(
          (c) => (c.profile?.intakeStatus || 'PENDING') === intakeStatus,
        );
      }

      clients.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      const total = clients.length;
      const from = (page - 1) * pageSize;
      const data = clients.slice(from, from + pageSize);

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      };
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('role', UserRole.CLIENT);

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`,
      );
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Client profiles are not yet implemented in Supabase service mode.
    let clients = (data as UserRow[] || []).map((row) => {
      const user = this.mapUserRow(row);
      return {
        ...user,
        profile: undefined,
        accountStatus: this.toAccountStatus(user),
      } as AdminClientRecord;
    });

    if (intakeStatus === 'COMPLETED') {
      clients = [];
    }

    const total = intakeStatus === 'COMPLETED' ? 0 : count || 0;

    return {
      data: clients,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async getProviderApplications(): Promise<ProviderApplication[]> {
    if (!isConfigured || !supabase) {
      const response = await api.getAllProviders({ page: 1, limit: 10000 });
      const providers = response.providers || [];
      return providers
        .filter(p => p.moderationStatus === ModerationStatus.PENDING)
        .map(p => ({
          id: p.id,
          userId: p.userId,
          status: 'PENDING' as const,
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          email: p.email || '',
          createdAt: p.audit?.createdAt || new Date().toISOString()
        }));
    }

    try {
      type ProviderWithUser = ProviderRow & {
        users: { first_name: string; last_name: string; email: string } | null;
      };

      const { data, error } = await supabase
        .from('providers')
        .select('*, users(first_name, last_name, email)')
        .eq('moderation_status', 'PENDING')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data as ProviderWithUser[] || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        status: 'PENDING' as const,
        firstName: row.users?.first_name || '',
        lastName: row.users?.last_name || '',
        email: row.users?.email || '',
        createdAt: row.created_at
      }));
    } catch (error) {
      console.warn('Could not fetch applications, falling back to providers:', error);
      return this.getProviderApplicationsFallback();
    }
  }

  private async getProviderApplicationsFallback(): Promise<ProviderApplication[]> {
    const providers = await this.getProviders(1, 100, 'PENDING');
    return providers.data.map(p => ({
      id: p.id,
      userId: p.userId,
      status: 'PENDING' as const,
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      email: p.email || '',
      createdAt: p.audit?.createdAt || new Date().toISOString()
    }));
  }

  async deleteUser(userId: string): Promise<void> {
    const target = await this.getUserById(userId);
    if (!target) return;

    if (target.role === UserRole.ADMIN) {
      const activeAdmins = await this.getActiveAdminCount(userId);
      if (activeAdmins === 0) {
        this.assertCanMutateAdmin(target, 'delete');
      }
    }

    if (!isConfigured || !supabase) {
      mockStore.store.users = mockStore.store.users.filter((u) => u.id !== userId);
      mockStore.store.clientProfiles = mockStore.store.clientProfiles.filter(
        (p) => p.userId !== userId,
      );
      mockStore.store.providers = mockStore.store.providers.filter(
        (p) => p.userId !== userId,
      );
      mockStore.save();
      return;
    }
    
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
  }

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    const target = await this.getUserById(userId);
    if (!target) throw new Error('User not found.');

    if (target.role === UserRole.ADMIN && role !== UserRole.ADMIN) {
      const activeAdmins = await this.getActiveAdminCount(userId);
      if (activeAdmins === 0) {
        this.assertCanMutateAdmin(target, 'demote');
      }
    }

    if (!isConfigured || !supabase) {
      const idx = mockStore.store.users.findIndex((u) => u.id === userId);
      if (idx === -1) throw new Error('User not found.');
      mockStore.store.users[idx] = {
        ...mockStore.store.users[idx],
        role,
        updatedAt: new Date().toISOString(),
      };
      mockStore.save();
      return;
    }
    
    try {
      const { error } = await (supabase.rpc as any)('elevate_user_role', { 
          target_user_id: userId, 
          new_role: role 
      });

      if (error) {
        console.warn('RPC elevate_user_role failed, using direct update:', error.message);
        await this.updateUserRoleDirectly(userId, role);
      }
    } catch (error) {
      console.warn('RPC call failed, using direct update:', error);
      await this.updateUserRoleDirectly(userId, role);
    }
  }

  async setUserSuspended(userId: string, suspended: boolean): Promise<void> {
    const target = await this.getUserById(userId);
    if (!target) throw new Error('User not found.');

    if (suspended && target.role === UserRole.ADMIN && !target.isDeleted) {
      const activeAdmins = await this.getActiveAdminCount(userId);
      if (activeAdmins === 0) {
        this.assertCanMutateAdmin(target, 'suspend');
      }
    }

    if (!isConfigured || !supabase) {
      const idx = mockStore.store.users.findIndex((u) => u.id === userId);
      if (idx === -1) throw new Error('User not found.');
      mockStore.store.users[idx] = {
        ...mockStore.store.users[idx],
        isDeleted: suspended,
        updatedAt: new Date().toISOString(),
      };
      mockStore.save();
      return;
    }

    const { error } = await (supabase.from('users') as any)
      .update({
        is_deleted: suspended,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
  }

  private async updateUserRoleDirectly(userId: string, role: UserRole): Promise<void> {
    if (!supabase) return;
    
    const { error } = await (supabase.from('users') as any)
      .update({ 
        role: role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
  }

  async approveProvider(providerId: string): Promise<void> {
    await api.moderateProvider(providerId, ModerationStatus.APPROVED);

    // Fix: Ensure user role is updated to PROVIDER to satisfy RLS
    if (isConfigured && supabase) {
        const { data } = await (supabase.from('providers') as any).select('user_id').eq('id', providerId).single();
        if (data?.user_id) {
            await this.updateUserRole(data.user_id, UserRole.PROVIDER);
        }
    }
  }

  async rejectProvider(providerId: string): Promise<void> {
    await api.moderateProvider(providerId, ModerationStatus.REJECTED);
  }

  async createUser(data: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    role: UserRole; 
    subscriptionTier?: SubscriptionTier; 
  }): Promise<void> {
    if (!isConfigured || !supabase) {
      // Mock Mode
      const user = await authService.register({
        email: data.email,
        password: 'password', // Default password for admin-created users
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role
      });

      if (data.role === UserRole.PROVIDER && data.subscriptionTier) {
        const provider = await providerService.getProviderByUserId(user.id);
        if (provider) {
          await providerService.updateProvider(provider.id, { 
            subscriptionTier: data.subscriptionTier,
            subscriptionStatus: SubscriptionStatus.ACTIVE,
            onboardingComplete: true // Auto-complete for admin created? Maybe.
          });
        }
      }
      return;
    }

    // Supabase Mode (Real)
    // Admin creation usually requires service_role key to bypass email verification or different endpoint
    // For now, we use the same flow but might fail if email confirm enabled.
    // Assuming this is for internal tool where we might have appropriate setup.
    // Or we just use signUp and let them verify.
    // But we need to set the role/tier immediately.
    
    // NOTE: This implementation is limited by client-side admin capabilities in Supabase.
    // In a real app, this should call an Edge Function.
    console.warn("Creating user via client-side admin is limited. Using basic registration.");
    
    // We can't easily register another user while logged in as admin without logging out.
    // So we likely need an RPC or Function. 
    // Falling back to just logging the attempt for now if not mock.
    throw new Error("User creation in Supabase mode requires backend function.");
  }

  async approveApplication(applicationId: string): Promise<void> {
    if (!isConfigured || !supabase) {
      await this.approveProvider(applicationId);
      return;
    }
    
    try {
      const { error } = await (supabase.rpc as any)('approve_provider_application', { 
          application_id: applicationId 
      });
      
      if (error) {
        console.warn('RPC approve_provider_application failed, using moderateProvider:', error.message);
        await this.approveProvider(applicationId);
      }
    } catch (error) {
      console.warn('RPC call failed, using moderateProvider:', error);
      await this.approveProvider(applicationId);
    }
  }

  async rejectApplication(applicationId: string, reason: string): Promise<void> {
    if (!isConfigured || !supabase) {
      await this.rejectProvider(applicationId);
      return;
    }
    
    try {
      const { error } = await (supabase.rpc as any)('reject_provider_application', { 
          application_id: applicationId,
          reason: reason
      });
      
      if (error) {
        console.warn('RPC reject_provider_application failed, using moderateProvider:', error.message);
        await this.rejectProvider(applicationId);
      }
    } catch (error) {
      console.warn('RPC call failed, using moderateProvider:', error);
      await this.rejectProvider(applicationId);
    }
  }
}

export const adminService = new AdminService();
