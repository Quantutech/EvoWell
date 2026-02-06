import React from 'react';
import { Container, Section } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Card, CardBody, Badge, Button } from '../components/ui';
import Breadcrumb from '../components/Breadcrumb';

const InvestorsView: React.FC = () => {
  return (
    <div className="bg-[#fbfcff] min-h-screen">
      <Breadcrumb items={[{ label: 'Investors' }]} />
      
      {/* 1. Hero Section — Investment Thesis */}
      <Section spacing="lg" className="pt-20 pb-32 border-b border-slate-50">
        <Container size="narrow">
          <div className="text-center">
            <Label variant="overline" color="brand" className="mb-6 block">Investment Thesis</Label>
            <Heading level={1} className="mb-8 text-5xl tracking-tight leading-tight">
              EvoWell is the sovereign operating system for the next generation of clinical wellness.
            </Heading>
            <Text variant="lead" className="text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              We are building the infrastructure that connects verified clinical expertise with a fragmented global demand for reliable, evidence-based care.
            </Text>
            <div className="flex justify-center gap-4">
              <Button variant="ghost" className="text-slate-500 font-bold border border-slate-200">
                Contact for Deck
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* 2. The Problem (Investor Framing) */}
      <Section spacing="lg" background="white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <div>
              <Label variant="overline" color="muted" className="mb-4">The Problem</Label>
              <Heading level={2} className="mb-6">The systemic fragmentation of wellness.</Heading>
              <Text className="text-slate-600 mb-6">
                The wellness industry is currently characterized by a deep lack of standards. Patients struggle with provider discovery and credibility, while qualified clinicians are forced to operate within commodified platforms that strip them of their sovereignty and brand identity.
              </Text>
              <div className="space-y-4">
                {[
                  "Discovery Gap: No unified, verified network for clinical-grade wellness.",
                  "Provider Burnout: Transactional platforms prioritize volume over care quality.",
                  "System Silos: Lack of continuity between wellness and traditional medical systems."
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                    <Text variant="small" className="font-medium text-slate-700">{item}</Text>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
              <Text variant="caption" className="uppercase font-black tracking-widest text-slate-400 mb-8 block">Market Signal</Text>
              <Heading level={4} className="mb-4">Inefficient allocation of clinical capital.</Heading>
              <Text variant="small" className="text-slate-500 leading-relaxed">
                Qualified professionals are spending 40% of their time on administration and fragmented marketing rather than patient outcomes. Current solutions focus on "marketplaces" which further commodify the provider. We focus on the "operating system" which empowers the professional.
              </Text>
            </div>
          </div>
        </Container>
      </Section>

      {/* 3. EvoWell’s Approach */}
      <Section spacing="lg">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-20">
            <Label variant="overline" color="brand" className="mb-4 block">Our Approach</Label>
            <Heading level={2} className="mb-6 text-4xl">Platform philosophy rooted in sovereignty.</Heading>
            <Text className="text-slate-600">
              We don't just provide a marketplace; we provide the tools for clinicians to build their own independent, scalable practices within a verified ecosystem.
            </Text>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Vetted Ecosystem",
                desc: "Every provider is manually verified, creating a high-trust surface that attracts premium users and long-term loyalty."
              },
              {
                title: "Supportive AI",
                desc: "We use AI to assist matching and administrative tasks, never to replace the human clinical intuition at the core of care."
              },
              {
                title: "Compounding Trust",
                desc: "By prioritizing data ethics and patient safety, we build a moat of credibility that becomes more defensible as the market matures."
              }
            ].map((item, i) => (
              <Card key={i} className="p-8 border-slate-100 shadow-sm">
                <Heading level={4} className="mb-4 text-lg">{item.title}</Heading>
                <Text variant="small" className="text-slate-500 leading-relaxed">{item.desc}</Text>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* 4 & 5. Market & Business Model */}
      <Section spacing="lg" background="dark" className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-20">
            <div>
              <Label variant="overline" className="text-brand-300 mb-4 block">Market Perspective</Label>
              <Heading level={2} color="white" className="mb-6">The convergence of wellness and clinical care.</Heading>
              <Text className="text-slate-300 mb-8">
                As traditional healthcare systems become more strained, consumers are shifting toward preventive, holistic wellness. EvoWell is positioned at this convergence—offering the rigor of clinical oversight with the accessibility of modern digital wellness.
              </Text>
              <Badge variant="brand" className="bg-white/10 text-white border-white/20 px-4 py-2">
                Strategic Market Positioning
              </Badge>
            </div>
            <div className="space-y-8">
              <Label variant="overline" className="text-brand-300 mb-4 block">Business Model</Label>
              <div className="grid gap-6">
                {[
                  { title: "SaaS Platform Fees", status: "Validated", desc: "Predictable revenue from providers for practice management tools." },
                  { title: "Network Revenue", status: "Scaling", desc: "Fee-based discovery and matching for new patient acquisition." },
                  { title: "Enterprise Partnerships", status: "Exploratory", desc: "Corporate wellness and clinical research data partnerships." }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-2">
                      <Heading level={4} color="white" className="text-base">{item.title}</Heading>
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-400 bg-brand-400/10 px-2 py-1 rounded-md">{item.status}</span>
                    </div>
                    <Text variant="small" className="text-slate-400">{item.desc}</Text>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 6 & 7. Traction & Moat */}
      <Section spacing="lg" background="white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div>
                <Label variant="overline" color="muted" className="mb-4 block">Traction & Signals</Label>
                <Heading level={2} className="mb-6">Maturity over momentum.</Heading>
                <Text className="text-slate-600 mb-6">
                  We have prioritized building a robust, compliant infrastructure. Our signals are focused on quality of engagement and provider retention.
                </Text>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Text variant="lead" weight="bold" color="brand">50+</Text>
                    <Text variant="caption" className="uppercase font-bold text-slate-400">Founding Clinicians</Text>
                  </div>
                  <div>
                    <Text variant="lead" weight="bold" color="brand">HIPAA</Text>
                    <Text variant="caption" className="uppercase font-bold text-slate-400">Compliant Infrastructure</Text>
                  </div>
                </div>
              </div>
              <div>
                <Label variant="overline" color="muted" className="mb-4 block">Defensibility</Label>
                <Heading level={2} className="mb-6">A moat of credibility.</Heading>
                <Text className="text-slate-600">
                  Our defensibility emerges from our manual vetting process, deep provider relationships, and an early-mover advantage in ethical AI integration for wellness.
                </Text>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200" 
                className="rounded-[3rem] shadow-2xl" 
                alt="Product Maturity"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* 9. Ethics, Trust & Responsibility */}
      <Section spacing="lg" className="bg-slate-50">
        <Container size="narrow">
          <div className="text-center mb-16">
            <Label variant="overline" color="muted" className="mb-4 block">Responsibility</Label>
            <Heading level={2}>Built for trust, not just growth.</Heading>
          </div>
          <div className="grid gap-12">
            {[
              {
                title: "Data Protection Mindset",
                desc: "We treat wellness data with clinical-grade seriousness. Our infrastructure is built to exceed standard data protection protocols, ensuring absolute patient privacy."
              },
              {
                title: "AI Responsibility",
                desc: "We are committed to transparent AI. Our algorithms are designed to facilitate human connection, not to replace it. We explicitly avoid speculative or predictive health modeling."
              }
            ].map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-brand-500 font-bold text-lg">{i + 1}</span>
                </div>
                <div>
                  <Heading level={4} className="mb-3 text-lg">{item.title}</Heading>
                  <Text className="text-slate-500 leading-relaxed">{item.desc}</Text>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 10. Investment Ask */}
      <Section spacing="lg" background="white">
        <Container size="narrow">
          <Card className="p-16 border-slate-100 shadow-2xl text-center bg-white rounded-[3rem]">
            <Label variant="overline" color="brand" className="mb-6 block">The Ask</Label>
            <Heading level={2} className="mb-6">Supporting the sovereign clinical era.</Heading>
            <Text className="text-slate-600 mb-10 text-lg leading-relaxed">
              We are currently in our early seed stage. This capital enables us to expand our provider network, finalize our HIPAA-compliant patient portal, and scale our matching logic.
            </Text>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button variant="brand" className="px-10 py-4 rounded-2xl">
                Request Investor Deck
              </Button>
              <Button variant="ghost" className="px-10 py-4 rounded-2xl border border-slate-200">
                Contact Founders
              </Button>
            </div>
            <Text variant="caption" className="mt-8 text-slate-400 font-medium">
              EvoWell • Long-term thinking for the future of care.
            </Text>
          </Card>
        </Container>
      </Section>
    </div>
  );
};

export default InvestorsView;
