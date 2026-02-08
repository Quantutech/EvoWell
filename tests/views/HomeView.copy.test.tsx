import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import HomeView from '../../src/views/HomeView';

const navigateMock = vi.fn();
const openEvoMock = vi.fn();
const getAllProvidersMock = vi.fn();
const getAllUsersMock = vi.fn();
const getAllBlogsMock = vi.fn();

vi.mock('../../src/App', () => ({
  useNavigation: () => ({
    currentPath: '#/',
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
    getAllProviders: (...args: unknown[]) => getAllProvidersMock(...args),
    getAllUsers: (...args: unknown[]) => getAllUsersMock(...args),
    getAllBlogs: (...args: unknown[]) => getAllBlogsMock(...args),
  },
}));

vi.mock('../../src/components/home/FeaturedProviders', () => ({
  default: ({ previewLabel }: { previewLabel?: string }) => (
    <section data-testid="featured-carousel-layout">{previewLabel}</section>
  ),
}));

vi.mock('../../src/components/home/FeaturedProvidersGrid', () => ({
  default: ({ previewLabel }: { previewLabel?: string }) => (
    <section data-testid="featured-grid-layout">{previewLabel}</section>
  ),
}));

describe('HomeView copy and routing behavior', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    openEvoMock.mockReset();
    getAllProvidersMock.mockResolvedValue({ providers: [], total: 0 });
    getAllUsersMock.mockResolvedValue([]);
    getAllBlogsMock.mockResolvedValue({ data: [] });
  });

  const renderView = () =>
    render(
      <HelmetProvider>
        <HomeView specialties={[]} />
      </HelmetProvider>,
    );

  it('renders the new narrative blocks and featured-layout previews', async () => {
    renderView();
    await waitFor(() => expect(getAllProvidersMock).toHaveBeenCalled());

    expect(
      screen.getByRole('heading', { name: 'The next evolution in care-built for trust.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Choose your path.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Clear steps. Less friction.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Provider Exchange' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Built with responsibility.' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Provider-first profile personalization.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'EvoWell is just getting started. Join early.' }),
    ).toBeInTheDocument();

    expect(screen.getByTestId('featured-grid-layout')).toBeInTheDocument();
    expect(screen.queryByTestId('featured-carousel-layout')).not.toBeInTheDocument();

    expect(screen.queryByText(/The Sovereign Practice OS/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Midnight' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Forest' })).toBeInTheDocument();
  });

  it('routes homepage CTAs to the expected destinations and opens Evo', async () => {
    const user = userEvent.setup();
    renderView();
    await waitFor(() => expect(getAllProvidersMock).toHaveBeenCalled());

    await user.click(screen.getAllByRole('button', { name: 'Find a Provider' })[0]);
    await user.click(screen.getAllByRole('button', { name: 'For Providers' })[0]);
    await user.click(screen.getByRole('button', { name: 'Browse Directory' }));
    await user.click(screen.getAllByRole('button', { name: 'Create Provider Profile' })[0]);
    await user.click(screen.getByRole('button', { name: 'Browse Exchange' }));
    await user.click(screen.getByRole('button', { name: 'Sell a Resource' }));
    await user.click(screen.getAllByRole('button', { name: 'Chat with Evo' })[0]);

    expect(navigateMock).toHaveBeenCalledWith('/search');
    expect(navigateMock).toHaveBeenCalledWith('/benefits');
    expect(navigateMock).toHaveBeenCalledWith('/login?join=true&role=provider');
    expect(navigateMock).toHaveBeenCalledWith('/exchange');
    expect(navigateMock).toHaveBeenCalledWith('/exchange/sell');
    expect(openEvoMock).toHaveBeenCalledTimes(1);
  });
});
