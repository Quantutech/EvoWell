import { User, ProviderProfile, ClientProfile, UserRole } from '../types';
import { SEED_DATA } from './seedData';
import { persistence } from './persistence';

interface MockStoreData {
  users: User[];
  providers: ProviderProfile[];
  clientProfiles: ClientProfile[];
  languages: string[];
  genders: string[];
}

class MockStoreService {
  public store: MockStoreData;

  constructor() {
    this.store = this.initializeStore();
  }

  private initializeStore(): MockStoreData {
    const store = persistence.loadStore();
    
    // Seed if empty (First run)
    if (store.users.length === 0) {
       console.log('🌱 Seeding initial data...');
       store.users = [...SEED_DATA.users];
       store.providers = [...SEED_DATA.providers];
       
       // Generate Client Profiles for Seed Users
       const seedClients = SEED_DATA.users.filter(u => u.role === UserRole.CLIENT);
       store.clientProfiles = seedClients.map(u => ({
          id: `cp-${u.id}`,
          userId: u.id,
          intakeStatus: 'COMPLETED',
          documents: [],
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          preferences: { communication: 'email', language: 'English' }
       }));
       
       // Seed Metadata
       store.languages = ['English', 'Spanish', 'Mandarin', 'French', 'German'];
       store.genders = ['Male', 'Female', 'Non-Binary', 'Prefer not to say'];
       
       // Save immediately
       persistence.saveStore(store);
    }
    return store;
  }

  public save() {
    persistence.saveStore(this.store);
  }
}

export const mockStore = new MockStoreService();
