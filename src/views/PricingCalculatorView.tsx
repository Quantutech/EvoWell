import React, { useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigation } from '../App';
import { SubscriptionTier } from '../types';
import Breadcrumb from '../components/Breadcrumb';
import Icon from '../components/ui/Icon';
import { iconPaths } from '../components/ui/iconPaths';
import { Section, Container } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button, Badge } from '../components/ui';
import { PRICING_TIERS } from '../config/pricing';
import { pricingCalculatorPageContent as content } from '../content/pricingCalculatorPageContent';
import type { PlanEstimate, CalculatorInputs } from './pricingCalculator.logic';
import { buildSlidingScalePlans, computePlanEstimates } from './pricingCalculator.logic';

const providerJoinPath = '/login?join=true&role=provider';

const fmtCurrency = (value: number, maxFractionDigits = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: maxFractionDigits,
  }).format(value);

const fmtPercent = (value: number) => `${value.toFixed(1)}%`;

const InputSlider: React.FC<{
  id: string;
  label: string;
  helper: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (value: number) => void;
}> = ({ id, label, helper, value, min, max, step = 1, format, onChange }) => {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2">
        <Label as="label" htmlFor={id}>
          {label}
        </Label>
        <span className="text-sm font-bold text-slate-800">
          {format ? format(value) : value}
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-3">{helper}</p>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
      />
    </div>
  );
};

const PlanOptionCard: React.FC<{
  estimate: PlanEstimate;
  isSelected: boolean;
  onClick: () => void;
}> = ({ estimate, isSelected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-[1.5rem] border p-5 transition-all ${
        isSelected
          ? 'border-brand-400 bg-brand-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <Heading level={4} className="text-slate-900 mb-1">
            {estimate.anchorTitle}
          </Heading>
          <p className="text-xs text-slate-500">{estimate.description}</p>
        </div>
        <Badge
          variant={estimate.badge === 'Recommended' ? 'brand' : 'neutral'}
          size="sm"
          pill
        >
          {estimate.badge}
        </Badge>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-slate-500 font-semibold mb-1">
            {content.comparisonPanel.membershipLabel}
          </p>
          <p className="font-black text-slate-900">{fmtCurrency(estimate.membershipCost)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-slate-500 font-semibold mb-1">
            {content.comparisonPanel.perSessionLabel}
          </p>
          <p className="font-black text-slate-900">{fmtCurrency(estimate.perSessionCost, 2)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-slate-500 font-semibold mb-1">
            {content.comparisonPanel.keepLabel}
          </p>
          <p className="font-black text-slate-900">{fmtCurrency(estimate.takeHomeEstimate)}</p>
        </div>
      </div>
    </button>
  );
};

const FaqItem: React.FC<{ question: string; answer: string }> = ({
  question,
  answer,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        isOpen ? 'border-brand-200 bg-brand-50/30 shadow-sm' : 'border-slate-100 bg-white'
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <Heading level={4} className="text-sm pr-4">
          {question}
        </Heading>
        <span
          className={`text-slate-400 transition-transform duration-300 shrink-0 ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6">
          <Text variant="small" color="muted">
            {answer}
          </Text>
        </div>
      </div>
    </div>
  );
};

const PricingCalculatorView: React.FC = () => {
  const { navigate } = useNavigation();
  const comparisonHeadingRef = useRef<HTMLDivElement | null>(null);

  const [inputs, setInputs] = useState<CalculatorInputs>({
    sessionsPerMonth: 40,
    avgSessionRate: 150,
    billingCycle: 'monthly',
  });
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(
    SubscriptionTier.PROFESSIONAL,
  );

  const plans = useMemo(() => buildSlidingScalePlans(PRICING_TIERS), []);
  const estimates = useMemo(
    () => computePlanEstimates(inputs, plans),
    [inputs, plans],
  );
  const selectedPlan = estimates.find((plan) => plan.id === selectedTier) ?? estimates[0];
  const estimatedMonthlyRevenue = inputs.sessionsPerMonth * inputs.avgSessionRate;

  const handleScrollToCalculator = () => {
    const calculatorSection = document.getElementById('calculator');
    calculatorSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    window.setTimeout(() => {
      comparisonHeadingRef.current?.focus();
    }, 300);
  };

  const handleCompareIncluded = () => {
    const includedSection = document.getElementById('included-every-plan');
    includedSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <Helmet>
        <title>{content.seo.title}</title>
        <meta name="description" content={content.seo.description} />
      </Helmet>

      <Breadcrumb
        items={[
          { label: 'For Providers', path: '/benefits' },
          { label: 'Sliding-Scale Calculator' },
        ]}
      />

      {/* Hero */}
      <section className="relative pt-20 md:pt-24 lg:pt-28 pb-16 md:pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-brand-100 rounded-full blur-[110px] opacity-70 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[320px] h-[320px] bg-blue-100 rounded-full blur-[110px] opacity-70 pointer-events-none" />
        <Container size="narrow" className="text-center">
          <Label variant="overline" className="text-brand-600 mb-5 inline-block">
            {content.hero.eyebrow}
          </Label>
          <Heading level={1} size="display" className="mb-5 text-slate-900">
            {content.hero.title}
          </Heading>
          <Text variant="lead" className="text-slate-600 mb-8">
            {content.hero.subhead}
          </Text>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-5">
            <Button size="lg" variant="brand" onClick={handleScrollToCalculator}>
              {content.hero.primaryCta}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate(providerJoinPath)}
            >
              {content.hero.secondaryCta}
            </Button>
          </div>

          <Text variant="small" className="text-slate-500 font-semibold">
            {content.hero.microcopy}
          </Text>
        </Container>
      </section>

      {/* Calculator Intro */}
      <Section spacing="sm" background="white">
        <Container className="max-w-4xl text-center">
          <Heading level={2} className="mb-4 text-slate-900">
            {content.calculatorIntro.title}
          </Heading>
          <Text variant="lead" className="text-slate-600 mb-5">
            {content.calculatorIntro.subhead}
          </Text>
          <Text variant="small" className="text-slate-500 font-semibold">
            {content.calculatorIntro.microcopy}
          </Text>
        </Container>
      </Section>

      {/* Calculator */}
      <Section id="calculator" spacing="md" background="default">
        <Container>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="grid lg:grid-cols-12">
              {/* Left panel */}
              <div className="lg:col-span-4 bg-slate-50 p-8 md:p-10 border-r border-slate-100">
                <Heading level={3} className="mb-8">
                  {content.practicePanel.title}
                </Heading>

                <div className="space-y-8">
                  <InputSlider
                    id="sessions-per-month"
                    label={content.practicePanel.sessionsLabel}
                    helper={content.practicePanel.sessionsHelper}
                    value={inputs.sessionsPerMonth}
                    min={5}
                    max={220}
                    onChange={(value) =>
                      setInputs((previous) => ({ ...previous, sessionsPerMonth: value }))
                    }
                  />

                  <InputSlider
                    id="average-session-rate"
                    label={content.practicePanel.sessionRateLabel}
                    helper={content.practicePanel.sessionRateHelper}
                    value={inputs.avgSessionRate}
                    min={50}
                    max={450}
                    step={5}
                    format={(value) => fmtCurrency(value)}
                    onChange={(value) =>
                      setInputs((previous) => ({ ...previous, avgSessionRate: value }))
                    }
                  />
                </div>

                <div className="mt-10">
                  <Label className="mb-2">{content.practicePanel.billingCycleLabel}</Label>
                  <p className="text-xs text-slate-500 mb-3">
                    {content.practicePanel.billingCycleHelper}
                  </p>
                  <div className="flex bg-slate-200 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() =>
                        setInputs((previous) => ({ ...previous, billingCycle: 'monthly' }))
                      }
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        inputs.billingCycle === 'monthly'
                          ? 'bg-white shadow-sm text-slate-800'
                          : 'text-slate-500'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setInputs((previous) => ({ ...previous, billingCycle: 'annual' }))
                      }
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        inputs.billingCycle === 'annual'
                          ? 'bg-white shadow-sm text-slate-800'
                          : 'text-slate-500'
                      }`}
                    >
                      Annual
                    </button>
                  </div>
                </div>

                <div className="mt-10 bg-white rounded-2xl p-5 border border-slate-100">
                  <Label color="muted" className="mb-1 block">
                    {content.practicePanel.estimatedRevenueLabel}
                  </Label>
                  <p
                    id="estimated-monthly-revenue-value"
                    className="text-3xl font-black text-slate-900 mb-2"
                  >
                    {fmtCurrency(estimatedMonthlyRevenue)}
                  </p>
                  <Text variant="small" color="muted">
                    {content.practicePanel.estimatedRevenueMicrocopy}
                  </Text>
                </div>
              </div>

              {/* Right panel */}
              <div className="lg:col-span-8 p-8 md:p-10 flex flex-col">
                <div
                  ref={comparisonHeadingRef}
                  tabIndex={-1}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg mb-8"
                >
                  <Heading level={3} className="mb-1">
                    {content.comparisonPanel.title}
                  </Heading>
                  <Text variant="small" color="muted">
                    {content.comparisonPanel.subhead}
                  </Text>
                </div>

                <div className="space-y-4 mb-5">
                  {estimates.map((estimate) => (
                    <PlanOptionCard
                      key={estimate.id}
                      estimate={estimate}
                      isSelected={estimate.id === selectedTier}
                      onClick={() => setSelectedTier(estimate.id)}
                    />
                  ))}
                </div>

                <Text variant="small" color="muted" className="mb-8">
                  {content.comparisonPanel.microcopy}
                </Text>

                {/* Selected summary */}
                <div className="bg-slate-900 rounded-[2rem] p-7 md:p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-56 h-56 bg-brand-500/20 blur-[80px] rounded-full pointer-events-none" />

                  <div className="relative z-10">
                    <Heading level={4} color="white" className="mb-6">
                      {content.selectedPlan.titlePrefix} {selectedPlan.anchorTitle}
                    </Heading>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                      <div>
                        <Label className="text-white/50 mb-1 block">
                          {content.selectedPlan.monthlyCostLabel}
                        </Label>
                        <Text color="white" weight="bold">
                          {fmtCurrency(selectedPlan.membershipCost)}
                        </Text>
                      </div>
                      <div>
                        <Label className="text-white/50 mb-1 block">
                          {content.selectedPlan.keepLabel}
                        </Label>
                        <Text color="white" weight="bold">
                          {fmtCurrency(selectedPlan.takeHomeEstimate)}
                        </Text>
                      </div>
                      <div>
                        <Label className="text-white/50 mb-1 block">
                          {content.selectedPlan.effectiveCostLabel}
                        </Label>
                        <Text color="white" weight="bold">
                          {fmtPercent(selectedPlan.effectiveCostPct)}
                        </Text>
                      </div>
                      <div>
                        <Label className="text-white/50 mb-1 block">
                          {content.selectedPlan.perSessionCostLabel}
                        </Label>
                        <Text color="white" weight="bold">
                          {fmtCurrency(selectedPlan.perSessionCost, 2)}
                        </Text>
                      </div>
                    </div>

                    <p id="selected-plan-message" className="text-white/90 mb-6">
                      {selectedPlan.summaryMessage}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                      <Button
                        variant="brand"
                        onClick={() => navigate(providerJoinPath)}
                      >
                        {content.selectedPlan.primaryCta}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleCompareIncluded}
                        className="bg-white text-slate-900 border-white hover:bg-slate-100"
                      >
                        {content.selectedPlan.secondaryCta}
                      </Button>
                    </div>

                    <Text variant="small" className="text-white/60">
                      {content.selectedPlan.disclaimer}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Included in every plan */}
      <Section id="included-every-plan" spacing="md" background="white">
        <Container>
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <Heading level={2} className="mb-4">
              {content.included.title}
            </Heading>
            <Text color="muted">{content.included.subhead}</Text>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.included.cards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-6"
              >
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-600 mb-4">
                  <Icon path={iconPaths[card.icon]} size={20} />
                </div>
                <Heading level={4} className="mb-2 text-base">
                  {card.title}
                </Heading>
                <Text variant="small" color="muted">
                  {card.copy}
                </Text>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Why sliding scale */}
      <Section spacing="md" background="default">
        <Container className="max-w-4xl">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-7 md:p-9">
            <Heading level={2} className="mb-4">
              {content.whySlidingScale.title}
            </Heading>
            <Text color="muted" className="mb-6">
              {content.whySlidingScale.copy}
            </Text>
            <ul className="space-y-3 mb-6">
              {content.whySlidingScale.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-slate-700">
                  <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center mt-0.5">
                    <Icon path={iconPaths.star} size={12} />
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <Text variant="small" color="muted">
              {content.whySlidingScale.microcopy}
            </Text>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section spacing="md" background="default">
        <Container size="narrow">
          <div className="text-center mb-12">
            <Heading level={2}>{content.faq.title}</Heading>
          </div>
          <div className="space-y-4">
            {content.faq.items.map((item) => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* Final CTA */}
      <Section spacing="md" background="brand" className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[560px] h-[560px] bg-brand-500/20 rounded-full blur-[100px] pointer-events-none" />
        <Container size="narrow" className="text-center relative z-10">
          <Heading level={2} size="display" color="white" className="mb-6">
            {content.finalCta.title}
          </Heading>
          <Text variant="lead" color="white" className="mb-8 opacity-95">
            {content.finalCta.subhead}
          </Text>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Button variant="secondary" onClick={() => navigate(providerJoinPath)}>
              {content.finalCta.primaryCta}
            </Button>
            <Button
              className="bg-transparent border border-white/20 hover:bg-white/10 text-white"
              onClick={handleScrollToCalculator}
            >
              {content.finalCta.secondaryCta}
            </Button>
          </div>
          <Text variant="small" className="text-white/75 font-semibold">
            {content.finalCta.microcopy}
          </Text>
        </Container>
      </Section>

      {/* Page disclaimer */}
      <Section spacing="sm" background="white">
        <Container className="max-w-4xl">
          <Text variant="small" className="text-center text-slate-500">
            {content.pageDisclaimer}
          </Text>
        </Container>
      </Section>
    </div>
  );
};

export default PricingCalculatorView;
