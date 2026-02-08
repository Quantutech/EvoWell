import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import ProviderGuideView from '../../src/views/ProviderGuideView';

const navigateMock = vi.fn();
const openEvoMock = vi.fn();

vi.mock('../../src/App', () => ({
  useNavigation: () => ({
    currentPath: '#/provider-guide',
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

describe('ProviderGuideView', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    openEvoMock.mockReset();
  });

  const renderView = () =>
    render(
      <HelmetProvider>
        <ProviderGuideView />
      </HelmetProvider>,
    );

  it('renders required copy blocks and mandatory Evo safety boundary', () => {
    renderView();

    expect(screen.getByRole('heading', { name: 'Start your journey with EvoWell.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Built for real practice life.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Go live in a few steps.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Verification keeps the network credible.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Meet Evo—your navigation assistant.' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Evo is not a medical professional and does not provide medical advice, diagnosis, or treatment.',
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/\[Insert Screenshot/i),
    ).not.toBeInTheDocument();
  });

  it('uses provider join flow for start and final CTA actions', async () => {
    const user = userEvent.setup();
    renderView();

    const startButtons = screen.getAllByRole('button', { name: 'Start Application' });
    expect(startButtons.length).toBeGreaterThan(0);

    await user.click(startButtons[0]);
    await user.click(screen.getByRole('button', { name: 'Create Provider Profile' }));

    expect(navigateMock).toHaveBeenCalledWith('/login?join=true&role=provider');
  });

  it('has a verification anchor target and scroll interaction button', async () => {
    const user = userEvent.setup();
    const scrollSpy = vi
      .spyOn(Element.prototype, 'scrollIntoView')
      .mockImplementation(() => undefined);

    renderView();

    expect(document.getElementById('verification')).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'See how verification works' }));
    expect(scrollSpy).toHaveBeenCalled();

    scrollSpy.mockRestore();
  });

  it('opens Evo when user clicks the Evo CTA', async () => {
    const user = userEvent.setup();
    renderView();

    await user.click(screen.getByRole('button', { name: 'Chat with Evo' }));
    expect(openEvoMock).toHaveBeenCalledTimes(1);
  });
});
