import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';
import { useNavigation } from '../App';
import { ProviderProfile, Specialty, SearchFilters, SessionFormat, AppointmentType } from '../types';
import ProviderCard from '../components/provider/ProviderCard';
import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { Heading, Text, Label } from '../components/typography';
import { Button, Select } from '../components/ui';
import { US_STATES, AGE_GROUPS } from '../data/constants';
import { getCameraReasonForInteraction } from '../utils/map/cameraPolicy';
import MapZoomControls from '../components/maps/MapZoomControls';
import {
  buildCameraRequest,
  isElementFullyVisibleWithinContainer,
  type MapCameraRequest,
} from '../utils/map/mapSearchHelpers';

// Fix for default markers in React Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const DEFAULT_MAP_CENTER: [number, number] = [39.8283, -98.5795];
const DEFAULT_MAP_ZOOM = 4;

/* ─── Map Controller ────────────────────────────────────────────────── */

const MapController: React.FC<{ bounds?: L.LatLngBoundsExpression; cameraRequest: MapCameraRequest }> = ({ bounds, cameraRequest }) => {
  const map = useMap();

  useEffect(() => {
    if (cameraRequest.reason === 'MARKER_CLICK' && cameraRequest.point) {
      map.flyTo(cameraRequest.point, 15, { duration: 0.45 });
      return;
    }

    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: false });
      return;
    }

    if (cameraRequest.reason === 'INITIAL_LOAD') {
      map.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, { animate: false });
    }
  }, [cameraRequest.eventId, cameraRequest.reason, cameraRequest.point, bounds, map]);

  return null;
};

const MapInstanceBridge: React.FC<{ onMapReady: (map: L.Map) => void }> = ({ onMapReady }) => {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
};

function scrollProviderIntoView(providerId: string): void {
  const row = document.getElementById(`provider-${providerId}`);
  if (!row) return;

  const listContainer = row.closest('[data-provider-list="scroll-container"]') as HTMLElement | null;
  if (!listContainer) {
    row.scrollIntoView({ block: 'center' });
    return;
  }

  if (!isElementFullyVisibleWithinContainer(row, listContainer)) {
    row.scrollIntoView({ block: 'center' });
  }
}

function createMarkerIcon(isHighlighted: boolean): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="w-8 h-8 bg-white rounded-full border-2 border-brand-500 shadow-xl flex items-center justify-center transition-all duration-300 ${isHighlighted ? 'scale-125 z-[1000] ring-4 ring-brand-500/20' : 'z-0'}">
            <div class="w-2.5 h-2.5 bg-brand-500 rounded-full"></div>
            </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}

/* ─── Filter Modal ──────────────────────────────────────────────────── */

const FilterModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    filters: SearchFilters;
    specialties: Specialty[];
    updateFilter: (key: keyof SearchFilters, val: SearchFilters[keyof SearchFilters] | undefined) => void;
    clearFilters: () => void;
}> = ({ isOpen, onClose, filters, specialties, updateFilter, clearFilters }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <Heading level={3} size="h4">Advanced Filters</Heading>
            <Text variant="caption" color="muted">Refine your search results</Text>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Location */}
          <Select
            label="State / Location"
            value={filters.state}
            options={US_STATES}
            onChange={(val) => updateFilter('state', val)}
            placeholder="All United States"
          />

          {/* Expertise */}
          <Select
            label="Specialty / Expertise"
            value={filters.specialty}
            options={specialties.map((s) => ({ value: s.id, label: s.name }))}
            onChange={(val) => updateFilter('specialty', val)}
            placeholder="All Specializations"
          />

          {/* Age Group */}
          <Select
            label="Patient Age Group"
            value={filters.agesServed?.[0]}
            options={AGE_GROUPS}
            onChange={(val) => updateFilter('agesServed', val ? [val] : undefined)}
            placeholder="All Ages"
          />

          {/* Session Type */}
          <div>
            <Label className="mb-4 block">Session Type</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Video', value: AppointmentType.VIDEO },
                { label: 'Phone', value: AppointmentType.PHONE },
                { label: 'In-Person', value: AppointmentType.IN_PERSON },
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const current = filters.appointmentTypes || [];
                    const next = current.includes(opt.value)
                      ? current.filter((v) => v !== opt.value)
                      : [...current, opt.value];
                    updateFilter('appointmentTypes', next.length ? next : undefined);
                  }}
                  className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    filters.appointmentTypes?.includes(opt.value)
                      ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20'
                      : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <Button variant="ghost" fullWidth onClick={() => { clearFilters(); onClose(); }}>Reset All</Button>
          <Button variant="brand" fullWidth onClick={onClose}>Show Results</Button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main view ──────────────────────────────────────────────────────── */

const MapSearchView: React.FC<{ specialties: Specialty[]; initialParams?: URLSearchParams }> = ({ specialties, initialParams }) => {
  const { navigate } = useNavigation();
  const [hoveredProviderId, setHoveredProviderId] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [cameraRequest, setCameraRequest] = useState<MapCameraRequest>({ reason: 'INITIAL_LOAD', eventId: 0 });
  const hasInitializedCamera = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    specialty: initialParams?.get('specialty') || undefined,
    query: initialParams?.get('query') || undefined,
    state: initialParams?.get('state') || undefined,
    format: (initialParams?.get('format') as SessionFormat) || undefined,
  });

  const [inputValue, setInputValue] = useState(initialParams?.get('query') || '');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({ ...prev, query: inputValue || undefined }));
    }, 400);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['mapSearchProviders', filters],
    queryFn: ({ pageParam = 0 }) => api.search({ ...filters, limit: 50, offset: pageParam * 50 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.flatMap((p) => p.providers).length;
      return fetched < lastPage.total ? allPages.length : undefined;
    },
    placeholderData: keepPreviousData,
  });

  const providers = useMemo(
    () => data?.pages.flatMap((page) => page.providers) ?? [],
    [data],
  );

  // ── Reveal observer ───────────────────────────────────────
  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('visible'); }),
        { threshold: 0.05 },
      );
    }

    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((el) => observerRef.current?.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [providers]);

  const updateFilter = (key: keyof SearchFilters, val: SearchFilters[keyof SearchFilters] | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: val || undefined }));
  };

  const clearFilters = () => {
    setFilters({});
    setInputValue('');
  };

  const bounds = useMemo(() => {
    const coords = providers
      .filter((provider) => provider.address?.lat && provider.address?.lng)
      .map((provider) => [provider.address!.lat!, provider.address!.lng!] as [number, number]);

    if (coords.length === 0) return undefined;
    return L.latLngBounds(coords);
  }, [providers]);

  useEffect(() => {
    const reason = hasInitializedCamera.current
      ? getCameraReasonForInteraction('FILTER_APPLY')
      : getCameraReasonForInteraction('INITIAL_LOAD');

    hasInitializedCamera.current = true;

    if (reason) {
      setCameraRequest((previousRequest) => buildCameraRequest(previousRequest, reason));
    }
  }, [bounds]);

  const focusProviderOnMap = useCallback((provider: ProviderProfile) => {
    if (!provider.address?.lat || !provider.address?.lng) return;
    const reason = getCameraReasonForInteraction('MARKER_CLICK');
    if (!reason) return;
    setCameraRequest((previousRequest) =>
      buildCameraRequest(previousRequest, reason, [provider.address!.lat!, provider.address!.lng!]),
    );
  }, []);

  const activeFilterCount = Object.values(filters).filter((value) => value !== undefined).length;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] mt-[64px] md:mt-[80px] bg-slate-50 font-sans overflow-hidden">
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        specialties={specialties}
        updateFilter={updateFilter}
        clearFilters={clearFilters}
      />

      {/* Sub-Header / Control Bar */}
      <div className="shrink-0 bg-white border-b border-slate-100 z-40 sticky top-0 shadow-sm px-6 md:px-10 py-3 flex items-center justify-center relative">
        <button
          onClick={() => setIsFilterOpen(true)}
          className={`flex items-center gap-3 px-8 py-3 rounded-full border transition-all hover:bg-slate-50 active:scale-95 ${activeFilterCount > 0 ? 'border-brand-500 bg-brand-50/30' : 'border-slate-200 bg-white'}`}
        >
          <svg className={`w-5 h-5 ${activeFilterCount > 0 ? 'text-brand-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Explore Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-brand-500 text-white rounded-full flex items-center justify-center text-[10px] font-black">{activeFilterCount}</span>
          )}
        </button>

        <div className="absolute right-6 md:right-10 flex items-center gap-3">
          <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest" onClick={() => navigate('#/search')}>
            List View
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Scrollable List */}
        <div data-provider-list="scroll-container" className="w-full lg:w-[50%] xl:w-[55%] overflow-y-auto custom-scrollbar bg-slate-50/50">
          <div className="p-4 md:p-6 lg:pl-10 space-y-4 max-w-4xl mx-auto pb-24 pt-8">
            {isLoading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin mx-auto mb-4"></div>
                <Text color="muted" className="font-bold uppercase tracking-widest text-xs">Syncing with clinical network...</Text>
              </div>
            ) : providers.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6">
                  {providers.map((provider) => (
                    <div
                      key={provider.id}
                      id={`provider-${provider.id}`}
                      onMouseEnter={() => setHoveredProviderId(provider.id)}
                      onMouseLeave={() => setHoveredProviderId(null)}
                      onClick={() => focusProviderOnMap(provider)}
                      className={`transition-all duration-300 cursor-pointer ${hoveredProviderId === provider.id ? 'scale-[1.01] z-10' : ''}`}
                    >
                      <ProviderCard
                        provider={provider}
                        className={hoveredProviderId === provider.id ? 'ring-2 ring-brand-500 shadow-xl' : ''}
                      />
                    </div>
                  ))}
                </div>

                {hasNextPage && (
                  <div className="text-center py-10">
                    <Button variant="secondary" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                      {isFetchingNextPage ? 'Loading more...' : 'Load More Results'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center">
                <Heading level={3} className="mb-2 uppercase tracking-tighter">No providers found</Heading>
                <Text color="muted">Try adjusting your filters or search terms.</Text>
                <Button className="mt-6 font-black uppercase text-xs tracking-widest" variant="secondary" onClick={clearFilters}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Map */}
        <div className="hidden lg:block lg:w-[50%] xl:w-[45%] h-full relative border-l border-slate-100 shadow-2xl lg:pr-10 lg:pb-10 lg:pt-8">
          <div className="h-full w-full rounded-[3rem] overflow-hidden shadow-2xl bg-slate-200 border border-slate-200/50">
            <MapContainer
              center={DEFAULT_MAP_CENTER}
              zoom={DEFAULT_MAP_ZOOM}
              minZoom={3}
              maxBounds={[[10, -180], [70, -50]]}
              style={{ height: '100%', width: '100%', filter: 'grayscale(0.1) contrast(1.05)' }}
              scrollWheelZoom
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              <MapInstanceBridge onMapReady={setMapInstance} />

              {providers.map((provider) => {
                if (!provider.address?.lat || !provider.address?.lng) return null;
                const isHighlighted = hoveredProviderId === provider.id;

                return (
                  <Marker
                    key={provider.id}
                    position={[provider.address.lat, provider.address.lng]}
                    icon={createMarkerIcon(isHighlighted)}
                    eventHandlers={{
                      mouseover: () => setHoveredProviderId(provider.id),
                      mouseout: () => setHoveredProviderId(null),
                      click: (event) => {
                        focusProviderOnMap(provider);
                        scrollProviderIntoView(provider.id);
                        event.target.openPopup();
                      },
                    }}
                  >
                    <Popup className="font-sans">
                      <div className="text-center p-2 min-w-[150px]">
                        <img src={provider.imageUrl} className="w-12 h-12 rounded-full mx-auto mb-2 object-cover border-2 border-brand-500 shadow-sm" alt="" />
                        <p className="font-bold text-slate-900 text-sm mb-0">Dr. {provider.firstName} {provider.lastName}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">{provider.professionalTitle}</p>
                        <Button size="sm" variant="brand" fullWidth className="h-7 text-[9px] uppercase font-black" onClick={() => navigate(`#/provider/${provider.id}`)}>View Profile</Button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              <MapController bounds={bounds} cameraRequest={cameraRequest} />
            </MapContainer>
          </div>

          {/* Custom Map Controls */}
          <MapZoomControls
            className="absolute top-6 left-6 z-[1000] flex flex-col gap-2"
            disabled={!mapInstance}
            onZoomIn={() => mapInstance?.zoomIn()}
            onZoomOut={() => mapInstance?.zoomOut()}
          />
        </div>
      </main>
    </div>
  );
};

export default MapSearchView;
