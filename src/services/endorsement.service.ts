import { supabase, isConfigured } from './supabase';
import { handleRequest } from './serviceUtils';
import { Endorsement, EndorsementReason, EndorsementType, UserRole } from '../types';
import { mockStore } from './mockStore';
import { auditService } from './audit';
import { AuditActionType, AuditResourceType } from '../types';
import { AppError } from './error-handler';

export interface IEndorsementService {
  createEndorsement(endorsedProviderId: string, reason?: EndorsementReason): Promise<Endorsement>;
  getEndorsementsForProvider(providerId: string): Promise<Endorsement[]>;
  revokeEndorsement(endorsementId: string): Promise<void>;
  hasEndorsed(providerId: string, userId: string): Promise<boolean>;
  getEndorsementSummary(providerId: string): Promise<{ evowell: boolean; peerCount: number }>;
  getAllEndorsements(): Promise<Endorsement[]>;
}

class SupabaseEndorsementService implements IEndorsementService {
  async createEndorsement(endorsedProviderId: string, reason?: EndorsementReason): Promise<Endorsement> {
    return handleRequest(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new AppError('Authentication required', 'UNAUTHORIZED');

      // Get user role
      const { data: userData } = await (supabase.from('users') as any).select('role').eq('id', user.id).single();
      if (!userData) throw new AppError('User profile not found', 'NOT_FOUND');

      const roleStr = userData.role.toUpperCase();
      const role = (roleStr === 'ADMIN' ? 'admin' : roleStr === 'PROVIDER' ? 'provider' : null) as 'admin' | 'provider' | null;
      
      if (!role) {
        throw new AppError('Only providers and admins can endorse', 'FORBIDDEN');
      }

      // Check self-endorsement
      const { data: provider } = await (supabase.from('providers') as any).select('id').eq('user_id', user.id).maybeSingle();
      if (provider?.id === endorsedProviderId) {
        throw new AppError('You cannot endorse yourself', 'UNPROCESSABLE_ENTITY');
      }

      const endorsementType: EndorsementType = role === 'admin' ? 'evowell' : 'peer';

      const { data, error } = await (supabase.from('endorsements') as any).insert({
        endorsed_provider_id: endorsedProviderId,
        endorser_user_id: user.id,
        endorser_role: role,
        endorsement_type: endorsementType,
        reason: reason || null
      }).select().single();

      if (error) {
        if (error.code === '23505') throw new AppError('Already endorsed this provider', 'CONFLICT');
        throw error;
      }

      auditService.log(AuditActionType.CREATE, AuditResourceType.SYSTEM, data.id, { type: 'endorsement' });
      
      return this.formatEndorsement(data);
    }, 'createEndorsement');
  }

  async getEndorsementsForProvider(providerId: string): Promise<Endorsement[]> {
    return handleRequest(async () => {
      const { data, error } = await (supabase
        .from('endorsements') as any)
        .select(`
          *,
          endorser:users (
            first_name,
            last_name,
            providers (
              professional_title,
              image_url,
              profile_slug
            )
          )
        `)
        .eq('endorsed_provider_id', providerId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((item: any) => this.formatEndorsement(item));
    }, 'getEndorsementsForProvider');
  }

  async revokeEndorsement(endorsementId: string): Promise<void> {
    return handleRequest(async () => {
      const { error } = await (supabase
        .from('endorsements') as any)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', endorsementId);

      if (error) throw error;
      
      auditService.log(AuditActionType.DELETE, AuditResourceType.SYSTEM, endorsementId, { type: 'endorsement' });
    }, 'revokeEndorsement');
  }

  async hasEndorsed(providerId: string, userId: string): Promise<boolean> {
    const { data } = await (supabase
      .from('endorsements') as any)
      .select('id')
      .eq('endorsed_provider_id', providerId)
      .eq('endorser_user_id', userId)
      .is('deleted_at', null)
      .maybeSingle();
    
    return !!data;
  }

  async getEndorsementSummary(providerId: string): Promise<{ evowell: boolean; peerCount: number }> {
    const { data, error } = await (supabase
      .from('endorsements') as any)
      .select('endorsement_type')
      .eq('endorsed_provider_id', providerId)
      .is('deleted_at', null);

    if (error || !data) return { evowell: false, peerCount: 0 };

    return {
      evowell: data.some((e: any) => e.endorsement_type === 'evowell'),
      peerCount: data.filter((e: any) => e.endorsement_type === 'peer').length
    };
  }

  async getAllEndorsements(): Promise<Endorsement[]> {
    return handleRequest(async () => {
      const { data, error } = await (supabase
        .from('endorsements') as any)
        .select(`
          *,
          endorser:users (
            first_name,
            last_name,
            providers (
              professional_title,
              image_url,
              profile_slug
            )
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((item: any) => this.formatEndorsement(item));
    }, 'getAllEndorsements');
  }

  private formatEndorsement(row: any): Endorsement {
    const endorserProvider = row.endorser?.providers?.[0];
    return {
      id: row.id,
      endorsedProviderId: row.endorsed_provider_id,
      endorserUserId: row.endorser_user_id,
      endorserRole: row.endorser_role,
      endorsementType: row.endorsement_type,
      reason: row.reason,
      createdAt: row.created_at,
      deletedAt: row.deleted_at,
      endorser: row.endorser ? {
        firstName: row.endorser.first_name,
        lastName: row.endorser.last_name,
        professionalTitle: endorserProvider?.professional_title,
        imageUrl: endorserProvider?.image_url,
        profileSlug: endorserProvider?.profile_slug
      } : undefined
    };
  }
}

class MockEndorsementService implements IEndorsementService {
  async createEndorsement(endorsedProviderId: string, reason?: EndorsementReason): Promise<Endorsement> {
    return handleRequest(async () => {
      // Find current user (In mock mode, we often assume session exists or pick first admin/provider)
      // For realism, let's try to get from persistence if available
      const stored = localStorage.getItem('evowell_mock_session');
      let userId = '';
      if (stored) {
          const parsed = JSON.parse(stored);
          userId = parsed.userId;
      }
      
      const currentUser = mockStore.store.users.find(u => u.id === userId) || 
                          mockStore.store.users.find(u => u.role === UserRole.ADMIN || u.role === UserRole.PROVIDER);
      
      if (!currentUser) throw new AppError('No eligible mock user found', 'UNAUTHORIZED');

      const existing = mockStore.store.endorsements.find(e => 
        e.endorsedProviderId === endorsedProviderId && 
        e.endorserUserId === currentUser.id &&
        !e.deletedAt
      );
      if (existing) throw new AppError('Already endorsed this provider', 'CONFLICT');

      const role = currentUser.role === UserRole.ADMIN ? 'admin' : currentUser.role === UserRole.PROVIDER ? 'provider' : null;
      if (!role) throw new AppError('Only providers and admins can endorse', 'FORBIDDEN');
      
      const endorsementType: EndorsementType = role === 'admin' ? 'evowell' : 'peer';

      // Self-endorsement check
      const userProvider = mockStore.store.providers.find(p => p.userId === currentUser.id);
      if (userProvider?.id === endorsedProviderId) {
        throw new AppError('You cannot endorse yourself', 'UNPROCESSABLE_ENTITY');
      }

      const newEndorsement: Endorsement = {
        id: `end-${Date.now()}`,
        endorsedProviderId,
        endorserUserId: currentUser.id,
        endorserRole: role,
        endorsementType,
        reason,
        createdAt: new Date().toISOString(),
        endorser: {
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          professionalTitle: userProvider?.professionalTitle,
          imageUrl: userProvider?.imageUrl,
          profileSlug: userProvider?.profileSlug
        }
      };

      mockStore.store.endorsements.push(newEndorsement);
      mockStore.save();
      return newEndorsement;
    }, 'createEndorsement');
  }

  async getEndorsementsForProvider(providerId: string): Promise<Endorsement[]> {
    return mockStore.store.endorsements.filter(e => e.endorsedProviderId === providerId && !e.deletedAt);
  }

  async revokeEndorsement(endorsementId: string): Promise<void> {
    const idx = mockStore.store.endorsements.findIndex(e => e.id === endorsementId);
    if (idx !== -1) {
      mockStore.store.endorsements[idx].deletedAt = new Date().toISOString();
      mockStore.save();
    }
  }

  async hasEndorsed(providerId: string, userId: string): Promise<boolean> {
    return mockStore.store.endorsements.some(e => 
      e.endorsedProviderId === providerId && e.endorserUserId === userId && !e.deletedAt
    );
  }

  async getEndorsementSummary(providerId: string): Promise<{ evowell: boolean; peerCount: number }> {
    const relevant = mockStore.store.endorsements.filter(e => e.endorsedProviderId === providerId && !e.deletedAt);
    return {
      evowell: relevant.some(e => e.endorsementType === 'evowell'),
      peerCount: relevant.filter(e => e.endorsementType === 'peer').length
    };
  }

  async getAllEndorsements(): Promise<Endorsement[]> {
    return mockStore.store.endorsements.filter(e => !e.deletedAt);
  }
}

export const endorsementService = isConfigured ? new SupabaseEndorsementService() : new MockEndorsementService();
