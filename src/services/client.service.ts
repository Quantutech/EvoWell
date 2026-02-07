import {
  User,
  ClientProfile,
  Appointment,
  Conversation,
  Message,
  UserRole,
  AppointmentStatus,
  AppointmentType,
} from '../types';
import { supabase, isConfigured } from './supabase';
import { mockStore, ClientJournalEntry, ProviderClientNote } from './mockStore';
import { SEED_DATA } from '../data/seed';
import { errorHandler, AppError, ErrorSeverity } from './error-handler';
import { handleRequest } from './serviceUtils';
import { notificationService } from './notifications';
import { realtimeHub } from './realtime/hub';

export interface CreateAppointmentInput {
  providerId: string;
  clientId: string;
  dateTime: string;
  durationMinutes: number;
  type: AppointmentType;
  notes?: string;
  amountCents?: number;
}

export interface IClientService {
  getUserById(id: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  getClientProfile(userId: string): Promise<ClientProfile | undefined>;
  updateClientProfile(userId: string, data: Partial<ClientProfile>): Promise<ClientProfile>;
  getAllClients(): Promise<(User & { profile?: ClientProfile })[]>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;

  getAllAppointments(): Promise<Appointment[]>;
  getAppointmentsForUser(uid: string, role: UserRole): Promise<Appointment[]>;
  createAppointment(input: CreateAppointmentInput): Promise<Appointment>;
  bookAppointment(pid: string, cid: string, time: string): Promise<void>;

  getConversations(uid?: string): Promise<Conversation[]>;
  getMessages(cid: string): Promise<Message[]>;
  sendMessage(params: { conversationId: string; senderId: string; text: string }): Promise<Message>;
  getOrCreateConversation(u1: string, u2: string): Promise<Conversation>;
  markAsRead(cid: string, uid: string): Promise<void>;
  deleteMessage(id: string): Promise<void>;
  deleteMessagesByRoom(cid: string): Promise<void>;
  getUnreadCount(uid: string): Promise<number>;

  addClientJournalEntry(userId: string, note: string): Promise<ClientJournalEntry>;
  getClientJournalEntries(userId: string): Promise<ClientJournalEntry[]>;
  upsertProviderClientNote(providerId: string, clientId: string, note: string): Promise<void>;
  getProviderClientNote(providerId: string, clientId: string): Promise<string | undefined>;
}

function formatUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role as UserRole,
    timezone: row.timezone || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isDeleted: row.is_deleted || false,
  };
}

function buildAppointmentWithRelations(appointment: Appointment): Appointment {
  const users = mockStore.store.users.length > 0 ? mockStore.store.users : SEED_DATA.users;
  const providers = mockStore.store.providers.length > 0 ? mockStore.store.providers : SEED_DATA.providers;
  const client = users.find((u) => u.id === appointment.clientId);
  const provider = providers.find((p) => p.id === appointment.providerId);

  return {
    ...appointment,
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
}

function parseAppointmentDateTime(raw: string): string {
  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) return direct.toISOString();

  const [datePart, timePart] = raw.split(' at ');
  if (!datePart || !timePart) return new Date().toISOString();

  const parsed = new Date(`${datePart} ${timePart}`);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();

  return new Date().toISOString();
}

function createConversationFromMessages(messages: Message[]): Conversation[] {
  const byConversation = new Map<string, Conversation>();

  for (const message of messages) {
    const existing = byConversation.get(message.conversation_id);

    if (!existing) {
      byConversation.set(message.conversation_id, {
        id: message.conversation_id,
        participant_1_id: message.sender_id,
        participant_2_id: message.receiver_id,
        created_at: message.created_at,
        last_message_at: message.created_at,
      });
      continue;
    }

    if (new Date(message.created_at).getTime() > new Date(existing.last_message_at).getTime()) {
      existing.last_message_at = message.created_at;
    }
  }

  return Array.from(byConversation.values());
}

function sortByNewestDate<T>(items: T[], selectDate: (item: T) => string): T[] {
  return [...items].sort(
    (a, b) => new Date(selectDate(b)).getTime() - new Date(selectDate(a)).getTime(),
  );
}

function hasAppointmentCollision(
  appointments: Appointment[],
  candidate: {
    providerId: string;
    dateTime: string;
    durationMinutes: number;
  },
): boolean {
  const start = new Date(candidate.dateTime).getTime();
  const end = start + candidate.durationMinutes * 60 * 1000;

  return appointments.some((appointment) => {
    if (appointment.providerId !== candidate.providerId) return false;
    if (
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.REJECTED
    ) {
      return false;
    }

    const otherStart = new Date(appointment.dateTime).getTime();
    const otherEnd = otherStart + (appointment.durationMinutes || 60) * 60 * 1000;
    return start < otherEnd && end > otherStart;
  });
}

class MockClientService implements IClientService {
  private ensureCollections() {
    const store = mockStore.store as any;
    if (!Array.isArray(store.appointments)) store.appointments = [...SEED_DATA.appointments];
    if (!Array.isArray(store.messages)) store.messages = [...SEED_DATA.messages];
    if (!Array.isArray(store.conversations)) {
      store.conversations = createConversationFromMessages(store.messages);
    }
    if (!Array.isArray(store.notifications)) store.notifications = [];
    if (!Array.isArray(store.clientJournalEntries)) store.clientJournalEntries = [];
    if (!Array.isArray(store.providerClientNotes)) store.providerClientNotes = [];
  }

  private resolveMessageLink(userId: string): string {
    const user = mockStore.store.users.find((candidate) => candidate.id === userId);
    if (!user) return '/notifications';

    if (user.role === UserRole.ADMIN) return '/admin?tab=messages';
    if (user.role === UserRole.PROVIDER) return '/console/support';
    return '/portal';
  }

  async getUserById(id: string): Promise<User | undefined> {
    return mockStore.store.users.find((u) => u.id === id);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return handleRequest(async () => {
      const idx = mockStore.store.users.findIndex((u) => u.id === id);
      if (idx !== -1) {
        mockStore.store.users[idx] = {
          ...mockStore.store.users[idx],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        mockStore.save();
        return mockStore.store.users[idx];
      }

      const seedUser = SEED_DATA.users.find((u) => u.id === id);
      if (!seedUser) throw new AppError('User not found', 'NOT_FOUND');

      const updated = {
        ...seedUser,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      mockStore.store.users.push(updated);
      mockStore.save();
      return updated;
    }, 'updateUser');
  }

  async getClientProfile(userId: string): Promise<ClientProfile | undefined> {
    return mockStore.store.clientProfiles.find((cp) => cp.userId === userId);
  }

  async updateClientProfile(userId: string, data: Partial<ClientProfile>): Promise<ClientProfile> {
    return handleRequest(async () => {
      let idx = mockStore.store.clientProfiles.findIndex((cp) => cp.userId === userId);
      if (idx === -1) {
        const createdAt = new Date().toISOString();
        const profile: ClientProfile = {
          id: `cp-${userId}`,
          userId,
          intakeStatus: 'PENDING',
          documents: [],
          createdAt,
          updatedAt: createdAt,
          preferences: { communication: 'email', language: 'English' },
        };
        mockStore.store.clientProfiles.push(profile);
        idx = mockStore.store.clientProfiles.length - 1;
      }

      mockStore.store.clientProfiles[idx] = {
        ...mockStore.store.clientProfiles[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      mockStore.save();
      return mockStore.store.clientProfiles[idx];
    }, 'updateClientProfile');
  }

  async getAllClients(): Promise<(User & { profile?: ClientProfile })[]> {
    const clients = mockStore.store.users.filter((u) => u.role === UserRole.CLIENT);
    return clients.map((user) => ({
      ...user,
      profile: mockStore.store.clientProfiles.find((profile) => profile.userId === user.id),
    }));
  }

  async getAllUsers(): Promise<User[]> {
    return [...mockStore.store.users];
  }

  async deleteUser(id: string): Promise<void> {
    this.ensureCollections();

    mockStore.store.users = mockStore.store.users.filter((u) => u.id !== id);
    mockStore.store.clientProfiles = mockStore.store.clientProfiles.filter((cp) => cp.userId !== id);
    mockStore.store.providers = mockStore.store.providers.filter((provider) => provider.userId !== id);
    mockStore.store.appointments = mockStore.store.appointments.filter(
      (appointment) => appointment.clientId !== id,
    );

    mockStore.store.conversations = mockStore.store.conversations.filter(
      (conversation) =>
        conversation.participant_1_id !== id && conversation.participant_2_id !== id,
    );
    const validConversationIds = new Set(mockStore.store.conversations.map((c) => c.id));
    mockStore.store.messages = mockStore.store.messages.filter((message) =>
      validConversationIds.has(message.conversation_id),
    );

    mockStore.save();
  }

  async getAllAppointments(): Promise<Appointment[]> {
    this.ensureCollections();
    return sortByNewestDate(
      mockStore.store.appointments.map(buildAppointmentWithRelations),
      (appointment) => appointment.dateTime,
    );
  }

  async getAppointmentsForUser(uid: string, role: UserRole): Promise<Appointment[]> {
    this.ensureCollections();

    let appointments = [...mockStore.store.appointments];

    if (role === UserRole.PROVIDER) {
      const providerIds = new Set(
        mockStore.store.providers
          .filter((provider) => provider.userId === uid || provider.id === uid)
          .map((provider) => provider.id),
      );
      appointments = appointments.filter((appointment) => providerIds.has(appointment.providerId));
    } else {
      appointments = appointments.filter((appointment) => appointment.clientId === uid);
    }

    return sortByNewestDate(
      appointments.map(buildAppointmentWithRelations),
      (appointment) => appointment.dateTime,
    );
  }

  async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    this.ensureCollections();

    if (
      hasAppointmentCollision(mockStore.store.appointments, {
        providerId: input.providerId,
        dateTime: input.dateTime,
        durationMinutes: input.durationMinutes,
      })
    ) {
      throw new AppError(
        'This time slot is no longer available. Please pick another time.',
        'APPOINTMENT_COLLISION',
        ErrorSeverity.WARNING,
      );
    }

    const now = new Date().toISOString();
    const appointment: Appointment = {
      id: `appt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      providerId: input.providerId,
      clientId: input.clientId,
      dateTime: input.dateTime,
      durationMinutes: input.durationMinutes,
      status: AppointmentStatus.PENDING,
      type: input.type,
      paymentStatus: (input.amountCents || 0) > 0 ? 'pending' : 'exempted',
      amountCents: input.amountCents,
      notes: input.notes,
      createdAt: now,
    };

    mockStore.store.appointments.push(appointment);
    mockStore.save();

    const provider = mockStore.store.providers.find((candidate) => candidate.id === input.providerId);
    if (provider) {
      await notificationService.createNotification({
        userId: provider.userId,
        type: 'appointment',
        title: 'New Appointment Request',
        message: 'A client requested a new session.',
        link: '/console/patients',
      });
    }

    await notificationService.createNotification({
      userId: input.clientId,
      type: 'appointment',
      title: 'Appointment Requested',
      message: 'Your appointment request was submitted successfully.',
      link: '/portal',
    });

    realtimeHub.publish('appointments', {
      appointmentId: appointment.id,
      status: appointment.status,
      providerId: appointment.providerId,
      clientId: appointment.clientId,
      dateTime: appointment.dateTime,
    });

    return buildAppointmentWithRelations(appointment);
  }

  async bookAppointment(pid: string, cid: string, time: string): Promise<void> {
    await this.createAppointment({
      providerId: pid,
      clientId: cid,
      dateTime: parseAppointmentDateTime(time),
      durationMinutes: 60,
      type: AppointmentType.VIDEO,
    });
  }

  async getConversations(uid?: string): Promise<Conversation[]> {
    this.ensureCollections();
    const source = uid
      ? mockStore.store.conversations.filter(
          (conversation) =>
            conversation.participant_1_id === uid || conversation.participant_2_id === uid,
        )
      : mockStore.store.conversations;

    return sortByNewestDate(source, (conversation) => conversation.last_message_at);
  }

  async getMessages(cid: string): Promise<Message[]> {
    this.ensureCollections();
    return [...mockStore.store.messages]
      .filter((message) => message.conversation_id === cid)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  async sendMessage(params: { conversationId: string; senderId: string; text: string }): Promise<Message> {
    this.ensureCollections();

    const conversation = mockStore.store.conversations.find((item) => item.id === params.conversationId);
    if (!conversation) throw new AppError('Conversation not found', 'NOT_FOUND');

    const receiverId =
      conversation.participant_1_id === params.senderId
        ? conversation.participant_2_id
        : conversation.participant_1_id;

    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      conversation_id: params.conversationId,
      sender_id: params.senderId,
      receiver_id: receiverId,
      content: params.text,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    mockStore.store.messages.push(message);
    conversation.last_message_at = message.created_at;
    mockStore.save();

    await notificationService.createNotification({
      userId: receiverId,
      type: 'message',
      title: 'New Message',
      message: 'You received a new message.',
      link: this.resolveMessageLink(receiverId),
    });

    realtimeHub.publish('messages', {
      conversationId: params.conversationId,
      message,
    });

    return message;
  }

  async getOrCreateConversation(u1: string, u2: string): Promise<Conversation> {
    this.ensureCollections();

    const existing = mockStore.store.conversations.find(
      (conversation) =>
        (conversation.participant_1_id === u1 && conversation.participant_2_id === u2) ||
        (conversation.participant_1_id === u2 && conversation.participant_2_id === u1),
    );

    if (existing) return existing;

    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      participant_1_id: u1,
      participant_2_id: u2,
      created_at: now,
      last_message_at: now,
    };

    mockStore.store.conversations.push(conversation);
    mockStore.save();
    return conversation;
  }

  async markAsRead(cid: string, uid: string): Promise<void> {
    this.ensureCollections();

    let changed = false;
    mockStore.store.messages = mockStore.store.messages.map((message) => {
      if (message.conversation_id !== cid || message.receiver_id !== uid || message.is_read) {
        return message;
      }
      changed = true;
      return { ...message, is_read: true };
    });

    if (changed) {
      mockStore.save();
      realtimeHub.publish('messages', {
        conversationId: cid,
        action: 'mark-read',
        userId: uid,
      });
    }
  }

  async deleteMessage(id: string): Promise<void> {
    this.ensureCollections();
    mockStore.store.messages = mockStore.store.messages.filter((message) => message.id !== id);
    mockStore.save();
  }

  async deleteMessagesByRoom(cid: string): Promise<void> {
    this.ensureCollections();
    mockStore.store.messages = mockStore.store.messages.filter(
      (message) => message.conversation_id !== cid,
    );
    mockStore.store.conversations = mockStore.store.conversations.filter(
      (conversation) => conversation.id !== cid,
    );
    mockStore.save();
  }

  async getUnreadCount(uid: string): Promise<number> {
    this.ensureCollections();
    return mockStore.store.messages.filter((message) => !message.is_read && message.receiver_id === uid)
      .length;
  }

  async addClientJournalEntry(userId: string, note: string): Promise<ClientJournalEntry> {
    this.ensureCollections();

    const entry: ClientJournalEntry = {
      id: `journal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      note,
      createdAt: new Date().toISOString(),
    };

    mockStore.store.clientJournalEntries.push(entry);
    mockStore.save();

    return entry;
  }

  async getClientJournalEntries(userId: string): Promise<ClientJournalEntry[]> {
    this.ensureCollections();
    return sortByNewestDate(
      mockStore.store.clientJournalEntries.filter((entry) => entry.userId === userId),
      (entry) => entry.createdAt,
    );
  }

  async upsertProviderClientNote(providerId: string, clientId: string, note: string): Promise<void> {
    this.ensureCollections();

    const idx = mockStore.store.providerClientNotes.findIndex(
      (entry) => entry.providerId === providerId && entry.clientId === clientId,
    );

    const updated: ProviderClientNote = {
      id:
        idx === -1
          ? `pcn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
          : mockStore.store.providerClientNotes[idx].id,
      providerId,
      clientId,
      note,
      updatedAt: new Date().toISOString(),
    };

    if (idx === -1) {
      mockStore.store.providerClientNotes.push(updated);
    } else {
      mockStore.store.providerClientNotes[idx] = updated;
    }

    mockStore.save();
  }

  async getProviderClientNote(providerId: string, clientId: string): Promise<string | undefined> {
    this.ensureCollections();
    const note = mockStore.store.providerClientNotes.find(
      (entry) => entry.providerId === providerId && entry.clientId === clientId,
    );
    return note?.note;
  }
}

class SupabaseClientService implements IClientService {
  async getUserById(id: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) errorHandler.logError(error, { method: 'getUserById', id });
    return data ? formatUser(data) : undefined;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return handleRequest(async () => {
      const { error } = await (supabase.from('users') as any)
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role,
          email: data.email,
          timezone: data.timezone,
          is_deleted: data.isDeleted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return (await this.getUserById(id))!;
    }, 'updateUser');
  }

  async getClientProfile(userId: string): Promise<ClientProfile | undefined> {
    const { data, error } = await (supabase.from('client_profiles') as any)
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error || !data) return undefined;

    return {
      id: data.id,
      userId: data.user_id,
      intakeStatus: data.intake_status || 'PENDING',
      documents: data.documents || [],
      bio: data.bio || undefined,
      dateOfBirth: data.date_of_birth || undefined,
      gender: data.gender || undefined,
      pronouns: data.pronouns || undefined,
      imageUrl: data.image_url || undefined,
      phoneNumber: data.phone_number || undefined,
      address: data.address || undefined,
      emergencyContact: data.emergency_contact || undefined,
      wellnessLog: data.wellness_log || [],
      habits: data.habits || [],
      preferences: data.preferences || { communication: 'email', language: 'English' },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateClientProfile(userId: string, data: Partial<ClientProfile>): Promise<ClientProfile> {
    const payload = {
      intake_status: data.intakeStatus,
      documents: data.documents,
      bio: data.bio,
      date_of_birth: data.dateOfBirth,
      gender: data.gender,
      pronouns: data.pronouns,
      image_url: data.imageUrl,
      phone_number: data.phoneNumber,
      address: data.address,
      emergency_contact: data.emergencyContact,
      wellness_log: data.wellnessLog,
      habits: data.habits,
      preferences: data.preferences,
      updated_at: new Date().toISOString(),
    };

    const existing = await this.getClientProfile(userId);

    if (!existing) {
      const { error } = await (supabase.from('client_profiles') as any).insert({
        user_id: userId,
        intake_status: data.intakeStatus || 'PENDING',
        documents: data.documents || [],
        bio: data.bio || null,
        date_of_birth: data.dateOfBirth || null,
        gender: data.gender || null,
        pronouns: data.pronouns || null,
        image_url: data.imageUrl || null,
        phone_number: data.phoneNumber || null,
        address: data.address || null,
        emergency_contact: data.emergencyContact || null,
        wellness_log: data.wellnessLog || [],
        habits: data.habits || [],
        preferences: data.preferences || { communication: 'email', language: 'English' },
      });

      if (error) throw error;
    } else {
      const { error } = await (supabase.from('client_profiles') as any)
        .update(payload)
        .eq('user_id', userId);
      if (error) throw error;
    }

    return (await this.getClientProfile(userId)) as ClientProfile;
  }

  async getAllClients(): Promise<(User & { profile?: ClientProfile })[]> {
    const { data, error } = await supabase.from('users').select('*').eq('role', UserRole.CLIENT);
    if (error) throw error;

    const users = (data || []).map(formatUser);
    const profiles = await Promise.all(users.map((user) => this.getClientProfile(user.id)));

    return users.map((user, index) => ({
      ...user,
      profile: profiles[index] || undefined,
    }));
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return (data || []).map(formatUser);
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  }

  async getAllAppointments(): Promise<Appointment[]> {
    const { data, error } = await (supabase.from('appointments') as any).select('*');
    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      providerId: row.provider_id,
      clientId: row.client_id,
      dateTime: row.date_time,
      durationMinutes: row.duration_minutes || 60,
      status: row.status,
      type: row.type,
      paymentStatus: row.payment_status || 'pending',
      paymentIntentId: row.payment_intent_id || undefined,
      amountCents: row.amount_cents || undefined,
      notes: row.notes || undefined,
      meetingLink: row.meeting_link || undefined,
      createdAt: row.created_at || undefined,
    }));
  }

  async getAppointmentsForUser(uid: string, role: UserRole): Promise<Appointment[]> {
    let query = (supabase.from('appointments') as any).select('*');
    if (role === UserRole.PROVIDER) {
      const { data: provider } = await (supabase.from('providers') as any)
        .select('id')
        .eq('user_id', uid)
        .single();
      if (!provider?.id) return [];
      query = query.eq('provider_id', provider.id);
    } else {
      query = query.eq('client_id', uid);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      providerId: row.provider_id,
      clientId: row.client_id,
      dateTime: row.date_time,
      durationMinutes: row.duration_minutes || 60,
      status: row.status,
      type: row.type,
      paymentStatus: row.payment_status || 'pending',
      paymentIntentId: row.payment_intent_id || undefined,
      amountCents: row.amount_cents || undefined,
      notes: row.notes || undefined,
      meetingLink: row.meeting_link || undefined,
      createdAt: row.created_at || undefined,
    }));
  }

  async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    const { data, error } = await (supabase.from('appointments') as any)
      .insert({
        provider_id: input.providerId,
        client_id: input.clientId,
        date_time: input.dateTime,
        duration_minutes: input.durationMinutes,
        type: input.type,
        notes: input.notes || null,
        status: AppointmentStatus.PENDING,
        payment_status: (input.amountCents || 0) > 0 ? 'pending' : 'exempted',
        amount_cents: input.amountCents || 0,
      })
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      providerId: data.provider_id,
      clientId: data.client_id,
      dateTime: data.date_time,
      durationMinutes: data.duration_minutes || 60,
      status: data.status,
      type: data.type,
      paymentStatus: data.payment_status || 'pending',
      paymentIntentId: data.payment_intent_id || undefined,
      amountCents: data.amount_cents || undefined,
      notes: data.notes || undefined,
      meetingLink: data.meeting_link || undefined,
      createdAt: data.created_at || undefined,
    };
  }

  async bookAppointment(pid: string, cid: string, time: string): Promise<void> {
    await this.createAppointment({
      providerId: pid,
      clientId: cid,
      dateTime: parseAppointmentDateTime(time),
      durationMinutes: 60,
      type: AppointmentType.VIDEO,
    });
  }

  async getConversations(uid?: string): Promise<Conversation[]> {
    let query = (supabase.from('conversations') as any).select('*');

    if (uid) {
      query = query.or(`participant_1_id.eq.${uid},participant_2_id.eq.${uid}`);
    }

    const { data, error } = await query.order('last_message_at', { ascending: false });
    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      participant_1_id: row.participant_1_id,
      participant_2_id: row.participant_2_id,
      last_message_at: row.last_message_at,
      created_at: row.created_at,
    }));
  }

  async getMessages(cid: string): Promise<Message[]> {
    const { data, error } = await (supabase.from('messages') as any)
      .select('*')
      .eq('conversation_id', cid)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      conversation_id: row.conversation_id,
      sender_id: row.sender_id,
      receiver_id: row.receiver_id,
      content: row.content,
      is_read: row.is_read || false,
      created_at: row.created_at,
    }));
  }

  async sendMessage(params: { conversationId: string; senderId: string; text: string }): Promise<Message> {
    const { data: conversationData, error: conversationError } = await (supabase
      .from('conversations') as any)
      .select('*')
      .eq('id', params.conversationId)
      .single();

    if (conversationError || !conversationData) throw conversationError || new Error('Conversation not found');

    const receiverId =
      conversationData.participant_1_id === params.senderId
        ? conversationData.participant_2_id
        : conversationData.participant_1_id;

    const { data, error } = await (supabase.from('messages') as any)
      .insert({
        conversation_id: params.conversationId,
        sender_id: params.senderId,
        receiver_id: receiverId,
        content: params.text,
        is_read: false,
      })
      .select('*')
      .single();

    if (error) throw error;

    await (supabase.from('conversations') as any)
      .update({ last_message_at: data.created_at })
      .eq('id', params.conversationId);

    return {
      id: data.id,
      conversation_id: data.conversation_id,
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      content: data.content,
      is_read: data.is_read || false,
      created_at: data.created_at,
    };
  }

  async getOrCreateConversation(u1: string, u2: string): Promise<Conversation> {
    const { data: existing, error: lookupError } = await (supabase.from('conversations') as any)
      .select('*')
      .or(
        `and(participant_1_id.eq.${u1},participant_2_id.eq.${u2}),and(participant_1_id.eq.${u2},participant_2_id.eq.${u1})`,
      )
      .limit(1)
      .maybeSingle();

    if (!lookupError && existing) {
      return {
        id: existing.id,
        participant_1_id: existing.participant_1_id,
        participant_2_id: existing.participant_2_id,
        last_message_at: existing.last_message_at,
        created_at: existing.created_at,
      };
    }

    const now = new Date().toISOString();
    const { data, error } = await (supabase.from('conversations') as any)
      .insert({
        participant_1_id: u1,
        participant_2_id: u2,
        created_at: now,
        last_message_at: now,
      })
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      participant_1_id: data.participant_1_id,
      participant_2_id: data.participant_2_id,
      last_message_at: data.last_message_at,
      created_at: data.created_at,
    };
  }

  async markAsRead(cid: string, uid: string): Promise<void> {
    const { error } = await (supabase.from('messages') as any)
      .update({ is_read: true })
      .eq('conversation_id', cid)
      .eq('receiver_id', uid)
      .eq('is_read', false);

    if (error) throw error;
  }

  async deleteMessage(id: string): Promise<void> {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) throw error;
  }

  async deleteMessagesByRoom(cid: string): Promise<void> {
    const { error } = await supabase.from('messages').delete().eq('conversation_id', cid);
    if (error) throw error;
  }

  async getUnreadCount(uid: string): Promise<number> {
    const { count, error } = await (supabase.from('messages') as any)
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', uid)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }

  async addClientJournalEntry(_userId: string, _note: string): Promise<ClientJournalEntry> {
    throw new Error('Journal entries are not yet implemented in Supabase mode');
  }

  async getClientJournalEntries(_userId: string): Promise<ClientJournalEntry[]> {
    return [];
  }

  async upsertProviderClientNote(_providerId: string, _clientId: string, _note: string): Promise<void> {
    throw new Error('Provider client notes are not yet implemented in Supabase mode');
  }

  async getProviderClientNote(_providerId: string, _clientId: string): Promise<string | undefined> {
    return undefined;
  }
}

export const clientService = isConfigured ? new SupabaseClientService() : new MockClientService();
