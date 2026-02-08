import React, { lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { appointmentService } from '@/services/appointments';
import { endorsementService } from '@/services/endorsement.service';
import { wishlistService } from '@/services/wishlist.service';
import { useAuth, useNavigation } from '@/App';
import { AppointmentType, ModerationStatus, ProviderProfileTheme, UserRole } from '@/types';
import { getUserTimezone } from '@/utils/timezone';
import { useToast } from '@/contexts/ToastContext';
import { useEvo } from '@/components/evo/EvoContext';
import SEO from '@/components/SEO';
import { Heading, Text } from '@/components/typography';
import { Icon } from '@/components/ui';
import { iconPaths } from '@/components/ui/iconPaths';
import ProviderProfileClassicTemplate from '@/components/provider/profile/templates/ProviderProfileClassicTemplate';
import { buildProviderProfileViewModel } from '@/features/provider-profile/model/buildProviderProfileViewModel';
import { PROVIDER_PROFILE_THEME_CONFIG } from '@/config/providerProfileThemes';
import { resolveProviderProfileTheme } from '@/types/ui/providerProfile';

const DynamicMap = lazy(() => import('@/components/maps/DynamicMap'));

const DAY_MAP: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function getAvailableDates(days: string[]): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  const targetDays = days.map((day) => DAY_MAP[day]).filter((day): day is number => typeof day === 'number');

  for (let offset = 0; offset < 14; offset += 1) {
    const date = new Date();
    date.setDate(today.getDate() + offset);
    if (targetDays.includes(date.getDay())) dates.push(date);
  }

  return dates;
}

const LoadingSkeleton: React.FC = () => (
  <div className="min-h-screen animate-pulse bg-[#F8FAFC] p-6">
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div className="h-60 rounded-3xl bg-slate-200" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="h-64 rounded-3xl bg-slate-200" />
          <div className="h-12 rounded-2xl bg-slate-200" />
          <div className="h-80 rounded-3xl bg-slate-200" />
        </div>
        <div className="h-[540px] rounded-3xl bg-slate-200" />
      </div>
    </div>
  </div>
);

const ProviderProfileView: React.FC<{ providerId?: string }> = ({ providerId: propId }) => {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const { addToast } = useToast();
  const { openEvo } = useEvo();
  const params = useParams<{ providerId: string }>();
  const [searchParams] = useSearchParams();

  const resolvedId = propId || params.providerId || '';
  const [userTimezone] = useState(getUserTimezone);

  const [activeTab, setActiveTab] = useState('Introduction');
  const [bookingMode, setBookingMode] = useState<'In Person' | 'Online'>('Online');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success' | 'error'>('idle');
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const manualScrollRef = useRef(false);

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

  const peerEndorsements = useMemo(
    () => endorsements.filter((endorsement) => endorsement.endorsementType === 'peer'),
    [endorsements],
  );

  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => api.getAllSpecialties(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const specialtyMap = useMemo(() => {
    const map = new Map<string, string>();
    specialties.forEach((specialty) => map.set(specialty.id, specialty.name));
    return map;
  }, [specialties]);

  const specialtyNameById = useCallback(
    (specialtyId: string) => specialtyMap.get(specialtyId) || specialtyId,
    [specialtyMap],
  );

  const { data: blogsResponse } = useQuery({
    queryKey: ['allBlogs'],
    queryFn: () => api.getAllBlogs({ limit: 1000 }),
    staleTime: 5 * 60 * 1000,
  });

  const blogs = useMemo(() => {
    const allBlogs = blogsResponse?.data ?? [];
    if (!provider) return [];
    return allBlogs.filter((blog) => blog.providerId === provider.id && blog.status === 'APPROVED');
  }, [blogsResponse?.data, provider]);

  const availableDates = useMemo(
    () => (provider ? getAvailableDates(provider.availability?.days || []) : []),
    [provider],
  );

  useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
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

  const model = useMemo(
    () =>
      provider
        ? buildProviderProfileViewModel({
            provider,
            endorsements,
            blogs,
            specialtyNameById,
          })
        : null,
    [provider, endorsements, blogs, specialtyNameById],
  );

  const isVisibleToPublic = provider
    ? provider.moderationStatus === ModerationStatus.APPROVED && provider.isPublished !== false
    : false;
  const isOwnerOrAdmin = provider
    ? !!user && (user.id === provider.userId || user.role === UserRole.ADMIN)
    : false;

  const previewThemeParam = searchParams.get('previewTheme');
  const previewTemplateParam = searchParams.get('previewTemplate');

  const previewTheme: ProviderProfileTheme | null = useMemo(() => {
    if (
      previewThemeParam === 'MIDNIGHT' ||
      previewThemeParam === 'FOREST' ||
      previewThemeParam === 'OCEAN' ||
      previewThemeParam === 'SLATE'
    ) {
      return previewThemeParam;
    }

    // Backward-compatible alias support for one release.
    if (previewTemplateParam === 'ELEVATED') return 'FOREST';
    if (previewTemplateParam === 'CLASSIC') return 'MIDNIGHT';
    return null;
  }, [previewThemeParam, previewTemplateParam]);

  const selectedTheme: ProviderProfileTheme = useMemo(() => {
    if (previewTheme) return previewTheme;
    if (!provider) return 'MIDNIGHT';
    return resolveProviderProfileTheme(provider.profileTheme, provider.profileTemplate);
  }, [previewTheme, provider]);

  const themeConfig = useMemo(
    () => PROVIDER_PROFILE_THEME_CONFIG[selectedTheme],
    [selectedTheme],
  );

  useEffect(() => {
    if (!model) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (manualScrollRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const section = model.sections.find((item) => item.elementId === entry.target.id);
            if (section) setActiveTab(section.label);
          }
        }
      },
      { rootMargin: '-160px 0px -60% 0px', threshold: 0 },
    );

    const frame = requestAnimationFrame(() => {
      sectionRefs.current.forEach((element) => observer.observe(element));
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [model]);

  const registerSection = useCallback(
    (id: string) => (element: HTMLElement | null) => {
      if (element) sectionRefs.current.set(id, element);
      else sectionRefs.current.delete(id);
    },
    [],
  );

  const scrollToSection = useCallback((elementId: string, label: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    manualScrollRef.current = true;
    setActiveTab(label);

    const y = element.getBoundingClientRect().top + window.scrollY - 130;
    window.scrollTo({ top: y, behavior: 'smooth' });

    window.setTimeout(() => {
      manualScrollRef.current = false;
    }, 400);
  }, []);

  const handleSignInToBook = useCallback(() => {
    navigate(`/login?redirect=${encodeURIComponent(window.location.hash)}`);
  }, [navigate]);

  const handleSaveToWishlist = useCallback(async () => {
    if (!provider) return;
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const result = await wishlistService.toggleWishlist(provider.id);
      addToast('success', result.isSaved ? 'Saved to wishlist.' : 'Removed from wishlist.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Unable to update wishlist.');
    }
  }, [provider, user, navigate, addToast]);

  const handleBook = useCallback(async () => {
    if (!user) {
      handleSignInToBook();
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
        type: bookingMode === 'In Person' ? AppointmentType.IN_PERSON : AppointmentType.VIDEO,
      });

      setBookingStatus('success');
      addToast('success', 'Appointment request submitted.');
      setSelectedSlot(null);
    } catch {
      setBookingStatus('error');
      addToast('error', 'Unable to submit appointment request.');
    }
  }, [
    user,
    selectedSlot,
    selectedDate,
    provider,
    bookingMode,
    addToast,
    handleSignInToBook,
  ]);

  const renderMap = useCallback(() => {
    if (!provider?.address) return null;
    return <DynamicMap address={provider.address} height="100%" />;
  }, [provider?.address]);

  const errorMessage = providerError ? (providerError as Error).message : null;

  if (loading) return <LoadingSkeleton />;

  if (!provider || errorMessage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Icon path={iconPaths.alertCircle} size={28} />
        </span>
        <Heading level={2}>Provider Not Found</Heading>
        <Text color="muted">{errorMessage || "We couldn't find the provider you're looking for."}</Text>
        <button
          type="button"
          onClick={() => navigate('/search')}
          className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700"
        >
          Browse All Providers
        </button>
      </div>
    );
  }

  if (!isVisibleToPublic && !isOwnerOrAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon path={iconPaths.lock} size={28} />
        </span>
        <Heading level={2}>Profile Not Available</Heading>
        <Text color="muted">This provider profile is not currently available.</Text>
        <button
          type="button"
          onClick={() => navigate('/search')}
          className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700"
        >
          Browse Available Providers
        </button>
      </div>
    );
  }

  if (!model) return null;

  const templateProps = {
    provider,
    user,
    model,
    activeTab,
    onSelectTab: scrollToSection,
    registerSection,
    userTimezone,
    bookingMode,
    setBookingMode,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    availableDates,
    availableSlots,
    slotsLoading,
    bookingStatus,
    onConfirmBooking: handleBook,
    onSignInToBook: handleSignInToBook,
    onSaveToWishlist: handleSaveToWishlist,
    onChatWithEvo: openEvo,
    onBrowseExchange: () => navigate('/exchange'),
    onViewArticle: (slug: string) => navigate(`/blog/${slug}`),
    onSectionAction: scrollToSection,
    onEndorseSuccess: () => {
      refetchEndorsements();
      refetchProvider();
    },
    renderMap,
    blogs,
    peerEndorsements,
    themeConfig,
  };

  return (
    <>
      <SEO
        title={model.seo.title}
        description={model.seo.description}
        image={provider.imageUrl}
        url={model.seo.url}
      />
      <ProviderProfileClassicTemplate {...templateProps} />
    </>
  );
};

export default ProviderProfileView;
