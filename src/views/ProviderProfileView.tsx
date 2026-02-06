import React, { useState, useEffect, useCallback, lazy, Suspense, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth, useNavigation } from '../App';
import { ProviderProfile, Specialty, BlogPost, ModerationStatus, UserRole } from '../types';
import { getUserTimezone } from '../utils/timezone';
import IdentityCard from '../components/provider/profile/IdentityCard';
import BookingSidebar from '../components/provider/booking/BookingSidebar';
import { Heading, Text, Label } from '../components/typography';
import { Card, Badge } from '../components/ui';
import { useQuery } from '@tanstack/react-query';

const DynamicMap = lazy(() => import('../components/maps/DynamicMap'));

// ─── Reusable sub-components ────────────────────────────────────────

const SectionHeading: React.FC<{ children: React.ReactNode; icon?: string }> = ({ children, icon }) => (
  <div className="flex items-center gap-3 mb-8">
    {icon && <span className="text-2xl" role="img" aria-hidden="true">{icon}</span>}
    <Heading level={2} className="tracking-tight">{children}</Heading>
  </div>
);

const EmptyState: React.FC<{ message: string; icon?: string }> = ({ message, icon = '📭' }) => (
  <div className="text-center py-12 text-slate-400">
    <span className="text-4xl block mb-4" role="img" aria-hidden="true">{icon}</span>
    <Text variant="small">{message}</Text>
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div className="bg-[#F8FAFC] min-h-screen pb-32 animate-pulse">
    <div className="h-[300px] bg-slate-200" />
    <div className="max-w-[1440px] mx-auto px-6 -mt-32 relative z-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-grow w-full lg:w-0 min-w-0 space-y-6">
          {/* Identity card skeleton */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-start gap-6">
              <div className="w-28 h-28 bg-slate-200 rounded-full shrink-0" />
              <div className="flex-1 space-y-3 pt-2">
                <div className="h-7 w-48 bg-slate-200 rounded-xl" />
                <div className="h-4 w-64 bg-slate-100 rounded-lg" />
                <div className="flex gap-2 mt-4">
                  <div className="h-6 w-20 bg-slate-100 rounded-full" />
                  <div className="h-6 w-24 bg-slate-100 rounded-full" />
                  <div className="h-6 w-16 bg-slate-100 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          {/* Tab skeleton */}
          <div className="h-12 w-96 bg-white rounded-2xl border border-slate-100" />
          {/* Content skeleton */}
          <div className="bg-white rounded-3xl p-10 border border-slate-100 space-y-4">
            <div className="h-6 w-40 bg-slate-200 rounded-xl" />
            <div className="h-4 w-full bg-slate-100 rounded-lg" />
            <div className="h-4 w-5/6 bg-slate-100 rounded-lg" />
            <div className="h-4 w-3/4 bg-slate-100 rounded-lg" />
          </div>
        </div>
        {/* Sidebar skeleton */}
        <div className="lg:w-[400px] shrink-0 w-full">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 h-[500px]" />
        </div>
      </div>
    </div>
  </div>
);

// ─── Helpers ────────────────────────────────────────────────────────

const DAY_MAP: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function getAvailableDates(p: ProviderProfile): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  const targetDays = (p.availability?.days || [])
    .map((d: string) => DAY_MAP[d])
    .filter((d): d is number => typeof d === 'number');

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    if (targetDays.includes(d.getDay())) dates.push(d);
  }
  return dates;
}

// ─── Main component ─────────────────────────────────────────────────

const ProviderProfileView: React.FC<{ providerId?: string }> = ({ providerId: propId }) => {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const params = useParams<{ providerId: string }>();
  const resolvedId = propId || params.providerId || '';

  const [userTz] = useState(getUserTimezone);
  const [activeTab, setActiveTab] = useState('Overview');
  const [bookingMode, setBookingMode] = useState<'In Person' | 'Online'>('Online');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState('idle');

  // Scroll-spy refs
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isManualScroll = useRef(false);

  // ── Data fetching ───────────────────────────────────────────

  const { data: provider, isLoading: loading, error: providerError } = useQuery({
    queryKey: ['provider', resolvedId],
    queryFn: () => api.fetchProviderBySlugOrId(resolvedId),
    enabled: !!resolvedId,
    retry: 1,
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => api.getAllSpecialties(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const { data: allBlogs = [] } = useQuery({
    queryKey: ['allBlogs'],
    queryFn: () => api.getAllBlogs(),
    staleTime: 5 * 60 * 1000,
  });

  // ── Derived state ───────────────────────────────────────────

  const blogs = useMemo(
    () => (provider ? allBlogs.filter(post => post.providerId === provider.id && post.status === 'APPROVED') : []),
    [allBlogs, provider],
  );

  const availableDates = useMemo(() => (provider ? getAvailableDates(provider) : []), [provider]);

  const specialtyMap = useMemo(() => {
    const map = new Map<string, string>();
    specialties.forEach(s => map.set(s.id, s.name));
    return map;
  }, [specialties]);

  const getSpecialtyName = useCallback((id: string) => specialtyMap.get(id) || id, [specialtyMap]);

  const error = providerError
    ? (providerError as Error).message
    : !provider && !loading
      ? `Provider not found: ${resolvedId}`
      : null;

  // ── Initialize selected date ────────────────────────────────

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // ── Scroll spy ──────────────────────────────────────────────

  const tabs = useMemo(
    () => [
      { label: 'Overview', id: 'section-overview' },
      { label: 'About', id: 'section-about' },
      { label: 'Media', id: 'section-media' },
      { label: 'Articles', id: 'section-articles' },
      { label: 'Location', id: 'section-location' },
    ],
    [],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (isManualScroll.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const match = tabs.find(t => t.id === entry.target.id);
            if (match) setActiveTab(match.label);
          }
        }
      },
      { rootMargin: '-160px 0px -60% 0px', threshold: 0 },
    );

    // Wait a tick for sections to mount
    const raf = requestAnimationFrame(() => {
      sectionRefs.current.forEach(el => observer.observe(el));
    });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [tabs, provider]);

  const registerSection = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(id, el);
    else sectionRefs.current.delete(id);
  }, []);

  // ── Actions ─────────────────────────────────────────────────

  const scrollToSection = useCallback(
    (id: string, label: string) => {
      setActiveTab(label);
      isManualScroll.current = true;

      const element = document.getElementById(id);
      if (element) {
        const offset = 160;
        const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }

      // Re-enable scroll spy after animation
      setTimeout(() => {
        isManualScroll.current = false;
      }, 800);
    },
    [],
  );

  const handleBook = useCallback(async () => {
    if (!user) {
      navigate(`#/login?redirect=${encodeURIComponent(window.location.hash)}`);
      return;
    }
    if (!selectedSlot || !selectedDate || !provider) return;

    setBookingStatus('booking');
    try {
      const dateStr = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      await api.bookAppointment(provider.id, user.id, `${dateStr} at ${selectedSlot}`);
      setBookingStatus('success');
    } catch {
      setBookingStatus('error');
    }
  }, [user, selectedSlot, selectedDate, provider, navigate]);

  // ── Loading ─────────────────────────────────────────────────

  if (loading) return <LoadingSkeleton />;

  // ── Error ───────────────────────────────────────────────────

  if (error || !provider) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 p-6">
        <span className="text-6xl" role="img" aria-label="confused face">😕</span>
        <Heading level={2}>Provider Not Found</Heading>
        <Text color="muted" className="text-center max-w-md">
          {error || "We couldn't find the provider you're looking for. They may have removed their profile or the link might be incorrect."}
        </Text>
        <button
          onClick={() => navigate('#/search')}
          className="mt-4 bg-brand-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Browse All Providers
        </button>
      </div>
    );
  }

  // ── Visibility gate ─────────────────────────────────────────

  const isVisibleToPublic = provider.moderationStatus === ModerationStatus.APPROVED && provider.isPublished !== false;
  const isOwnerOrAdmin = user && (user.id === provider.userId || user.role === UserRole.ADMIN);

  if (!isVisibleToPublic && !isOwnerOrAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 p-6">
        <span className="text-6xl" role="img" aria-label="lock">🔒</span>
        <Heading level={2}>Profile Not Available</Heading>
        <Text color="muted" className="text-center max-w-md">
          This provider profile is not currently available. It may be pending review or unpublished.
        </Text>
        <button
          onClick={() => navigate('#/search')}
          className="mt-4 bg-brand-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Browse Available Providers
        </button>
      </div>
    );
  }

  // ── Content flags ───────────────────────────────────────────

  const hasAboutContent =
    (provider.educationHistory?.length || 0) > 0 ||
    (provider.licenses?.length || 0) > 0 ||
    (provider.therapeuticApproaches?.length || 0) > 0;

  const hasMediaContent =
    (provider.mediaAppearances?.length || 0) > 0 ||
    (provider.mediaLinks?.length || 0) > 0 ||
    !!provider.videoUrl;

  const hasArticles = blogs.length > 0;

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-32">
      {/* Hero Background */}
      <div className="h-[300px] bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 -mt-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ── Main Content ─────────────────────────────────── */}
          <div className="flex-grow w-full lg:w-0 min-w-0">
            <IdentityCard provider={provider} />

            {/* Tab Navigation */}
            <nav className="sticky top-20 z-30 bg-[#F8FAFC]/95 backdrop-blur-sm pt-2 pb-4 mb-4" aria-label="Profile sections">
              <div className="flex gap-2 overflow-x-auto no-scrollbar bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit max-w-full" role="tablist">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.label}
                    aria-controls={tab.id}
                    onClick={() => scrollToSection(tab.id, tab.label)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                      activeTab === tab.label
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>

            {/* Content Sections */}
            <div className="space-y-8">

              {/* ═══ OVERVIEW ═══════════════════════════════════ */}
              <Card id="section-overview" ref={registerSection('section-overview')} className="scroll-mt-36 p-8 md:p-10" role="tabpanel" aria-label="Overview">
                <SectionHeading icon="👋">Introduction</SectionHeading>

                <div className="prose prose-slate max-w-none mb-10">
                  <Text variant="lead" className="text-slate-600 leading-relaxed">
                    {provider.bio || `${provider.firstName || 'This provider'} is dedicated to providing high-quality mental health care with a compassionate, patient-centered approach.`}
                  </Text>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-10 border-t border-slate-100">
                  <div>
                    <Label className="mb-4">Specialties</Label>
                    <div className="flex flex-wrap gap-2">
                      {provider.specialties?.length > 0 ? (
                        provider.specialties.map((s: string) => (
                          <Badge key={s} variant="info">{getSpecialtyName(s)}</Badge>
                        ))
                      ) : (
                        <Text variant="small" color="muted">Not specified</Text>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-4">Ages Served</Label>
                    <div className="flex flex-wrap gap-2">
                      {(provider.agesServed || provider.worksWith)?.length > 0 ? (
                        (provider.agesServed || provider.worksWith)?.map((w: string) => (
                          <Badge key={w} variant="neutral">{w}</Badge>
                        ))
                      ) : (
                        <Text variant="small" color="muted">Adults, Adolescents</Text>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-4">Languages</Label>
                    <div className="flex flex-wrap gap-2">
                      {provider.languages?.length > 0 ? (
                        provider.languages.map((lang: string) => (
                          <Badge key={lang} variant="success">{lang}</Badge>
                        ))
                      ) : (
                        <Badge variant="success">English</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {provider.appointmentTypes?.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <Label className="mb-4">Session Formats Available</Label>
                    <div className="flex flex-wrap gap-3">
                      {provider.appointmentTypes.map((type: string) => {
                        const lower = type.toLowerCase();
                        const icon = lower.includes('video') ? '📹' : lower.includes('phone') ? '📞' : lower.includes('person') ? '🏢' : lower.includes('chat') ? '💬' : '📋';
                        return (
                          <div key={type} className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                            <span className="text-lg" role="img" aria-hidden="true">{icon}</span>
                            <span className="text-sm font-bold text-slate-700">{type}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>

              {/* ═══ ABOUT ═════════════════════════════════════ */}
              <Card id="section-about" ref={registerSection('section-about')} className="scroll-mt-36 p-8 md:p-10" role="tabpanel" aria-label="Credentials and background">
                <SectionHeading icon="🎓">Credentials &amp; Background</SectionHeading>

                {!hasAboutContent ? (
                  <EmptyState message="No credentials information available yet." icon="📋" />
                ) : (
                  <div className="space-y-10">
                    {(provider.educationHistory?.length || 0) > 0 && (
                      <div>
                        <Label className="mb-4">Education</Label>
                        <div className="space-y-4">
                          {provider.educationHistory.map((edu, idx) => (
                            <div key={idx} className="flex items-start gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl border border-slate-100 shrink-0" aria-hidden="true">🎓</div>
                              <div className="min-w-0">
                                <Text weight="bold" color="primary">{edu.degree}</Text>
                                <Text variant="small" color="muted">{edu.university}</Text>
                                {edu.year && <Text variant="caption" color="muted">{edu.year}</Text>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(provider.licenses?.length || 0) > 0 && (
                      <div>
                        <Label className="mb-4">Licenses &amp; Certifications</Label>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {provider.licenses.map((license, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${license.verified ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                {license.verified ? '✓' : '○'}
                              </div>
                              <div className="min-w-0">
                                <Text weight="bold" color="primary">{license.state} License</Text>
                                <Text variant="caption" color="muted" className="truncate">#{license.number}</Text>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(provider.therapeuticApproaches?.length || 0) > 0 && (
                      <div>
                        <Label className="mb-4">Therapeutic Approaches</Label>
                        <div className="flex flex-wrap gap-2">
                          {provider.therapeuticApproaches!.map((approach: string) => (
                            <Badge key={approach} variant="info">{approach}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* ═══ MEDIA ═════════════════════════════════════ */}
              <Card id="section-media" ref={registerSection('section-media')} className="scroll-mt-36 p-8 md:p-10" role="tabpanel" aria-label="Media and appearances">
                <SectionHeading icon="🎬">Media &amp; Appearances</SectionHeading>

                {!hasMediaContent ? (
                  <EmptyState message="No media content available yet." icon="🎥" />
                ) : (
                  <div className="space-y-8">
                    {provider.videoUrl && (
                      <div>
                        <Label className="mb-4">Video Introduction</Label>
                        <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                          <iframe
                            src={provider.videoUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={`Video introduction by ${provider.firstName || 'provider'}`}
                            loading="lazy"
                          />
                        </div>
                      </div>
                    )}

                    {(provider.mediaAppearances?.length || 0) > 0 && (
                      <div>
                        <Label className="mb-4">Featured In</Label>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {provider.mediaAppearances!.map((media, idx) => (
                            <a
                              key={idx}
                              href={media.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden hover:border-brand-200 hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                            >
                              {media.imageUrl && (
                                <div className="aspect-video bg-slate-200 overflow-hidden">
                                  <img src={media.imageUrl} alt={media.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                </div>
                              )}
                              <div className="p-4">
                                <Badge variant={media.type === 'video' ? 'info' : media.type === 'audio' ? 'success' : 'neutral'} className="mb-2">{media.type}</Badge>
                                <Text weight="bold" className="group-hover:text-brand-600 transition-colors line-clamp-2">{media.title}</Text>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {(provider.mediaLinks?.length || 0) > 0 && (
                      <div>
                        <Label className="mb-4">More Media</Label>
                        <div className="space-y-3">
                          {provider.mediaLinks!.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-white transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                            >
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-100 group-hover:border-brand-200 shrink-0" aria-hidden="true">
                                {link.type === 'video' ? '📹' : link.type === 'podcast' ? '🎙️' : '📰'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <Text weight="bold" className="truncate group-hover:text-brand-600">{link.title}</Text>
                                <Text variant="caption" color="muted" className="truncate">{link.url}</Text>
                              </div>
                              <svg className="w-5 h-5 text-slate-400 group-hover:text-brand-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* ═══ ARTICLES ══════════════════════════════════ */}
              <Card id="section-articles" ref={registerSection('section-articles')} className="scroll-mt-36 p-8 md:p-10" role="tabpanel" aria-label="Articles and insights">
                <SectionHeading icon="📝">Articles &amp; Insights</SectionHeading>

                {!hasArticles ? (
                  <EmptyState message="No articles published yet." icon="✍️" />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {blogs.map(blog => (
                      <a
                        key={blog.id}
                        href={`#/blog/${blog.slug}`}
                        className="group block bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden hover:border-brand-200 hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        {blog.imageUrl && (
                          <div className="aspect-video bg-slate-200 overflow-hidden">
                            <img src={blog.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          </div>
                        )}
                        <div className="p-6">
                          <Text variant="caption" color="muted" className="mb-2">
                            {new Date(blog.publishedAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </Text>
                          <Heading level={4} className="group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">{blog.title}</Heading>
                          <Text variant="small" color="muted" className="line-clamp-2">{blog.summary || blog.content?.substring(0, 150)}</Text>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </Card>

              {/* ═══ LOCATION ═════════════════════════════════ */}
              <Card id="section-location" ref={registerSection('section-location')} className="scroll-mt-36 p-8 md:p-10" role="tabpanel" aria-label="Office location">
                <SectionHeading icon="📍">Office Location</SectionHeading>

                <div className="h-96 rounded-3xl w-full mb-6 relative overflow-hidden shadow-inner border border-slate-100">
                  <Suspense fallback={
                    <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center">
                      <Text variant="small" color="muted" className="uppercase tracking-widest font-bold">Loading Map…</Text>
                    </div>
                  }>
                    <DynamicMap
                      address={provider.businessAddress || provider.address || undefined}
                      height="100%"
                    />
                  </Suspense>
                </div>

                {(provider.address?.street || provider.businessAddress?.street) && (
                  <div className="space-y-1">
                    <Text weight="bold" color="primary">{provider.businessAddress?.street || provider.address?.street}</Text>
                    <Text variant="small" color="muted">
                      {provider.businessAddress?.city || provider.address?.city}, {provider.businessAddress?.state || provider.address?.state} {provider.businessAddress?.zip || provider.address?.zip}
                    </Text>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-4">
                  {(provider.phone || provider.phoneNumber) && (
                    <a
                      href={`tel:${provider.phone || provider.phoneNumber}`}
                      className="flex items-center gap-2 text-slate-600 hover:text-brand-600 transition-colors focus:outline-none focus-visible:text-brand-600"
                    >
                      <span aria-hidden="true">📞</span>
                      <Text variant="small" weight="bold">{provider.phone || provider.phoneNumber}</Text>
                    </a>
                  )}
                  {provider.email && (
                    <a
                      href={`mailto:${provider.email}`}
                      className="flex items-center gap-2 text-slate-600 hover:text-brand-600 transition-colors focus:outline-none focus-visible:text-brand-600"
                    >
                      <span aria-hidden="true">✉️</span>
                      <Text variant="small" weight="bold">{provider.email}</Text>
                    </a>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* ── Booking Sidebar ──────────────────────────────── */}
          <aside className="lg:w-[400px] shrink-0 w-full relative" aria-label="Book appointment">
            <BookingSidebar
              provider={provider}
              bookingMode={bookingMode}
              setBookingMode={setBookingMode}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              availableDates={availableDates}
              userTz={userTz}
              bookingStatus={bookingStatus}
              handleBook={handleBook}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfileView;