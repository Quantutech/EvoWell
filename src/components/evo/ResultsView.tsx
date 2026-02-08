import React, { useEffect, useMemo, useState } from 'react';
import { useNavigation, useAuth } from '@/App';
import { AppointmentType, ProviderProfile, SearchFilters, UserRole } from '@/types';
import { providerService } from '@/services/provider.service';
import { wishlistService } from '@/services/wishlist.service';
import ProviderCard from '@/components/provider/ProviderCard';
import { Button } from '@/components/ui';
import { Heading, Text } from '@/components/typography';
import { logEvoEvent } from './logging';
import { UserSignal, EvoSortPreference } from './types';

interface ResultsViewProps {
  signal: UserSignal;
  onReset: () => void;
  onClose: () => void;
}

const DAY_ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SUPPORT_KEYWORD_MAP: Record<string, string[]> = {
  THERAPY: ['Anxiety', 'Depression', 'Trauma', 'Relationships'],
  COACHING: ['Performance', 'Leadership', 'Burnout'],
  NUTRITION: ['Nutrition'],
  MOVEMENT: ['Movement', 'Pain'],
  SLEEP: ['Sleep'],
  STRESS_BURNOUT: ['Burnout', 'Anxiety'],
  COUPLES: ['Relationships'],
};

const UNSURE_TOPIC_MAP: Record<string, string[]> = {
  ANXIETY_STRESS: ['Anxiety', 'Burnout'],
  LOW_MOOD: ['Depression'],
  RELATIONSHIP_CONFLICT: ['Relationships'],
  FOCUS_ADHD: ['ADHD', 'Performance'],
  SLEEP: ['Sleep'],
  BODY_PAIN: ['Movement'],
  NUTRITION: ['Nutrition'],
};

function normalize(value: string | undefined): string {
  return (value || '').toLowerCase();
}

function deriveBudgetCap(signal: UserSignal): number | undefined {
  switch (signal.budgetRange) {
    case 'UNDER_120':
      return 120;
    case '120_200':
      return 200;
    default:
      return undefined;
  }
}

function deriveSupportKeywords(signal: UserSignal): string[] {
  const direct = (signal.supportNeeds || []).flatMap((need) => SUPPORT_KEYWORD_MAP[need] || [need]);
  const unsure = signal.unsureTopic ? UNSURE_TOPIC_MAP[signal.unsureTopic] || [] : [];
  return Array.from(new Set([...direct, ...unsure].filter(Boolean)));
}

function inferStateFromLocation(location: string | undefined): string | undefined {
  if (!location) return undefined;
  const match = location.match(/\b([A-Z]{2})\b/);
  return match?.[1];
}

function specializationScore(provider: ProviderProfile, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const corpus = `${provider.professionalTitle} ${provider.professionalCategory} ${provider.bio} ${(provider.specialties || []).join(' ')}`.toLowerCase();
  return keywords.reduce((score, keyword) => (corpus.includes(keyword.toLowerCase()) ? score + 1 : score), 0);
}

function soonestAvailabilityScore(provider: ProviderProfile): number {
  const schedule = provider.availability?.schedule || [];
  const activeDays = schedule.filter((entry) => entry.active).map((entry) => entry.day);
  const hours = provider.availability?.hours || [];
  if (activeDays.length === 0 && hours.length === 0) return Number.POSITIVE_INFINITY;

  const now = new Date();
  const today = now.getDay();
  let bestOffset = Number.POSITIVE_INFINITY;

  for (const day of activeDays) {
    const index = DAY_ORDER.indexOf(day);
    if (index === -1) continue;
    const offset = (index - today + 7) % 7;
    bestOffset = Math.min(bestOffset, offset);
  }

  if (!Number.isFinite(bestOffset)) return 6;
  return bestOffset;
}

function applyClientPostFilters(providers: ProviderProfile[], signal: UserSignal): ProviderProfile[] {
  let next = [...providers];

  if (signal.sessionFormat === 'ONLINE') {
    next = next.filter((provider) =>
      provider.appointmentTypes?.some((type) =>
        [AppointmentType.VIDEO, AppointmentType.PHONE, AppointmentType.CHAT].includes(type),
      ),
    );
  }

  if (signal.sessionFormat === 'IN_PERSON') {
    next = next.filter((provider) =>
      provider.appointmentTypes?.some((type) => type === AppointmentType.IN_PERSON),
    );
  }

  if (signal.preferredLanguage?.trim()) {
    const language = normalize(signal.preferredLanguage);
    next = next.filter((provider) =>
      provider.languages?.some((candidate) => normalize(candidate).includes(language)),
    );
  }

  if (signal.insurancePreference === 'YES' && signal.insurer?.trim()) {
    const insurer = normalize(signal.insurer);
    next = next.filter((provider) =>
      provider.insuranceAccepted?.some((accepted) => normalize(accepted).includes(insurer)),
    );
  }

  if (signal.providerGenderPreference && signal.providerGenderPreference !== 'NO_PREFERENCE') {
    const expected = normalize(signal.providerGenderPreference.replace('_', ' '));
    next = next.filter((provider) => normalize(provider.gender).includes(expected));
  }

  return next;
}

function sortProviders(
  providers: ProviderProfile[],
  sortPreference: EvoSortPreference,
  keywords: string[],
): ProviderProfile[] {
  const cloned = [...providers];

  if (sortPreference === 'SOONEST') {
    return cloned.sort((a, b) => soonestAvailabilityScore(a) - soonestAvailabilityScore(b));
  }

  if (sortPreference === 'BUDGET') {
    return cloned.sort((a, b) => (a.pricing?.hourlyRate || 0) - (b.pricing?.hourlyRate || 0));
  }

  return cloned.sort((a, b) => specializationScore(b, keywords) - specializationScore(a, keywords));
}

function generateProviderPublishDraft(signal: UserSignal) {
  const typeLabel =
    signal.publishResourceType === 'WORKSHEET'
      ? 'Worksheet'
      : signal.publishResourceType === 'GUIDE'
        ? 'Guide'
        : signal.publishResourceType === 'COURSE'
          ? 'Course'
          : signal.publishResourceType === 'AUDIO_VIDEO'
            ? 'Audio Resource'
            : 'Resource';
  const audienceLabel =
    signal.publishAudience === 'CLIENTS'
      ? 'Clients'
      : signal.publishAudience === 'PROVIDERS'
        ? 'Providers'
        : 'Clients and Providers';

  const title = `${typeLabel} for ${audienceLabel}`;
  const description =
    `A practical ${typeLabel.toLowerCase()} designed for ${audienceLabel.toLowerCase()} on EvoWell. ` +
    'This listing focuses on education, structured support, and implementation guidance.';
  const bullets = [
    'Clear, step-by-step structure',
    'Evidence-informed and practical',
    'Built for fast implementation',
  ];
  const tags = [typeLabel, audienceLabel, 'Educational Support', 'EvoWell Exchange'];
  const disclaimers = [
    'Informational only, not medical advice.',
    'Not a substitute for professional care.',
    'Results vary.',
  ];

  return { title, description, bullets, tags, disclaimers };
}

function containsRegulatedClaim(input: string | undefined): boolean {
  const message = normalize(input);
  return ['cure', 'guaranteed', 'diagnose', 'treats', 'medical treatment'].some((term) =>
    message.includes(term),
  );
}

function buildProviderChecklist(provider: ProviderProfile | null | undefined) {
  const items = [
    {
      id: 'specialties',
      label: 'Add specialties',
      complete: (provider?.specialties || []).length > 0,
      path: '/console/settings',
    },
    {
      id: 'modalities',
      label: 'Add modalities and session types',
      complete: (provider?.appointmentTypes || []).length > 0,
      path: '/console/settings',
    },
    {
      id: 'languages',
      label: 'Add languages',
      complete: (provider?.languages || []).length > 0,
      path: '/console/settings',
    },
    {
      id: 'bio',
      label: 'Add bio and expectations',
      complete: Boolean(provider?.bio?.trim()),
      path: '/console/settings',
    },
    {
      id: 'availability',
      label: 'Add availability',
      complete: (provider?.availability?.schedule || []).some((entry) => entry.active),
      path: '/console/availability',
    },
  ];

  const nextMissing = items.find((item) => !item.complete);
  return { items, nextMissing };
}

const ResultsView: React.FC<ResultsViewProps> = ({ signal, onReset, onClose }) => {
  const { user, provider } = useAuth();
  const { navigate } = useNavigation();
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [sortPreference, setSortPreference] = useState<EvoSortPreference>(
    signal.sortPreference || 'SPECIALIZATION',
  );

  const isClientProviderFlow =
    signal.roleContext === 'CLIENT' &&
    (signal.clientIntent === 'FIND_PROVIDER' || signal.clientIntent === 'UNSURE');

  useEffect(() => {
    logEvoEvent({
      type: 'intent',
      role: signal.roleContext,
      intent: signal.clientIntent || signal.providerIntent || signal.browsingIntent,
      success: true,
    });
  }, [signal.roleContext, signal.clientIntent, signal.providerIntent, signal.browsingIntent]);

  useEffect(() => {
    if (!isClientProviderFlow) {
      setLoading(false);
      return;
    }

    let canceled = false;

    const fetchProviders = async () => {
      setLoading(true);
      try {
        const supportKeywords = deriveSupportKeywords(signal);
        const searchFilters: SearchFilters = { limit: 30 };

        if (supportKeywords[0]) {
          searchFilters.query = supportKeywords[0];
          searchFilters.specialty = supportKeywords[0];
        }

        const budgetCap = deriveBudgetCap(signal);
        if (budgetCap) searchFilters.maxPrice = budgetCap;

        const state = inferStateFromLocation(signal.location);
        if (state) searchFilters.state = state;

        const response = await providerService.search(searchFilters);
        let filtered = applyClientPostFilters(response.providers, signal);
        filtered = sortProviders(filtered, sortPreference, supportKeywords);

        if (!canceled) {
          setProviders(filtered.slice(0, 6));
        }

        if (!canceled && user?.role === UserRole.CLIENT && filtered.length > 0) {
          try {
            const ids = filtered.slice(0, 6).map((provider) => provider.id);
            const statuses = await wishlistService.checkWishlistStatus(ids);
            setSavedStatus(statuses);
          } catch {
            setSavedStatus({});
          }
        }
      } catch {
        if (!canceled) setProviders([]);
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    fetchProviders();

    return () => {
      canceled = true;
    };
  }, [isClientProviderFlow, signal, sortPreference, user?.role]);

  const supportKeywords = useMemo(() => deriveSupportKeywords(signal), [signal]);
  const publishDraft = useMemo(() => generateProviderPublishDraft(signal), [signal]);
  const providerChecklist = useMemo(() => buildProviderChecklist(provider), [provider]);

  const handleNavigate = (path: string) => {
    logEvoEvent({
      type: 'deep-link',
      role: signal.roleContext,
      intent: signal.clientIntent || signal.providerIntent || signal.browsingIntent,
      path,
      success: true,
    });
    onClose();
    navigate(path);
  };

  const handleEscalate = (reason: string) => {
    logEvoEvent({
      type: 'escalation',
      role: signal.roleContext,
      intent: signal.providerIntent || signal.clientIntent,
      reason,
      success: true,
    });
    handleNavigate(signal.roleContext === 'PROVIDER' ? '/console/support' : '/help');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mb-4" />
        <Text>Building recommendations...</Text>
      </div>
    );
  }

  const showSafetyMicrocopy =
    signal.roleContext === 'CLIENT' &&
    (signal.clientIntent === 'FIND_PROVIDER' || signal.clientIntent === 'UNSURE');

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-6 pb-24 space-y-8">
      {signal.safetyFlags?.some((flag) => flag === 'MEDICAL_ADVICE' || flag === 'MEDICATION') && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <Heading level={4} className="mb-2">Safety Reminder</Heading>
          <Text className="text-sm">
            Evo can&apos;t provide medical advice, diagnosis, treatment planning, or medication
            guidance. I can help you find the right provider and next steps on EvoWell.
          </Text>
        </section>
      )}

      {isClientProviderFlow && (
        <section className="space-y-5">
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6">
            <Heading level={4} className="text-brand-900 m-0 mb-2">
              Matched providers for your preferences
            </Heading>
            <Text className="text-sm text-slate-600">
              Sort by availability, budget, or specialization. If you&apos;re in immediate danger or
              feel unsafe, call local emergency services.
            </Text>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Soonest availability', value: 'SOONEST' as const },
              { label: 'Budget fit', value: 'BUDGET' as const },
              { label: 'Specialization match', value: 'SPECIALIZATION' as const },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortPreference(option.value)}
                className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
                  sortPreference === option.value
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {providers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <Text>
                I couldn&apos;t find strong matches with the current filters. Try broadening
                preferences or searching the full directory.
              </Text>
              <div className="mt-4">
                <Button onClick={() => handleNavigate('/directory')}>Browse all providers</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  isSaved={savedStatus[provider.id]}
                  onToggleSave={(saved) =>
                    setSavedStatus((prev) => ({ ...prev, [provider.id]: saved }))
                  }
                />
              ))}
            </div>
          )}
        </section>
      )}

      {signal.roleContext === 'CLIENT' && signal.clientIntent === 'ACCOUNT_HELP' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <Heading level={4}>Account Help</Heading>
          <Text className="text-sm text-slate-600">
            I can help with login, wishlist, and booking paths.
          </Text>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button onClick={() => handleNavigate(user ? '/portal' : '/login')}>Open account</Button>
            <Button variant="secondary" onClick={() => handleNavigate('/portal')}>
              View wishlist
            </Button>
            <Button variant="secondary" onClick={() => handleNavigate('/portal')}>
              Manage bookings
            </Button>
          </div>
        </section>
      )}

      {signal.roleContext === 'CLIENT' && signal.clientIntent === 'EXPLORE_RESOURCES' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <Heading level={4}>Resources to Explore</Heading>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button onClick={() => handleNavigate('/exchange')}>Provider Exchange</Button>
            <Button variant="secondary" onClick={() => handleNavigate('/blog')}>
              Blog
            </Button>
            <Button variant="secondary" onClick={() => handleNavigate('/podcasts')}>
              Podcasts
            </Button>
          </div>
        </section>
      )}

      {signal.roleContext === 'PROVIDER' && signal.providerIntent === 'FINISH_PROFILE' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <Heading level={4}>Go-Live Checklist</Heading>
          <Text className="text-sm text-slate-600">
            Current status: <strong>{(signal.providerProfileStatus || 'NOT_STARTED').replace(/_/g, ' ')}</strong>
          </Text>
          <ul className="text-sm text-slate-700 space-y-2">
            {providerChecklist.items.map((item, index) => (
              <li key={item.id} className="flex items-center gap-2">
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${item.complete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {item.complete ? '✓' : index + 1}
                </span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button onClick={() => handleNavigate(providerChecklist.nextMissing?.path || '/console/settings')}>
              Take me to next missing step
            </Button>
            <Button variant="secondary" onClick={() => handleNavigate('/console/availability')}>
              Set availability
            </Button>
            <Button variant="secondary" onClick={() => handleNavigate('/console/overview')}>
              Return to dashboard
            </Button>
          </div>
        </section>
      )}

      {signal.roleContext === 'PROVIDER' && signal.providerIntent === 'SET_AVAILABILITY' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <Heading level={4}>Availability Setup</Heading>
          <Text className="text-sm text-slate-600">
            I can take you directly to your availability controls and booking preferences.
          </Text>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button onClick={() => handleNavigate('/console/availability')}>Open availability</Button>
            <Button variant="secondary" onClick={() => handleNavigate('/console/patients')}>
              Review bookings
            </Button>
          </div>
        </section>
      )}

      {signal.roleContext === 'PROVIDER' && signal.providerIntent === 'SET_MEMBERSHIP' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <Heading level={4}>Sliding-Scale Membership Guidance</Heading>
          <Text className="text-sm text-slate-600">
            EvoWell uses a sliding-scale membership. Core access stays the same across the scale.
            Choose a price that fits today and change it anytime.
          </Text>
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-slate-700">
            {signal.providerStage === 'EARLY' && 'Recommendation: Access / Minimum is a practical starting point.'}
            {signal.providerStage === 'STEADY' && 'Recommendation: Sustain / Recommended fits most providers.'}
            {signal.providerStage === 'GROWING' && 'Recommendation: Supporter helps fund new features and keeps access open.'}
            {!signal.providerStage && 'Recommendation: start with a stage that reflects your current caseload.'}
          </div>
          <Button onClick={() => handleNavigate('/console/subscription')}>
            Open membership settings
          </Button>
        </section>
      )}

      {signal.roleContext === 'PROVIDER' && signal.providerIntent === 'PUBLISH_RESOURCE' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <Heading level={4}>Exchange Listing Draft</Heading>
          {containsRegulatedClaim(signal.initialRequest) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              I can help describe your resource, but we need to avoid medical claims. Let&apos;s frame
              this as educational support with clear disclaimers.
            </div>
          )}
          <div className="space-y-2 text-sm">
            <p><strong>Title:</strong> {publishDraft.title}</p>
            <p><strong>Description:</strong> {publishDraft.description}</p>
            <p><strong>Bullet points:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              {publishDraft.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <p><strong>Tags:</strong> {publishDraft.tags.join(', ')}</p>
            {signal.publishNeedsDisclaimer !== 'NO' && (
              <>
                <p><strong>Disclaimers:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  {publishDraft.disclaimers.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <Button onClick={() => handleNavigate('/console/resources')}>Create listing</Button>
        </section>
      )}

      {signal.roleContext === 'PROVIDER' && signal.providerIntent === 'TROUBLESHOOT' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <Heading level={4}>Troubleshooting Steps</Heading>
          <Text className="text-sm text-slate-600">
            Area: <strong>{(signal.troubleshootingArea || 'OTHER').replace(/_/g, ' ')}</strong>
          </Text>
          <ol className="text-sm text-slate-700 space-y-2">
            <li>1. Refresh your session and confirm your account role.</li>
            <li>2. Re-open the exact settings page and retry once.</li>
            <li>3. Capture the exact error text or screenshot.</li>
            <li>4. If unresolved after two tries, escalate to support.</li>
          </ol>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button onClick={() => handleNavigate('/console/support')}>Open support</Button>
            <Button variant="secondary" onClick={() => handleEscalate('provider-troubleshooting')}>
              Escalate to support
            </Button>
          </div>
        </section>
      )}

      {signal.roleContext === 'BROWSING' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <Heading level={4}>Explore EvoWell</Heading>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button onClick={() => handleNavigate('/search')}>Find a provider</Button>
            <Button variant="secondary" onClick={() => handleNavigate('/exchange')}>
              Provider Exchange
            </Button>
            <Button variant="secondary" onClick={() => handleNavigate('/benefits')}>
              Platform overview
            </Button>
          </div>
        </section>
      )}

      {signal.roleContext === 'ADMIN' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <Heading level={4}>Admin Operations Shortcuts</Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button onClick={() => handleNavigate('/admin?tab=users')}>People management</Button>
            <Button variant="secondary" onClick={() => handleNavigate('/admin?tab=providers')}>
              Provider moderation
            </Button>
            <Button variant="secondary" onClick={() => handleNavigate('/admin?tab=messages')}>
              Message center
            </Button>
            <Button variant="secondary" onClick={() => handleNavigate('/admin?tab=config')}>
              Platform config
            </Button>
          </div>
        </section>
      )}

      {showSafetyMicrocopy && (
        <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Text variant="small">
            If you&apos;re in immediate danger or feel unsafe, call local emergency services.
          </Text>
        </section>
      )}

      <section className="pt-4 border-t border-slate-100">
        {supportKeywords.length > 0 && (
          <Text variant="small" className="mb-4 text-slate-500">
            Match context: {supportKeywords.join(', ')}
          </Text>
        )}
        <div className="grid grid-cols-3 gap-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="secondary" onClick={onReset}>
            Start over
          </Button>
          <Button onClick={() => handleNavigate('/directory')}>View all providers</Button>
        </div>
      </section>
    </div>
  );
};

export default ResultsView;
