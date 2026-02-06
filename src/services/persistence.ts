import { User, ProviderProfile, ClientProfile } from '../types';

const STORAGE_KEYS = {
  USERS: 'evowell_users',
  PROVIDERS: 'evowell_providers',
  CLIENTS: 'evowell_clients',
  AUTH_TOKEN: 'evowell_auth_token',
  AUTH_USER_ID: 'evowell_auth_user_id'
};

export const persistence = {
  // --- Data Store Persistence ---

  saveStore(data: { users: User[], providers: ProviderProfile[], clientProfiles: ClientProfile[], languages?: string[], genders?: string[] }) {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(data.providers));
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(data.clientProfiles));
      if (data.languages) localStorage.setItem('evowell_languages', JSON.stringify(data.languages));
      if (data.genders) localStorage.setItem('evowell_genders', JSON.stringify(data.genders));
    } catch (e) {
      console.error('Failed to save store to localStorage', e);
    }
  },

  loadStore(): { users: User[], providers: ProviderProfile[], clientProfiles: ClientProfile[], languages: string[], genders: string[] } {
    try {
      const usersRaw = localStorage.getItem(STORAGE_KEYS.USERS);
      const providersRaw = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
      const clientsRaw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      const languagesRaw = localStorage.getItem('evowell_languages');
      const gendersRaw = localStorage.getItem('evowell_genders');

      return {
        users: usersRaw ? JSON.parse(usersRaw) : [],
        providers: providersRaw ? JSON.parse(providersRaw) : [],
        clientProfiles: clientsRaw ? JSON.parse(clientsRaw) : [],
        languages: languagesRaw ? JSON.parse(languagesRaw) : ['English', 'Spanish', 'French'],
        genders: gendersRaw ? JSON.parse(gendersRaw) : ['Male', 'Female', 'Non-Binary']
      };
    } catch (e) {
      console.error('Failed to load store from localStorage', e);
      return { users: [], providers: [], clientProfiles: [], languages: [], genders: [] };
    }
  },

  // --- Auth Persistence ---

  setSession(token: string, userId: string) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER_ID, userId);
  },

  getSession(): { token: string | null, userId: string | null } {
    return {
      token: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
      userId: localStorage.getItem(STORAGE_KEYS.AUTH_USER_ID)
    };
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER_ID);
  }
};
