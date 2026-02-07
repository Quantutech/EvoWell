import React, { useState, useEffect, useCallback, lazy, Suspense, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth, useNavigation } from '../App';
import {
  ProviderProfile,
  ModerationStatus,
  UserRole,
  AppointmentType,
} from '../types';
import { endorsementService } from '../services/endorsement.service';
import { appointmentService } from '../services/appointments';
import { getUserTimezone } from '../utils/timezone';
import IdentityCard from '../components/provider/profile/IdentityCard';
import { EndorsementCard } from '../components/provider/EndorsementCard';
import { EndorseButton } from '../components/provider/EndorseButton';
import BookingSidebar from '../components/provider/booking/BookingSidebar';
import { Heading, Text, Label } from '../components/typography';
import { Card, Badge, Icon } from '../components/ui';
import { iconPaths } from '../components/ui/iconPaths';
import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';
import { useToast } from '../contexts/ToastContext';

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

const getVideoEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  
  // Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  
  return null;
};

const LoadingSkeleton: React.FC = () => (
  <div className="bg-[#F8FAFC] min-h-screen pb-32 animate-pulse">
    <div className="h-[300px] bg-slate-200" />
    <div className="max-w-[1440px] mx-auto px-6 -mt-32 relative z-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-grow w-full lg:w-0 min-w-0 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-64" />
          <div className="h-12 w-96 bg-white rounded-2xl border border-slate-100" />
          <div className="bg-white rounded-3xl p-10 border border-slate-100 space-y-4 h-96" />
        </div>
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
  const { addToast } = useToast();
  const params = useParams<{ providerId: string }>();
  const resolvedId = propId || params.providerId || '';

  const [userTz] = useState(getUserTimezone);
  const [activeTab, setActiveTab] = useState('Overview');
  const [bookingMode, setBookingMode] = useState<'In Person' | 'Online'>('Online');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isManualScroll = useRef(false);

  const { data: provider, isLoading: loading, error: providerError, refetch: refetchProvider } = useQuery({
    queryKey: ['provider', resolvedId],
    queryFn: () => api.fetchProviderBySlugOrId(resolvedId),
    enabled: !!resolvedId,
    retry: 1,
  });

  const { data: endorsements = [], refetch: refetchEndorsements } = useQuery({
    queryKey: ['endorsements', provider?.id],
    queryFn: () => endorsementService.getEndorsementsForProvider(provider!.id),
    enabled: !!provider?.id,
  });

  const peerEndorsements = useMemo(() => endorsements.filter(e => e.endorsementType === 'peer'), [endorsements]);

  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => api.getAllSpecialties(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const { data: blogsResponse } = useQuery({
    queryKey: ['allBlogs'],
    queryFn: () => api.getAllBlogs({ limit: 1000 }),
    staleTime: 5 * 60 * 1000,
  });

  const allBlogs = blogsResponse?.data || [];

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

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!provider || !selectedDate) {
        setAvailableSlots([]);
        return;
      }

      setSlotsLoading(true);
      try {
        const slots = await appointmentService.getProviderAvailability(provider.id, selectedDate, 60);
        const starts = slots.map((slot) => slot.start);
        setAvailableSlots(starts);
        setSelectedSlot((current) =>
          current && !starts.some((slot) => slot.toISOString() === current) ? null : current,
        );
      } catch {
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [provider, selectedDate]);

  const tabs = useMemo(
    () => [
      { label: 'Introduction', id: 'section-overview' },
      { label: 'Credentials', id: 'section-about' },
      { label: 'Endorsements', id: 'section-endorsements' },
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

  const scrollToSection = useCallback(
    (id: string, label: string) => {
      setActiveTab(label);
      isManualScroll.current = true;

      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }

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
      const appointmentDate = new Date(selectedSlot);

      const slots = await appointmentService.getProviderAvailability(provider.id, selectedDate, 60);
      const isStillAvailable = slots.some(
        (slot) => slot.start.toISOString() === appointmentDate.toISOString(),
      );

      if (!isStillAvailable) {
        setBookingStatus('error');
        addToast('warning', 'Selected slot is no longer available. Please choose another time.');
        return;
      }

      await api.createAppointment({
        providerId: provider.id,
        clientId: user.id,
        dateTime: appointmentDate.toISOString(),
        durationMinutes: 60,
        type:
          bookingMode === 'In Person'
            ? AppointmentType.IN_PERSON
            : AppointmentType.VIDEO,
      });
      setBookingStatus('success');
      addToast('success', 'Appointment request submitted.');
      setSelectedSlot(null);
    } catch {
      setBookingStatus('error');
      addToast('error', 'Unable to submit appointment request.');
    }
  }, [user, selectedSlot, selectedDate, provider, navigate, bookingMode, addToast]);

  if (loading) return <LoadingSkeleton />;

  if (error || !provider) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 p-6">
        <span className="text-6xl" role="img" aria-label="confused face">😕</span>
        <Heading level={2}>Provider Not Found</Heading>
        <Text color="muted" className="text-center max-w-md">
          {error || "We couldn't find the provider you're looking for."}
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

  const isVisibleToPublic = provider.moderationStatus === ModerationStatus.APPROVED && provider.isPublished !== false;
  const isOwnerOrAdmin = user && (user.id === provider.userId || user.role === UserRole.ADMIN);

  if (!isVisibleToPublic && !isOwnerOrAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 p-6">
        <span className="text-6xl" role="img" aria-label="lock">🔒</span>
        <Heading level={2}>Profile Not Available</Heading>
        <Text color="muted" className="text-center max-w-md">
          This provider profile is not currently available.
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

  const hasAboutContent =
    (provider.educationHistory?.length || 0) > 0 ||
    (provider.licenses?.length || 0) > 0 ||
    (provider.therapeuticApproaches?.length || 0) > 0;

  const hasMediaContent =
    (provider.mediaAppearances?.length || 0) > 0 ||
    (provider.mediaLinks?.length || 0) > 0 ||
    !!provider.videoUrl;

  const hasArticles = blogs.length > 0;

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-32 font-sans">
      {provider && (
        <SEO 
          title={`Dr. ${provider.firstName} ${provider.lastName}`}
          description={provider.tagline || provider.bio}
          image={provider.imageUrl}
          url={`/provider/${provider.profileSlug || provider.id}`}
        />
      )}
      <div className="h-[300px] bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 -mt-32 relative z-10">
        
        {/* ROW 1: Identity & Video (Same height) */}
        <div className="flex flex-col lg:flex-row gap-8 items-stretch mb-8">
           <div className="flex-grow w-full lg:w-0 min-w-0">
              {provider && <IdentityCard provider={provider} />}
           </div>
           
           {provider?.videoUrl && (
              <div className="lg:w-[400px] shrink-0 w-full">
                <Card className="h-full p-6 overflow-hidden shadow-xl shadow-slate-200/50 border-slate-100 flex flex-col animate-in fade-in slide-in-from-right-4 duration-700">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">🎬</span>
                    <Heading level={4} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Intro Video</Heading>
                  </div>
                  <div className="flex-1 min-h-[200px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                    <iframe
                      src={getVideoEmbedUrl(provider.videoUrl) || ''}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${provider.firstName || 'Provider'}'s Introduction Video`}
                    />
                  </div>
                </Card>
              </div>
           )}
        </div>

        {/* ROW 2: Sections & Booking (Sticky) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-grow w-full lg:w-0 min-w-0">
            {/* Tab Navigation */}
            <nav className="sticky top-20 z-30 bg-[#F8FAFC] pt-2 pb-4 mb-4" aria-label="Profile sections">
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

            <div className="space-y-8">
              <Card id="section-overview" ref={registerSection('section-overview')} className="scroll-mt-36 p-8 md:p-10" role="tabpanel">
                <SectionHeading icon="👋">Introduction</SectionHeading>
                <div className="prose prose-slate max-w-none mb-10">
                  <Text variant="lead" className="text-slate-600 leading-relaxed">
                    {provider.bio || `${provider.firstName || 'This provider'} is dedicated to high-quality care.`}
                  </Text>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-10 border-t border-slate-100">
                  <div>
                    <Label className="mb-4">Specialties</Label>
                    <div className="flex flex-wrap gap-2">
                      {provider.specialties?.map((s: string) => <Badge key={s} variant="info">{getSpecialtyName(s)}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-4">Ages Served</Label>
                    <div className="flex flex-wrap gap-2">
                      {(provider.agesServed || provider.worksWith)?.map((w: string) => <Badge key={w} variant="neutral">{w}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-4">Languages</Label>
                    <div className="flex flex-wrap gap-2">
                      {provider.languages?.map((lang: string) => <Badge key={lang} variant="success">{lang}</Badge>)}
                    </div>
                  </div>
                </div>
              </Card>

              <Card id="section-about" ref={registerSection('section-about')} className="scroll-mt-36 p-8 md:p-10" role="tabpanel">
                <SectionHeading icon="🎓">Credentials & Background</SectionHeading>
                {!hasAboutContent ? (
                  <EmptyState message="No credentials info available." />
                ) : (
                  <div className="space-y-10">
                    {provider.educationHistory?.length > 0 && (
                      <div>
                        <Label className="mb-4">Education</Label>
                        <div className="space-y-4">
                          {provider.educationHistory.map((edu, idx) => (
                            <div key={idx} className="flex items-start gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100">🎓</div>
                              <div>
                                <Text weight="bold">{edu.degree}</Text>
                                <Text variant="small" color="muted">{edu.university}</Text>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {provider.licenses?.length > 0 && (
                      <div>
                        <Label className="mb-4">Licenses</Label>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {provider.licenses.map((license, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${license.verified ? 'bg-green-100 text-green-600' : 'bg-slate-100'}`}>
                                {license.verified ? '✓' : '○'}
                              </div>
                              <div>
                                <Text weight="bold">{license.state} License</Text>
                                <Text variant="caption" color="muted">#{license.number}</Text>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Trust & Endorsements Section */}
              <Card id="section-endorsements" ref={registerSection('section-endorsements')} className="scroll-mt-36 p-8 md:p-10 border-slate-200/60 shadow-xl shadow-slate-200/40 animate-in fade-in slide-in-from-bottom-4 duration-500" role="tabpanel">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                  <SectionHeading icon="🛡️">Trust & Endorsements</SectionHeading>
                  {provider && (
                    <EndorseButton 
                      provider={provider} 
                      onSuccess={() => {
                        refetchEndorsements();
                        refetchProvider();
                      }} 
                    />
                  )}
                </div>

                {provider?.endorsements?.evowell && (
                  <div className="bg-[#0f311c] border border-[#1e663a]/30 p-6 rounded-[24px] mb-10 shadow-lg shadow-[#0f311c]/10">
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 bg-[#1e663a]/20 rounded-2xl flex items-center justify-center shrink-0 text-teal-400 border border-[#1e663a]/30">
                         <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M12 11V15M12 11L10 9M12 11L14 9" strokeWidth="2" />
                         </svg>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-teal-50 leading-tight mb-2">Endorsed by EvoWell Team</h4>
                        <p className="text-teal-100/70 text-sm leading-relaxed max-w-2xl">
                          Verified for quality, ethics, and alignment with platform standards. This provider has undergone a rigorous manual review by our clinical board.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="h-px flex-grow bg-slate-100"></div>
                     <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">
                       Verified Peer Endorsements ({peerEndorsements.length})
                     </span>
                     <div className="h-px flex-grow bg-slate-100"></div>
                     {peerEndorsements.length > 0 && (
                        <div className="flex gap-2">
                           <button 
                             onClick={() => {
                               const el = document.getElementById('endorsement-slider');
                               if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
                             }}
                             className="w-8 h-8 bg-white rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-brand-300 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-500 hover:text-brand-600"
                             aria-label="Scroll left"
                           >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                           </button>
                           <button 
                             onClick={() => {
                               const el = document.getElementById('endorsement-slider');
                               if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
                             }}
                             className="w-8 h-8 bg-white rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-brand-300 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-500 hover:text-brand-600"
                             aria-label="Scroll right"
                           >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                           </button>
                        </div>
                     )}
                  </div>

                  {peerEndorsements.length > 0 ? (
                    <div className="relative group/slider">
                        <div 
                          id="endorsement-slider" 
                          className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory scroll-smooth"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                          <style>{`
                            #endorsement-slider::-webkit-scrollbar { 
                              display: none; 
                            }
                          `}</style>
                          {peerEndorsements.map((e) => (
                            <div key={e.id} className="snap-start shrink-0 w-[300px]">
                                <EndorsementCard endorsement={e} />
                            </div>
                          ))}
                        </div>
                    </div>
                  ) : (
                    <div className="py-12 bg-slate-50/50 rounded-[24px] border-2 border-dashed border-slate-200 text-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <Text variant="small" weight="bold" color="muted">No peer endorsements yet.</Text>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Endorsements only come from verified wellness professionals.</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card id="section-media" ref={registerSection('section-media')} className="scroll-mt-36 p-8 md:p-10" role="tabpanel">
                <SectionHeading icon="🎬">Media & Appearances</SectionHeading>
                {!hasMediaContent ? (
                  <EmptyState message="No media content available yet." icon="🎥" />
                ) : (
                  <div className="space-y-8">
                    {(provider.mediaAppearances || []).map((media, idx) => (
                      <a key={idx} href={media.link} target="_blank" rel="noopener" className="block bg-slate-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                        <div className="p-4 flex gap-4 items-center">
                            <Badge variant="info">{media.type}</Badge>
                            <Text weight="bold">{media.title}</Text>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </Card>

              <Card id="section-articles" ref={registerSection('section-articles')} className="scroll-mt-36 p-8 md:p-10" role="tabpanel">
                <SectionHeading icon="📝">Articles & Insights</SectionHeading>
                {!hasArticles ? (
                  <EmptyState message="No articles published yet." icon="✍️" />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {blogs.map(blog => (
                      <a key={blog.id} href={`#/blog/${blog.slug}`} className="group block bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
                        <div className="p-6">
                          <Heading level={4} className="group-hover:text-brand-600 transition-colors mb-2">{blog.title}</Heading>
                          <Text variant="small" color="muted" className="line-clamp-2">{blog.summary}</Text>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </Card>

              <Card id="section-location" ref={registerSection('section-location')} className="scroll-mt-36 p-8 md:p-10" role="tabpanel">
                <SectionHeading icon="📍">Office Location</SectionHeading>
                <div className="h-96 rounded-3xl w-full mb-6 relative overflow-hidden border border-slate-100">
                  <Suspense fallback={<div className="h-full w-full bg-slate-100 animate-pulse" />}>
                    <DynamicMap address={provider.address} height="100%" />
                  </Suspense>
                </div>
                <Text weight="bold">{provider.address?.street}</Text>
                <Text variant="small" color="muted">{provider.address?.city}, {provider.address?.state}</Text>
              </Card>
            </div>
          </div>

          {/* Sidebar: Sticky Booking & Exchange */}
          <aside className="lg:w-[400px] shrink-0 w-full sticky top-28 space-y-6" aria-label="Book appointment">
            <BookingSidebar
              provider={provider}
              bookingMode={bookingMode}
              setBookingMode={setBookingMode}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              availableDates={availableDates}
              availableSlots={availableSlots}
              slotsLoading={slotsLoading}
              userTz={userTz}
              bookingStatus={bookingStatus}
              handleBook={handleBook}
            />

            <Card 
              className="p-6 bg-brand-50 border-brand-100 hover:border-brand-300 transition-all cursor-pointer group shadow-sm"
              onClick={() => navigate('/exchange')}
            >
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
                      <Icon path={iconPaths.folder} size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-1">Expert Exchange</p>
                      <Heading level={4} className="text-sm leading-tight">Explore clinical tools & resources</Heading>
                   </div>
                   <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                   </div>
                </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfileView;
