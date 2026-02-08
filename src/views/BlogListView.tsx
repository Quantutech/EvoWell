import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '../services/api';
import { useAuth, useNavigation } from '../App';
import { BlogPost, UserRole } from '../types';
import Breadcrumb from '../components/Breadcrumb';
import { Container, PageHero, Section } from '../components/layout';
import { Badge, Button, Card, CardBody, Tag } from '../components/ui';
import { Heading, Label, Text } from '../components/typography';
import { blogIndexPageContent as content } from '../content/blogIndexPageContent';

const ALL_CATEGORY = content.filters.allLabel;

const BlogSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-16">
    <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white">
      <div className="grid lg:grid-cols-2">
        <div className="aspect-video bg-slate-100 lg:aspect-auto" />
        <div className="space-y-4 p-10 lg:p-16">
          <div className="flex gap-3">
            <div className="h-6 w-20 rounded-full bg-slate-100" />
            <div className="h-6 w-36 rounded-full bg-slate-50" />
          </div>
          <div className="h-8 w-4/5 rounded-xl bg-slate-100" />
          <div className="h-8 w-1/2 rounded-xl bg-slate-100" />
          <div className="h-4 w-full rounded-lg bg-slate-50" />
          <div className="h-4 w-5/6 rounded-lg bg-slate-50" />
          <div className="flex items-center gap-3 pt-4">
            <div className="h-10 w-10 rounded-full bg-slate-100" />
            <div className="h-4 w-28 rounded-lg bg-slate-50" />
          </div>
        </div>
      </div>
    </div>

    <div className="grid gap-8 md:grid-cols-3">
      {[0, 1, 2].map((index) => (
        <div key={index} className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white">
          <div className="aspect-[4/3] bg-slate-100" />
          <div className="space-y-3 p-6">
            <div className="h-4 w-24 rounded-full bg-slate-50" />
            <div className="h-5 w-full rounded-lg bg-slate-100" />
            <div className="h-4 w-3/4 rounded-lg bg-slate-50" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const normalizeReadTime = (readTime?: string): string => {
  if (!readTime) return '5 min read';
  const numeric = readTime.match(/\d+/)?.[0];
  if (!numeric) return readTime;
  return `${numeric} min read`;
};

const isEditorialRole = (role?: string): boolean => {
  if (!role) return true;
  const normalized = role.trim().toLowerCase();
  return normalized === 'admin' || normalized === 'editorial' || normalized === 'evowell editorial';
};

const getAuthorLine = (post: BlogPost): string => {
  const name = (post.authorName || '').trim();
  const role = (post.authorRole || '').trim();
  if (!name || !role || isEditorialRole(role)) {
    return content.grid.authorFallback;
  }
  return `By ${name} • ${role}`;
};

const buildExcerpt = (summary?: string): string => {
  const clean = (summary || '').trim();
  if (!clean) return 'What you’ll learn: practical takeaways from this article.';
  const lower = clean.toLowerCase();
  if (lower.startsWith("what you'll learn") || lower.startsWith('what you’ll learn')) {
    return clean;
  }
  return `What you’ll learn: ${clean}`;
};

const BlogListView: React.FC = () => {
  const { navigate } = useNavigation();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);
  const newsletterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    api
      .getAllBlogs({ limit: 100 })
      .then((response) => {
        if (!isMounted) return;
        const data = response.data || [];
        const visibleBlogs = data.filter(
          (post) => post.status === 'APPROVED' || user?.role === UserRole.ADMIN,
        );
        setBlogs(visibleBlogs);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setBlogs([]);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    blogs.forEach((post) => {
      if (!post.category) return;
      counts.set(post.category, (counts.get(post.category) || 0) + 1);
    });
    return counts;
  }, [blogs]);

  const categories = useMemo(
    () => [ALL_CATEGORY, ...Array.from(categoryCounts.keys()).sort()],
    [categoryCounts],
  );

  const filteredBlogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return blogs.filter((post) => {
      const matchesCategory = activeCategory === ALL_CATEGORY || post.category === activeCategory;
      const matchesQuery =
        !query ||
        post.title.toLowerCase().includes(query) ||
        (post.summary || '').toLowerCase().includes(query) ||
        (post.authorName || '').toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [blogs, activeCategory, searchQuery]);

  const featured = useMemo(() => {
    if (filteredBlogs.length === 0) return undefined;
    return filteredBlogs.find((post) => post.isFeatured && post.status === 'APPROVED') || filteredBlogs[0];
  }, [filteredBlogs]);

  const regularPosts = useMemo(
    () => filteredBlogs.filter((post) => post.id !== featured?.id),
    [filteredBlogs, featured],
  );

  const hasAnyPosts = blogs.length > 0;
  const hasMatches = filteredBlogs.length > 0;
  const isNoPosts = !loading && !hasAnyPosts;
  const isNoMatches = !loading && hasAnyPosts && !hasMatches;

  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory(ALL_CATEGORY);
  };

  const handleNewsletterSubmit = () => {
    if (!newsletterEmail.trim()) return;
    setNewsletterSent(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#fbfcff]">
      <Helmet>
        <title>{content.seo.title}</title>
        <meta name="description" content={content.seo.description} />
      </Helmet>

      <Breadcrumb items={[{ label: 'Resources & Insights' }]} />

      <PageHero
        overline={content.hero.eyebrow}
        title={content.hero.title}
        description={content.hero.subhead}
        variant="left-aligned"
        actions={
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/search')}
              className="block text-left text-sm font-bold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
            >
              {content.heroLinks.support}
            </button>
            <button
              type="button"
              onClick={() => navigate('/benefits')}
              className="block text-left text-sm font-bold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
            >
              {content.heroLinks.providers}
            </button>
            <Text variant="small" className="pt-1 font-semibold text-slate-500">
              {content.hero.microcopy}
            </Text>
          </div>
        }
      />

      <Section spacing="md" background="default">
        <Container>
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <Text variant="small" className="font-semibold text-slate-600">
              {content.disclaimer}
            </Text>
          </div>

          {loading ? (
            <BlogSkeleton />
          ) : (
            <>
              {featured && (
                <Card
                  variant="default"
                  size="lg"
                  className="group mb-16 cursor-pointer overflow-hidden p-0"
                  onClick={() => navigate(`/blog/${featured.slug}`)}
                >
                  <div className="grid lg:grid-cols-2">
                    <div className="relative aspect-video overflow-hidden bg-slate-100 lg:aspect-auto">
                      <img
                        src={featured.imageUrl}
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        alt={featured.title}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <div className="absolute left-5 top-5">
                        <Badge variant="brand" className="bg-brand-500 text-white shadow-lg">
                          {content.featured.badge}
                        </Badge>
                      </div>
                    </div>

                    <div className="relative flex flex-col justify-center bg-white p-10 lg:p-14">
                      <div className="mb-5 flex flex-wrap items-center gap-3">
                        <Badge variant="brand">{featured.category}</Badge>
                        <Label variant="badge" color="muted">
                          {`${normalizeReadTime(featured.readTime)} • ${formatDate(featured.publishedAt)}`}
                        </Label>
                        {featured.status && featured.status !== 'APPROVED' && (
                          <Badge variant="warning">{featured.status}</Badge>
                        )}
                      </div>

                      <Heading level={2} className="mb-5 leading-tight transition-colors group-hover:text-brand-600">
                        {featured.title}
                      </Heading>
                      <Text variant="lead" className="mb-8 line-clamp-3 text-slate-500">
                        {buildExcerpt(featured.summary)}
                      </Text>

                      <div className="mt-auto flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                        <div className="min-w-0">
                          <Text variant="small" weight="bold" className="truncate">
                            {getAuthorLine(featured)}
                          </Text>
                        </div>
                        <span className="text-sm font-bold text-brand-600 transition-colors group-hover:text-brand-700">
                          {content.featured.cta} →
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <div className="sticky top-20 z-20 -mx-2 mb-2 bg-[#fbfcff]/95 px-2 py-3 backdrop-blur-sm">
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar lg:pb-0">
                  {categories.map((category) => {
                    const count =
                      category === ALL_CATEGORY ? blogs.length : categoryCounts.get(category) || 0;

                    return (
                      <Tag
                        key={category}
                        selected={activeCategory === category}
                        onSelect={() => setActiveCategory(category)}
                      >
                        {category}
                        {count > 0 && (
                          <span
                            className={`ml-1.5 text-[10px] ${
                              activeCategory === category ? 'opacity-70' : 'text-slate-400'
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </Tag>
                    );
                  })}
                </div>

                <div className="w-full lg:max-w-sm">
                  <div className="group relative">
                    <svg
                      className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder={content.filters.searchPlaceholder}
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 placeholder:font-medium placeholder:text-slate-400 shadow-sm outline-none transition-all focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500 transition-colors hover:bg-slate-200"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <Text variant="caption" className="mt-2 pl-1 text-slate-500">
                    {content.filters.searchHelper}
                  </Text>
                </div>
              </div>

              {(searchQuery || activeCategory !== ALL_CATEGORY) && (
                <div className="mb-6 flex items-center gap-3">
                  <Text variant="small" color="muted" className="font-semibold">
                    {filteredBlogs.length} article{filteredBlogs.length !== 1 ? 's' : ''}
                    {searchQuery && (
                      <>
                        {' '}
                        matching <span className="text-slate-700">"{searchQuery}"</span>
                      </>
                    )}
                    {activeCategory !== ALL_CATEGORY && (
                      <>
                        {' '}
                        in <span className="text-slate-700">{activeCategory}</span>
                      </>
                    )}
                  </Text>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-bold text-brand-500 transition-colors hover:text-brand-700"
                  >
                    {content.filters.clear}
                  </button>
                </div>
              )}

              {regularPosts.length > 0 && (
                <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                  {regularPosts.map((post) => (
                    <Card
                      key={post.id}
                      className="group flex h-full cursor-pointer flex-col overflow-hidden p-0 transition-shadow duration-300 hover:shadow-xl"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden border-b border-slate-100 bg-slate-50">
                        <img
                          src={post.imageUrl}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          alt={post.title}
                          loading="lazy"
                        />
                        <div className="absolute left-4 top-4">
                          <Badge variant="neutral" className="bg-white/90 shadow-sm backdrop-blur-md">
                            {post.category}
                          </Badge>
                        </div>
                        {post.status && post.status !== 'APPROVED' && (
                          <div className="absolute right-4 top-4">
                            <Badge variant="warning">{post.status}</Badge>
                          </div>
                        )}
                      </div>

                      <CardBody className="flex flex-1 flex-col p-6">
                        <Label variant="badge" color="muted" className="mb-3">
                          {`${formatDate(post.publishedAt)} • ${normalizeReadTime(post.readTime)}`}
                        </Label>
                        <Heading level={4} className="mb-3 line-clamp-2 leading-snug transition-colors group-hover:text-brand-600">
                          {post.title}
                        </Heading>
                        <Text variant="small" color="muted" className="mb-6 line-clamp-2">
                          {buildExcerpt(post.summary)}
                        </Text>

                        <div className="mt-auto border-t border-slate-50 pt-4">
                          <Text variant="caption" weight="bold" className="mb-3 truncate">
                            {getAuthorLine(post)}
                          </Text>
                          <span className="text-sm font-bold text-brand-600 transition-colors group-hover:text-brand-700">
                            {content.grid.cta} →
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}

              {isNoPosts && (
                <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white py-20 text-center">
                  <Heading level={3} className="mb-3">
                    {content.emptyStates.noPosts.title}
                  </Heading>
                  <Text color="muted" className="mx-auto mb-6 max-w-2xl">
                    {content.emptyStates.noPosts.copy}
                  </Text>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      newsletterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  >
                    {content.emptyStates.noPosts.cta}
                  </Button>
                </div>
              )}

              {isNoMatches && (
                <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white py-20 text-center">
                  <Heading level={3} className="mb-3">
                    {content.emptyStates.noMatches.title}
                  </Heading>
                  <Text color="muted" className="mb-6">
                    {content.emptyStates.noMatches.copy}
                  </Text>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button variant="secondary" size="sm" onClick={clearFilters}>
                      {content.emptyStates.noMatches.clearFilters}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveCategory(ALL_CATEGORY)}
                    >
                      {content.emptyStates.noMatches.viewAll}
                    </Button>
                  </div>
                </div>
              )}

              <div ref={newsletterRef} className="mt-24">
                <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white">
                  <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-brand-400 via-emerald-400 to-brand-500" />
                  <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                  />

                  <div className="relative z-10 flex flex-col items-center gap-10 p-10 lg:flex-row lg:gap-14 lg:p-14">
                    <div className="flex flex-1 items-start gap-5">
                      <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 sm:flex">
                        <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="mb-2 text-xl font-black text-slate-900 lg:text-2xl">
                          {content.newsletter.title}
                        </h3>
                        <p className="max-w-md text-sm leading-relaxed text-slate-500">
                          {content.newsletter.copy}
                        </p>
                      </div>
                    </div>

                    <div className="w-full lg:min-w-[380px] lg:w-auto">
                      {newsletterSent ? (
                        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center">
                          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
                            <span className="text-lg text-brand-600">✓</span>
                          </div>
                          <p className="text-sm font-bold text-brand-800">{content.newsletter.successTitle}</p>
                          <p className="mt-1 text-xs text-brand-600">{content.newsletter.successCopy}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1.5 transition-all focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-500/10">
                            <input
                              type="email"
                              placeholder={content.newsletter.placeholder}
                              className="min-w-0 flex-grow border-none bg-transparent px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-0"
                              value={newsletterEmail}
                              onChange={(event) => setNewsletterEmail(event.target.value)}
                              onKeyDown={(event) => event.key === 'Enter' && handleNewsletterSubmit()}
                            />
                            <button
                              type="button"
                              onClick={handleNewsletterSubmit}
                              className="whitespace-nowrap rounded-lg bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
                            >
                              {content.newsletter.button}
                            </button>
                          </div>
                          <p className="pl-2 text-[11px] text-slate-400">{content.newsletter.microcopy}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Container>
      </Section>
    </div>
  );
};

export default BlogListView;
