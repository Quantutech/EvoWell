import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import AboutView from '../../src/views/AboutView';

const navigateMock = vi.fn();

vi.mock('../../src/App', () => ({
  useNavigation: () => ({
    currentPath: '#/about',
    navigate: navigateMock,
  }),
}));

describe('AboutView trust-first rewrite', () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  const renderView = () =>
    render(
      <HelmetProvider>
        <AboutView />
      </HelmetProvider>,
    );

  it('renders required copy blocks and trust disclaimers', () => {
    renderView();

    expect(
      screen.getByRole('heading', {
        name: 'Building a better system for care-starting with providers.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Why we built EvoWell' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: "We're early-but not new to this space." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'A provider-first ecosystem-by design.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Why sliding-scale membership matters' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Built responsibly-because trust is the product.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Help shape what EvoWell becomes.' }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Verification supports trust, but it is not a guarantee of outcomes. Always choose providers based on fit and your needs.',
      ),
    ).toBeInTheDocument();
  });

  it('routes CTAs to the expected destinations', async () => {
    const user = userEvent.setup();
    renderView();

    await user.click(screen.getByRole('button', { name: 'Explore the Platform' }));
    await user.click(screen.getByRole('button', { name: 'For Providers' }));
    await user.click(screen.getByRole('button', { name: 'See pricing' }));
    await user.click(screen.getByRole('button', { name: 'Join as a Provider' }));
    await user.click(screen.getByRole('button', { name: 'Explore the Directory' }));
    await user.click(screen.getByRole('button', { name: 'Contact us' }));

    expect(navigateMock).toHaveBeenCalledWith('/benefits');
    expect(navigateMock).toHaveBeenCalledWith('/provider-guide');
    expect(navigateMock).toHaveBeenCalledWith('/calculator');
    expect(navigateMock).toHaveBeenCalledWith('/login?join=true&role=provider');
    expect(navigateMock).toHaveBeenCalledWith('/search');
    expect(navigateMock).toHaveBeenCalledWith('/contact');
  });

  it('does not render legacy map/team/timeline modules', () => {
    renderView();

    expect(screen.queryByText(/Born from a waiting room/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Specialists across the country/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/The people behind the platform/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Join Our Network/i)).not.toBeInTheDocument();
  });
});
