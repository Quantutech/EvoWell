import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProviderProfileView from '../../src/views/ProviderProfileView';
import { providers } from '../../src/data/seed/providers';
import { User, UserRole } from '../../src/types';

const navigateMock = vi.fn();
const openEvoMock = vi.fn();
const getProviderMock = vi.fn();
const getSpecialtiesMock = vi.fn();
const getBlogsMock = vi.fn();
const getAvailabilityMock = vi.fn();
const getEndorsementsMock = vi.fn();

let mockUser: User | null = null;

vi.mock('../../src/App', () => ({
  useAuth: () => ({ user: mockUser }),
  useNavigation: () => ({
    currentPath: '#/provider/provider-preview-test',
    navigate: navigateMock,
  }),
}));

vi.mock('../../src/components/evo/EvoContext', () => ({
  useEvo: () => ({
    isOpen: false,
    openEvo: openEvoMock,
    closeEvo: vi.fn(),
  }),
}));

vi.mock('../../src/services/api', () => ({
  api: {
    fetchProviderBySlugOrId: (...args: unknown[]) => getProviderMock(...args),
    getAllSpecialties: (...args: unknown[]) => getSpecialtiesMock(...args),
    getAllBlogs: (...args: unknown[]) => getBlogsMock(...args),
    createAppointment: vi.fn(),
  },
}));

vi.mock('../../src/services/appointments', () => ({
  appointmentService: {
    getProviderAvailability: (...args: unknown[]) => getAvailabilityMock(...args),
  },
}));

vi.mock('../../src/services/endorsement.service', () => ({
  endorsementService: {
    getEndorsementsForProvider: (...args: unknown[]) => getEndorsementsMock(...args),
    hasEndorsed: vi.fn().mockResolvedValue(false),
  },
}));

vi.mock('../../src/services/wishlist.service', () => ({
  wishlistService: {
    toggleWishlist: vi.fn().mockResolvedValue({ isSaved: true }),
  },
}));

vi.mock('../../src/contexts/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock('../../src/components/maps/DynamicMap', () => ({
  default: () => <div data-testid="dynamic-map">Map</div>,
}));

vi.mock('../../src/components/SEO', () => ({
  default: () => null,
}));

function renderView(route: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/provider/:providerId" element={<ProviderProfileView />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProviderProfileView theme switching', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    openEvoMock.mockReset();
    getEndorsementsMock.mockResolvedValue([]);
    getSpecialtiesMock.mockResolvedValue([]);
    getBlogsMock.mockResolvedValue({ data: [] });
    getAvailabilityMock.mockResolvedValue([]);
  });

  it('renders forest theme when owner previews FOREST', async () => {
    const provider = {
      ...providers[0],
      id: 'prov-preview-1',
      userId: 'u-provider-owner',
      profileSlug: 'provider-preview-test',
      profileTheme: 'MIDNIGHT' as const,
      videoUrl: '',
    };

    mockUser = {
      id: 'u-provider-owner',
      email: 'owner@evowell.com',
      firstName: 'Owner',
      lastName: 'Provider',
      role: UserRole.PROVIDER,
      createdAt: '',
      updatedAt: '',
      isDeleted: false,
    };
    getProviderMock.mockResolvedValue(provider);

    renderView('/provider/provider-preview-test?previewTheme=FOREST');

    expect(await screen.findByTestId('provider-profile-theme-forest')).toBeInTheDocument();
    expect(screen.getAllByText('Book appointment').length).toBeGreaterThan(0);
  });

  it('supports legacy previewTemplate alias and maps it to forest theme', async () => {
    const provider = {
      ...providers[0],
      id: 'prov-preview-2',
      userId: 'u-provider-owner',
      profileSlug: 'provider-preview-public',
      profileTheme: 'MIDNIGHT' as const,
      videoUrl: '',
    };

    mockUser = {
      id: 'u-client-public',
      email: 'client@evowell.com',
      firstName: 'Client',
      lastName: 'Viewer',
      role: UserRole.CLIENT,
      createdAt: '',
      updatedAt: '',
      isDeleted: false,
    };
    getProviderMock.mockResolvedValue(provider);

    renderView('/provider/provider-preview-public?previewTemplate=ELEVATED');

    await waitFor(() => expect(screen.getAllByText('Introduction').length).toBeGreaterThan(0));
    expect(screen.getByTestId('provider-profile-theme-forest')).toBeInTheDocument();
  });
});
