import React from 'react';
import { useNavigation } from '../App';
import Breadcrumb from '../components/Breadcrumb';
import { Container, Section } from '../components/layout';
import { Heading, Label, Text } from '../components/typography';
import { Button, Card, CardBody } from '../components/ui';

const InvestorsView: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="min-h-screen bg-[#fbfcff]">
      <Breadcrumb items={[{ label: 'Investors' }]} />

      <Section spacing="lg" className="border-b border-slate-50 pb-32 pt-20">
        <Container size="narrow">
          <div className="text-center">
            <Label variant="overline" color="brand" className="mb-6 block">
              Investment Thesis
            </Label>
            <Heading level={1} className="mb-8 text-5xl leading-tight tracking-tight">
              EvoWell is building the trust layer for clinical wellness.
            </Heading>
            <Text variant="lead" className="mx-auto mb-10 max-w-2xl text-slate-600 leading-relaxed">
              We&apos;re creating infrastructure that connects verified providers with people seeking reliable, evidence-informed support-plus the tools to run and grow modern practices.
            </Text>
            <Button
              variant="ghost"
              className="border border-slate-200 font-bold text-slate-600"
              onClick={() => navigate('/contact')}
            >
              Contact for Deck
            </Button>
            <Text variant="small" className="mt-4 font-semibold text-slate-500">
              Early-stage • Trust-first • Provider-led design
            </Text>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" background="white">
        <Container>
          <div className="grid items-start gap-20 lg:grid-cols-2">
            <div>
              <Label variant="overline" color="muted" className="mb-4 block">
                The Problem
              </Label>
              <Heading level={2} className="mb-6">
                The systemic fragmentation of wellness.
              </Heading>
              <Text className="mb-6 text-slate-600">
                The wellness and clinical support ecosystem is growing, but the infrastructure is fragmented. Providers juggle disconnected tools for scheduling, payments, communication, documentation, discovery, and content. Clients face inconsistent signals of quality and fit.
              </Text>
              <div className="space-y-4">
                {[
                  'Discovery is noisy; trust is hard to assess.',
                  'Providers lose time to admin and tool sprawl.',
                  'Educational resources are scattered and difficult to distribute responsibly.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    <Text variant="small" className="font-medium text-slate-700">
                      {item}
                    </Text>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[3rem] border border-slate-100 bg-slate-50 p-10">
              <Text variant="caption" className="mb-8 block uppercase tracking-widest text-slate-400">
                Market Signal
              </Text>
              <Heading level={4} className="mb-4">
                Inefficient allocation of clinical capital.
              </Heading>
              <Text variant="small" className="leading-relaxed text-slate-500">
                Outcomes improve when the right client finds the right provider early. But current discovery and operational tooling create friction and wasted spend-on both sides. EvoWell focuses on the infrastructure layer where trust, matching, and workflow efficiency compound over time.
              </Text>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className="mx-auto mb-20 max-w-3xl text-center">
            <Label variant="overline" color="brand" className="mb-4 block">
              Our Approach
            </Label>
            <Heading level={2} className="mb-6 text-4xl">
              Platform philosophy rooted in trust.
            </Heading>
            <Text className="text-slate-600">
              We don&apos;t just build a marketplace. We build the rails for a credible network: verification, clear UX, and tools that reduce friction for providers.
            </Text>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'Vetted Ecosystem',
                desc: 'Provider verification supports transparency and reduces noise-helping clients choose with more confidence.',
              },
              {
                title: 'Supportive AI (Non-clinical)',
                desc: 'Evo helps users navigate next steps and helps providers manage workflows-without diagnosing or providing medical advice.',
              },
              {
                title: 'Compounding Trust',
                desc: 'As the network grows, credibility strengthens: clearer profiles, responsible content standards, and better matching signals.',
              },
            ].map((item) => (
              <Card key={item.title} className="border-slate-100 p-8 shadow-sm">
                <Heading level={4} className="mb-4 text-lg">
                  {item.title}
                </Heading>
                <Text variant="small" className="leading-relaxed text-slate-500">
                  {item.desc}
                </Text>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="lg" background="dark" className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <Container className="relative z-10">
          <div className="grid gap-20 lg:grid-cols-2">
            <div>
              <Label variant="overline" className="mb-4 block text-brand-300">
                Market Perspective
              </Label>
              <Heading level={2} color="white" className="mb-6">
                The convergence of wellness and clinical care.
              </Heading>
              <Text className="text-slate-300">
                Consumers increasingly treat wellness as part of healthcare. Providers are adopting hybrid models, digital products, and new care pathways. The next wave of platforms will be defined by trust, operational simplicity, and responsible guidance-not just lead generation.
              </Text>
            </div>

            <div className="space-y-6">
              <Label variant="overline" className="mb-4 block text-brand-300">
                Business Model
              </Label>
              {[
                {
                  title: 'SaaS Platform Fees',
                  desc: 'Sliding-scale membership for verified presence and practice tooling.',
                },
                {
                  title: 'Network Revenue',
                  desc: 'Marketplace take-rate on educational resources and practice tools sold through the Provider Exchange.',
                },
                {
                  title: 'Strategic Partnerships (Future)',
                  desc: 'Select integrations and ecosystem partnerships that improve provider workflows and access-without compromising trust.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <Heading level={4} color="white" className="mb-2 text-base">
                    {item.title}
                  </Heading>
                  <Text variant="small" className="text-slate-400">
                    {item.desc}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" background="white">
        <Container>
          <div className="grid items-center gap-20 lg:grid-cols-2">
            <div className="space-y-12">
              <div>
                <Label variant="overline" color="muted" className="mb-4 block">
                  Traction & Signals
                </Label>
                <Heading level={2} className="mb-6">
                  Maturity over momentum.
                </Heading>
                <Text className="mb-6 text-slate-600">
                  EvoWell is early-stage. Our focus is building a compliant, trust-first foundation: verification workflows, secure operations, and a provider experience that is genuinely useful.
                </Text>

                <div className="grid gap-4">
                  {[
                    'Provider onboarding flow live',
                    'Verification pipeline implemented',
                    'Platform foundation designed for security and privacy',
                  ].map((signal) => (
                    <div key={signal} className="flex items-start gap-3">
                      <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      <Text variant="small" className="font-medium text-slate-700">
                        {signal}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label variant="overline" color="muted" className="mb-4 block">
                  A moat of credibility.
                </Label>
                <Text className="text-slate-600">
                  Trust compounds. Verification standards, responsible content policies, and high-quality UX create defensibility that grows with the network.
                </Text>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200"
                className="rounded-[3rem] shadow-2xl"
                alt="Platform foundation and growth signals"
              />
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" className="bg-slate-50">
        <Container size="narrow">
          <div className="mb-16 text-center">
            <Label variant="overline" color="muted" className="mb-4 block">
              Responsibility
            </Label>
            <Heading level={2}>Built for trust, not just growth.</Heading>
          </div>

          <div className="grid gap-12">
            {[
              {
                title: 'Data Protection Mindset',
                desc: 'We design around privacy, security, and responsible data handling. Trust requires strong systems-not after-the-fact fixes.',
              },
              {
                title: 'AI Responsibility',
                desc: 'Evo is a navigation assistant-not a clinician. We enforce strict guardrails: no medical advice, no diagnosis, and no treatment recommendations.',
              },
            ].map((item, index) => (
              <div key={item.title} className="flex flex-col items-start gap-8 md:flex-row">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <span className="text-lg font-bold text-brand-500">{index + 1}</span>
                </div>
                <div>
                  <Heading level={4} className="mb-3 text-lg">
                    {item.title}
                  </Heading>
                  <Text className="leading-relaxed text-slate-500">{item.desc}</Text>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="lg" background="white">
        <Container size="narrow">
          <Card className="rounded-[3rem] border-slate-100 bg-white p-16 text-center shadow-2xl">
            <Label variant="overline" color="brand" className="mb-6 block">
              The Ask
            </Label>
            <Heading level={2} className="mb-6">
              Supporting the next era of trusted clinical wellness.
            </Heading>
            <Text className="mb-10 text-lg leading-relaxed text-slate-600">
              We&apos;re selectively meeting with investors aligned with responsible healthcare innovation. If you&apos;d like to review the thesis and roadmap, we&apos;re happy to share the deck.
            </Text>
            <div className="flex flex-col justify-center gap-4 md:flex-row">
              <Button variant="brand" className="rounded-2xl px-10 py-4" onClick={() => navigate('/contact')}>
                Request Investor Deck
              </Button>
              <Button
                variant="ghost"
                className="rounded-2xl border border-slate-200 px-10 py-4"
                onClick={() => navigate('/contact')}
              >
                Contact Founders
              </Button>
            </div>
            <Text variant="caption" className="mt-6 font-medium text-slate-500">
              This page is informational only and does not constitute an offer to sell securities.
            </Text>
            <Text variant="caption" className="mt-3 text-slate-400">
              Investor information is provided for discussion purposes only and may change as the product evolves.
            </Text>
          </Card>
        </Container>
      </Section>
    </div>
  );
};

export default InvestorsView;
