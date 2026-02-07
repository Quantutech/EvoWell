import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { wishlistService } from '../services/wishlist.service';
import { useNavigation } from '../App';
import { ProviderProfile, Specialty } from '../types';
import Breadcrumb from '../components/Breadcrumb';
import { PageHero, Section, Container } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button, Badge, Card, Select } from '../components/ui';
import ProviderCard from '../components/provider/ProviderCard';
import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { SearchFilters, SessionFormat } from '../types';

/* ─── Types ──────────────────────────────────────────────────────────── */

type SortOption = 'name_asc' | 'name_desc' | 'endorsements' | 'newest';
type ViewMode = 'list' | 'grid';

interface EnrichedProvider extends ProviderProfile {
  firstName?: string;
  lastName?: string;
  sortName?: string;
  slug?: string;
  title?: string;
  credentials?: string;
  createdAt?: string;
}

/* ─── Compact grid card (for grid mode) ──────────────────────────────── */

const ProviderGridCard: React.FC<{ provider: EnrichedProvider }> = ({ provider }) => {
  const { navigate } = useNavigation();
  const slug = provider.slug || provider.id;
  const name = [provider.firstName, provider.lastName].filter(Boolean).join(' ') || 'Provider';

  return (
    <div
      onClick={() => navigate(`#/provider/${slug}`)}
      className="group cursor-pointer bg-white rounded-[1.75rem] border border-slate-100 overflow-hidden hover:shadow-xl hover:border-slate-200 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={provider.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=e2e8f0&color=475569&bold=true`}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {provider.endorsements?.evowell && (
          <div className="absolute top-3 right-3 bg-[#0f311c] border border-[#1e663a]/30 px-2.5 py-1 rounded-lg text-[9px] font-black text-teal-400 shadow-sm uppercase tracking-widest">
            Endorsed
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-5">
        <p className="font-bold text-sm text-slate-800 truncate group-hover:text-brand-600 transition-colors">{name}</p>
        <p className="text-xs text-slate-500 truncate mt-0.5">{provider.title || provider.credentials || 'Licensed Provider'}</p>
        {provider.address?.state && (
          <p className="text-xs text-slate-400 mt-1.5">{provider.address.city ? `${provider.address.city}, ` : ''}{provider.address.state}</p>
        )}
        {provider.specialties && provider.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {provider.specialties.slice(0, 2).map((s, i) => (
              <span key={i} className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{s}</span>
            ))}
            {provider.specialties.length > 2 && (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">+{provider.specialties.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main view ──────────────────────────────────────────────────────── */

const DirectoryView: React.FC<{ specialties?: Specialty[] }> = ({ specialties = [] }) => {
  const { navigate } = useNavigation();
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ── Data fetching ─────────────────────────────────────────

  // ── Unified Search Hook (Matches SearchView's Robustness) ─────────

  const LIMIT = 20;
  
  const searchFilters: SearchFilters = useMemo(() => ({
    specialty: selectedSpecialty || undefined,
    sortBy: sortBy === 'endorsements' ? 'endorsements' : sortBy === 'name_asc' ? 'name_asc' : undefined
  }), [selectedSpecialty, sortBy]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['directoryProviders', searchFilters],
    queryFn: ({ pageParam = 0 }) => api.search({ ...searchFilters, limit: LIMIT, offset: pageParam * LIMIT }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.flatMap(p => p.providers).length;
      return fetched < lastPage.total ? allPages.length : undefined;
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const rawResults = data?.pages.flatMap(p => p.providers) || [];
  
  // Transform results for client-side usage
  const allProviders = useMemo(() => {
    return rawResults.map(p => ({
      ...p,
      firstName: p.firstName || 'Unknown',
      lastName: p.lastName || 'Provider',
      sortName: `${p.lastName || 'Provider'} ${p.firstName || 'Unknown'}`.trim().toLowerCase(),
      createdAt: (p as any).audit?.createdAt || (p as any).createdAt,
      slug: (p as any).profileSlug || (p as any).slug
    } as EnrichedProvider));
  }, [rawResults]);

  // ── Client-side Filtering & Sorting ───────────────────────

  const filtered = useMemo(() => {
    let list = [...allProviders];

    // Client-side letter filtering
    if (selectedLetter) {
      list = list.filter(p => {
        const initial = (p.lastName || p.firstName || '').charAt(0).toUpperCase();
        return initial === selectedLetter;
      });
    }

    switch (sortBy) {
      case 'name_asc':
        list.sort((a, b) => (a.sortName || '').localeCompare(b.sortName || ''));
        break;
      case 'name_desc':
        list.sort((a, b) => (b.sortName || '').localeCompare(a.sortName || ''));
        break;
      case 'endorsements':
        list.sort((a, b) => {
            const scoreA = (a.endorsements?.evowell ? 50 : 0) + Math.min((a.endorsements?.peerCount || 0) * 5, 75);
            const scoreB = (b.endorsements?.evowell ? 50 : 0) + Math.min((b.endorsements?.peerCount || 0) * 5, 75);
            return scoreB - scoreA;
        });
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
    }

    return list;
  }, [allProviders, selectedSpecialty, selectedLetter, sortBy]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // ── Available letters ─────────────────────────────────────

  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    allProviders.forEach(p => {
      const ch = (p.lastName || p.firstName || '').charAt(0).toUpperCase();
      if (ch && /[A-Z]/.test(ch)) letters.add(ch);
    });
    return Array.from(letters).sort();
  }, [allProviders]);

  // ── Top specialties (from actual provider data) ───────────

  const topSpecialties = useMemo(() => {
    const counts = new Map<string, number>();
    allProviders.forEach(p => {
      p.specialties?.forEach(s => counts.set(s, (counts.get(s) || 0) + 1));
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([id, count]) => {
        const spec = specialties.find(s => s.id === id);
        return { id, name: spec?.name || id, count };
      });
  }, [allProviders, specialties]);

  // ── Infinite scroll via IntersectionObserver ──────────────

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount(prev => prev + 20);
        }
      },
      { rootMargin: '400px' },
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore]);

  // ── Reveal animation ──────────────────────────────────────

  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
        { threshold: 0.05 },
      );
    }
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => observerRef.current?.observe(el));
    }, 100);
    return () => { clearTimeout(timer); observerRef.current?.disconnect(); };
  }, [visible]);

  // ── Reset visible count on filter change ──────────────────

  useEffect(() => {
    setVisibleCount(20);
  }, [selectedSpecialty, selectedLetter, sortBy]);

  const visibleIds = useMemo(() => visible.map(p => p.id).join(','), [visible]);

  useEffect(() => {
    if (visibleIds) {
      const ids = visibleIds.split(',');
      wishlistService.checkWishlistStatus(ids).then(setSavedStatus).catch(console.error);
    }
  }, [visibleIds]);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <Breadcrumb items={[{ label: 'Directory' }]} />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <Container className="relative z-10 pt-16 pb-20">
          <div className="max-w-2xl">
            <Label variant="overline" className="text-brand-400 mb-4">Clinical Network</Label>
            <Heading level={1} size="display" color="white" className="mb-4">
              Provider Directory
            </Heading>
            <Text variant="lead" className="text-slate-400 mb-8">
              Browse our growing network of verified mental health and wellness professionals.
            </Text>

            {/* Search redirect bar */}
            <div
              onClick={() => navigate('#/search')}
              className="flex items-center gap-4 bg-white/10 hover:bg-white/[0.15] backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 cursor-pointer transition-all group max-w-lg"
            >
              <svg className="w-5 h-5 text-slate-400 group-hover:text-brand-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Search by name, specialty, or keyword…</span>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/10 px-3 py-1.5 rounded-lg hidden sm:block">⌘K</span>
            </div>
          </div>
        </Container>
      </div>

      {/* ── Specialty chips & Controls ────────────────────────── */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-30">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
              <button
                onClick={() => setSelectedSpecialty(null)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  !selectedSpecialty
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              {topSpecialties.map(spec => (
                <button
                  key={spec.id}
                  onClick={() => setSelectedSpecialty(selectedSpecialty === spec.id ? null : spec.id)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedSpecialty === spec.id
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {spec.name}
                  <span className={`ml-1.5 ${selectedSpecialty === spec.id ? 'text-brand-200' : 'text-slate-400'}`}>
                    {spec.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-50">
              {/* Sort dropdown */}
              <div className="min-w-[140px]">
                <Select
                  value={sortBy}
                  onChange={(val) => setSortBy(val as SortOption)}
                  options={[
                    { value: 'name_asc', label: 'Name A → Z' },
                    { value: 'name_desc', label: 'Name Z → A' },
                    { value: 'endorsements', label: 'Most Trusted' },
                    { value: 'newest', label: 'Newest First' },
                  ]}
                  className="bg-slate-50 border-none"
                />
              </div>

              {/* View toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                  aria-label="List view"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                  aria-label="Grid view"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* ── Controls + Content ────────────────────────────────── */}
      <Container className="py-10 pb-24">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Sidebar: Alphabet nav */}
          <aside className="hidden lg:block w-12 shrink-0 sticky top-36">
            <div className="flex flex-col items-center gap-0.5">
              <button
                onClick={() => setSelectedLetter(null)}
                className={`w-8 h-8 rounded-lg text-[10px] font-black flex items-center justify-center transition-all ${
                  !selectedLetter ? 'bg-brand-500 text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                All
              </button>
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
                const isAvailable = availableLetters.includes(letter);
                const isActive = selectedLetter === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => isAvailable && setSelectedLetter(isActive ? null : letter)}
                    disabled={!isAvailable}
                    className={`w-8 h-7 rounded-md text-[11px] font-bold flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-brand-500 text-white'
                        : isAvailable
                          ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 cursor-pointer'
                          : 'text-slate-200 cursor-default'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* Results */}
            {isLoading ? (
              <div className="py-32 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin mb-4" />
                <Label>Loading directory…</Label>
              </div>
            ) : visible.length > 0 ? (
              <>
                {viewMode === 'list' ? (
                  <div className="space-y-5">
                    {visible.map(p => (
                      <div key={p.id} className="reveal">
                        <ProviderCard 
                          provider={p} 
                          isSaved={savedStatus[p.id]}
                          onToggleSave={(saved) => setSavedStatus(prev => ({ ...prev, [p.id]: saved }))}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {visible.map(p => (
                      <div key={p.id} className="reveal">
                        <ProviderGridCard provider={p} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="h-1" />

                {hasMore && (
                  <div className="text-center pt-10">
                    <Text variant="small" color="muted">
                      Showing {visible.length} of {filtered.length}
                    </Text>
                  </div>
                )}
              </>
            ) : (
              <div className="py-32 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <span className="text-4xl block mb-4">🔍</span>
                <Text weight="bold" color="muted" className="mb-2">No providers match your filters.</Text>
                <Text variant="small" color="muted" className="mb-6">Try a different specialty or clear all filters.</Text>
                <Button variant="secondary" size="sm" onClick={() => { setSelectedSpecialty(null); setSelectedLetter(null); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default DirectoryView;