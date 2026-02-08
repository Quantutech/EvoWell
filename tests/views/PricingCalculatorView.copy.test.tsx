import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import PricingCalculatorView from '../../src/views/PricingCalculatorView';

const navigateMock = vi.fn();

vi.mock('../../src/App', () => ({
  useNavigation: () => ({
    currentPath: '#/calculator',
    navigate: navigateMock,
  }),
}));

describe('PricingCalculatorView copy and CTA behavior', () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  const renderView = () =>
    render(
      <HelmetProvider>
        <PricingCalculatorView />
      </HelmetProvider>,
    );

  it('renders required headings, disclaimers, and FAQ content', () => {
    renderView();

    expect(
      screen.getByRole('heading', {
        name: "Pay what's fair. Upgrade when the math says so.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'See the plan that fits your practice today.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Choose your monthly membership (sliding scale)' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Included in every plan' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Why sliding scale?' })).toBeInTheDocument();

    expect(
      screen.getByText(/EvoWell does not guarantee specific financial outcomes/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /The pricing calculator provides estimates for informational purposes only and does not guarantee savings, income, or outcomes./i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByText('What am I paying for?')).toBeInTheDocument();
    expect(screen.getByText('Can I change my price later?')).toBeInTheDocument();
    expect(
      screen.queryByText(/Find the plan that pays for itself/i),
    ).not.toBeInTheDocument();
  });

  it('supports set-price scrolling and provider join CTA routes', async () => {
    const user = userEvent.setup();
    const scrollSpy = vi
      .spyOn(Element.prototype, 'scrollIntoView')
      .mockImplementation(() => undefined);

    renderView();

    expect(document.getElementById('calculator')).not.toBeNull();
    expect(document.getElementById('included-every-plan')).not.toBeNull();

    await user.click(screen.getAllByRole('button', { name: 'Set My Price' })[0]);
    expect(scrollSpy).toHaveBeenCalled();

    await user.click(screen.getAllByRole('button', { name: 'Create Provider Profile' })[0]);
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(navigateMock).toHaveBeenCalledWith('/login?join=true&role=provider');

    scrollSpy.mockRestore();
  });

  it('keeps comparison CTA and labels aligned to sliding-scale flow', async () => {
    const user = userEvent.setup();
    renderView();

    expect(
      screen.getByText('Same core access at every point on the scale.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Features do not change across the sliding scale. Your selection helps keep EvoWell accessible/i,
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: "Compare what's included" }));
    expect(screen.getByRole('heading', { name: 'Included in every plan' })).toBeInTheDocument();
  });
});
