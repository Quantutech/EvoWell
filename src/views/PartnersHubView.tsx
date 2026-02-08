import React, { useEffect, useState } from 'react';
import { useNavigation } from '../App';
import Breadcrumb from '../components/Breadcrumb';
import { api } from '../services/api';
import { Testimonial } from '../types';
import { Container, Grid, PageHero, Section } from '../components/layout';
import { Heading, Label, Text } from '../components/typography';
import { Button, Card, CardBody, CardHeader } from '../components/ui';
import Icon from '../components/ui/Icon';
import { iconPaths } from '../components/ui/iconPaths';

const PartnersHeroVisual = () => (
  <div className="relative w-full max-w-lg aspect-square">
    <div className="absolute inset-0 rotate-3 rounded-[3rem] bg-gradient-to-tr from-brand-100 to-blue-50 opacity-60" />
    <div className="absolute inset-0 -rotate-3 overflow-hidden rounded-[3rem] border border-slate-100 bg-white shadow-2xl">
      <img
        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=900"
        className="h-full w-full object-cover opacity-95 transition-all duration-700 hover:scale-105"
        alt="Partnership collaboration"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 to-transparent" />
      <div className="absolute right-7 top-7 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-lg backdrop-blur-md">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon path={iconPaths.partners} size={20} />
        </span>
      </div>
      <div className="absolute bottom-7 left-7 max-w-[220px] rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lg backdrop-blur-md">
        <Label variant="badge" color="brand" className="mb-2 block">
          Trust-first ecosystem
        </Label>
        <Text variant="small" className="text-slate-700">
          Built for practical utility, responsible standards, and measurable collaboration.
        </Text>
      </div>
    </div>
  </div>
);

const partnershipAdvantages = [
  {
    title: 'Enhanced Visibility',
    copy: 'Reach verified providers and engaged clients through curated placements and co-marketing-not noise.',
    icon: 'eye',
  },
  {
    title: 'Targeted Outreach',
    copy: 'Launch campaigns by specialty, modality, location, and practice type to reach the right audiences.',
    icon: 'search',
  },
  {
    title: 'Collaborative Growth',
    copy: 'Co-build and co-launch with a team that ships quickly, measures impact, and iterates.',
    icon: 'chart',
  },
  {
    title: 'Credibility & Trust',
    copy: 'Partner inside a platform designed for verification, clarity, and responsible standards.',
    icon: 'shield',
  },
] as const;

const partnershipJourney = [
  {
    title: 'Reach Out & Connect',
    copy: 'Share what you do, who you serve, and the partnership type you are exploring.',
  },
  {
    title: 'Discovery & Alignment',
    copy: 'We confirm fit across audience, values, compliance needs, scope, and timelines.',
  },
  {
    title: 'Onboarding & Integration',
    copy: 'We set up the pilot: placements, co-marketing, integration, or a sponsored initiative.',
  },
  {
    title: 'Grow & Succeed Together',
    copy: 'Track outcomes, improve execution, and expand what proves value.',
  },
] as const;

const PartnersHubView: React.FC = () => {
  const { navigate } = useNavigation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    api
      .getTestimonials('partners')
      .then((rows) => setTestimonials(rows))
      .catch(() => setTestimonials([]));
  }, []);

  const scrollToForm = () => {
    document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToOptions = () => {
    document
      .getElementById('partnership-options')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Breadcrumb items={[{ label: 'For Partners' }]} />

      <PageHero
        overline="Strategic Alliances"
        title={
          <>
            Shape the Future of <br />
            <span className="text-brand-500">Wellness Together.</span>
          </>
        }
        description="Partner with EvoWell to deliver better tools, services, and solutions for a verified provider network and the people they support. We build with partners who care about trust, responsible growth, and real utility."
        variant="split"
        visual={<PartnersHeroVisual />}
        actions={
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" onClick={scrollToForm}>
                Become a Partner
              </Button>
              <Button variant="secondary" onClick={scrollToOptions}>
                View Partnership Options
              </Button>
            </div>
            <Text variant="small" className="font-semibold text-slate-500">
              Early-stage platform • Experienced team • Trust-first ecosystem
            </Text>
          </div>
        }
      />

      <Section spacing="md" background="default">
        <Container>
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <Heading level={2} size="h1" className="mb-6">
                Why Partner with <br />
                EvoWell?
              </Heading>
              <div className="h-1.5 w-20 rounded-full bg-brand-500" />
            </div>
            <Text variant="lead">We believe that great partnerships create lasting impact.</Text>
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="white">
        <Container>
          <div className="mb-14 text-center">
            <Label variant="overline" color="brand" className="mb-4 block">
              The Value Prop
            </Label>
            <Heading level={2}>Partnership Advantages</Heading>
          </div>
          <Grid cols={1} md={2} lg={4}>
            {partnershipAdvantages.map((item) => (
              <Card key={item.title} variant="muted">
                <CardBody className="text-center">
                  <div className="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-white text-brand-600 shadow-sm">
                    <Icon path={iconPaths[item.icon]} size={24} />
                  </div>
                  <Heading level={4} className="mb-4">
                    {item.title}
                  </Heading>
                  <Text variant="small" color="muted">
                    {item.copy}
                  </Text>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </Container>
      </Section>

      <Section id="partnership-options" spacing="lg" background="default">
        <Container>
          <div className="mb-14 text-center">
            <Heading level={2} className="mb-3">
              Ecosystem Opportunities
            </Heading>
            <Text color="muted" className="mx-auto max-w-3xl">
              Discover how we can collaborate-whether you are building tools, offering services, or supporting the ecosystem.
            </Text>
          </div>

          <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <Text variant="small" className="font-semibold text-slate-600">
              We partner with teams building workflow tools, education, compliance support, and responsible innovation-especially where trust and clarity matter.
            </Text>
          </div>

          <Grid cols={1} lg={2}>
            <Card variant="default" size="lg">
              <CardHeader>
                <Label variant="overline" color="brand">
                  Partnerships
                </Label>
                <Heading level={3}>For Vendors & Service Providers</Heading>
              </CardHeader>
              <CardBody>
                <Text variant="lead" className="mb-8 text-slate-600">
                  Feature your innovative tools and services to providers who need real workflow improvements-practice operations, compliance support, education, and more.
                </Text>
                <Button variant="secondary" onClick={() => navigate('/contact')}>
                  Explore Vendor Programs
                </Button>
              </CardBody>
            </Card>

            <Card variant="elevated" size="lg" className="bg-[#234b3a] text-white border-none shadow-2xl shadow-brand-900/20">
              <CardHeader>
                <Label variant="overline" className="text-brand-200">
                  Partnerships
                </Label>
                <Heading level={3} color="white">
                  For Sponsors & Strategic Allies
                </Heading>
              </CardHeader>
              <CardBody>
                <Text variant="lead" color="white" className="mb-8 text-white/85">
                  Support a trust-first ecosystem through sponsorships, community initiatives, and subsidized access programs that expand responsible care.
                </Text>
                <Button
                  variant="secondary"
                  className="bg-white text-slate-900 border-white hover:bg-slate-100"
                  onClick={() => navigate('/contact')}
                >
                  View Sponsorship Options
                </Button>
              </CardBody>
            </Card>
          </Grid>
        </Container>
      </Section>

      <Section spacing="md" className="relative overflow-hidden bg-[#f0f8fa]">
        <Container className="relative z-10">
          <div className="mb-16 text-center">
            <Label variant="overline" color="brand" className="mb-4 block">
              The Roadmap
            </Label>
            <Heading level={2}>Partnership Journey</Heading>
          </div>

          <Grid cols={1} md={2} lg={4} gap="lg">
            {partnershipJourney.map((step, index) => (
              <Card key={step.title} className="relative overflow-visible">
                <div className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-xl border-4 border-[#f0f8fa] bg-slate-900 text-lg font-black text-white shadow-xl">
                  {index + 1}
                </div>
                <CardBody className="mt-6">
                  <Heading level={4} className="mb-3">
                    {step.title}
                  </Heading>
                  <Text variant="small" color="muted">
                    {step.copy}
                  </Text>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </Container>
      </Section>

      <Section spacing="md" background="white">
        <Container>
          <div className="mb-12 flex items-end justify-between">
            <div>
              <Heading level={2} className="mb-2">
                Partners in Impact
              </Heading>
              <Text color="muted">
                Here is how organizations can show up in the EvoWell ecosystem.
              </Text>
            </div>
          </div>

          {testimonials.length > 0 ? (
            <Grid cols={1} md={2} lg={3}>
              {testimonials.map((item) => (
                <Card key={`${item.author}-${item.role}`} variant="muted">
                  <CardBody>
                    <div className="mb-5 flex items-center gap-4">
                      <img
                        src={item.imageUrl}
                        className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm"
                        alt={item.author}
                      />
                      <div>
                        <Heading level={4}>{item.author}</Heading>
                        <Label variant="badge" color="brand">
                          {item.role}
                        </Label>
                      </div>
                    </div>
                    <Text variant="small" className="italic text-slate-600">
                      "{item.text}"
                    </Text>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          ) : (
            <Grid cols={1} md={2}>
              <Card variant="muted">
                <CardBody>
                  <Heading level={4} className="mb-3">
                    Partner spotlights coming soon.
                  </Heading>
                  <Text color="muted">
                    We are onboarding early partners now. If you would like to collaborate, we would love to talk.
                  </Text>
                </CardBody>
              </Card>
              <Card variant="muted">
                <CardBody>
                  <Heading level={4} className="mb-3">
                    Building impact with the right fit.
                  </Heading>
                  <Text color="muted">
                    We prioritize relevance, practical utility, and responsible standards over volume partnerships.
                  </Text>
                </CardBody>
              </Card>
            </Grid>
          )}
        </Container>
      </Section>

      <Section spacing="md" background="default">
        <Container>
          <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-brand-500 to-brand-700 p-12 text-white shadow-2xl lg:p-20">
            <div className="max-w-3xl">
              <Heading level={2} color="white" className="mb-6">
                Ready to Transform the Wellness Landscape?
              </Heading>
              <Text color="white" className="mb-10 opacity-90">
                Join an ecosystem built for trust, designed for ease, and focused on real outcomes for providers and the people they support.
              </Text>
            </div>
            <Button
              className="relative z-10 bg-white text-brand-600 hover:bg-slate-50"
              onClick={scrollToForm}
            >
              Start Partnership
            </Button>
          </div>
        </Container>
      </Section>

      <Section id="partner-form" spacing="lg" background="muted">
        <Container size="narrow">
          <div className="mb-12 text-center">
            <Heading level={2}>Let&apos;s Get Started</Heading>
            <Text color="muted">Fill out the form below and we&apos;ll get back to you within 1-2 business days.</Text>
          </div>

          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <Text variant="small" className="font-semibold text-amber-900">
              We do not run pay-to-play partnerships that compromise trust. Relevance and responsibility come first.
            </Text>
          </div>

          <Card className="p-10 lg:p-14">
            <form className="space-y-7" onSubmit={(event) => event.preventDefault()}>
              <div className="grid gap-7 md:grid-cols-2">
                <div className="space-y-2">
                  <Label as="label" htmlFor="partners-first-name">
                    First Name
                  </Label>
                  <input
                    id="partners-first-name"
                    className="w-full rounded-2xl bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none ring-brand-500/20 transition focus:ring-2"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label as="label" htmlFor="partners-last-name">
                    Last Name
                  </Label>
                  <input
                    id="partners-last-name"
                    className="w-full rounded-2xl bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none ring-brand-500/20 transition focus:ring-2"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid gap-7 md:grid-cols-2">
                <div className="space-y-2">
                  <Label as="label" htmlFor="partners-email">
                    Work Email
                  </Label>
                  <input
                    id="partners-email"
                    type="email"
                    className="w-full rounded-2xl bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none ring-brand-500/20 transition focus:ring-2"
                    placeholder="you@organization.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label as="label" htmlFor="partners-organization">
                    Organization
                  </Label>
                  <input
                    id="partners-organization"
                    className="w-full rounded-2xl bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none ring-brand-500/20 transition focus:ring-2"
                    placeholder="Organization name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label as="label" htmlFor="partners-type">
                  Partnership Type
                </Label>
                <select
                  id="partners-type"
                  className="w-full rounded-2xl bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-800 outline-none ring-brand-500/20 transition focus:ring-2"
                  defaultValue="Vendor/Service Provider"
                >
                  <option>Vendor/Service Provider</option>
                  <option>Sponsor</option>
                  <option>Strategic Ally</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label as="label" htmlFor="partners-message">
                  Message
                </Label>
                <textarea
                  id="partners-message"
                  rows={5}
                  className="w-full resize-y rounded-2xl bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none ring-brand-500/20 transition focus:ring-2"
                  placeholder="Tell us about your partnership goals."
                />
              </div>

              <Button fullWidth variant="brand">
                Submit Application
              </Button>

              <Text variant="small" color="muted" className="text-center">
                By submitting, you agree that EvoWell may contact you about partnership opportunities.
              </Text>
            </form>
          </Card>
        </Container>
      </Section>
    </div>
  );
};

export default PartnersHubView;
