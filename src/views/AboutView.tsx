import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigation } from '../App';
import Breadcrumb from '../components/Breadcrumb';
import { Section, Container } from '../components/layout';
import { Heading, Label, Text } from '../components/typography';
import { Button, BrandImage } from '../components/ui';
import Icon from '../components/ui/Icon';
import { iconPaths } from '../components/ui/iconPaths';
import { aboutPageContent as content } from '../content/aboutPageContent';
import { brandImages } from '../config/brandImages';

const providerJoinPath = '/login?join=true&role=provider';

const AboutView: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <Helmet>
        <title>{content.seo.title}</title>
        <meta name="description" content={content.seo.description} />
      </Helmet>

      <Breadcrumb items={[{ label: content.hero.pageName }]} />

      <section className="relative overflow-hidden pb-20 pt-20 md:pb-24 md:pt-24 lg:pt-28">
        <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />

        <Container size="full">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <Label variant="overline" color="brand" className="mb-5">
                {content.hero.pageName}
              </Label>

              <Heading level={1} size="display" className="mb-6 text-slate-900">
                {content.hero.title}
              </Heading>

              <Text variant="lead" className="mb-8 max-w-3xl text-slate-600">
                {content.hero.subhead}
              </Text>

              <div className="mb-5 flex flex-wrap gap-4">
                <Button size="lg" variant="brand" onClick={() => navigate('/benefits')}>
                  {content.hero.primaryCta}
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigate('/provider-guide')}>
                  {content.hero.secondaryCta}
                </Button>
              </div>

              <Text variant="small" className="font-semibold text-slate-500">
                {content.hero.microcopy}
              </Text>
            </div>

            <div>
              <BrandImage
                src={brandImages.about.hero.src}
                fallbackSrc={brandImages.about.hero.fallbackSrc}
                alt={brandImages.about.hero.alt}
                className="h-full w-full rounded-[2.5rem] border border-slate-200 object-cover shadow-xl shadow-slate-200/60"
                aspectRatio="16 / 12"
              />
            </div>
          </div>
        </Container>
      </section>

      <Section spacing="lg" background="white">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 md:p-10">
              <Heading level={2} className="mb-4 text-slate-900">
                {content.why.title}
              </Heading>
              <Text className="mb-4 text-slate-600">{content.why.copy}</Text>
              <Text className="text-slate-600">{content.why.copyLine2}</Text>
            </div>

            <BrandImage
              src={brandImages.about.sections.why.src}
              fallbackSrc={brandImages.about.sections.why.fallbackSrc}
              alt={brandImages.about.sections.why.alt}
              className="h-full w-full rounded-[2rem] border border-slate-200 object-cover shadow-lg shadow-slate-200/50"
              aspectRatio="4 / 3"
            />
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="default">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
              <Heading level={2} className="mb-4 text-slate-900">
                {content.earlyStage.title}
              </Heading>
              <Text className="mb-4 text-slate-600">{content.earlyStage.copy}</Text>
              <Text className="mb-6 text-slate-600">{content.earlyStage.copyLine2}</Text>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <Text variant="small" className="font-semibold text-amber-900">
                  {content.earlyStage.microcopy}
                </Text>
              </div>
            </div>

            <BrandImage
              src={brandImages.about.sections.earlyStage.src}
              fallbackSrc={brandImages.about.sections.earlyStage.fallbackSrc}
              alt={brandImages.about.sections.earlyStage.alt}
              className="h-full w-full rounded-[2rem] border border-slate-200 object-cover shadow-lg shadow-slate-200/50"
              aspectRatio="4 / 3"
            />
          </div>
        </Container>
      </Section>

      <Section spacing="lg" background="white">
        <Container>
          <div className="mb-12 text-center">
            <Heading level={2} className="mb-4 text-slate-900">
              {content.pillars.title}
            </Heading>
            <Text variant="lead" className="mx-auto max-w-3xl text-slate-600">
              {content.pillars.subhead}
            </Text>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {content.pillars.items.map((pillar) => (
              <article
                key={pillar.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon path={iconPaths[pillar.icon]} size={20} />
                </div>
                <Heading level={4} className="mb-3 text-slate-900">
                  {pillar.title}
                </Heading>
                <Text className="text-slate-600">{pillar.copy}</Text>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="lg" background="default">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
              <Heading level={2} className="mb-4 text-slate-900">
                {content.slidingScale.title}
              </Heading>
              <Text className="mb-6 text-slate-600">{content.slidingScale.copy}</Text>

              <ul className="mb-6 space-y-3">
                {content.slidingScale.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-slate-700">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                      <Icon path={iconPaths.shield} size={12} />
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <Text variant="small" className="mb-6 font-semibold text-slate-500">
                {content.slidingScale.microcopy}
              </Text>

              <Button variant="brand" onClick={() => navigate('/calculator')}>
                {content.slidingScale.cta}
              </Button>
            </div>

            <BrandImage
              src={brandImages.about.sections.slidingScale.src}
              fallbackSrc={brandImages.about.sections.slidingScale.fallbackSrc}
              alt={brandImages.about.sections.slidingScale.alt}
              className="h-full w-full rounded-[2rem] border border-slate-200 object-cover shadow-lg shadow-slate-200/50"
              aspectRatio="4 / 3"
            />
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="white">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 md:p-10">
              <Heading level={2} className="mb-4 text-slate-900">
                {content.trustSafety.title}
              </Heading>
              <Text className="mb-6 text-slate-600">{content.trustSafety.copy}</Text>

              <ul className="mb-6 space-y-3">
                {content.trustSafety.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-slate-700">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                      <Icon path={iconPaths.info} size={12} />
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <Text variant="small" className="font-semibold text-slate-500">
                  {content.trustSafety.disclaimer}
                </Text>
              </div>
            </div>

            <BrandImage
              src={brandImages.about.sections.trustSafety.src}
              fallbackSrc={brandImages.about.sections.trustSafety.fallbackSrc}
              alt={brandImages.about.sections.trustSafety.alt}
              className="h-full w-full rounded-[2rem] border border-slate-200 object-cover shadow-lg shadow-slate-200/50"
              aspectRatio="4 / 3"
            />
          </div>
        </Container>
      </Section>

      <Section spacing="lg" background="default">
        <Container>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0f311c] px-8 py-12 text-white shadow-2xl md:px-12 md:py-16">
            <div className="pointer-events-none absolute inset-0 opacity-15">
              <BrandImage
                src={brandImages.about.sections.participation.src}
                fallbackSrc={brandImages.about.sections.participation.fallbackSrc}
                alt={brandImages.about.sections.participation.alt}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="relative z-10">
              <Heading level={2} color="white" className="mb-4 max-w-4xl">
                {content.participation.title}
              </Heading>
              <Text variant="lead" color="white" className="mb-8 max-w-4xl text-white/85">
                {content.participation.copy}
              </Text>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="brand" onClick={() => navigate(providerJoinPath)}>
                  {content.participation.primaryCta}
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigate('/search')}>
                  {content.participation.secondaryCta}
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => navigate('/contact')}
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  {content.participation.tertiaryCta}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default AboutView;
