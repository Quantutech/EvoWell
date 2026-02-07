import { seedUsers, seedProviders, seedBlogs, seedSpecialties, seedTestimonials } from '../seed/core';
import { generateMockData } from '../mock/factories';
import { Endorsement, ProviderProfile, User, UserRole } from '../../types';

const isProd = (import.meta as any).env?.PROD;
const isDev = (import.meta as any).env?.DEV;

export const loadInitialData = () => {
  // Check if we already have data in localStorage
  const stored = localStorage.getItem('evowell_mock_store');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Auto-clear on 1 week in production
      if (isProd && parsed.lastUpdated) {
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - parsed.lastUpdated > oneWeek) {
          console.log('🕒 Production data expired, resetting...');
          localStorage.removeItem('evowell_mock_store');
        } else {
          return parsed;
        }
      } else {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse stored mock data', e);
    }
  }

  console.log(`🌱 Loading initial data (${isProd ? 'Production' : 'Development'} mode)...`);

  let users = [...seedUsers];
  let providers = [...seedProviders];
  let blogs = [...seedBlogs];

  if (isDev) {
    // In Dev, add 25-30 realistic mock records
    const mock = generateMockData(25);
    users = [...users, ...mock.users];
    providers = [...providers, ...mock.providers];
    blogs = [...blogs, ...mock.blogs];
  } else {
    // In Prod/Staging, keep it minimal as requested (5 providers, 3 blogs)
    // We already have some in seed, add a few more from factory if needed
    const extraMock = generateMockData(4); // To reach ~5 providers total
    users = [...users, ...extraMock.users.slice(0, 4)];
    providers = [...providers, ...extraMock.providers.slice(0, 4)];
    blogs = [...blogs, ...extraMock.blogs.slice(0, 2)];
  }

  // Generate Mock Endorsements
  const endorsements: Endorsement[] = [];
  const admins = users.filter(u => u.role === UserRole.ADMIN);
  const providerUsers = users.filter(u => u.role === UserRole.PROVIDER);

  // 1. Grant EvoWell endorsements to top providers
  providers.slice(0, 3).forEach(p => {
      const admin = admins[0] || { id: 'admin-1', firstName: 'Evo', lastName: 'Admin' };
      endorsements.push({
          id: `end-evo-${p.id}`,
          endorsedProviderId: p.id,
          endorserUserId: admin.id,
          endorserRole: 'admin',
          endorsementType: 'evowell',
          reason: 'clinical_expertise',
          createdAt: new Date().toISOString()
      });
  });

  // 2. Grant Peer endorsements
  providers.forEach((target, i) => {
      // Pick 2-5 random peers to endorse
      const peerCount = 2 + (i % 4); 
      // Ensure we don't pick self and exist
      const peers = providerUsers
          .filter(u => u.id !== target.userId)
          .sort(() => 0.5 - Math.random())
          .slice(0, peerCount);

      peers.forEach(peerUser => {
          // Find provider profile for this peer user
          const peerProfile = providers.find(p => p.userId === peerUser.id);
          if (peerProfile) {
              endorsements.push({
                  id: `end-peer-${target.id}-${peerUser.id}`,
                  endorsedProviderId: target.id,
                  endorserUserId: peerUser.id,
                  endorserRole: 'provider',
                  endorsementType: 'peer',
                  reason: ['clinical_expertise', 'professional_collaboration', 'ethical_practice', 'strong_outcomes'][Math.floor(Math.random() * 4)] as any,
                  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
                  endorser: {
                      firstName: peerUser.firstName,
                      lastName: peerUser.lastName,
                      professionalTitle: peerProfile.professionalTitle,
                      imageUrl: peerProfile.imageUrl,
                      profileSlug: peerProfile.profileSlug
                  }
              });
          }
      });
  });

  const initialStore = {
    users,
    providers,
    blogs,
    specialties: seedSpecialties,
    testimonials: seedTestimonials,
    endorsements,
    lastUpdated: Date.now(),
    isDemoMode: true
  };

  localStorage.setItem('evowell_mock_store', JSON.stringify(initialStore));
  return initialStore;
};
