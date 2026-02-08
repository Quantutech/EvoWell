import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ExchangeSellEntryView from '../../src/views/ExchangeSellEntryView';
import { ModerationStatus, UserRole } from '../../src/types';

const navigateMock = vi.fn();

const authState: {
  user: any;
  provider: any;
  isLoading: boolean;
} = {
  user: null,
  provider: null,
  isLoading: false,
};

vi.mock('../../src/App', () => ({
  useAuth: () => authState,
  useNavigation: () => ({
    currentPath: '#/exchange/sell',
    navigate: navigateMock,
  }),
}));

const createUser = (role: UserRole) => ({
  id: `user-${role.toLowerCase()}`,
  firstName: 'Test',
  lastName: 'User',
  email: `${role.toLowerCase()}@evowell.com`,
  role,
  isDeleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe('ExchangeSellEntryView', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    authState.user = null;
    authState.provider = null;
    authState.isLoading = false;
  });

  it('redirects unauthenticated users to provider join flow with return path', async () => {
    render(<ExchangeSellEntryView />);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login?join=true&role=provider&next=%2Fexchange%2Fsell');
    });
  });

  it('shows a gate for authenticated non-provider users', async () => {
    const user = userEvent.setup();
    authState.user = createUser(UserRole.CLIENT);

    render(<ExchangeSellEntryView />);

    expect(
      screen.getByRole('heading', { name: 'Provider access required to sell resources' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Join as Provider' }));
    await user.click(screen.getByRole('button', { name: 'Browse Exchange' }));

    expect(navigateMock).toHaveBeenCalledWith('/login?join=true&role=provider&next=%2Fexchange%2Fsell');
    expect(navigateMock).toHaveBeenCalledWith('/exchange');
  });

  it('routes providers without verification readiness to onboarding', async () => {
    authState.user = createUser(UserRole.PROVIDER);
    authState.provider = {
      onboardingComplete: false,
      moderationStatus: ModerationStatus.PENDING,
    };

    render(<ExchangeSellEntryView />);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/onboarding?next=%2Fexchange%2Fsell');
    });
  });

  it('routes verified providers to the resources workspace', async () => {
    authState.user = createUser(UserRole.PROVIDER);
    authState.provider = {
      onboardingComplete: true,
      moderationStatus: ModerationStatus.APPROVED,
    };

    render(<ExchangeSellEntryView />);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/console/resources');
    });
  });
});
