import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BlogPost, ModerationStatus, ProviderProfile, Specialty } from '@/types';
import { useNavigation } from '@/App';
import { api } from '@/services/api';
import { useEvo } from '@/components/evo/EvoContext';
import { homePageContent as content } from '@/content/homePageContent';
import { HomeCtaTargetKey, HomeCtaTargetMap } from '@/types/ui/homePage';
import { Section, Container } from '@/components/layout';
import { Heading, Label, Text } from '@/components/typography';
import { Badge, Button, Card, CardBody } from '@/components/ui';
import Icon from '@/components/ui/Icon';
import { iconPaths } from '@/components/ui/iconPaths';
import FeaturedProvidersGrid from '@/components/home/FeaturedProvidersGrid';

interface FeaturedProvider extends ProviderProfile {
  firstName: string;
  lastName: string;
}

const providerJoinPath = '/login?join=true&role=provider';

const HOME_CTA_TARGETS: HomeCtaTargetMap = {
  FIND_PROVIDER: { type: 'route', path: '/search' },
  FOR_PROVIDERS: { type: 'route', path: '/benefits' },
  CHAT_WITH_EVO: { type: 'action', action: 'OPEN_EVO' },
  BROWSE_DIRECTORY: { type: 'route', path: '/search' },
  CREATE_PROVIDER_PROFILE: { type: 'route', path: providerJoinPath },
  VIEW_ALL_PROVIDERS: { type: 'route', path: '/search' },
  BROWSE_EXCHANGE: { type: 'route', path: '/exchange' },
  SELL_RESOURCE: { type: 'route', path: '/exchange/sell' },
  TALK_TO_SUPPORT: { type: 'route', path: '/contact' },
};

const HomeView: React.FC<{ specialties: Specialty[] }> = ({ specialties: _specialties }) => {
  const { navigate } = useNavigation();
  const { openEvo } = useEvo();
  const [featuredProviders, setFeaturedProviders] = useState<FeaturedProvider[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadHomepageData = async () => {
      try {
        const [providersResponse, users, blogsResponse] = await Promise.all([
          api.getAllProviders({ page: 1, limit: 40 }),
          api.getAllUsers(),
          api.getAllBlogs({ limit: 8 }),
        ]);

        if (!isActive) return;

        const providers = providersResponse.providers || [];
        const enrichedProviders = providers.map((provider) => {
          const user = users.find((row) => row.id === provider.userId);
          return {
            ...provider,
            firstName: user?.firstName || 'EvoWell',
            lastName: user?.lastName || 'Provider',
          };
        });

        const approvedProviders = enrichedProviders.filter(
          (provider) =>
            provider.moderationStatus === ModerationStatus.APPROVED && provider.isPublished,
        );

        const source = approvedProviders.length > 0 ? approvedProviders : enrichedProviders;
        const ranked = [...source].sort(
          (a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0),
        );
        setFeaturedProviders(ranked.slice(0, 10));

        const allBlogs = blogsResponse.data || [];
        const publishedBlogs = allBlogs.filter((blog) => blog.status === 'APPROVED');
        const sortedBlogs = [...publishedBlogs].sort(
          (a, b) =>
            new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime(),
        );
        setFeaturedBlogs(sortedBlogs.slice(0, 3));
      } catch (error) {
        if (isActive) {
          setFeaturedProviders([]);
          setFeaturedBlogs([]);
        }
      }
    };

    loadHomepageData();
    return () => {
      isActive = false;
    };
  }, []);

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('query', searchQuery.trim());
    }
    if (searchLocation.trim()) {
      params.set('state', searchLocation.trim());
    }
    const queryString = params.toString();
    navigate(queryString ? `/search?${queryString}` : '/search');
  };

  const handleCta = (targetKey: HomeCtaTargetKey) => {
    const target = HOME_CTA_TARGETS[targetKey];

    if (target.type === 'action' && target.action === 'OPEN_EVO') {
      openEvo();
      return;
    }

    if (target.type === 'route') {
      navigate(target.path);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <Helmet>
        <title>{content.seo.title}</title>
        <meta name="description" content={content.seo.description} />
      </Helmet>

      <section className="relative overflow-hidden bg-white pb-20 pt-24 md:pb-24 md:pt-28">
        <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />

        <Container size="full">
          <div className="mx-auto max-w-5xl text-center">
            <Heading level={1} size="display" className="mb-6 text-slate-900">
              {content.hero.title}
            </Heading>
            <Text variant="lead" className="mx-auto mb-10 max-w-4xl text-slate-600">
              {content.hero.subhead}
            </Text>

            <div className="mb-5 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                variant="brand"
                onClick={() => handleCta('FIND_PROVIDER')}
              >
                {content.hero.primaryCta}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => handleCta('FOR_PROVIDERS')}
              >
                {content.hero.secondaryCta}
              </Button>
              <button
                type="button"
                onClick={() => handleCta('CHAT_WITH_EVO')}
                className="text-sm font-bold text-brand-600 underline-offset-4 hover:text-brand-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-md px-2 py-1"
              >
                {content.hero.tertiaryCta}
              </button>
            </div>

            <div className="mx-auto mb-6 max-w-4xl rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <Label variant="overline" color="muted" className="mb-3 block text-center">
                {content.search.title}
              </Label>
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <label htmlFor="home-search-query" className="sr-only">
                  Search by specialty or condition
                </label>
                <input
                  id="home-search-query"
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSearchSubmit();
                    }
                  }}
                  placeholder={content.search.queryPlaceholder}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <label htmlFor="home-search-location" className="sr-only">
                  Search by location
                </label>
                <input
                  id="home-search-location"
                  type="text"
                  value={searchLocation}
                  onChange={(event) => setSearchLocation(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSearchSubmit();
                    }
                  }}
                  placeholder={content.search.locationPlaceholder}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <Button variant="brand" onClick={handleSearchSubmit}>
                  {content.search.cta}
                </Button>
              </div>
            </div>

            <Text variant="small" className="font-semibold text-slate-500">
              {content.hero.microcopy}
            </Text>
          </div>
        </Container>
      </section>

      <Section spacing="lg" background="default">
        <Container>
          <div className="mb-10 text-center">
            <Heading level={2} className="mb-3">
              {content.paths.title}
            </Heading>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {content.paths.items.map((item, index) => {
              const ctaTarget = index === 0 ? 'BROWSE_DIRECTORY' : 'CREATE_PROVIDER_PROFILE';
              return (
                <Card
                  key={item.title}
                  className="border border-slate-200 rounded-3xl shadow-sm hover:shadow-lg transition-shadow"
                >
                  <CardBody className="space-y-5 p-8">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                        <Icon path={iconPaths[item.icon]} size={22} />
                      </span>
                      <Heading level={3} className="text-slate-900">
                        {item.title}
                      </Heading>
                    </div>

                    <Text className="text-slate-600">{item.copy}</Text>

                    <Button
                      variant={index === 0 ? 'secondary' : 'brand'}
                      onClick={() => handleCta(ctaTarget)}
                    >
                      {item.cta}
                    </Button>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="white">
        <Container>
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 md:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <Heading level={2} className="mb-3 text-slate-900">
                  {content.providerDesignChoice.title}
                </Heading>
                <Text className="text-slate-600">
                  {content.providerDesignChoice.subhead}
                </Text>
              </div>
              <Button variant="brand" onClick={() => handleCta('CREATE_PROVIDER_PROFILE')}>
                {content.providerDesignChoice.cta}
              </Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {content.providerDesignChoice.schemes.map((scheme) => (
                <div key={scheme.name} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <Label variant="overline" color="brand" className="mb-2 block">
                    Color Scheme
                  </Label>
                  <Heading level={4} className="mb-2 text-slate-900">
                    {scheme.name}
                  </Heading>
                  <Text className="text-slate-600">{scheme.copy}</Text>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" background="white">
        <Container>
          <div className="mb-12 text-center">
            <Heading level={2} className="mb-4">
              {content.howItWorks.title}
            </Heading>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {content.howItWorks.steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7"
              >
                <Badge variant="brand" className="mb-5">
                  Step {index + 1}
                </Badge>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
                  <Icon path={iconPaths[step.icon]} size={20} />
                </div>
                <Heading level={4} className="mb-3 text-slate-900">
                  {step.title}
                </Heading>
                <Text className="text-slate-600">{step.copy}</Text>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button variant="brand" onClick={() => handleCta('CHAT_WITH_EVO')}>
              {content.howItWorks.cta}
            </Button>
          </div>
        </Container>
      </Section>

      <FeaturedProvidersGrid
        providers={featuredProviders}
        title={content.featuredProviders.title}
        subhead={content.featuredProviders.subhead}
        microcopy={content.featuredProviders.microcopy}
        ctaLabel={content.featuredProviders.cta}
      />

      <Section spacing="lg" background="default">
        <Container>
          <div className="grid gap-10 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <Label variant="overline" color="brand" className="mb-4 block">
                Provider Exchange
              </Label>
              <Heading level={2} className="mb-4 text-slate-900">
                {content.exchange.title}
              </Heading>
              <Text variant="lead" className="mb-6 max-w-3xl text-slate-600">
                {content.exchange.subhead}
              </Text>
              <div className="flex flex-wrap gap-4">
                <Button variant="brand" onClick={() => handleCta('BROWSE_EXCHANGE')}>
                  {content.exchange.primaryCta}
                </Button>
                <Button variant="secondary" onClick={() => handleCta('SELL_RESOURCE')}>
                  {content.exchange.secondaryCta}
                </Button>
              </div>
              <Text variant="small" className="mt-4 font-semibold text-slate-500">
                {content.exchange.disclaimer}
              </Text>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <Heading level={4} className="mb-3 text-slate-900">
                Build trust with every listing
              </Heading>
              <Text className="text-slate-600">
                Verified providers publish educational resources that support real-world care journeys without making
                medical claims.
              </Text>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="white">
        <Container>
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 md:p-10">
            <Heading level={2} className="mb-6 text-slate-900">
              {content.trust.title}
            </Heading>
            <ul className="grid gap-4 md:grid-cols-3">
              {content.trust.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-700"
                >
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                    <Icon path={iconPaths.shield} size={12} />
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" background="default">
        <Container>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Heading level={2} className="mb-3 text-slate-900">
                {content.blog.title}
              </Heading>
              <Text className="max-w-3xl text-slate-600">{content.blog.subhead}</Text>
            </div>
            <Button variant="secondary" onClick={() => navigate('/blog')}>
              {content.blog.cta}
            </Button>
          </div>

          {featuredBlogs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {featuredBlogs.map((post) => (
                <article
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-3 p-6">
                    <Label variant="badge" color="brand">
                      {post.category}
                    </Label>
                    <Heading level={4} className="line-clamp-2 text-slate-900">
                      {post.title}
                    </Heading>
                    <Text variant="small" className="line-clamp-2 text-slate-600">
                      {post.summary}
                    </Text>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
              <Text className="text-slate-500">{content.blog.emptyState}</Text>
            </div>
          )}
        </Container>
      </Section>

      <Section spacing="lg" background="default">
        <Container>
          <div className="rounded-[2.75rem] bg-[#0f311c] px-8 py-12 text-white shadow-2xl md:px-12 md:py-16">
            <Heading level={2} color="white" className="mb-4 max-w-4xl">
              {content.finalCta.title}
            </Heading>
            <Text variant="lead" color="white" className="mb-8 max-w-4xl text-white/85">
              {content.finalCta.subhead}
            </Text>
            <div className="flex flex-wrap gap-4">
              <Button variant="brand" onClick={() => handleCta('FOR_PROVIDERS')}>
                {content.finalCta.primaryCta}
              </Button>
              <Button variant="secondary" onClick={() => handleCta('FIND_PROVIDER')}>
                {content.finalCta.secondaryCta}
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default HomeView;
