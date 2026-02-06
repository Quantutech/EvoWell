import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../App';
import Breadcrumb from '../components/Breadcrumb';
import ThreeDIcon from '../components/ui/ThreeDIcon';
import PointSolutionsReplacement from '../components/PointSolutionsReplacement';
import { PageHero, Section, Container, Grid } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button, Card, CardHeader, CardBody, Badge } from '../components/ui';

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
];

/* ─── Hero visual ────────────────────────────────────────────────────── */

const BenefitsHeroVisual = () => (
  <div className="relative w-full max-w-lg aspect-[4/5]">
    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-[80px]"></div>
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"></div>
    <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600" className="absolute top-0 right-0 w-3/4 h-3/5 object-cover rounded-[3rem] shadow-2xl border-4 border-white z-10" alt="Provider 1" />
    <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600" className="absolute bottom-0 left-0 w-3/4 h-3/5 object-cover rounded-[3rem] shadow-2xl border-4 border-white z-20 grayscale hover:grayscale-0 transition-all duration-700" alt="Provider 2" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl z-30 border border-white/50 text-center">
       <Heading level={3} size="h3" className="mb-1">+40%</Heading>
       <Label variant="overline">Client Growth</Label>
    </div>
  </div>
);

/* ─── Main view ──────────────────────────────────────────────────────── */

const BenefitsView: React.FC = () => {
  const { navigate } = useNavigation();
  const [activeFeature, setActiveFeature] = useState(0);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const features = [
    { title: "Sovereign Practice Management", subtitle: "Run Your Practice, Your Way", desc: "Set your own rates, hours, and cancellation policies. EvoWell adapts to how you work — not the other way around.", icon: "settings", img: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&q=80&w=800" },
    { title: "Holistic Service Flexibility", subtitle: "Offer What You Love", desc: "Go beyond 1:1 sessions. Run group workshops, sell digital guides, offer async check-ins — all from one profile.", icon: "heart", img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800" },
    { title: "High-Visibility Discovery", subtitle: "Get Found by the Right Clients", desc: "Our SEO-optimized directory and smart matching connect you with clients who are looking for exactly your specialties.", icon: "eye", img: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=800" },
    { title: "Passive Income Streams", subtitle: "Earn Beyond Sessions", desc: "Upload e-books, meditation guides, and self-paced courses. Your expertise works for you around the clock.", icon: "dollar", img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800" },
    { title: "Borderless Connection", subtitle: "Expand Your Reach Nationwide", desc: "Connect with clients across the country through secure video. No commute, no overhead, no geographic ceiling.", icon: "globe", img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800" },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <Breadcrumb items={[{ label: 'Provider Benefits' }]} />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <PageHero
        overline="For Modern Practitioners"
        title={<>Your Practice.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-blue-600">Elevated.</span></>}
        description="EvoWell isn't just a directory. It's a complete operating system for the next generation of mental health and wellness professionals."
        variant="split"
        visual={<BenefitsHeroVisual />}
        actions={<>
          <Button variant="primary" onClick={() => navigate('#/login?join=true')}>Start Your Journey</Button>
          <Button variant="secondary" onClick={() => navigate('/pricing')}>See Pricing</Button>
        </>}
      />

      {/* ── Feature Explorer ─────────────────────────────────────── */}
      <Section spacing="lg" background="white" className="relative">
        <Container size="full">
          <div className="mb-20 text-center reveal">
             <Heading level={2} className="mb-4">The Provider Ecosystem</Heading>
             <Text color="muted">Everything you need to thrive in the digital care economy.</Text>
          </div>
          <div className="grid lg:grid-cols-2 gap-16 items-start reveal">
             <div className="space-y-4">
                {features.map((feature, idx) => (
                   <button
                     key={idx}
                     onClick={() => setActiveFeature(idx)}
                     className={`w-full text-left p-8 rounded-[2rem] transition-all duration-300 flex items-center gap-6 group ${activeFeature === idx ? 'bg-slate-50 shadow-inner' : 'hover:bg-white hover:shadow-lg border border-transparent hover:border-slate-100'}`}
                   >
                      <div className={`transition-all duration-300 ${activeFeature === idx ? 'scale-110' : 'grayscale group-hover:grayscale-0'}`}>
                         <ThreeDIcon icon={feature.icon as any} size="lg" />
                      </div>
                      <div>
                         <Heading level={4} className={`mb-1 transition-colors ${activeFeature === idx ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`}>{feature.title}</Heading>
                         {activeFeature === idx && <Text variant="small" color="brand" className="animate-in fade-in slide-in-from-left-2">{feature.subtitle}</Text>}
                      </div>
                   </button>
                ))}
             </div>
             <div className="sticky top-32">
                <div className="bg-slate-900 rounded-[3rem] p-2 shadow-2xl overflow-hidden relative aspect-square lg:aspect-[4/3]">
                   {features.map((feature, idx) => (
                      <div key={idx} className={`absolute inset-0 transition-all duration-700 ease-in-out ${activeFeature === idx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
                         <img src={feature.img} className="w-full h-full object-cover opacity-60 rounded-[2.5rem]" alt={feature.title} />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                         <div className="absolute bottom-0 left-0 w-full p-12">
                            <div className="mb-6"><ThreeDIcon icon={feature.icon as any} size="xl" className="shadow-2xl" /></div>
                            <Heading level={3} size="h2" color="white" className="mb-4">{feature.subtitle}</Heading>
                            <Text color="white" className="opacity-80 max-w-md">{feature.desc}</Text>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </Container>
      </Section>

      <PointSolutionsReplacement />

      {/* ── Founder Quote ────────────────────────────────────────── */}
      <Section spacing="md" className="bg-brand-50 relative overflow-hidden">
         <Container className="relative z-10">
            <div className="bg-white rounded-[3rem] p-10 lg:p-16 shadow-xl border border-slate-100 flex flex-col lg:flex-row gap-16 items-center reveal">
               <div className="lg:w-2/5 relative shrink-0">
                  <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden rotate-2 shadow-lg border-4 border-white">
                     <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Founder" />
                  </div>
               </div>
               <div className="lg:w-3/5 space-y-6">
                  <Heading level={2}>Built by Someone Who's Been There</Heading>
                  <Text variant="lead" className="text-slate-600">"I spent years paying for four different tools that didn't talk to each other — a booking system, a billing platform, a directory listing, and a notes app. EvoWell was born from wanting one place that actually works."</Text>
                  <div className="pt-4">
                    <Text weight="bold">Dr. Cassandra Vane</Text>
                    <Text variant="small" color="muted">Founder & CEO, EvoWell</Text>
                  </div>
               </div>
            </div>
         </Container>
      </Section>

      {/* ── Pricing Overview ─────────────────────────────────────── */}
      <Section spacing="lg" background="dark" className="relative">
        <Container className="relative z-10">
          <div className="text-center mb-6 reveal">
            <Label variant="overline" className="text-brand-400 mb-4">Simple Pricing</Label>
            <Heading level={2} color="white" className="mb-4">Pay less as you grow</Heading>
            <Text className="text-slate-400 max-w-xl mx-auto mb-10">Every tier includes a small per-booking platform fee that drops as you commit to a higher plan. Start free, upgrade when it makes sense.</Text>
          </div>

          <div className="flex justify-center mb-14 reveal">
            <div className="inline-flex bg-white/10 p-1 rounded-2xl backdrop-blur-sm border border-white/10">
              <button onClick={() => setBillingCycle('monthly')} className={`px-8 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${billingCycle === 'monthly' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}>Monthly</button>
              <button onClick={() => setBillingCycle('annual')} className={`px-8 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${billingCycle === 'annual' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}>Annual <span className="text-brand-300 ml-1">Save 25%</span></button>
            </div>
          </div>

          <Grid cols={3} gap="lg" className="reveal">
            {PRICING_TIERS.map((tier, i) => {
              const price = billingCycle === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
              return (
                <Card key={tier.id} variant={tier.highlight ? 'elevated' : 'muted'} className={`h-full relative ${tier.highlight ? 'scale-105 z-10' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                  {tier.highlight && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Most Popular</div>}
                  <CardHeader>
                     <Heading level={3} className={`mb-1 ${tier.highlight ? 'text-slate-900' : 'text-white'}`}>{tier.name}</Heading>
                     <Text variant="small" className={tier.highlight ? 'text-slate-500' : 'text-slate-400'}>{tier.tagline}</Text>
                     <div className="mt-6 flex items-baseline gap-1">
                        <span className={`text-4xl font-black ${tier.highlight ? 'text-slate-900' : 'text-white'}`}>{price === 0 ? 'Free' : `$${price}`}</span>
                        {price > 0 && <span className={`text-xs font-bold opacity-60 ${tier.highlight ? 'text-slate-900' : 'text-white'}`}>/mo</span>}
                     </div>
                     <div className="mt-3 inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-xl text-xs font-bold">
                       <span>{tier.platformFee}% per booking</span>
                     </div>
                  </CardHeader>
                  <CardBody>
                     <div className="space-y-4 mb-8">
                        {tier.features.map((f, idx) => (
                           <div key={idx} className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${tier.highlight ? 'bg-brand-500 text-white' : 'bg-white/20 text-white'}`}>✓</div>
                              <span className={`text-xs font-bold ${tier.highlight ? 'text-slate-700' : 'text-slate-300'}`}>{f}</span>
                           </div>
                        ))}
                     </div>
                     <Button fullWidth variant={tier.highlight ? 'brand' : 'secondary'} onClick={() => navigate('#/login?join=true')}>
                       {price === 0 ? 'Get Started Free' : 'Start 14-Day Trial'}
                     </Button>
                  </CardBody>
                </Card>
              );
            })}
          </Grid>

          {/* CTA to calculator */}
          <div className="text-center mt-16 reveal">
            <Text className="text-slate-400 mb-4">Not sure which plan fits? See the numbers for yourself.</Text>
            <Button variant="ghost" className="text-brand-400 hover:text-brand-300" onClick={() => navigate('/pricing')}>
              Open the ROI Calculator →
            </Button>
          </div>
        </Container>
      </Section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <Section spacing="lg" background="white">
        <Container>
          <div className="text-center mb-16 reveal">
            <Label variant="overline" color="brand" className="mb-4">How It Works</Label>
            <Heading level={2}>Live in under a week</Heading>
          </div>
          <div className="grid md:grid-cols-4 gap-8 reveal">
            {[
              { step: '01', title: 'Apply', desc: 'Submit your credentials and practice details. Takes about 5 minutes.' },
              { step: '02', title: 'Get verified', desc: 'Our clinical team reviews your profile within 48 hours.' },
              { step: '03', title: 'Build your profile', desc: 'Add your specialties, rates, availability, and a personal bio.' },
            { step: '04', title: 'Start seeing clients', desc: 'You\'re live. Clients can find and book you immediately.' },            ].map((s, i) => (
              <div key={i} className="relative">
                {i < 3 && <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-px bg-slate-200 z-0"></div>}
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-sm font-black mb-5">{s.step}</div>
                  <Heading level={4} className="mb-2">{s.title}</Heading>
                  <Text variant="small" color="muted">{s.desc}</Text>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <Section spacing="md" background="default">
         <Container className="max-w-5xl">
            <div className="text-center reveal">
              <Heading level={2} className="mb-6">Ready to join the evolution?</Heading>
              <Text variant="lead" className="mb-10 text-slate-500">Create your profile in minutes. Verification takes less than 48 hours. Start on the free tier — upgrade anytime.</Text>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="brand" onClick={() => navigate('#/login?join=true')}>Create Provider Profile</Button>
                <Button size="lg" variant="secondary" onClick={() => navigate('/pricing')}>Calculate Your ROI</Button>
              </div>
            </div>
         </Container>
      </Section>
    </div>
  );
};

export default BenefitsView;