import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { useNavigation } from '../App';
import { ProviderProfile, Specialty, SearchFilters, SessionFormat } from '../types';
import Breadcrumb from '../components/Breadcrumb';
import { PageHero, Section, Container } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button, Badge, Card } from '../components/ui';
import ProviderCard from '../components/provider/ProviderCard';
import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';

/* ─── Types ──────────────────────────────────────────────────────────── */

type SortOption = 'relevance' | 'rating' | 'name-asc' | 'price-low' | 'price-high';

/* ─── Active filter pill ─────────────────────────────────────────────── */

const FilterPill: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 pl-3 pr-2 py-1.5 rounded-full text-xs font-bold">
    {label}
    <button onClick={onRemove} className="w-4 h-4 rounded-full bg-brand-200/50 hover:bg-brand-300/50 flex items-center justify-center text-brand-600 transition-colors">×</button>
  </span>
);

/* ─── Main view ──────────────────────────────────────────────────────── */

const SearchView: React.FC<{ specialties: Specialty[]; initialParams?: URLSearchParams }> = ({ specialties, initialParams }) => {
  const { navigate } = useNavigation();
  const LIMIT = 20;

  const [filters, setFilters] = useState<SearchFilters>({
    specialty: initialParams?.get('specialty') || undefined,
    query: initialParams?.get('query') || undefined,
    state: initialParams?.get('state') || undefined,
    format: (initialParams?.get('format') as SessionFormat) || undefined,
    gender: undefined,
    language: undefined,
    maxPrice: undefined,
    day: undefined,
  });

  const [inputValue, setInputValue] = useState(initialParams?.get('query') || '');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters = !!(filters.specialty || filters.format || filters.state || filters.language || filters.day || filters.gender || filters.maxPrice);
  const isDirectoryMode = !filters.query && !hasActiveFilters;

  // ── Debounce search input ─────────────────────────────────

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, query: inputValue || undefined }));
    }, 400);
    return () => clearTimeout(handler);
  }, [inputValue]);

  // ── React Query: fetch providers ──────────────────────────

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['searchProviders', filters],
    queryFn: ({ pageParam = 0 }) => api.search({ ...filters, limit: LIMIT, offset: pageParam * LIMIT }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.flatMap(p => p.providers).length;
      return fetched < lastPage.total ? allPages.length : undefined;
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const rawResults = data?.pages.flatMap(p => p.providers) || [];
  const total = data?.pages[0]?.total || 0;

  // ── Client-side sort (since API may not support all sort options) ──

  const results = useMemo(() => {
    const list = [...rawResults];
    switch (sortBy) {
      case 'rating':
        list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        break;
      case 'name-asc':
        list.sort((a, b) => (a.firstName || a.id).localeCompare(b.firstName || b.id));
        break;
      case 'price-low':
        list.sort((a, b) => (Number(a.sessionRate) || 0) - (Number(b.sessionRate) || 0));
        break;
      case 'price-high':
        list.sort((a, b) => (Number(b.sessionRate) || 0) - (Number(a.sessionRate) || 0));
        break;
      default: // relevance — keep API order
        break;
    }
    return list;
  }, [rawResults, sortBy]);

  // ── Reveal observer ───────────────────────────────────────

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
  }, [results]);

  // ── Helper to update a filter ─────────────────────────────

  const updateFilter = useCallback(<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({ maxPrice: undefined });
    setInputValue('');
    setSortBy('relevance');
  }, []);

  // ── Get active filter labels (for pills) ──────────────────

  const activeFilterLabels = useMemo(() => {
    const pills: { label: string; clear: () => void }[] = [];
    if (filters.specialty) {
      const name = specialties.find(s => s.id === filters.specialty)?.name || filters.specialty;
      pills.push({ label: name, clear: () => updateFilter('specialty', undefined) });
    }
    if (filters.format) {
      pills.push({ label: filters.format === SessionFormat.IN_PERSON ? 'In Person' : 'Remote', clear: () => updateFilter('format', undefined) });
    }
    if (filters.state) pills.push({ label: filters.state, clear: () => updateFilter('state', undefined) });
    if (filters.language) pills.push({ label: filters.language, clear: () => updateFilter('language', undefined) });
    if (filters.gender) pills.push({ label: filters.gender, clear: () => updateFilter('gender', undefined) });
    if (filters.day) pills.push({ label: filters.day, clear: () => updateFilter('day', undefined) });
    if (filters.maxPrice) pills.push({ label: `Under $${filters.maxPrice}/hr`, clear: () => updateFilter('maxPrice', undefined) });
    return pills;
  }, [filters, specialties, updateFilter]);

  // ── Filter panel (shared between desktop sidebar & mobile drawer) ──

  const FilterPanelContent = () => (
    <div className="space-y-7">
      {/* Session format */}
      <div>
        <Label className="mb-3 block text-xs">Session Format</Label>
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
          {([
            { label: 'Any', value: undefined },
            { label: 'In Person', value: SessionFormat.IN_PERSON },
            { label: 'Remote', value: SessionFormat.REMOTE },
          ] as const).map(opt => (
            <button
              key={opt.label}
              onClick={() => updateFilter('format', opt.value)}
              className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                filters.format === opt.value
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Specialty */}
      <div>
        <Label className="mb-3 block text-xs">Specialty</Label>
        <select
          value={filters.specialty || ''}
          onChange={e => updateFilter('specialty', e.target.value || undefined)}
          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-brand-300 transition-colors"
        >
          <option value="">All Specialties</option>
          {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Price range */}
      <div>
        <div className="flex justify-between mb-3">
          <Label className="text-xs">Max Hourly Rate</Label>
          <span className="text-xs font-bold text-slate-700">{filters.maxPrice ? `$${filters.maxPrice}` : 'Any'}</span>
        </div>
        <input
          type="range" min={50} max={500} step={10}
          value={filters.maxPrice || 500}
          onChange={e => {
            const val = parseInt(e.target.value);
            updateFilter('maxPrice', val >= 500 ? undefined : val);
          }}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
          <span>$50</span><span>$500+</span>
        </div>
      </div>

      {/* Language */}
      <div>
        <Label className="mb-3 block text-xs">Language</Label>
        <select
          value={filters.language || ''}
          onChange={e => updateFilter('language', e.target.value || undefined)}
          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-brand-300 transition-colors"
        >
          <option value="">Any Language</option>
          {['English', 'Spanish', 'French', 'Mandarin', 'Arabic', 'Portuguese', 'Korean', 'Hindi'].map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Gender preference */}
      <div>
        <Label className="mb-3 block text-xs">Provider Gender</Label>
        <div className="flex gap-2">
          {['Any', 'Male', 'Female', 'Non-binary'].map(g => (
            <button
              key={g}
              onClick={() => updateFilter('gender', g === 'Any' ? undefined : g)}
              className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl border transition-all ${
                (g === 'Any' && !filters.gender) || filters.gender === g
                  ? 'bg-brand-50 border-brand-200 text-brand-700'
                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Availability day */}
      <div>
        <Label className="mb-3 block text-xs">Available On</Label>
        <div className="flex flex-wrap gap-1.5">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <button
              key={d}
              onClick={() => updateFilter('day', filters.day === d ? undefined : d)}
              className={`w-11 h-10 text-[11px] font-bold rounded-xl border transition-all ${
                filters.day === d
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <Breadcrumb items={[{ label: 'Directory', path: '/directory' }, { label: 'Search' }]} />

      {/* ── Search header ────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <Container>
          <div className="flex items-center gap-3 py-4">
            {/* Search input */}
            <div className="relative flex-1 max-w-2xl group">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by name, specialty, or keyword…"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:ring-4 focus:ring-brand-500/10 focus:border-brand-300 focus:bg-white outline-none transition-all"
              />
              {inputValue && (
                <button
                  onClick={() => setInputValue('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-500 text-xs transition-colors"
                >
                  ×
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="hidden sm:block bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-700 outline-none cursor-pointer hover:border-slate-300"
            >
              <option value="relevance">Most Relevant</option>
              <option value="rating">Highest Rated</option>
              <option value="name-asc">Name A → Z</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-700 hover:border-slate-300 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {hasActiveFilters && <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center">{activeFilterLabels.length}</span>}
            </button>
          </div>

          {/* Active filter pills */}
          {activeFilterLabels.length > 0 && (
            <div className="flex items-center gap-2 pb-3 overflow-x-auto no-scrollbar">
              {activeFilterLabels.map((f, i) => (
                <FilterPill key={i} label={f.label} onRemove={f.clear} />
              ))}
              <button onClick={clearAllFilters} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap ml-1">
                Clear all
              </button>
            </div>
          )}
        </Container>
      </div>

      {/* ── Mobile filter drawer ─────────────────────────────── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <Heading level={3}>Filters</Heading>
              <button onClick={() => setMobileFiltersOpen(false)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100">×</button>
            </div>
            <div className="p-6">
              <FilterPanelContent />
            </div>
            <div className="sticky bottom-0 p-6 bg-white border-t border-slate-100 flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => { clearAllFilters(); setMobileFiltersOpen(false); }}>Reset</Button>
              <Button variant="primary" className="flex-1" onClick={() => setMobileFiltersOpen(false)}>Show Results</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────── */}
      <Container className="py-8 pb-24">
        {/* Results header */}
        <div className="mb-6">
          <Text variant="small" color="muted" className="font-semibold">
            {isLoading ? 'Searching…' : `${total} provider${total !== 1 ? 's' : ''} found`}
            {filters.query && <span> for "<span className="text-slate-700">{filters.query}</span>"</span>}
          </Text>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop filter sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <Card className="sticky top-32 p-6">
              <div className="flex items-center justify-between mb-6">
                <Heading level={4} className="text-sm">Filters</Heading>
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="text-xs font-bold text-brand-500 hover:text-brand-700 transition-colors">Reset</button>
                )}
              </div>
              <FilterPanelContent />
            </Card>
          </aside>

          {/* Results list */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="py-32 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin mb-4" />
                <Label>Searching providers…</Label>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="space-y-5">
                  {results.map(p => (
                    <div key={p.id} className="reveal">
                      <ProviderCard provider={p} />
                    </div>
                  ))}
                </div>

                {hasNextPage && (
                  <div className="text-center pt-10">
                    <Button variant="secondary" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                      {isFetchingNextPage ? 'Loading more…' : `Load More (${results.length} of ${total})`}
                    </Button>
                  </div>
                )}

                {!hasNextPage && results.length > 0 && (
                  <div className="text-center pt-10">
                    <Text variant="small" color="muted">Showing all {results.length} results</Text>
                  </div>
                )}
              </>
            ) : (
              <div className="py-32 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <span className="text-4xl block mb-4">🔍</span>
                <Heading level={4} className="mb-2">No matching providers</Heading>
                <Text variant="small" color="muted" className="mb-6 max-w-sm mx-auto">
                  Try broadening your search or adjusting filters. You can also browse the full directory.
                </Text>
                <div className="flex gap-3 justify-center">
                  <Button variant="secondary" size="sm" onClick={clearAllFilters}>Clear Filters</Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate('#/directory')}>View Directory</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SearchView;