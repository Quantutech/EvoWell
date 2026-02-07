import { User, ClientProfile, Appointment, Conversation, Message, UserRole, AuditActionType, AuditResourceType, AppointmentStatus } from '../types';
import { supabase, isConfigured } from './supabase';
import { mockStore } from './mockStore';
import { SEED_DATA } from '../data/seed';
import { auditService } from './audit';
import { errorHandler, AppError } from './error-handler';
import { handleRequest } from './serviceUtils';
import { persistence } from './persistence';

export interface IClientService {
  getUserById(id: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  getClientProfile(userId: string): Promise<ClientProfile | undefined>;
  updateClientProfile(userId: string, data: Partial<ClientProfile>): Promise<ClientProfile>;
  getAllClients(): Promise<(User & { profile?: ClientProfile })[]>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  
  // Appointments (Mock mostly)
  getAllAppointments(): Promise<Appointment[]>;
  getAppointmentsForUser(uid: string, role: UserRole): Promise<Appointment[]>;
  bookAppointment(pid: string, cid: string, time: string): Promise<void>;
  
  // Messaging (Mock mostly)
  getConversations(uid?: string): Promise<Conversation[]>;
  getMessages(cid: string): Promise<Message[]>;
  sendMessage(params: any): Promise<Message>;
  getOrCreateConversation(u1: string, u2: string): Promise<Conversation>;
  markAsRead(cid: string, uid: string): Promise<void>;
  deleteMessage(id: string): Promise<void>;
  deleteMessagesByRoom(cid: string): Promise<void>;
  getUnreadCount(uid: string): Promise<number>;
}

// Helper to enrich appointments with client/provider data from seed
function enrichAppointments(uid: string, role: UserRole): Appointment[] {
  const appointments = SEED_DATA.appointments.filter((a) => {
    if (role === UserRole.PROVIDER) {
      const providerProfile = SEED_DATA.providers.find((p) => p.userId === uid);
      return providerProfile && a.providerId === providerProfile.id;
    }
    return a.clientId === uid;
  });

  return appointments.map((appt) => {
    const client = SEED_DATA.users.find((u) => u.id === appt.clientId);
    const provider = SEED_DATA.providers.find((p) => p.id === appt.providerId);

    return {
      ...appt,
      client: client
        ? {
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            imageUrl: '',
          }
        : undefined,
      provider: provider
        ? {
            professionalTitle: provider.professionalTitle,
            imageUrl: provider.imageUrl,
          }
        : undefined,
    };
  });
}

// Helper to format user
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

class MockClientService implements IClientService {
  async getUserById(id: string): Promise<User | undefined> {
    return mockStore.store.users.find((u) => u.id === id);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return handleRequest(async () => {
        const tempIdx = mockStore.store.users.findIndex(u => u.id === id);
        if (tempIdx !== -1) {
            mockStore.store.users[tempIdx] = { ...mockStore.store.users[tempIdx], ...data };
            mockStore.save();
            return mockStore.store.users[tempIdx];
        }
        const seedUser = SEED_DATA.users.find(u => u.id === id);
        if (seedUser) {
             const updated = { ...seedUser, ...data };
             mockStore.store.users.push(updated);
             mockStore.save();
             return updated;
        }
        throw new AppError("User not found", "NOT_FOUND");
    }, 'updateUser');
  }

  async getClientProfile(userId: string): Promise<ClientProfile | undefined> {
      return mockStore.store.clientProfiles.find(cp => cp.userId === userId);
  }

  async updateClientProfile(userId: string, data: Partial<ClientProfile>): Promise<ClientProfile> {
      return handleRequest(async () => {
          let idx = mockStore.store.clientProfiles.findIndex(cp => cp.userId === userId);
          if (idx === -1) {
              // Lazy create
              const newProfile: ClientProfile = {
                  id: `cp-${userId}`,
                  userId: userId,
                  intakeStatus: 'PENDING',
                  documents: [],
                  bio: data.bio,
                  dateOfBirth: data.dateOfBirth,
                  gender: data.gender,
                  pronouns: data.pronouns,
                  phoneNumber: data.phoneNumber,
                  address: data.address,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  preferences: { communication: 'email', language: 'English' }
              };
              mockStore.store.clientProfiles.push(newProfile);
              idx = mockStore.store.clientProfiles.length - 1;
          }
          
          mockStore.store.clientProfiles[idx] = { 
            ...mockStore.store.clientProfiles[idx], 
            ...data,
            updatedAt: new Date().toISOString()
          };
          mockStore.save();
          return mockStore.store.clientProfiles[idx];
      }, 'updateClientProfile');
  }

  async getAllClients(): Promise<(User & { profile?: ClientProfile })[]> {
      const clients = mockStore.store.users.filter(u => u.role === UserRole.CLIENT);
      return clients.map(u => ({
          ...u,
          profile: mockStore.store.clientProfiles.find(cp => cp.userId === u.id)
      }));
  }

  async getAllUsers(): Promise<User[]> {
      return [...mockStore.store.users];
  }

  async deleteUser(id: string): Promise<void> {
      mockStore.store.users = mockStore.store.users.filter((u) => u.id !== id);
      mockStore.store.clientProfiles = mockStore.store.clientProfiles.filter(
        (cp) => cp.userId !== id,
      );
      mockStore.store.providers = mockStore.store.providers.filter(
        (provider) => provider.userId !== id,
      );
      mockStore.save();
  }

  // Mocks
  async getAllAppointments(): Promise<Appointment[]> { return SEED_DATA.appointments; }
  async getAppointmentsForUser(uid: string, role: UserRole): Promise<Appointment[]> {
      return enrichAppointments(uid, role);
  }
  async bookAppointment(pid: string, cid: string, time: string): Promise<void> {}
  async getConversations(uid?: string): Promise<Conversation[]> { return []; }
  async getMessages(cid: string): Promise<Message[]> { return []; }
  async sendMessage(params: any): Promise<Message> { return {} as Message; }
  async getOrCreateConversation(u1: string, u2: string): Promise<Conversation> { return {} as Conversation; }
  async markAsRead(cid: string, uid: string): Promise<void> {}
  async deleteMessage(id: string): Promise<void> {}
  async deleteMessagesByRoom(cid: string): Promise<void> {}
  async getUnreadCount(uid: string): Promise<number> { return 0; }
}

class SupabaseClientService implements IClientService {
  async getUserById(id: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) errorHandler.logError(error, { method: 'getUserById', id });
    return data ? formatUser(data) : undefined;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return handleRequest(async () => {
        const { error } = await (supabase.from('users') as any).update({
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role,
          email: data.email,
          timezone: data.timezone,
          is_deleted: data.isDeleted,
          updated_at: new Date().toISOString()
        }).eq('id', id);
        
        if (error) throw error;
        return (await this.getUserById(id))!;
    }, 'updateUser');
  }

  async getClientProfile(userId: string): Promise<ClientProfile | undefined> {
      // Prod implementation would go here, currently undefined in original
      return undefined;
  }

  async updateClientProfile(userId: string, data: Partial<ClientProfile>): Promise<ClientProfile> {
      throw new Error("Prod not implemented for Client Profile");
  }

  async getAllClients(): Promise<(User & { profile?: ClientProfile })[]> {
      // Prod: Fetch users and join client_profiles
      // For now returning mock empty for prod safety
      return [];
  }

  async getAllUsers(): Promise<User[]> {
      // Original API didn't implement getAllUsers for Supabase?
      // "async getAllUsers(): Promise<User[]> { const allUsers = ...SEED_DATA... }"
      // It seems it was always mock. I should implement it for Supabase or return empty/throw.
      // I'll return empty or fetch from DB.
      // Since it wasn't there, I'll probably just return empty array or fetch simple list.
      const { data } = await supabase.from('users').select('*');
      return (data || []).map(formatUser);
  }

  async deleteUser(id: string): Promise<void> {
      await supabase.from('users').delete().eq('id', id);
  }

  // Mocks/Placeholders for Supabase until implemented
  async getAllAppointments(): Promise<Appointment[]> { return SEED_DATA.appointments; }
  async getAppointmentsForUser(uid: string, role: UserRole): Promise<Appointment[]> {
      return enrichAppointments(uid, role);
  }
  async bookAppointment(pid: string, cid: string, time: string): Promise<void> {}
  async getConversations(uid?: string): Promise<Conversation[]> { return []; }
  async getMessages(cid: string): Promise<Message[]> { return []; }
  async sendMessage(params: any): Promise<Message> { return {} as Message; }
  async getOrCreateConversation(u1: string, u2: string): Promise<Conversation> { return {} as Conversation; }
  async markAsRead(cid: string, uid: string): Promise<void> {}
  async deleteMessage(id: string): Promise<void> {}
  async deleteMessagesByRoom(cid: string): Promise<void> {}
  async getUnreadCount(uid: string): Promise<number> { return 0; }
}

export const clientService = isConfigured ? new SupabaseClientService() : new MockClientService();
