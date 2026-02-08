import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import BlogListView from '../../src/views/BlogListView';
import { BlogPost } from '../../src/types';

const navigateMock = vi.fn();
const getAllBlogsMock = vi.fn();

vi.mock('../../src/App', () => ({
  useNavigation: () => ({
    currentPath: '#/blog',
    navigate: navigateMock,
  }),
  useAuth: () => ({
    user: null,
  }),
}));

vi.mock('../../src/services/api', () => ({
  api: {
    getAllBlogs: (...args: unknown[]) => getAllBlogsMock(...args),
  },
}));

const buildBlog = (overrides: Partial<BlogPost> = {}): BlogPost => ({
  id: 'blog-1',
  slug: 'sleep-basics',
  title: 'The Science of Sleep',
  summary: 'How sleep quality affects mood and practical recovery habits.',
  content: 'content',
  category: 'Wellness',
  authorName: 'Dr. Sarah Chen',
  authorRole: 'Clinical Psychologist',
  authorImage: 'https://example.com/a.jpg',
  readTime: '6 min read',
  imageUrl: 'https://example.com/b.jpg',
  publishedAt: '2024-01-02',
  status: 'APPROVED',
  isFeatured: true,
  ...overrides,
});

describe('BlogListView copy and UX rewrite', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    getAllBlogsMock.mockResolvedValue({ data: [buildBlog(), buildBlog({ id: 'blog-2', slug: 'burnout', title: 'Burnout Signals', isFeatured: false, category: 'Mental Health', authorRole: 'Admin', summary: 'Recognize burnout signals and practical actions.' })], total: 2 });
  });

  const renderView = () =>
    render(
      <HelmetProvider>
        <BlogListView />
      </HelmetProvider>,
    );

  it('renders the new hero, disclaimer, filter/search copy, and featured labels', async () => {
    renderView();
    await waitFor(() => expect(getAllBlogsMock).toHaveBeenCalled());

    expect(screen.getByRole('heading', { name: 'Resources & Insights' })).toBeInTheDocument();
    expect(
      screen.getByText('Evidence-informed ideas, practical wellness strategies, and updates from the EvoWell community.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Educational content only — not medical advice.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Articles are for informational and educational purposes only and are not medical advice\./i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /^All/ })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Search articles…'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Try “sleep”, “burnout”, “CBT”, “nutrition”'),
    ).toBeInTheDocument();

    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByText(/Read article/i)).toBeInTheDocument();
    expect(screen.getAllByText('EvoWell Editorial').length).toBeGreaterThan(0);

    expect(screen.queryByText('View all')).not.toBeInTheDocument();
    expect(
      screen.queryByText('The latest clinical news, wellness strategies, and community stories.'),
    ).not.toBeInTheDocument();
  });

  it('routes both hero conversion links correctly', async () => {
    const user = userEvent.setup();
    renderView();
    await waitFor(() => expect(getAllBlogsMock).toHaveBeenCalled());

    await user.click(
      screen.getByRole('button', { name: 'Looking for support? Browse the Provider Directory →' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Are you a provider? Learn about EvoWell for Providers →' }),
    );

    expect(navigateMock).toHaveBeenCalledWith('/search');
    expect(navigateMock).toHaveBeenCalledWith('/benefits');
  });

  it('shows no-posts empty state with Subscribe CTA', async () => {
    getAllBlogsMock.mockResolvedValueOnce({ data: [], total: 0 });
    renderView();
    await waitFor(() => expect(getAllBlogsMock).toHaveBeenCalled());

    const heading = screen.getByRole('heading', { name: 'Articles are coming soon.' });
    expect(heading).toBeInTheDocument();
    expect(
      screen.getByText(
        'We’re building a library of evidence-informed resources for providers and people seeking support. Check back soon—or subscribe for updates.',
      ),
    ).toBeInTheDocument();
    const noPostsContainer = heading.closest('div');
    expect(noPostsContainer).not.toBeNull();
    expect(
      within(noPostsContainer as HTMLElement).getByRole('button', { name: 'Subscribe' }),
    ).toBeInTheDocument();
  });

  it('shows no-matches state with clear and view all actions', async () => {
    const user = userEvent.setup();
    renderView();
    await waitFor(() => expect(getAllBlogsMock).toHaveBeenCalled());

    await user.type(screen.getByPlaceholderText('Search articles…'), 'nomatchxyz');

    expect(screen.getByText('No matches found.')).toBeInTheDocument();
    expect(screen.getByText('Try a different keyword or clear filters.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View all' })).toBeInTheDocument();
  });

  it('renders newsletter strip copy with updated placeholder and microcopy', async () => {
    renderView();
    await waitFor(() => expect(getAllBlogsMock).toHaveBeenCalled());

    expect(screen.getByText('Stay ahead of the curve')).toBeInTheDocument();
    expect(
      screen.getByText('Evidence-informed insights, provider spotlights, and new resources — delivered weekly.'),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByText('No spam. Unsubscribe anytime.')).toBeInTheDocument();
  });
});
