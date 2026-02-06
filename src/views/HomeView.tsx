import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Specialty, ProviderProfile, BlogPost, Testimonial } from '../types';
import { useNavigation } from '../App';
import { api } from '../services/api';
import AnimatedCounter from '../components/AnimatedCounter';
import PointSolutionsReplacement from '../components/PointSolutionsReplacement';
import SimpleChart from '../components/SimpleChart';
import FeaturedProviders from '../components/home/FeaturedProviders';
import TestimonialsSection from '../components/home/TestimonialsSection';
import { PageHero, Section, Container, Grid } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button, Card, CardHeader, CardBody, Badge } from '../components/ui';

interface FeaturedProvider extends ProviderProfile {
  firstName: string;
  lastName: string;
}

/* ─── Hero visual (unchanged) ────────────────────────────────────────── */

const HomeHeroVisual = () => {
  const heroChartData = [
    { date: '2024-01-01', views: 20, inquiries: 2 },
    { date: '2024-01-02', views: 45, inquiries: 5 },
    { date: '2024-01-03', views: 30, inquiries: 3 },
    { date: '2024-01-04', views: 60, inquiries: 8 },
    { date: '2024-01-05', views: 80, inquiries: 12 },
    { date: '2024-01-06', views: 110, inquiries: 15 },
  ];

  return (
    <div className="relative w-full max-w-lg">
       <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-[2.5rem] shadow-2xl w-full relative z-20 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
          <div className="flex justify-between items-center mb-8">
             <div>
                <Label variant="overline" color="muted" className="mb-1">Weekly Growth</Label>
                <Heading level={3} size="h3">$8,450</Heading>
             </div>
             <Badge variant="success" size="md">+24%</Badge>
          </div>
          <div className="h-40 mb-8">
             <SimpleChart data={heroChartData} dataKey="views" color="#257a46" height={160} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-50 p-4 rounded-2xl">
                <Label variant="overline" color="muted" className="mb-1">New Patients</Label>
                <Text variant="lead" weight="bold" color="primary">12</Text>
             </div>
             <div className="bg-slate-50 p-4 rounded-2xl">
                <Label variant="overline" color="muted" className="mb-1">Retention</Label>
                <Text variant="lead" weight="bold" color="primary">98%</Text>
             </div>
          </div>
       </div>

       <Card className="absolute top-20 -right-8 z-30 animate-bounce-slow hidden md:block w-auto" size="sm">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">📅</div>
             <div>
                <Text variant="small" weight="bold">New Booking</Text>
                <Text variant="caption" color="muted">Just now • Sarah M.</Text>
             </div>
          </div>
       </Card>

       <Card className="absolute bottom-20 -left-8 bg-slate-900 text-white z-30 animate-bounce-slow hidden md:block w-auto border-none" size="sm">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center font-black">5.0</div>
             <div>
                <Text variant="small" weight="bold" color="white">Stellar Review</Text>
                <div className="flex text-amber-400 text-[10px]">★★★★★</div>
             </div>
          </div>
       </Card>
    </div>
  );
};

/* ─── Inline Featured Providers ──────────────────────────────────────── */
/* 
   The original FeaturedProviders component may have visibility issues,
   so we render an explicit fallback grid here that links directly.
   If FeaturedProviders works fine, you can remove this and keep the import.
*/

const FeaturedProvidersGrid: React.FC<{ providers: FeaturedProvider[]; navigate: (path: string) => void }> = ({ providers, navigate }) => {
  if (providers.length === 0) return null;

  return (
    <Section spacing="md" background="white">
      <Container>
        <div className="flex justify-between items-end mb-10 reveal">
          <div>
            <Label variant="overline" color="brand" className="mb-3">Top Rated</Label>
            <Heading level={2}>Featured Providers</Heading>
          </div>
          <Button variant="ghost" onClick={() => navigate('#/search')}>View All →</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 reveal">
          {providers.slice(0, 10).map((p) => {
            const slug = p.slug || p.id;
            return (
              <div
                key={p.id}
                onClick={() => navigate(`#/provider/${slug}`)}
                className="group cursor-pointer"
              >
                <div className="relative rounded-[1.75rem] overflow-hidden aspect-[3/4] bg-slate-100 mb-3 shadow-sm group-hover:shadow-xl transition-all duration-300">
                  <img
                    src={p.imageUrl || `https://ui-avatars.com/api/?name=${p.firstName}+${p.lastName}&size=400&background=e2e8f0&color=475569&bold=true`}
                    alt={`${p.firstName} ${p.lastName}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Rating badge */}
                  {p.rating && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-black text-slate-800 shadow-sm">
                      ★ {typeof p.rating === 'number' ? p.rating.toFixed(1) : p.rating}
                    </div>
                  )}

                  {/* Hover overlay info */}
                  <div className="absolute bottom-0 left-0 w-full p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-white text-xs font-bold bg-brand-500/80 backdrop-blur-sm px-3 py-1 rounded-full">
                      View Profile →
                    </span>
                  </div>
                </div>

                <div className="px-1">
                  <p className="font-bold text-sm text-slate-800 truncate group-hover:text-brand-600 transition-colors">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {p.title || p.credentials || 'Licensed Provider'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
};

/* ─── Main view ──────────────────────────────────────────────────────── */

const HomeView: React.FC<{ specialties: Specialty[] }> = ({ specialties }) => {
  const [featured, setFeatured] = useState<FeaturedProvider[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const { navigate } = useNavigation();
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Search state
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearchSubmit = useCallback(() => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (location) params.set('state', location);
    navigate(`#/search?${params.toString()}`);
  }, [query, location, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const [searchRes, allUsers, allBlogs, homeTestimonials] = await Promise.all([
        api.search({}),
        api.getAllUsers(),
        api.getAllBlogs(),
        api.getTestimonials('home'),
      ]);

      const providersWithNames = searchRes.providers.map(p => {
        const user = allUsers.find(u => u.id === p.userId);
        return { ...p, firstName: user?.firstName || 'Unknown', lastName: user?.lastName || 'Provider' };
      });

      const shuffled = providersWithNames.sort(() => 0.5 - Math.random());
      setFeatured(shuffled.slice(0, 10));
      setBlogs(allBlogs.slice(0, 3));
      setTestimonials(homeTestimonials);
    };

    fetchData();

    observerRef.current = new IntersectionObserver(
      entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); }),
      { threshold: 0.1 },
    );
    document.querySelectorAll('.reveal').forEach(el => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const areasOfSupport = [
    { name: 'Addiction', img: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&q=80&w=600', id: 's7' },
    { name: 'Parenting', img: 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&q=80&w=600', id: 's5' },
    { name: 'Nutrition', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=600', id: 's7' },
    { name: 'Relational', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=600', id: 's6' },
    { name: 'Trauma & PTSD', img: 'https://images.unsplash.com/photo-1620065406085-7d8d21b5f7e6?auto=format&fit=crop&q=80&w=600', id: 's4' },
    { name: 'ADHD', img: 'https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?auto=format&fit=crop&q=80&w=600', id: 's8' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <PageHero
        overline="The Sovereign Practice OS"
        title={
          <>
            The next evolution<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">in clinical care.</span>
          </>
        }
        description="For Patients: A trusted network of verified experts. For Providers: A complete operating system to grow your practice on your terms."
        variant="split"
        visual={<HomeHeroVisual />}
        actions={
          <div className="w-full max-w-xl">
            {/* ── Search Bar (refined) ─────────────────────────── */}
            <div
              className={`bg-white rounded-[1.25rem] border transition-all duration-300 ${
                searchFocused
                  ? 'shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] border-brand-200 ring-4 ring-brand-50'
                  : 'shadow-xl shadow-slate-200/50 border-slate-100 hover:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.1)]'
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Query field */}
                <div className="flex-1 relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center group-focus-within:bg-brand-100 transition-colors">
                    <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Condition, specialty, or name…"
                    className="w-full pl-16 pr-4 py-5 bg-transparent border-none text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:ring-0 outline-none"
                    onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
                  />
                </div>

                {/* Divider */}
                <div className="hidden md:flex items-center px-0">
                  <div className="w-px h-8 bg-slate-150 bg-slate-200"></div>
                </div>
                <div className="md:hidden mx-4">
                  <div className="h-px bg-slate-100"></div>
                </div>

                {/* Location field */}
                <div className="flex-1 relative flex items-center group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center group-focus-within:bg-brand-50 transition-colors">
                    <svg className="w-4 h-4 text-slate-500 group-focus-within:text-brand-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Zip code or 'Remote'"
                    className="w-full pl-16 pr-4 py-5 bg-transparent border-none text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:ring-0 outline-none"
                    onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
                  />

                  {/* Submit button — sits inside the bar on desktop */}
                  <div className="hidden md:block pr-2.5 shrink-0">
                    <button
                      onClick={handleSearchSubmit}
                      className="bg-brand-500 hover:bg-brand-600 active:scale-95 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                    >
                      Find Care
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile submit button */}
              <div className="md:hidden p-3 pt-0">
                <button
                  onClick={handleSearchSubmit}
                  className="w-full bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white py-4 rounded-xl text-sm font-bold transition-all"
                >
                  Find Care
                </button>
              </div>
            </div>

            {/* Quick-link pills under search */}
            <div className="flex flex-wrap items-center gap-2 mt-5">
              <span className="text-xs font-medium text-slate-400 mr-1">Popular:</span>
              {['Anxiety', 'Depression', 'ADHD', 'Couples Therapy'].map(term => (
                <button
                  key={term}
                  onClick={() => { setQuery(term); navigate(`#/search?query=${encodeURIComponent(term)}`); }}
                  className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all"
                >
                  {term}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-6 mt-7">
               <Label variant="overline" color="muted">Founding Partners</Label>
               <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-500 flex items-center justify-center text-[8px] text-white font-bold">50+</div>
               </div>
               <Label variant="overline" color="muted">Clinicians</Label>
            </div>
          </div>
        }
      />

      {/* ── Insurance ────────────────────────────────────────────── */}
      <Section spacing="md" background="white">
         <Container>
            <div className="text-center mb-12 reveal">
               <Heading level={2} className="mb-4">We Accept Major Insurance Plans</Heading>
               <Text className="max-w-2xl mx-auto">
                  Our providers are in-network with top carriers. We handle the verification and billing so you can focus on your health.
               </Text>
            </div>
            <div className="flex flex-wrap justify-center gap-6 reveal">
               {['Aetna', 'Cigna', 'BlueCross BlueShield', 'UnitedHealthcare', 'Medicare', 'Oscar'].map((name, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 px-8 py-4 rounded-xl flex items-center justify-center min-w-[140px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                     <span className="text-lg font-black italic tracking-tight text-slate-700">{name}</span>
                  </div>
               ))}
               <div className="bg-white border-2 border-dashed border-slate-200 px-8 py-4 rounded-xl flex items-center justify-center min-w-[140px] text-slate-500 font-bold text-xs uppercase tracking-widest">
                  + FSA / HSA Accepted
               </div>
            </div>
         </Container>
      </Section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <Section spacing="md" background="default">
        <Container>
          <Grid cols={4} gap="lg" className="reveal">
              <AnimatedCounter target={50} label="Founding Providers" prefix="+" />
              <AnimatedCounter target={15} label="Specialties" prefix="+" />
              <AnimatedCounter target={100} label="Available Online" suffix="%" />
              <AnimatedCounter target={500} label="Waitlist Access" prefix="+" />
          </Grid>
        </Container>
      </Section>

      {/* ── Meet Evo AI ──────────────────────────────────────────── */}
      <Section spacing="md" background="dark" className="relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

         <Container className="relative z-10">
           <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="reveal">
               <div className="inline-block px-4 py-2 rounded-full bg-white/10 border border-white/10 text-brand-300 text-[11px] font-black uppercase tracking-widest mb-6 backdrop-blur-sm">Intelligent Matching</div>
               <Heading level={2} size="display" color="white" className="mb-6">Meet Evo.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">Your Wellness Concierge.</span></Heading>
               <Text variant="lead" color="white" className="mb-10 opacity-80 max-w-xl">Not sure where to start? Evo uses advanced clinical logic to understand your needs and match you with the perfect specialist in seconds.</Text>
               <Button variant="brand" leftIcon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}>
                  Chat with Evo
               </Button>
            </div>
            <div className="reveal relative flex justify-center">
               <div className="relative w-full max-w-md bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl">
                  <div className="space-y-4">
                     <div className="flex items-end gap-3"><div className="w-8 h-8 rounded-full bg-slate-700"></div><div className="bg-slate-700 text-slate-200 px-5 py-3 rounded-2xl rounded-bl-none text-sm font-medium">I'm feeling anxious about work.</div></div>
                     <div className="flex items-end gap-3 flex-row-reverse"><div className="w-8 h-8 rounded-full bg-brand-500"></div><div className="bg-brand-600 text-white px-5 py-3 rounded-2xl rounded-br-none text-sm font-medium shadow-lg">I understand. Are you looking for a therapist or a performance coach?</div></div>
                  </div>
               </div>
            </div>
           </div>
         </Container>
      </Section>

      {/* ── How it Works ─────────────────────────────────────────── */}
      <Section spacing="md" background="default">
         <Container>
           <div className="grid lg:grid-cols-2 gap-20 items-center reveal">
            <div className="relative">
               <div className="bg-brand-100 rounded-[3rem] overflow-hidden aspect-[4/3] relative">
                  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover mix-blend-multiply opacity-90" alt="Platform Dashboard" />
               </div>
               <Card className="absolute -bottom-10 -right-10 hidden md:block max-w-xs" variant="default" size="lg">
                  <CardHeader>
                     <Heading level={3} color="brand" className="mb-2">3 Simple Steps</Heading>
                  </CardHeader>
                  <CardBody>
                     <Text variant="small">To start your wellness journey today.</Text>
                  </CardBody>
               </Card>
            </div>
            <div>
               <Heading level={2} className="mb-12">How it works</Heading>
               <div className="space-y-12">
                  {[
                    { num: 1, title: 'Find Providers', desc: 'Search our directory for licensed providers, browse their resources, videos, and more.' },
                    { num: 2, title: 'Book & Connect', desc: 'Easily book appointments or access digital products and media through the provider\'s links.' },
                    { num: 3, title: 'Stay Connected', desc: 'Engage with your provider, follow our blog, and access wellness tools anytime.' },
                  ].map(step => (
                    <div key={step.num} className="flex gap-6 group">
                       <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-900 flex items-center justify-center text-xl font-black shrink-0 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">{step.num}</div>
                       <div>
                          <Heading level={4} className="mb-2">{step.title}</Heading>
                          <Text>{step.desc}</Text>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
           </div>
         </Container>
      </Section>

      {/* ── Why Choose ───────────────────────────────────────────── */}
      <Section spacing="md" background="white">
        <Container>
          <div className="text-center mb-16 reveal">
             <Heading level={2}>Why Choose EvoWell?</Heading>
          </div>
          <Grid cols={4} className="reveal">
             {[
               { title: "Wellness Library", desc: "Digital downloads, media, and tools." },
               { title: "Direct Scheduling", desc: "Seamless booking with experts." },
               { title: "Private Messaging", desc: "Secure comms with professionals." },
               { title: "Open Access", desc: "No gatekeepers. Just care." },
             ].map((item, i) => (
               <Card key={i} variant="muted" hoverable>
                  <CardHeader>
                     <Heading level={3} size="h4">{item.title}</Heading>
                  </CardHeader>
                  <CardBody>
                     <Text variant="small">{item.desc}</Text>
                  </CardBody>
               </Card>
             ))}
          </Grid>
        </Container>
      </Section>

      {/* ── Areas of Support (compact) ───────────────────────────── */}
      <Section spacing="sm" background="default">
        <Container>
          <div className="flex justify-between items-end mb-8 reveal">
             <div>
               <Label variant="overline" color="brand" className="mb-3">Specialties</Label>
               <Heading level={2}>Areas of Support</Heading>
             </div>
             <Button variant="ghost" onClick={() => navigate('#/search')}>View All →</Button>
          </div>

          {/* Horizontal scroll on mobile, 6-col grid on desktop */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-6 md:overflow-visible reveal">
             {areasOfSupport.map((area, i) => (
               <div
                 key={i}
                 onClick={() => navigate(`#/search?specialty=${area.id}`)}
                 className="group cursor-pointer shrink-0 w-40 md:w-auto"
               >
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-sm group-hover:shadow-lg transition-all duration-300">
                     <img
                       src={area.img}
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                       alt={area.name}
                       loading="lazy"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                     <div className="absolute bottom-0 left-0 w-full p-4">
                        <span className="text-white font-bold text-sm leading-tight">{area.name}</span>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </Container>
      </Section>

      {/* ── Featured Providers ───────────────────────────────────── */}
      <FeaturedProviders providers={featured} />

      <PointSolutionsReplacement />

      {/* ── Provider CTA ─────────────────────────────────────────── */}
      <Section spacing="sm" background="default">
         <Container>
           <div className="bg-[#2a4651] rounded-[3rem] p-12 lg:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 reveal">
              <div className="relative z-10 max-w-2xl">
                 <Heading level={2} color="white" className="mb-6">Curious About Becoming an EvoWell Provider?</Heading>
                 <Text color="white" className="opacity-90">Create your profile in minutes, showcase your expertise, and grow your impact.</Text>
              </div>
              <Button variant="secondary" className="relative z-10 bg-amber-400 border-none text-[#2a4651] hover:bg-amber-300" onClick={() => navigate('#/login?join=true')}>
                 Join as a Provider
              </Button>
           </div>
         </Container>
      </Section>

      <TestimonialsSection testimonials={testimonials} />

      {/* ── Blog ─────────────────────────────────────────────────── */}
      <Section spacing="md" background="default">
         <Container size="full">
           <div className="mb-12 reveal">
              <Heading level={2}>Everyday Wellness Support</Heading>
           </div>
           <Grid cols={3} className="reveal">
              {blogs.map(post => (
                 <div key={post.id} onClick={() => navigate(`#/blog/${post.slug}`)} className="group cursor-pointer">
                    <div className="aspect-[16/10] rounded-[2rem] overflow-hidden mb-6 relative">
                       <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" loading="lazy" />
                    </div>
                    <Label variant="overline" color="brand" className="mb-2">{post.category}</Label>
                    <Heading level={4} className="mb-3 group-hover:text-brand-600 transition-colors">{post.title}</Heading>
                 </div>
              ))}
           </Grid>
           <div className="text-center mt-16 reveal">
              <Button variant="secondary" onClick={() => navigate('#/blog')}>Browse Resources</Button>
           </div>
         </Container>
      </Section>
    </div>
  );
};

export default HomeView;