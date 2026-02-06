
export const APP_CONFIG = {
  name: 'EvoWell',
  description: 'The next evolution in clinical care.',
  version: '0.1.0',
  api: {
    // Safe access with fallback
    baseUrl: ((import.meta as any).env && (import.meta as any).env.VITE_API_URL) || '/api/v1',
    timeout: 10000,
  },
  theme: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    colors: {
      primary: '#257a46', // Accessible Brand Green
      secondary: '#0e84ea',
    },
  },
  routes: {
    home: '#/',
    login: '#/login',
    dashboard: '#/dashboard',
    search: '#/search',
  }
};