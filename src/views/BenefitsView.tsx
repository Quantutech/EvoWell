import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigation } from '../App';
import Breadcrumb from '../components/Breadcrumb';
import PointSolutionsReplacement from '../components/PointSolutionsReplacement';
import { Section, Container } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button, BrandImage } from '../components/ui';
import Icon from '../components/ui/Icon';
import { iconPaths } from '../components/ui/iconPaths';
import { brandImages } from '../config/brandImages';

/* ─── Shared pricing data (single source of truth) ───────────────────── */
export const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Get listed, get found',
    monthlyPrice: 0,
    annualPrice: 0,
    platformFee: 10,
    clientCap: 15,
    features: [
      'Basic directory listing',
      'Secure messaging',
      'Client dashboard',
      'Up to 15 active clients',
      'Standard support',
    ],
    highlight: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'For full-time practitioners',
    monthlyPrice: 39,
    annualPrice: 29,
    platformFee: 5,
    clientCap: Infinity,
    features: [
      'Priority listing placement',
      'HD video sessions',
      'Unlimited active clients',
      'Analytics dashboard',
      'Custom booking link',
      'Reduced 5% platform fee',
    ],
    highlight: true,
  },
  {
    id: 'practice',
    name: 'Practice',
    tagline: 'For group practices',
    monthlyPrice: 99,
    annualPrice: 79,
    platformFee: 3,
    clientCap: Infinity,
    features: [
      'Everything in Growth',
      'Up to 5 provider seats',
      'Digital product storefront',
      'White-label booking page',
      'Team analytics & reporting',
      'Reduced 3% platform fee',
    ],
    highlight: false,
  },
] as const;

const providerJoinPath = '/login?join=true&role=provider';

const ecosystemItems: Array<{
  title: string;
  copy: string;
  icon: keyof typeof iconPaths;
}> = [
  {
    title: 'Practice Management (without the clutter)',
    copy: 'Scheduling, reminders, and workflows that reduce admin load.',
    icon: 'settings',
  },
  {
    title: 'Client Communication (built for care)',
    copy: 'Secure messaging and simple follow-ups without juggling apps.',
    icon: 'chat',
  },
  {
    title: 'Discovery That Rewards Credibility',
    copy: 'Verified profiles, clear filters, and trust signals clients understand.',
    icon: 'shield',
  },
  {
    title: "Payments That Don't Interrupt Sessions",
    copy: 'Straightforward billing and payouts designed to stay out of your way.',
    icon: 'dollar',
  },
  {
    title: 'Passive Income Through the Exchange',
    copy: 'Turn your tools into resources others can buy and use.',
    icon: 'folder',
  },
];

const exchangeFeatures: Array<{
  title: string;
  copy: string;
  icon: keyof typeof iconPaths;
}> = [
  {
    title: 'Publish once. Earn repeatedly.',
    copy: 'Turn your best resources into downloads that support your practice.',
    icon: 'download',
  },
  {
    title: 'Built for clinical-quality tools.',
    copy: 'Clear categories, search, and filters so the right people find your work.',
    icon: 'search',
  },
  {
    title: 'Your content, your voice.',
    copy: 'Keep your style. Keep your standards. Keep improving over time.',
    icon: 'article',
  },
  {
    title: 'Free and paid options.',
    copy: 'Share a free starter resource or build a paid library.',
    icon: 'star',
  },
  {
    title: 'Verified creators only.',
    copy: 'Trust stays high because contributors are verified providers.',
    icon: 'shield',
  },
];

const slidingScaleAnchors = [
  {
    label: 'Minimum - Access',
    detail: 'for early-stage, rebuilding, limited caseload',
  },
  {
    label: 'Recommended - Sustain',
    detail: 'covers operations + ongoing development',
  },
  {
    label: 'Supporter - Sponsor',
    detail: 'helps subsidize other providers and funds new tools',
  },
] as const;

const onboardingSteps: Array<{
  step: string;
  title: string;
  copy: string;
  microcopy?: string;
}> = [
  {
    step: 'Step 1',
    title: 'Apply',
    copy: 'Create your account and start your provider profile.',
  },
  {
    step: 'Step 2',
    title: 'Get verified',
    copy: "Submit credentials for review so clients can trust who they're booking with.",
    microcopy: 'Verification protects both clients and providers.',
  },
  {
    step: 'Step 3',
    title: 'Build your profile',
    copy: 'Add specialties, modalities, languages, availability, rates, and accepted insurance (if applicable).',
  },
  {
    step: 'Step 4',
    title: 'Go live & grow',
    copy: 'Publish your profile, enable booking, and optionally add your first Exchange resource.',
  },
];

const BenefitsView: React.FC = () => {
  const { navigate } = useNavigation();
  const [selectedAnchor, setSelectedAnchor] = useState(1);
  const activeAnchor = slidingScaleAnchors[selectedAnchor];

  const navigateToProviderJoin = () => navigate(providerJoinPath);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('sliding-scale-pricing');
    if (!pricingSection) return;
    pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <Helmet>
        <title>EvoWell for Providers | Run Your Practice. Grow With Trust.</title>
        <meta
          name="description"
          content="A provider-first platform for scheduling, messaging, payments, discovery, and a marketplace to sell your resources—on a sliding-scale membership."
        />
      </Helmet>

      <Breadcrumb items={[{ label: 'For Providers' }]} />

      {/* Hero */}
      <section className="relative pt-20 md:pt-24 lg:pt-28 pb-20 md:pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-brand-100 rounded-full blur-[110px] opacity-70 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[340px] h-[340px] bg-blue-100 rounded-full blur-[110px] opacity-70 pointer-events-none" />
        <Container size="full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Label variant="overline" className="text-brand-600 mb-5">
                For Providers
              </Label>
              <Heading level={1} size="display" className="mb-5 text-slate-900">
                Your Practice. Elevated.
              </Heading>
              <Text variant="lead" className="text-slate-600 mb-8 max-w-2xl">
                Everything you need to run a modern clinical wellness practice—booking, messaging, payments,
                visibility, and a marketplace for your tools. Built for trust. Designed for ease.
              </Text>

              <div className="flex flex-wrap gap-4 mb-4">
                <Button size="lg" variant="brand" onClick={navigateToProviderJoin}>
                  Create Provider Profile
                </Button>
                <Button size="lg" variant="secondary" onClick={navigateToProviderJoin}>
                  Start Application
                </Button>
              </div>

              <button
                type="button"
                onClick={scrollToPricing}
                className="text-sm font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-4 mb-5"
              >
                See how sliding-scale pricing works
              </button>

              <Text variant="small" className="text-slate-500 font-semibold">
                Sliding-scale membership • Change your price anytime • Verification keeps the network credible
              </Text>
            </div>

            <div className="relative">
              <BrandImage
                src={brandImages.providerGuide.hero.src}
                fallbackSrc={brandImages.providerGuide.hero.fallbackSrc}
                alt="Provider operations and growth on EvoWell"
                className="w-full h-full object-cover rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/60"
                aspectRatio="4 / 3"
                wrapperClassName="w-full max-w-2xl mx-auto"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Provider Ecosystem */}
      <Section spacing="lg" background="white">
        <Container size="full">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
            <div>
              <Label variant="overline" className="text-brand-600 mb-4">
                The Provider Ecosystem
              </Label>
              <Heading level={2} className="mb-4 text-slate-900">
                One platform for the work behind the work.
              </Heading>
              <Text variant="lead" className="text-slate-600 mb-8 max-w-3xl">
                Stop stitching together tools that don&apos;t talk to each other. EvoWell helps you stay organized,
                get found, and grow—without losing your voice or independence.
              </Text>

              <div className="space-y-4">
                {ecosystemItems.map((item) => (
                  <article key={item.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <span className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-brand-600 flex items-center justify-center shrink-0">
                        <Icon path={iconPaths[item.icon]} size={20} />
                      </span>
                      <div>
                        <Heading level={4} className="mb-1 text-slate-900">
                          {item.title}
                        </Heading>
                        <Text className="text-slate-600">{item.copy}</Text>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                <Button size="lg" variant="brand" onClick={navigateToProviderJoin}>
                  Create Provider Profile
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigate('/exchange')}>
                  Browse Provider Exchange
                </Button>
              </div>
            </div>

            <div className="lg:sticky lg:top-24">
              <BrandImage
                src={brandImages.providerGuide.cards.tools.src}
                fallbackSrc={brandImages.providerGuide.cards.tools.fallbackSrc}
                alt="Provider dashboard workspace"
                className="w-full h-full object-cover rounded-[2rem] border border-slate-200 shadow-xl"
                aspectRatio="4 / 3"
              />
            </div>
          </div>
        </Container>
      </Section>

      <PointSolutionsReplacement
        eyebrow="Provider Infrastructure"
        title="One platform."
        titleAccent="To replace them all."
        subhead="Replace spreadsheets, scattered apps, and patchwork systems with one clean experience—for you and your clients."
        microcopy="EvoWell is designed to integrate smoothly with how you already work—without forcing you into a rigid template."
      />

      {/* Provider Exchange */}
      <Section spacing="lg" background="dark">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <Heading level={2} color="white" className="mb-4">
                Provider Exchange - monetize your expertise.
              </Heading>
              <Text variant="lead" className="text-slate-300 mb-8">
                Sell templates, worksheets, guides, toolkits, and courses—created by verified providers and trusted
                by the EvoWell community.
              </Text>

              <div className="flex flex-wrap gap-4 mb-4">
                <Button size="lg" variant="brand" onClick={() => navigate('/exchange')}>
                  Browse the Exchange
                </Button>
                <Button size="lg" variant="secondary" onClick={navigateToProviderJoin}>
                  Sell a Resource
                </Button>
              </div>

              <Text variant="small" className="text-slate-400 font-semibold">
                Only verified providers can publish to the Exchange.
              </Text>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {exchangeFeatures.map((feature) => (
                <article
                  key={feature.title}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm"
                >
                  <span className="w-10 h-10 rounded-xl bg-white/10 text-brand-300 flex items-center justify-center mb-4">
                    <Icon path={iconPaths[feature.icon]} size={20} />
                  </span>
                  <Heading level={4} color="white" className="mb-2">
                    {feature.title}
                  </Heading>
                  <Text className="text-slate-300">{feature.copy}</Text>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Sliding Scale */}
      <Section id="sliding-scale-pricing" spacing="lg" background="white">
        <Container className="max-w-5xl">
          <div className="text-center mb-10">
            <Heading level={2} className="mb-4 text-slate-900">
              Pay what&apos;s fair. Scale when you&apos;re ready.
            </Heading>
            <Text variant="lead" className="text-slate-600">
              EvoWell uses a sliding-scale membership so more providers can access modern tools—without compromising
              the platform. Choose your price within a range. Adjust anytime.
            </Text>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 md:p-8">
            <label htmlFor="sliding-scale-tier" className="sr-only">
              Select sliding-scale membership level
            </label>
            <input
              id="sliding-scale-tier"
              type="range"
              min={0}
              max={2}
              step={1}
              value={selectedAnchor}
              onChange={(event) => setSelectedAnchor(Number(event.target.value))}
              className="w-full accent-brand-600"
            />

            <div className="grid md:grid-cols-3 gap-3 mt-5">
              {slidingScaleAnchors.map((anchor, index) => (
                <button
                  key={anchor.label}
                  type="button"
                  onClick={() => setSelectedAnchor(index)}
                  className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                    selectedAnchor === index
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-bold">{anchor.label}</p>
                  <p className="text-xs mt-1">{anchor.detail}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-white border border-slate-200 p-5">
              <Heading level={4} className="mb-2 text-slate-900">
                {activeAnchor.label}
              </Heading>
              <Text className="text-slate-600">{activeAnchor.detail}</Text>
            </div>

            <Text className="text-slate-600 mt-5">
              Your core access stays the same across the sliding scale. This is about accessibility and shared
              sustainability.
            </Text>

            <div className="mt-6">
              <Button size="lg" variant="brand" onClick={navigateToProviderJoin}>
                Set Your Price
              </Button>
            </div>
          </div>

          <Text className="text-slate-600 mt-8">
            Because providers shouldn&apos;t be priced out of good infrastructure. We keep a minimum to maintain secure
            systems and support. Those who can contribute more help keep EvoWell accessible.
          </Text>
        </Container>
      </Section>

      {/* Social Proof */}
      <Section spacing="md" background="default">
        <Container className="max-w-4xl">
          <div className="bg-white rounded-[2rem] border border-slate-200 p-8 md:p-10 shadow-sm text-center">
            <Heading level={2} className="mb-4 text-slate-900">
              Built by people who understand the reality of practice.
            </Heading>
            <Text variant="lead" className="text-slate-600">
              We&apos;re building EvoWell alongside providers—prioritizing usability, trust, and long-term
              sustainability over flashy features.
            </Text>
            <Text variant="small" className="text-slate-500 mt-4">
              Early access is evolving—your feedback shapes what ships next.
            </Text>
          </div>
        </Container>
      </Section>

      {/* How It Works */}
      <Section spacing="lg" background="white">
        <Container>
          <div className="text-center mb-12">
            <Heading level={2} className="mb-4 text-slate-900">
              Live in under a week.
            </Heading>
            <Text variant="lead" className="text-slate-600">
              A straightforward path from signup to a public profile.
            </Text>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {onboardingSteps.map((step, index) => (
              <article key={step.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="text-xs font-black uppercase tracking-widest text-brand-600 mb-3">{step.step}</p>
                <Heading level={4} className="mb-3 text-slate-900">
                  {step.title}
                </Heading>
                <Text className="text-slate-600 mb-3">{step.copy}</Text>
                {step.microcopy && (
                  <Text variant="small" className="text-slate-500">
                    {step.microcopy}
                  </Text>
                )}
                {index === 0 && (
                  <div className="mt-4">
                    <Button variant="brand" size="sm" onClick={navigateToProviderJoin}>
                      Start Application
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* Final CTA */}
      <Section spacing="md" background="default">
        <Container className="max-w-6xl">
          <div className="rounded-[2.5rem] bg-gradient-to-br from-brand-700 to-brand-500 text-white p-8 md:p-12 lg:p-16 shadow-2xl">
            <Heading level={2} color="white" className="mb-4 max-w-4xl">
              Ready to join the evolution?
            </Heading>
            <Text variant="lead" className="text-brand-50 max-w-4xl mb-8">
              Build a verified presence, simplify your workflow, and grow your practice—on a sliding scale that
              respects where you are today.
            </Text>

            <div className="flex flex-wrap gap-4 mb-5">
              <Button size="lg" variant="primary" onClick={navigateToProviderJoin}>
                Create Provider Profile
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/contact')}>
                Talk to Support
              </Button>
            </div>

            <Text variant="small" className="text-brand-100 font-semibold">
              No long-term contracts. Change your price anytime.
            </Text>
          </div>
        </Container>
      </Section>

      {/* Footer Disclaimer */}
      <Section spacing="sm" background="white">
        <Container className="max-w-5xl">
          <div className="text-center">
            <Text variant="small" className="text-slate-500">
              EvoWell is a platform that helps people find providers and helps providers manage their practice. Evo and
              platform content are for informational purposes only and are not medical advice. If you&apos;re experiencing
              an emergency, call local emergency services.
            </Text>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default BenefitsView;
