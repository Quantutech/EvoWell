import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '../App';
import { api } from '../services/api';
import { ProviderProfile } from '../types';
import Breadcrumb from '../components/Breadcrumb';
import AnimatedCounter from '../components/AnimatedCounter';
import { PageHero, Section, Container, Grid } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Card, Button } from '../components/ui';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  fullBio: string;
  img: string;
  x: string;
  linkedin: string;
  web: string;
}

interface EnrichedProvider extends ProviderProfile {
  firstName?: string;
  lastName?: string;
}

const AboutHeroVisual = () => (
  <div className="relative flex justify-end">
     <div className="bg-[#f0f9ff] rounded-[4rem] p-10 relative overflow-hidden w-full max-w-lg">
        <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover rounded-[3rem] grayscale mix-blend-multiply opacity-80" alt="Clinical Illustration" />
        <div className="absolute inset-0 bg-brand-500/10"></div>
        <div className="absolute top-10 left-10 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center text-2xl">💬</div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center text-2xl">📞</div>
     </div>
  </div>
);

/* ─── US Map ─────────────────────────────────────────────────────────── */

const USMap: React.FC<{ providers: EnrichedProvider[] }> = ({ providers }) => {
  const stateCoords: Record<string, { x: number; y: number }> = {
    'New York': { x: 82, y: 28 }, 'NY': { x: 82, y: 28 },
    'California': { x: 8, y: 45 }, 'CA': { x: 8, y: 45 },
    'Texas': { x: 45, y: 75 }, 'TX': { x: 45, y: 75 },
    'Florida': { x: 80, y: 85 }, 'FL': { x: 80, y: 85 },
    'Washington': { x: 12, y: 8 }, 'WA': { x: 12, y: 8 },
    'Illinois': { x: 60, y: 35 }, 'IL': { x: 60, y: 35 },
    'Massachusetts': { x: 88, y: 22 }, 'MA': { x: 88, y: 22 },
    'Colorado': { x: 32, y: 45 }, 'CO': { x: 32, y: 45 },
    'Georgia': { x: 74, y: 70 }, 'GA': { x: 74, y: 70 },
    'Oregon': { x: 8, y: 18 }, 'OR': { x: 8, y: 18 },
    'Ohio': { x: 68, y: 35 }, 'OH': { x: 68, y: 35 },
    'Michigan': { x: 65, y: 28 }, 'MI': { x: 65, y: 28 },
  };

  const markers = providers
    .filter(p => p.address?.state && (stateCoords[p.address.state] || stateCoords['New York']))
    .map(p => {
      const state = p.address?.state || 'NY';
      const baseCoords = stateCoords[state] || stateCoords['New York'];
      const x = baseCoords.x + (Math.random() - 0.5) * 6;
      const y = baseCoords.y + (Math.random() - 0.5) * 6;
      return {
        id: p.id,
        name: `Dr. ${p.firstName || 'Expert'} ${p.lastName?.charAt(0) || ''}.`,
        img: p.imageUrl,
        x, y,
        state
      };
    }).slice(0, 15);

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="relative w-full aspect-[16/9] rounded-[3rem] overflow-hidden shadow-[0_8px_60px_-12px_rgba(0,0,0,0.08)] border border-slate-100 select-none"
      style={{ background: 'linear-gradient(160deg, #f8fafc 0%, #eef4ff 50%, #f0fdf4 100%)' }}>
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#475569 0.8px, transparent 0.8px)', backgroundSize: '24px 24px' }}></div>
      {/* Map silhouette */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
        backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/1/1a/Blank_US_Map_%28states_only%29.svg)',
        backgroundSize: '100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}></div>

      {/* Connection lines (decorative) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        {markers.slice(0, 6).map((m, i) => {
          const next = markers[(i + 3) % markers.length];
          return <line key={`line-${i}`} x1={`${m.x}%`} y1={`${m.y}%`} x2={`${next.x}%`} y2={`${next.y}%`} stroke="currentColor" className="text-brand-400" strokeWidth="0.5" strokeDasharray="4 6" />;
        })}
      </svg>

      {/* Provider markers */}
      {markers.map((m) => (
        <div
          key={m.id}
          className="absolute group"
          style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)' }}
          onMouseEnter={() => setHoveredId(m.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          {/* Pulse ring */}
          <div className={`absolute inset-[-4px] rounded-full border-2 transition-all duration-500 ${hoveredId === m.id ? 'border-brand-400 scale-150 opacity-0' : 'border-transparent scale-100 opacity-0'}`}></div>
          <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full border-[2.5px] border-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] bg-white overflow-hidden cursor-pointer transition-all duration-300 ${hoveredId === m.id ? 'scale-[1.3] z-50 shadow-[0_8px_30px_rgba(0,0,0,0.18)]' : 'hover:scale-110'}`}>
            <img src={m.img} alt={m.name} className="w-full h-full rounded-full object-cover" />
          </div>
          {/* Tooltip */}
          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-white px-4 py-2.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100/80 whitespace-nowrap pointer-events-none z-50 transition-all duration-200 ${hoveredId === m.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <p className="text-sm font-semibold text-slate-800">{m.name}</p>
            <p className="text-xs text-brand-500 font-medium">{m.state}</p>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 bg-white rotate-45 border-r border-b border-slate-100/80"></div>
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 bg-white/70 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/60 shadow-sm flex items-center gap-3">
         <div className="relative w-2.5 h-2.5">
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-50"></div>
            <div className="relative w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
         </div>
         <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">Live Network</span>
      </div>

      {/* Provider count badge */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8 bg-white/70 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/60 shadow-sm">
         <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">{markers.length} providers online</span>
      </div>
    </div>
  );
};

/* ─── Bio Modal ──────────────────────────────────────────────────────── */

const BioModal: React.FC<{ member: TeamMember; onClose: () => void }> = ({ member, onClose }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="md:w-2/5 relative h-72 md:h-auto shrink-0">
          <img src={member.img} className="w-full h-full object-cover" alt={member.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
          <button onClick={onClose} className="absolute top-6 right-6 md:hidden bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition-all">✕</button>
        </div>
        <div className="md:w-3/5 p-10 lg:p-16 relative overflow-y-auto">
          <button onClick={onClose} className="hidden md:flex absolute top-10 right-10 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full w-10 h-10 items-center justify-center">✕</button>
          <Label variant="overline" color="brand" className="mb-2">{member.role}</Label>
          <Heading level={2} className="mb-8">{member.name}</Heading>
          <div className="prose prose-slate max-w-none prose-lg">
            <Text>{member.fullBio}</Text>
          </div>
          <div className="flex gap-4 mt-12 pt-10 border-t border-slate-100">
             <Button variant="ghost" as="a" href={member.linkedin} className="w-12 h-12 p-0 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-brand-50 hover:text-brand-600 transition-colors">LI</Button>
             <Button variant="ghost" as="a" href={member.x} className="w-12 h-12 p-0 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-brand-50 hover:text-brand-600 transition-colors">X</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Team Section (new grid layout) ─────────────────────────────────── */

const TeamSection: React.FC<{ team: TeamMember[], onSelect: (m: TeamMember) => void }> = ({ team, onSelect }) => {
  const lead = team[0];
  const rest = team.slice(1);

  return (
    <Section spacing="lg" background="default">
      <Container>
        <div className="text-center mb-16 reveal">
          <Label variant="overline" color="brand" className="mb-4">Leadership</Label>
          <Heading level={2} size="h1" className="mb-4">The people behind the platform</Heading>
          <Text className="max-w-xl mx-auto">Clinicians, engineers, and designers united by the belief that everyone deserves access to exceptional care.</Text>
        </div>

        {/* Featured leader */}
        <div
          className="reveal group relative rounded-[2.5rem] overflow-hidden mb-8 cursor-pointer bg-brand-900"
          onClick={() => onSelect(lead)}
        >
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-[4/3] md:aspect-auto">
              <img src={lead.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={lead.name} />
              <div className="absolute inset-0 bg-brand-900/20 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            <div className="p-10 md:p-16 flex flex-col justify-center">
              <Label variant="overline" className="text-brand-400 mb-4">{lead.role}</Label>
              <Heading level={3} size="h2" color="white" className="mb-6">{lead.name}</Heading>
              <Text className="text-slate-300 leading-relaxed mb-8">{lead.fullBio}</Text>
              <div className="flex gap-3">
                <span className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white text-sm cursor-pointer transition-all">LI</span>
                <span className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white text-sm cursor-pointer transition-all">X</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rest of team */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 reveal">
          {rest.map((member, i) => (
            <div
              key={i}
              className="group relative rounded-[2rem] overflow-hidden cursor-pointer aspect-[3/4] bg-slate-100"
              onClick={() => onSelect(member)}
            >
              <img src={member.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt={member.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-semibold text-base mb-1">{member.name}</p>
                <p className="text-brand-300 text-xs font-medium tracking-wider uppercase">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

/* ─── Main View ──────────────────────────────────────────────────────── */

const AboutView: React.FC = () => {
  const { navigate } = useNavigation();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [enrichedProviders, setEnrichedProviders] = useState<EnrichedProvider[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    Promise.all([api.getAllProviders(), api.getAllUsers()]).then(([providers, users]) => {
      const enriched = providers.map(p => {
        const user = users.find(u => u.id === p.userId);
        return { ...p, firstName: user?.firstName, lastName: user?.lastName };
      });
      setEnrichedProviders(enriched);
    });
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const team: TeamMember[] = [
    { name: "Dr. Cassandra Vane", role: "CEO & Founder", bio: "Pioneering the intersection of clinical care and technology.", fullBio: "Dr. Cassandra Vane spent fifteen years as a practicing clinical psychologist before founding EvoWell. Frustrated by the barriers her own patients faced — long wait lists, insurance red tape, and geographic limitations — she set out to build a platform that meets people where they are. Her vision: world-class mental health care should be as accessible as a phone call.", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800", x: "#", linkedin: "#", web: "#" },
    { name: "Adrian Solis", role: "Chief Technology Officer", bio: "Architecting zero-trust infrastructure for sensitive health data.", fullBio: "Adrian brings two decades of experience building secure, scalable systems at companies like Stripe and Oscar Health. At EvoWell he oversees the engineering team and ensures that every byte of patient data is protected with zero-trust architecture.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800", x: "#", linkedin: "#", web: "#" },
    { name: "Elara Vance", role: "Head of Design", bio: "Crafting empathetic interfaces that feel human.", fullBio: "Elara treats pixels with the same care a therapist treats words. Before EvoWell, she led design at Calm and Headspace, where she developed a deep understanding of how digital experiences can reduce anxiety rather than create it.", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800", x: "#", linkedin: "#", web: "#" },
    { name: "Dr. Marcus Thorne", role: "Director of Clinical Affairs", bio: "Ensuring clinical rigor across the platform.", fullBio: "A board-certified psychiatrist with a research background in teletherapy outcomes, Dr. Thorne ensures that every provider on EvoWell meets the highest standards of clinical excellence.", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800", x: "#", linkedin: "#", web: "#" },
    { name: "Sophia Liu", role: "VP of Operations", bio: "Scaling the ecosystem without losing the human touch.", fullBio: "Sophia manages the complex logistics of provider credentialing, scheduling, and compliance. Her systems thinking keeps EvoWell running smoothly as it scales.", img: "https://images.unsplash.com/photo-1598550874175-4d7112ee7f38?auto=format&fit=crop&q=80&w=800", x: "#", linkedin: "#", web: "#" },
    { name: "James Sterling", role: "Community Lead", bio: "Fostering connection across the care network.", fullBio: "James believes that healers need community too. He runs EvoWell's provider support programs, peer groups, and the annual EvoWell Summit.", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800", x: "#", linkedin: "#", web: "#" }
  ];

  const values = [
    { icon: "🌍", title: "Accessible", desc: "Care without barriers — geographic, financial, or cultural." },
    { icon: "🤝", title: "Empowering", desc: "Tools that put clients and providers in the driver's seat." },
    { icon: "🧬", title: "Inclusive", desc: "A platform built to serve every identity and background." },
    { icon: "🔒", title: "Trustworthy", desc: "Radical transparency in everything we build and share." },
    { icon: "⚡", title: "Innovative", desc: "Technology that feels invisible but changes everything." },
    { icon: "🌱", title: "Collaborative", desc: "Better outcomes through partnership, not isolation." }
  ];

  const milestones = [
    { year: "2021", event: "Founded after Dr. Vane's clinical research revealed a critical gap in accessible care." },
    { year: "2022", event: "Launched beta with 20 providers and 200 early users across three states." },
    { year: "2023", event: "Expanded to 50+ providers covering 15 specialties nationwide." },
    { year: "2024", event: "Reached 500+ users with 100% online availability and growing." },
  ];

  return (
    <div className="bg-white min-h-screen">
      <Breadcrumb items={[{ label: 'About us' }]} />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <PageHero
        overline="Our Story"
        title={<>The next evolution<br/><span className="text-brand-500">in care</span></>}
        description="Your trusted companion on the journey to mental peace and well-being. We connect individuals with elite providers through a balanced clinical ecosystem."
        variant="split"
        visual={<AboutHeroVisual />}
      />

      {/* ── Our Story ────────────────────────────────────────────── */}
      <Section spacing="lg" background="default">
        <Container>
          <div className="grid lg:grid-cols-5 gap-16 lg:gap-24 items-start reveal">
            {/* Left — narrative */}
            <div className="lg:col-span-3">
              <Label variant="overline" color="brand" className="mb-4">Our Story</Label>
              <Heading level={2} size="h1" className="mb-8">
                Born from a waiting room,<br className="hidden lg:block" /> built for the world
              </Heading>
              <div className="space-y-6">
                <Text variant="lead">
                  In 2021, Dr. Cassandra Vane sat across from a patient who had waited eleven weeks for an appointment. Eleven weeks of unanswered questions, sleepless nights, and a growing sense that help was out of reach.
                </Text>
                <Text>
                  That moment crystallized something she had felt for years: the mental health system wasn't broken — it was simply never designed for the people who need it most. Geographic barriers, insurance labyrinths, and month-long waitlists were treated as acceptable norms.
                </Text>
                <Text>
                  EvoWell started as a simple question — what if finding the right therapist were as easy as finding the right doctor? — and grew into a platform connecting people with verified specialists in days, not months. No gatekeepers, no guesswork. Just care that meets you where you are.
                </Text>
              </div>
            </div>

            {/* Right — timeline */}
            <div className="lg:col-span-2">
              <div className="relative pl-8 border-l-2 border-brand-100 space-y-10">
                {milestones.map((m, i) => (
                  <div key={i} className="relative group">
                    <div className="absolute -left-[calc(2rem+5px)] w-3 h-3 rounded-full bg-brand-500 ring-4 ring-brand-50 group-hover:ring-brand-100 transition-all"></div>
                    <Label variant="overline" color="brand" className="mb-1">{m.year}</Label>
                    <Text className="text-slate-600">{m.event}</Text>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <Section spacing="md" background="white">
         <Container>
           <Grid cols={4} className="reveal">
              <AnimatedCounter target={50} label="Verified Experts" prefix="+" />
              <AnimatedCounter target={15} label="Specialties" prefix="+" />
              <AnimatedCounter target={100} label="Available Online" suffix="%" />
              <AnimatedCounter target={500} label="Beta Users" prefix="+" />
           </Grid>
         </Container>
      </Section>

      {/* ── Map ──────────────────────────────────────────────────── */}
      <Section spacing="lg" background="default" className="overflow-hidden">
         <Container>
           <div className="text-center mb-16 reveal">
              <Label variant="overline" color="brand" className="mb-4">Our Presence</Label>
              <Heading level={2} size="h1" className="mb-4">Specialists across the country</Heading>
              <Text className="max-w-xl mx-auto">A growing network of licensed therapists, psychiatrists, and counselors — all vetted, all online, all ready.</Text>
           </div>
           <div className="reveal">
             <USMap providers={enrichedProviders} />
           </div>
         </Container>
      </Section>

      {/* ── Values ───────────────────────────────────────────────── */}
      <Section spacing="lg" background="white">
         <Container>
           <div className="text-center mb-16 reveal">
              <Label variant="overline" color="brand" className="mb-4">What We Stand For</Label>
              <Heading level={2} size="h1">Built on principles,<br className="hidden md:block" /> not just code</Heading>
           </div>
           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 reveal">
              {values.map((v, i) => (
                <div key={i} className="group p-8 rounded-[2rem] border border-slate-100 hover:border-brand-100 bg-white hover:bg-brand-50/30 transition-all duration-300">
                   <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform">{v.icon}</div>
                   <Heading level={4} className="mb-2">{v.title}</Heading>
                   <Text variant="caption" className="text-slate-500 leading-relaxed">{v.desc}</Text>
                </div>
              ))}
           </div>
         </Container>
      </Section>

      {/* ── Team ──────────────────────────────────────────────────── */}
      <TeamSection team={team} onSelect={setSelectedMember} />

      {/* ── Provider CTA ─────────────────────────────────────────── */}
      <Section spacing="lg" background="default">
        <Container>
          <div className="reveal relative rounded-[3rem] overflow-hidden bg-brand-900">
            {/* Background texture */}
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}></div>
            <div className="absolute top-0 right-0 w-[40%] h-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 30%, rgba(var(--color-brand-400-rgb, 96, 165, 250), 0.5), transparent 60%)' }}></div>

            <div className="relative grid lg:grid-cols-2 gap-12 items-center p-10 md:p-16 lg:p-20">
              {/* Copy */}
              <div>
                <Label variant="overline" className="text-brand-400 mb-4">Join Our Network</Label>
                <Heading level={2} size="h1" color="white" className="mb-6">
                  Your expertise deserves<br className="hidden md:block" /> a wider reach
                </Heading>
                <Text className="text-slate-300 leading-relaxed mb-4 max-w-lg">
                  EvoWell gives licensed providers the tools, the clients, and the flexibility to practice on their own terms — fully online, with zero overhead. Join a growing network of 50+ specialists already transforming how care is delivered.
                </Text>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mb-10">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Free to apply</span>
                  <span className="text-slate-600">·</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Set your own schedule</span>
                  <span className="text-slate-600">·</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Get matched with clients</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary" onClick={() => navigate('/provider/register')} className="px-8 py-4 rounded-2xl text-base font-semibold">
                    Apply as a Provider
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/providers')} className="px-8 py-4 rounded-2xl text-base font-semibold text-white hover:bg-white/10">
                    Browse Our Providers →
                  </Button>
                </div>
              </div>

              {/* Visual — stacked provider avatars + stats */}
              <div className="hidden lg:flex flex-col items-center justify-center">
                <div className="relative w-72 h-72">
                  {/* Decorative rings */}
                  <div className="absolute inset-0 rounded-full border border-white/[0.06]"></div>
                  <div className="absolute inset-6 rounded-full border border-white/[0.08]"></div>
                  <div className="absolute inset-12 rounded-full border border-white/[0.1]"></div>

                  {/* Floating avatars around the circle */}
                  {team.slice(0, 5).map((m, i) => {
                    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                    const radius = 120;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    return (
                      <div
                        key={i}
                        className="absolute w-14 h-14 rounded-full border-[3px] border-brand-900 shadow-lg overflow-hidden"
                        style={{ left: `calc(50% + ${x}px - 28px)`, top: `calc(50% + ${y}px - 28px)` }}
                      >
                        <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                      </div>
                    );
                  })}

                  {/* Center stat */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">50+</span>
                    <span className="text-xs font-semibold tracking-wider uppercase text-brand-400 mt-1">Providers</span>
                  </div>
                </div>

                <p className="text-slate-400 text-sm text-center mt-8 max-w-xs">Join clinicians from across the country who are already building thriving practices on EvoWell.</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Bio Modal ────────────────────────────────────────────── */}
      {selectedMember && <BioModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
    </div>
  );
};

export default AboutView;