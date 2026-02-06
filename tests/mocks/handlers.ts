
import { http, HttpResponse } from 'msw';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';

export const handlers = [
  // Mock Login
  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'authenticated'
      }
    });
  }),

  // Mock Get User
  http.get(`${SUPABASE_URL}/rest/v1/users`, () => {
    return HttpResponse.json([
      {
        id: 'test-user-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'CLIENT'
      }
    ]);
  }),

  // Mock Get Providers
  http.get(`${SUPABASE_URL}/rest/v1/providers`, () => {
    return HttpResponse.json([
      {
        id: 'prov-1',
        user_id: 'user-prov-1',
        professional_title: 'Clinical Psychologist',
        bio: 'Mock Bio',
        hourly_rate: 150,
        is_published: true
      }
    ]);
  }),

  // Mock RPC Calls (Search)
  http.post(`${SUPABASE_URL}/rest/v1/rpc/search_providers_rpc`, () => {
    return HttpResponse.json([
      { id: 'prov-1' }
    ]);
  })
];
