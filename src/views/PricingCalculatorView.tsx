import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigation } from '../App';
import Breadcrumb from '../components/Breadcrumb';
import { PRICING_TIERS } from './BenefitsView';
import { PageHero, Section, Container, Grid } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button, Card, CardHeader, CardBody, Badge } from '../components/ui';

/* ─── Helpers ────────────────────────────────────────────────────────── */

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

/* ─── Calculator logic ───────────────────────────────────────────────── */

interface CalcInputs {
  sessionsPerMonth: number;
  avgSessionRate: number;
  billingCycle: 'monthly' | 'annual';
}

function computeTierCosts(inputs: CalcInputs) {
  const { sessionsPerMonth, avgSessionRate, billingCycle } = inputs;
  const grossRevenue = sessionsPerMonth * avgSessionRate;

  return PRICING_TIERS.map(tier => {
    const subscription = billingCycle === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
    const platformFees = grossRevenue * (tier.platformFee / 100);
    const totalCost = subscription + platformFees;
    const takeHome = grossRevenue - totalCost;
    const effectiveRate = grossRevenue > 0 ? (totalCost / grossRevenue) * 100 : 0;
    const cappedWarning = tier.clientCap !== Infinity && sessionsPerMonth > tier.clientCap * 4; // rough: 4 sessions/client avg

    return {
      ...tier,
      subscription,
      platformFees,
      totalCost,
      takeHome,
      effectiveRate,
      cappedWarning,
    };
  });
}

/* ─── Slider component ───────────────────────────────────────────────── */

const InputSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step = 1, format, onChange }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between mb-3">
        <Label>{label}</Label>
        <span className="text-sm font-bold text-slate-800">{format ? format(value) : value}</span>
      </div>
      <div className="relative">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
        />
        {/* Active track fill */}
        <div
          className="absolute top-0 left-0 h-2 bg-brand-500 rounded-l-lg pointer-events-none"
          style={{ width: `${pct}%` }}
        ></div>
      </div>
    </div>
  );
};

/* ─── Comparison bar ─────────────────────────────────────────────────── */

const CostBar: React.FC<{
  tier: ReturnType<typeof computeTierCosts>[number];
  maxCost: number;
  isRecommended: boolean;
  isSelected: boolean;
  onClick: () => void;
}> = ({ tier, maxCost, isRecommended, isSelected, onClick }) => {
  const subWidth = maxCost > 0 ? (tier.subscription / maxCost) * 100 : 0;
  const feeWidth = maxCost > 0 ? (tier.platformFees / maxCost) * 100 : 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all duration-300 ${
        isSelected
          ? 'border-brand-500 bg-brand-50/50 shadow-lg'
          : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Heading level={4} className="text-base">{tier.name}</Heading>
          {isRecommended && (
            <span className="bg-brand-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">Best Value</span>
          )}
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-slate-800">{fmt(tier.totalCost)}</span>
          <span className="text-xs text-slate-400 font-bold">/mo total</span>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 mb-4">
        {tier.subscription > 0 && (
          <div className="bg-slate-400 h-full transition-all duration-700" style={{ width: `${subWidth}%` }}></div>
        )}
        <div className="bg-brand-400 h-full transition-all duration-700" style={{ width: `${feeWidth}%` }}></div>
      </div>

      <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
          Subscription: {fmt(tier.subscription)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-400 inline-block"></span>
          Platform fee ({tier.platformFee}%): {fmt(tier.platformFees)}
        </span>
        <span className="ml-auto font-bold text-slate-700">
          You keep: {fmt(tier.takeHome)}
        </span>
      </div>

      {tier.cappedWarning && (
        <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-4 py-2 rounded-xl">
          ⚠ This tier is capped at {tier.clientCap} clients — you may need a higher plan.
        </div>
      )}
    </button>
  );
};

/* ─── Main view ──────────────────────────────────────────────────────── */

const PricingCalculatorView: React.FC = () => {
  const { navigate } = useNavigation();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [inputs, setInputs] = useState<CalcInputs>({
    sessionsPerMonth: 40,
    avgSessionRate: 150,
    billingCycle: 'monthly',
  });

  const [selectedTier, setSelectedTier] = useState<string>('growth');

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const tiers = useMemo(() => computeTierCosts(inputs), [inputs]);
  const maxCost = Math.max(...tiers.map(t => t.totalCost), 1);

  // Recommend the tier with the lowest effective rate (that isn't capped)
  const recommended = useMemo(() => {
    const eligible = tiers.filter(t => !t.cappedWarning);
    if (eligible.length === 0) return tiers[tiers.length - 1];
    return eligible.reduce((best, t) => (t.totalCost < best.totalCost ? t : best), eligible[0]);
  }, [tiers]);

  const selectedData = tiers.find(t => t.id === selectedTier) || tiers[1];
  const grossRevenue = inputs.sessionsPerMonth * inputs.avgSessionRate;

  // Comparison: what if they used a generic 10% marketplace
  const genericMarketplaceFee = grossRevenue * 0.10;
  const savingsVsGeneric = genericMarketplaceFee - selectedData.totalCost;

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <Breadcrumb items={[{ label: 'Provider Benefits', path: '/benefits' }, { label: 'ROI Calculator' }]} />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <PageHero
        overline="Practice Intelligence"
        title={<>Find the plan<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-blue-600">that pays for itself.</span></>}
        description="Adjust your practice numbers below. We'll show you exactly what each tier costs — and which one puts the most money back in your pocket."
        actions={<Button onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })} variant="primary">Start Calculating →</Button>}
        variant="centered"
        background="gradient"
      />

      {/* ── Calculator ───────────────────────────────────────────── */}
      <Section id="calculator" spacing="md">
        <Container>
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden reveal">
            <div className="grid lg:grid-cols-12 min-h-[700px]">

              {/* Left: Inputs */}
              <div className="lg:col-span-4 bg-slate-50 p-10 lg:p-12 border-r border-slate-100">
                <Heading level={3} className="mb-2">Your Practice</Heading>
                <Text variant="small" color="muted" className="mb-10">Adjust the sliders to match your current volume.</Text>

                <div className="space-y-10">
                  <InputSlider
                    label="Sessions per month"
                    value={inputs.sessionsPerMonth}
                    min={5} max={200}
                    onChange={v => setInputs(p => ({ ...p, sessionsPerMonth: v }))}
                  />
                  <InputSlider
                    label="Average session rate"
                    value={inputs.avgSessionRate}
                    min={50} max={400} step={10}
                    format={v => `$${v}`}
                    onChange={v => setInputs(p => ({ ...p, avgSessionRate: v }))}
                  />
                </div>

                <div className="mt-12">
                  <Label className="mb-3">Billing cycle</Label>
                  <div className="flex bg-slate-200 p-1 rounded-xl">
                    <button
                      onClick={() => setInputs(p => ({ ...p, billingCycle: 'monthly' }))}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${inputs.billingCycle === 'monthly' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                    >Monthly</button>
                    <button
                      onClick={() => setInputs(p => ({ ...p, billingCycle: 'annual' }))}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${inputs.billingCycle === 'annual' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                    >Annual</button>
                  </div>
                </div>

                {/* Gross revenue summary */}
                <div className="mt-12 bg-white rounded-2xl p-6 border border-slate-100">
                  <Label color="muted" className="mb-1">Your gross monthly revenue</Label>
                  <Heading level={2} size="h2">{fmt(grossRevenue)}</Heading>
                </div>
              </div>

              {/* Right: Results */}
              <div className="lg:col-span-8 p-10 lg:p-12 flex flex-col">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <Heading level={3} className="mb-1">Plan Comparison</Heading>
                    <Text variant="small" color="muted">Click a plan to see the full breakdown.</Text>
                  </div>
                </div>

                {/* Tier comparison bars */}
                <div className="space-y-4 mb-10 flex-grow">
                  {tiers.map(tier => (
                    <CostBar
                      key={tier.id}
                      tier={tier}
                      maxCost={maxCost}
                      isRecommended={tier.id === recommended.id}
                      isSelected={tier.id === selectedTier}
                      onClick={() => setSelectedTier(tier.id)}
                    />
                  ))}
                </div>

                {/* Selected plan detail */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/15 blur-[80px] rounded-full pointer-events-none"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <Label variant="overline" className="text-brand-400 mb-1">Selected Plan</Label>
                        <Heading level={4} color="white">{selectedData.name}</Heading>
                      </div>
                      <div className="text-right">
                        <Label variant="overline" className="text-white/40 mb-1">Effective cost</Label>
                        <span className="text-2xl font-black text-white">{selectedData.effectiveRate.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-8">
                      <div>
                        <Label className="text-white/40 mb-1">Monthly cost</Label>
                        <Text color="white" weight="bold" className="text-xl">{fmt(selectedData.totalCost)}</Text>
                      </div>
                      <div>
                        <Label className="text-white/40 mb-1">You keep</Label>
                        <Text className="text-xl font-bold text-brand-400">{fmt(selectedData.takeHome)}</Text>
                      </div>
                      <div>
                        <Label className="text-white/40 mb-1">Per session cost</Label>
                        <Text color="white" weight="bold" className="text-xl">
                          {inputs.sessionsPerMonth > 0 ? fmt(selectedData.totalCost / inputs.sessionsPerMonth) : '$0'}
                        </Text>
                      </div>
                    </div>

                    {/* Savings vs generic marketplace */}
                    {savingsVsGeneric > 0 && (
                      <div className="bg-white/10 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-black shrink-0">✓</div>
                        <div>
                          <Text color="white" weight="bold" className="text-sm">
                            You save {fmt(savingsVsGeneric)}/mo vs. a flat 10% marketplace
                          </Text>
                          <Text className="text-white/50 text-xs">
                            That's {fmt(savingsVsGeneric * 12)} per year back in your pocket.
                          </Text>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── What's included in every plan ────────────────────────── */}
      <Section spacing="md" background="white">
        <Container>
          <div className="text-center mb-14 reveal">
            <Heading level={2} className="mb-4">Included in every plan</Heading>
            <Text color="muted">No hidden fees. No feature paywalls on the essentials.</Text>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 reveal">
            {[
              { icon: '🔒', title: 'HIPAA-ready messaging', desc: 'End-to-end encrypted client communication.' },
              { icon: '📅', title: 'Online scheduling', desc: 'Clients book directly from your profile.' },
              { icon: '💳', title: 'Payment processing', desc: 'Accept cards with automatic invoicing.' },
              { icon: '📋', title: 'Session notes', desc: 'Structured note templates built for clinicians.' },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                <div className="text-2xl mb-4">{item.icon}</div>
                <Heading level={4} className="mb-2 text-sm">{item.title}</Heading>
                <Text variant="small" color="muted">{item.desc}</Text>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <Section spacing="md" background="default">
        <Container size="narrow">
          <div className="text-center mb-14 reveal">
            <Heading level={2}>Common questions</Heading>
          </div>
          <div className="space-y-4 reveal">
            {[
              { q: 'What is the platform fee?', a: 'A small percentage charged on each completed booking. It covers payment processing, client matching, and infrastructure. The fee decreases as you move to higher tiers — from 10% on Starter down to 3% on Practice.' },
              { q: 'Can I switch plans anytime?', a: 'Yes. Upgrade or downgrade at any time. If you upgrade mid-cycle, we prorate the difference. If you downgrade, the change takes effect at your next billing date.' },
              { q: 'Is there a contract or commitment?', a: 'No long-term contracts. Monthly plans are billed month-to-month. Annual plans are billed upfront at a 25% discount and can be cancelled with a prorated refund.' },
               { q: 'What happens if I exceed the Starter client cap?', a: 'We\'ll notify you when you\'re approaching the 15-client limit...' },
  { q: 'How does the free trial work?', a: 'Growth and Practice plans come with a 14-day free trial. You... If you cancel before the trial ends, you\'re never charged. After the trial, you drop to Starter...' 
  },            ].map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </Container>
      </Section>

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <Section spacing="md" background="brand" className="relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[100px] pointer-events-none"></div>
         <Container size="narrow" className="text-center relative z-10 reveal">
            <Heading level={2} size="display" color="white" className="mb-6">
              Start free. Upgrade when<br className="hidden md:block" /> the math says so.
            </Heading>
            <Text variant="lead" color="white" className="mb-10 opacity-90">
              Create your provider profile in under 5 minutes. Begin on Starter at no cost — and let your practice volume tell you when it's time to level up.
            </Text>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Button variant="secondary" onClick={() => navigate('#/login?join=true')}>Create Provider Profile</Button>
               <Button className="bg-transparent border border-white/20 hover:bg-white/10 text-white" onClick={() => navigate('/benefits')}>Explore Benefits</Button>
            </div>
            <Label variant="badge" className="mt-8 opacity-50 text-white block">14-day free trial on paid plans • No credit card required to start</Label>
         </Container>
      </Section>
    </div>
  );
};

/* ─── FAQ accordion item ─────────────────────────────────────────────── */

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border transition-all duration-300 ${open ? 'border-brand-200 bg-brand-50/30 shadow-sm' : 'border-slate-100 bg-white'}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-6 text-left">
        <Heading level={4} className="text-sm pr-4">{question}</Heading>
        <span className={`text-slate-400 transition-transform duration-300 shrink-0 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6">
          <Text variant="small" color="muted">{answer}</Text>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculatorView;