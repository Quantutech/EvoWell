import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigation } from '../App';
import { useEvo } from '../components/evo/EvoContext';
import Breadcrumb from '../components/Breadcrumb';
import { Section, Container } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button, BrandImage } from '../components/ui';
import Icon from '../components/ui/Icon';
import { iconPaths } from '../components/ui/iconPaths';
import { providerGuidePageContent as content } from '../content/providerGuidePageContent';
import { brandImages } from '../config/brandImages';

const providerJoinPath = '/login?join=true&role=provider';

const ProviderGuideView: React.FC = () => {
  const { navigate } = useNavigation();
  const { openEvo } = useEvo();

  const handleStartApplication = () => navigate(providerJoinPath);

  const scrollToVerification = () => {
    const target = document.getElementById('verification');
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <Helmet>
        <title>{content.seo.title}</title>
        <meta name="description" content={content.seo.description} />
      </Helmet>

      <Breadcrumb items={[{ label: 'Provider Guide' }]} />

      {/* Hero */}
      <section className="relative pt-20 md:pt-24 lg:pt-28 pb-20 md:pb-28 overflow-hidden">
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-brand-100 rounded-full blur-[110px] opacity-70 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-blue-100 rounded-full blur-[110px] opacity-70 pointer-events-none" />

        <Container size="full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Label variant="overline" className="text-brand-600 mb-5">
                {content.hero.eyebrow}
              </Label>
              <Heading level={1} size="display" className="mb-5 text-slate-900">
                {content.hero.title}
              </Heading>
              <Text variant="lead" className="text-slate-600 mb-8 max-w-2xl">
                {content.hero.subhead}
              </Text>

              <div className="flex flex-wrap gap-4 mb-5">
                <Button size="lg" variant="brand" onClick={handleStartApplication}>
                  {content.hero.primaryCta}
                </Button>
                <Button size="lg" variant="secondary" onClick={scrollToVerification}>
                  {content.hero.secondaryCta}
                </Button>
              </div>

              <Text variant="small" className="text-slate-500 font-semibold">
                {content.hero.microcopy}
              </Text>
            </div>

            <div className="relative">
              <BrandImage
                src={brandImages.providerGuide.hero.src}
                fallbackSrc={brandImages.providerGuide.hero.fallbackSrc}
                alt={brandImages.providerGuide.hero.alt}
                className="w-full h-full object-cover rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/60"
                aspectRatio="4 / 3"
                wrapperClassName="w-full max-w-2xl mx-auto"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* What You Get */}
      <Section spacing="lg" background="white">
        <Container>
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <Heading level={2} className="mb-4 text-slate-900">
              {content.whatYouGet.title}
            </Heading>
            <Text variant="lead" className="text-slate-600">
              {content.whatYouGet.subhead}
            </Text>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {content.whatYouGet.cards.map((card) => {
              const cardImage = brandImages.providerGuide.cards[card.imageKey];

              return (
                <article
                  key={card.title}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
                >
                  <BrandImage
                    src={cardImage.src}
                    fallbackSrc={cardImage.fallbackSrc}
                    alt={cardImage.alt}
                    className="w-full h-full object-cover"
                    aspectRatio="4 / 3"
                  />

                  <div className="p-6">
                    <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                      <Icon path={iconPaths[card.icon]} size={22} />
                    </div>
                    <Heading level={4} className="mb-3 text-slate-900">
                      {card.title}
                    </Heading>
                    <Text className="text-slate-600">{card.copy}</Text>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Onboarding Steps */}
      <Section spacing="lg" background="default">
        <Container>
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <Heading level={2} className="mb-4 text-slate-900">
              {content.onboardingSteps.title}
            </Heading>
            <Text variant="lead" className="text-slate-600">
              {content.onboardingSteps.subhead}
            </Text>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {content.onboardingSteps.steps.map((step) => (
              <article
                key={step.title}
                className="bg-white rounded-3xl border border-slate-200 p-7 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white text-lg font-black flex items-center justify-center">
                    {step.step.replace('Step ', '')}
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Icon path={iconPaths[step.icon]} size={18} />
                  </div>
                </div>
                <Heading level={4} className="mb-3 text-slate-900">
                  {step.title}
                </Heading>
                <Text className="text-slate-600 mb-3">{step.copy}</Text>
                <Text variant="small" className="text-slate-500 font-semibold">
                  {step.microcopy}
                </Text>
              </article>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button size="lg" variant="brand" onClick={handleStartApplication}>
              {content.onboardingSteps.button}
            </Button>
          </div>
        </Container>
      </Section>

      {/* Verification */}
      <Section id="verification" spacing="lg" background="white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <Heading level={2} className="mb-4 text-slate-900">
                {content.verification.title}
              </Heading>
              <Text variant="lead" className="text-slate-600 mb-7">
                {content.verification.subhead}
              </Text>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-5">
                <Heading level={4} className="mb-4 text-slate-900">
                  {content.verification.itemsTitle}
                </Heading>
                <ul className="space-y-3">
                  {content.verification.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mt-0.5">
                        <Icon path={iconPaths.shield} size={12} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Text variant="small" className="text-slate-500 mb-6">
                {content.verification.microcopy}
              </Text>

              <Button variant="secondary" onClick={() => navigate('/contact')}>
                {content.verification.cta}
              </Button>
            </div>

            <div>
              <BrandImage
                src={brandImages.providerGuide.verification.src}
                fallbackSrc={brandImages.providerGuide.verification.fallbackSrc}
                alt={brandImages.providerGuide.verification.alt}
                className="w-full h-full object-cover rounded-[2rem] border border-slate-200 shadow-lg"
                aspectRatio="16 / 10"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* Profile Tips */}
      <Section spacing="md" background="default">
        <Container>
          <div className="bg-white rounded-[2rem] border border-slate-200 p-8 md:p-10 shadow-sm">
            <Heading level={2} className="mb-4 text-slate-900">
              {content.profileTips.title}
            </Heading>
            <Text variant="lead" className="text-slate-600 mb-8">
              {content.profileTips.subhead}
            </Text>

            <ul className="grid md:grid-cols-2 gap-4">
              {content.profileTips.bullets.map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-3 text-slate-700 bg-slate-50 rounded-xl border border-slate-200 p-4"
                >
                  <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center mt-0.5">
                    <Icon path={iconPaths.star} size={12} />
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* Evo */}
      <Section spacing="md" background="white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <Heading level={2} className="mb-4 text-slate-900">
                {content.evo.title}
              </Heading>
              <Text variant="lead" className="text-slate-600 mb-6">
                {content.evo.subhead}
              </Text>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6">
                <Text variant="small" className="text-amber-900 font-semibold">
                  {content.evo.safety}
                </Text>
              </div>

              <Button variant="brand" onClick={openEvo}>
                {content.evo.cta}
              </Button>
            </div>

            <div>
              <BrandImage
                src={brandImages.providerGuide.evo.src}
                fallbackSrc={brandImages.providerGuide.evo.fallbackSrc}
                alt={brandImages.providerGuide.evo.alt}
                className="w-full h-full object-cover rounded-[2rem] border border-slate-200 shadow-lg"
                aspectRatio="16 / 9"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* Final CTA */}
      <Section spacing="lg" background="default">
        <Container>
          <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl">
            <BrandImage
              src={brandImages.providerGuide.finalCta.src}
              fallbackSrc={brandImages.providerGuide.finalCta.fallbackSrc}
              alt={brandImages.providerGuide.finalCta.alt}
              className="w-full h-full object-cover"
              aspectRatio="16 / 7"
            />
            <div className="absolute inset-0 bg-slate-900/45" />
            <div className="absolute inset-0 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <Heading level={2} color="white" className="mb-4 max-w-3xl">
                {content.finalCta.title}
              </Heading>
              <Text variant="lead" className="text-slate-100 max-w-3xl mb-8">
                {content.finalCta.subhead}
              </Text>

              <div className="flex flex-wrap gap-4 mb-5">
                <Button size="lg" variant="brand" onClick={handleStartApplication}>
                  {content.finalCta.primaryCta}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleStartApplication}
                  className="bg-white text-brand-600 border-white hover:bg-brand-50"
                >
                  {content.finalCta.secondaryCta}
                </Button>
              </div>

              <Text variant="small" className="text-slate-100 font-semibold">
                {content.finalCta.microcopy}
              </Text>
            </div>
          </div>
        </Container>
      </Section>

      {/* Disclaimer */}
      <section className="pb-16">
        <Container>
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5">
            <Text variant="small" className="text-slate-600">
              {content.disclaimer}
            </Text>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default ProviderGuideView;
