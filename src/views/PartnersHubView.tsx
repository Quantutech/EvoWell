import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '../App';
import Breadcrumb from '../components/Breadcrumb';
import { api } from '../services/api';
import { Testimonial } from '../types';
import { PageHero, Section, Container, Grid } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button, Card, CardHeader, CardBody } from '../components/ui';

const PartnersHeroVisual = () => (
  <div className="relative w-full aspect-square max-w-lg">
    <div className="absolute inset-0 bg-gradient-to-tr from-brand-100 to-blue-50 rounded-[3rem] rotate-3 opacity-60"></div>
    <div className="absolute inset-0 bg-white rounded-[3rem] -rotate-3 shadow-2xl overflow-hidden border border-slate-100">
       <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale opacity-90 mix-blend-multiply hover:grayscale-0 transition-all duration-700 hover:scale-105" alt="Partnership Illustration" />
       <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 animate-bounce-slow">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">🤝</div>
       </div>
       <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50 max-w-[200px]">
          <div className="flex gap-2 mb-2">
             <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
             <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white -ml-4"></div>
             <div className="w-8 h-8 rounded-full bg-brand-500 border-2 border-white -ml-4 flex items-center justify-center text-[10px] text-white font-black">+2k</div>
          </div>
          <Text variant="caption" weight="bold">Active Partners</Text>
       </div>
    </div>
 </div>
);

const PartnersHubView: React.FC = () => {
  const { navigate } = useNavigation();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    api.getTestimonials('partners').then(setTestimonials);
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const benefits = [
    { title: "Enhanced Visibility", desc: "Reach thousands of licensed providers...", icon: "📊" },
    { title: "Targeted Outreach", desc: "Connect directly with decision-makers...", icon: "🎯" },
    { title: "Collaborative Growth", desc: "Co-create initiatives, events...", icon: "📈" },
    { title: "Credibility & Trust", desc: "Align your brand with a trusted platform...", icon: "🛡️" }
  ];

  const journeySteps = [
    { title: "Reach Out & Connect", desc: "Fill out our brief partnership form...", icon: "📞" },
    { title: "Discovery & Alignment", desc: "We'll schedule a conversation...", icon: "🔍" },
    { title: "Onboarding & Integration", desc: "Work with our technical teams...", icon: "⚙️" },
    { title: "Grow & Succeed Together", desc: "Launch your services on EvoWell...", icon: "🌱" }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
      <Breadcrumb items={[{ label: 'Partners Hub' }]} />

      <PageHero
        overline="Strategic Alliances"
        title={<>Shape the Future of <br/><span className="text-brand-500">Wellness Together.</span></>}
        description="Partner with EvoWell to deliver innovative tools, services, and solutions directly to the mental health and wellness community."
        variant="split"
        visual={<PartnersHeroVisual />}
        actions={<>
            <Button variant="primary" onClick={() => document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth' })}>Become a Partner</Button>
            <Button variant="secondary">View Media Kit</Button>
        </>}
      />

      <Section spacing="md" background="default">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
             <div>
               <Heading level={2} size="h1" className="mb-6">Why Partner with <br/>EvoWell?</Heading>
               <div className="h-1.5 w-20 bg-brand-500 rounded-full reveal"></div>
             </div>
             <Text variant="lead" className="reveal">We believe that great partnerships create lasting impact...</Text>
          </div>
        </Container>
      </Section>

      <Section spacing="md" background="white">
        <Container>
           <div className="text-center mb-16 reveal">
              <Label variant="overline" color="brand" className="mb-4">The Value Prop</Label>
              <Heading level={2}>Partnership Advantages</Heading>
           </div>
           <Grid cols={4} className="reveal">
              {benefits.map((benefit, i) => (
                <Card key={i} variant="muted" hoverable>
                   <CardBody className="text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-8 shadow-sm border border-slate-100">{benefit.icon}</div>
                      <Heading level={4} className="mb-4">{benefit.title}</Heading>
                      <Text variant="small" color="muted">{benefit.desc}</Text>
                   </CardBody>
                </Card>
              ))}
           </Grid>
        </Container>
      </Section>

      <Section spacing="lg" background="default">
        <Container>
          <div className="text-center mb-16">
             <Heading level={2} className="reveal">Ecosystem Opportunities</Heading>
             <Text color="muted" className="reveal mt-4">Discover how you can make a difference in the network.</Text>
          </div>
          <div className="space-y-32">
            {/* Vendors */}
            <div className="group reveal">
               <Card variant="default" size="lg" className="grid lg:grid-cols-2 gap-16 items-center p-10">
                  <div className="relative aspect-square rounded-[2.5rem] overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Vendors" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                     <div className="absolute bottom-10 left-10 text-white">
                        <Label variant="overline" className="mb-2 opacity-80 text-white">Marketplace</Label>
                        <Heading level={3} color="white">Service Vendors</Heading>
                     </div>
                  </div>
                  <div>
                     <Heading level={3} className="mb-6">For Vendors & Service Providers</Heading>
                     <Text variant="lead" className="mb-10">Feature your innovative tools...</Text>
                     <Button variant="secondary">Explore Vendor Program</Button>
                  </div>
               </Card>
            </div>
            {/* Sponsors */}
            <div className="group reveal">
               <Card variant="elevated" size="lg" className="bg-[#2a4651] text-white grid lg:grid-cols-2 gap-16 items-center lg:flex-row-reverse p-10 border-none">
                  <div className="order-2 lg:order-1">
                     <Heading level={3} color="white" className="mb-6">For Sponsors & Strategic Allies</Heading>
                     <Text color="white" className="mb-10 opacity-80">Support our mission while gaining high-impact exposure...</Text>
                     <Button variant="brand">View Sponsorship Deck</Button>
                  </div>
                  <div className="order-1 lg:order-2 relative aspect-square rounded-[2.5rem] overflow-hidden border border-white/10">
                     <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Sponsors" />
                  </div>
               </Card>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="md" className="bg-[#f0f8fa] relative overflow-hidden">
         <Container className="relative z-10">
           <div className="text-center mb-20 reveal">
             <Label variant="overline" color="brand" className="mb-4">The Roadmap</Label>
             <Heading level={2}>Partnership Journey</Heading>
           </div>
           <Grid cols={4} gap="lg">
              {journeySteps.map((step, i) => (
                 <Card key={i} className="reveal relative group hover:-translate-y-2 transition-transform duration-300 overflow-visible">
                    <div className="absolute -top-6 left-8 w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-xl border-4 border-[#f0f8fa]">
                       {i + 1}
                    </div>
                    <CardBody className="mt-6">
                        <div className="mb-4 text-4xl">{step.icon}</div>
                        <Heading level={4} className="mb-3">{step.title}</Heading>
                        <Text variant="small" color="muted">{step.desc}</Text>
                    </CardBody>
                 </Card>
              ))}
           </Grid>
         </Container>
      </Section>

      <Section spacing="md" background="white">
        <Container>
           <div className="flex justify-between items-end mb-16 reveal">
              <div>
                 <Heading level={2} className="mb-2">Partners in Impact</Heading>
                 <Text color="muted">Hear from organizations growing with us.</Text>
              </div>
           </div>
           <Grid cols={4} className="reveal">
              {testimonials.map((t, i) => (
                <Card key={i} variant="muted" hoverable>
                   <CardBody>
                       <div className="flex items-center gap-4 mb-6">
                          <img src={t.imageUrl} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" alt={t.author} />
                          <div>
                             <Heading level={5} size="h4">{t.author}</Heading>
                             <Label variant="badge" color="brand">{t.role}</Label>
                          </div>
                       </div>
                       <Text variant="small" className="italic">"{t.text}"</Text>
                   </CardBody>
                </Card>
              ))}
           </Grid>
        </Container>
      </Section>

      <Section spacing="md" background="default">
        <Container>
           <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-[3rem] p-12 lg:p-20 text-white flex flex-col lg:flex-row justify-between items-center gap-12 relative overflow-hidden shadow-2xl reveal">
              <div className="max-w-2xl relative z-10">
                 <Heading level={2} color="white" className="mb-6">Ready to Transform the <br/>Wellness Landscape?</Heading>
                 <Text color="white" className="opacity-90">Join a movement where your innovative solutions empower providers to thrive.</Text>
              </div>
              <Button className="bg-white text-brand-600 hover:bg-slate-50 relative z-10" onClick={() => document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth' })}>Start Partnership</Button>
           </div>
        </Container>
      </Section>

      <Section id="partner-form" spacing="lg" background="muted">
        <Container size="narrow">
           <div className="text-center mb-16 reveal">
              <Heading level={2}>Let's Get Started</Heading>
              <Text color="muted">Fill out the details below and our team will be in touch.</Text>
           </div>
           <Card className="p-10 lg:p-16 reveal">
              <form className="space-y-8" onSubmit={e => e.preventDefault()}>
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <Label>First Name</Label>
                       <input className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-brand-500/20 outline-none" placeholder="Enter First Name" />
                    </div>
                    <div className="space-y-2">
                       <Label>Last Name</Label>
                       <input className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-brand-500/20 outline-none" placeholder="Enter Last Name" />
                    </div>
                 </div>
                 <Button fullWidth variant="brand">Submit Application</Button>
              </form>
           </Card>
        </Container>
      </Section>
    </div>
  );
};

export default PartnersHubView;