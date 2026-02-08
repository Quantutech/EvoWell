import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PartnersHubView from '../../src/views/PartnersHubView';

const navigateMock = vi.fn();
const getTestimonialsMock = vi.fn();

vi.mock('../../src/App', () => ({
  useNavigation: () => ({
    currentPath: '#/partners',
    navigate: navigateMock,
  }),
}));

vi.mock('../../src/services/api', () => ({
  api: {
    getTestimonials: (...args: unknown[]) => getTestimonialsMock(...args),
  },
}));

describe('PartnersHubView copy rewrite', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    getTestimonialsMock.mockResolvedValue([]);
  });

  it('renders required sections and form labels', async () => {
    render(<PartnersHubView />);
    await waitFor(() => expect(getTestimonialsMock).toHaveBeenCalledWith('partners'));

    expect(
      screen.getByRole('heading', { name: 'Shape the Future of Wellness Together.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Why Partner with EvoWell?' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Partnership Advantages' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ecosystem Opportunities' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Partnership Journey' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Partners in Impact' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Ready to Transform the Wellness Landscape?' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: "Let's Get Started" })).toBeInTheDocument();

    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Work Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Organization')).toBeInTheDocument();
    expect(screen.getByLabelText('Partnership Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('routes partner opportunity buttons to contact', async () => {
    const user = userEvent.setup();
    render(<PartnersHubView />);
    await waitFor(() => expect(getTestimonialsMock).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: 'Explore Vendor Programs' }));
    await user.click(screen.getByRole('button', { name: 'View Sponsorship Options' }));

    expect(navigateMock).toHaveBeenCalledWith('/contact');
  });

  it('shows safe partner placeholders when no testimonials exist', async () => {
    render(<PartnersHubView />);
    await waitFor(() => expect(getTestimonialsMock).toHaveBeenCalled());

    expect(screen.getByText('Partner spotlights coming soon.')).toBeInTheDocument();
    expect(
      screen.getByText(
        'We are onboarding early partners now. If you would like to collaborate, we would love to talk.',
      ),
    ).toBeInTheDocument();
  });
});
