import {
  User,
  ProviderProfile,
  ClientProfile,
  Resource,
  UserRole,
  Endorsement,
  WishlistEntry,
  Appointment,
  Conversation,
  Message,
  Notification,
  UserRoleAssignment,
  PermissionOverride,
  ProviderEntitlementOverride,
  ConfigCatalog,
  ConfigEntry,
} from '../types';
import { persistence } from './persistence';
import { loadInitialData } from '../data/utils/loader';

export interface ClientJournalEntry {
  id: string;
  userId: string;
  note: string;
  createdAt: string;
}

export interface ProviderClientNote {
  id: string;
  providerId: string;
  clientId: string;
  note: string;
  updatedAt: string;
}

interface MockStoreData {
  users: User[];
  providers: ProviderProfile[];
  blogs: any[];
  specialties: any[];
  testimonials: any[];
  clientProfiles: ClientProfile[];
  resources: Resource[];
  endorsements: Endorsement[];
  wishlist: WishlistEntry[];
  hiddenResourceIds: string[];
  languages: string[];
  genders: string[];
  appointments: Appointment[];
  conversations: Conversation[];
  messages: Message[];
  notifications: Notification[];
  clientJournalEntries: ClientJournalEntry[];
  providerClientNotes: ProviderClientNote[];
  userRoleAssignments: UserRoleAssignment[];
  userPermissionOverrides: PermissionOverride[];
  providerEntitlementOverrides: ProviderEntitlementOverride[];
  configCatalogs: ConfigCatalog[];
  configEntries: ConfigEntry[];
  lastUpdated?: number;
  isDemoMode?: boolean;
}

class MockStoreService {
  public store: MockStoreData;

  constructor() {
    this.store = this.initializeStore();
  }

  private initializeStore(): MockStoreData {
    const initialData = loadInitialData();
    const stored = persistence.loadStore();

    // If persistence has data, merge it with initial seed/mock data 
    // but prefer persistence for stateful changes
    const store: MockStoreData = {
      ...initialData,
      clientProfiles: stored.clientProfiles || [],
      resources: (stored as any).resources || [],
      endorsements: (stored as any).endorsements || initialData.endorsements || [],
      wishlist: (stored as any).wishlist || [],
      hiddenResourceIds: (stored as any).hiddenResourceIds || [],
      languages: stored.languages || ['English', 'Spanish', 'Mandarin', 'French', 'German'],
      genders: stored.genders || ['Male', 'Female', 'Non-Binary', 'Prefer not to say'],
      appointments: (stored as any).appointments || initialData.appointments || [],
      conversations: (stored as any).conversations || initialData.conversations || [],
      messages: (stored as any).messages || initialData.messages || [],
      notifications: (stored as any).notifications || initialData.notifications || [],
      clientJournalEntries:
        (stored as any).clientJournalEntries || initialData.clientJournalEntries || [],
      providerClientNotes:
        (stored as any).providerClientNotes || initialData.providerClientNotes || [],
      userRoleAssignments:
        (stored as any).userRoleAssignments || initialData.userRoleAssignments || [],
      userPermissionOverrides:
        (stored as any).userPermissionOverrides || initialData.userPermissionOverrides || [],
      providerEntitlementOverrides:
        (stored as any).providerEntitlementOverrides || initialData.providerEntitlementOverrides || [],
      configCatalogs: (stored as any).configCatalogs || initialData.configCatalogs || [],
      configEntries: (stored as any).configEntries || initialData.configEntries || [],
    };

    // Load from seed data if persistence is empty
    if (store.clientProfiles.length === 0 && initialData.clientProfiles) {
      store.clientProfiles = [...initialData.clientProfiles];
    }

    // Auto-generate client profiles if still missing for remaining clients
    const existingUserIds = new Set(store.clientProfiles.map(p => p.userId));
    const remainingClients = store.users.filter(u => u.role === UserRole.CLIENT && !existingUserIds.has(u.id));
    
    if (remainingClients.length > 0) {
      const generated: ClientProfile[] = remainingClients.map(u => ({
        id: `cp-${u.id}`,
        userId: u.id,
        intakeStatus: 'COMPLETED',
        documents: [],
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        preferences: { communication: 'email' as const, language: 'English' }
      }));
      store.clientProfiles = [...store.clientProfiles, ...generated];
    }

    // Auto-generate wishlist items if missing
    if (store.wishlist.length === 0) {
        const client = store.users.find(u => u.role === UserRole.CLIENT);
        const providers = store.providers.slice(0, 3);
        if (client && providers.length > 0) {
            store.wishlist = providers.map((p, index) => ({
                id: `wl-mock-${index}`,
                providerId: p.id,
                clientId: client.id,
                createdAt: new Date().toISOString()
            }));
        }
    }

    return store;
  }

  public resetData() {
    localStorage.removeItem('evowell_mock_store');
    this.store = this.initializeStore();
    this.save();
    window.location.reload();
  }

  public save() {
    persistence.saveStore(this.store);
    // Also update the loader's source
    localStorage.setItem('evowell_mock_store', JSON.stringify({
      ...this.store,
      lastUpdated: Date.now()
    }));
  }
}

export const mockStore = new MockStoreService();
