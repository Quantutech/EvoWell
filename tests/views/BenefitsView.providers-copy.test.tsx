import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import BenefitsView from '../../src/views/BenefitsView';

const navigateMock = vi.fn();

vi.mock('../../src/App', () => ({
  useNavigation: () => ({
    currentPath: '#/benefits',
    navigate: navigateMock,
  }),
}));

describe('BenefitsView providers landing copy', () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  const renderView = () =>
    render(
      <HelmetProvider>
        <BenefitsView />
      </HelmetProvider>,
    );

  it('renders required provider-focused narrative sections', () => {
    renderView();

    expect(screen.getByRole('heading', { name: 'Your Practice. Elevated.' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'One platform for the work behind the work.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Provider Exchange - monetize your expertise.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: "Pay what's fair. Scale when you're ready." }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Live in under a week.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ready to join the evolution?' })).toBeInTheDocument();
    expect(
      screen.getByText(
        /EvoWell is a platform that helps people find providers and helps providers manage their practice./i,
      ),
    ).toBeInTheDocument();

    expect(screen.queryByText('Start Your Journey')).not.toBeInTheDocument();
    expect(screen.queryByText('See Pricing')).not.toBeInTheDocument();
  });

  it('uses expected CTA routing for provider join and support', async () => {
    const user = userEvent.setup();
    renderView();

    await user.click(screen.getAllByRole('button', { name: 'Create Provider Profile' })[0]);
    await user.click(screen.getAllByRole('button', { name: 'Start Application' })[0]);
    await user.click(screen.getByRole('button', { name: 'Talk to Support' }));

    expect(navigateMock).toHaveBeenCalledWith('/login?join=true&role=provider');
    expect(navigateMock).toHaveBeenCalledWith('/contact');
  });

  it('provides a sliding-scale anchor target and scroll interaction', async () => {
    const user = userEvent.setup();
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => undefined);

    renderView();

    expect(document.getElementById('sliding-scale-pricing')).not.toBeNull();
    await user.click(screen.getByRole('button', { name: 'See how sliding-scale pricing works' }));
    expect(scrollSpy).toHaveBeenCalled();

    scrollSpy.mockRestore();
  });
});
