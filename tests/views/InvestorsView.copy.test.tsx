import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InvestorsView from '../../src/views/InvestorsView';

const navigateMock = vi.fn();

vi.mock('../../src/App', () => ({
  useNavigation: () => ({
    currentPath: '#/investors',
    navigate: navigateMock,
  }),
}));

describe('InvestorsView copy rewrite', () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it('renders trust-first investor narrative and removes old hype language', () => {
    render(<InvestorsView />);

    expect(
      screen.getByRole('heading', {
        name: 'EvoWell is building the trust layer for clinical wellness.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'The systemic fragmentation of wellness.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Platform philosophy rooted in trust.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Built for trust, not just growth.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Supporting the next era of trusted clinical wellness.' }),
    ).toBeInTheDocument();

    expect(screen.queryByText(/sovereign operating system/i)).not.toBeInTheDocument();
  });

  it('routes investor CTAs to contact', async () => {
    const user = userEvent.setup();
    render(<InvestorsView />);

    await user.click(screen.getByRole('button', { name: 'Contact for Deck' }));
    await user.click(screen.getByRole('button', { name: 'Request Investor Deck' }));
    await user.click(screen.getByRole('button', { name: 'Contact Founders' }));

    expect(navigateMock).toHaveBeenCalledTimes(3);
    expect(navigateMock).toHaveBeenNthCalledWith(1, '/contact');
    expect(navigateMock).toHaveBeenNthCalledWith(2, '/contact');
    expect(navigateMock).toHaveBeenNthCalledWith(3, '/contact');
  });
});
