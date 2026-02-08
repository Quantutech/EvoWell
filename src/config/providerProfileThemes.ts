import { ProviderProfileTheme } from '@/types';
import { ProviderProfileSectionKey, PROVIDER_PROFILE_THEME_LABELS } from '@/types/ui/providerProfile';

export interface ProviderProfileThemeConfig {
  key: ProviderProfileTheme;
  label: string;
  description: string;
  heroShellClass: string;
  heroGlowPrimaryClass: string;
  heroGlowSecondaryClass: string;
  tabActiveClass: string;
  accentTextClass: string;
  badgeEmphasisClass: string;
  sectionRailClassByKey: Record<ProviderProfileSectionKey, string>;
  rightRailCardClass: string;
  bookingAccentTextClass: string;
  bookingPrimaryButtonClass: string;
  bookingSlotSelectedClass: string;
  exchangeCardClass: string;
  exchangeIconClass: string;
  exchangeLinkClass: string;
  stickyPrimaryButtonClass: string;
  swatches: [string, string, string];
}

export const PROVIDER_PROFILE_THEME_CONFIG: Record<ProviderProfileTheme, ProviderProfileThemeConfig> =
  {
    MIDNIGHT: {
      key: 'MIDNIGHT',
      label: PROVIDER_PROFILE_THEME_LABELS.MIDNIGHT,
      description: 'Deep navy shell with clean neutral surfaces.',
      heroShellClass: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
      heroGlowPrimaryClass: 'bg-blue-300/20',
      heroGlowSecondaryClass: 'bg-indigo-300/15',
      tabActiveClass: 'bg-slate-900 text-white',
      accentTextClass: 'text-blue-700',
      badgeEmphasisClass: 'bg-blue-100 text-blue-800 border border-blue-200',
      sectionRailClassByKey: {
        introduction: 'bg-slate-900',
        credentials: 'bg-blue-600',
        endorsements: 'bg-emerald-600',
        media: 'bg-violet-600',
        articles: 'bg-amber-500',
        location: 'bg-rose-500',
      },
      rightRailCardClass: 'border-slate-200 bg-white',
      bookingAccentTextClass: 'text-blue-700',
      bookingPrimaryButtonClass: 'bg-slate-900 text-white hover:bg-slate-800',
      bookingSlotSelectedClass: 'border-slate-900 bg-slate-900 text-white',
      exchangeCardClass: 'border-blue-100 bg-blue-50 hover:border-blue-200 hover:bg-blue-100/70',
      exchangeIconClass: 'bg-blue-700 text-white',
      exchangeLinkClass: 'text-blue-700',
      stickyPrimaryButtonClass: 'bg-slate-900 text-white',
      swatches: ['#0f172a', '#1d4ed8', '#ecfeff'],
    },
    FOREST: {
      key: 'FOREST',
      label: PROVIDER_PROFILE_THEME_LABELS.FOREST,
      description: 'Calm evergreen palette with soft wellness accents.',
      heroShellClass: 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900',
      heroGlowPrimaryClass: 'bg-emerald-300/25',
      heroGlowSecondaryClass: 'bg-teal-300/20',
      tabActiveClass: 'bg-emerald-800 text-white',
      accentTextClass: 'text-emerald-700',
      badgeEmphasisClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      sectionRailClassByKey: {
        introduction: 'bg-emerald-700',
        credentials: 'bg-teal-600',
        endorsements: 'bg-green-600',
        media: 'bg-cyan-600',
        articles: 'bg-lime-600',
        location: 'bg-emerald-500',
      },
      rightRailCardClass: 'border-emerald-100 bg-emerald-50/40',
      bookingAccentTextClass: 'text-emerald-700',
      bookingPrimaryButtonClass: 'bg-emerald-800 text-white hover:bg-emerald-700',
      bookingSlotSelectedClass: 'border-emerald-700 bg-emerald-700 text-white',
      exchangeCardClass:
        'border-emerald-200 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100/70',
      exchangeIconClass: 'bg-emerald-700 text-white',
      exchangeLinkClass: 'text-emerald-700',
      stickyPrimaryButtonClass: 'bg-emerald-800 text-white',
      swatches: ['#14532d', '#047857', '#ecfdf5'],
    },
    OCEAN: {
      key: 'OCEAN',
      label: PROVIDER_PROFILE_THEME_LABELS.OCEAN,
      description: 'Fresh blue-cyan gradient with high-contrast controls.',
      heroShellClass: 'bg-gradient-to-br from-sky-900 via-blue-800 to-cyan-900',
      heroGlowPrimaryClass: 'bg-cyan-300/25',
      heroGlowSecondaryClass: 'bg-sky-300/20',
      tabActiveClass: 'bg-sky-800 text-white',
      accentTextClass: 'text-sky-700',
      badgeEmphasisClass: 'bg-sky-100 text-sky-800 border border-sky-200',
      sectionRailClassByKey: {
        introduction: 'bg-sky-700',
        credentials: 'bg-blue-600',
        endorsements: 'bg-cyan-600',
        media: 'bg-indigo-600',
        articles: 'bg-amber-500',
        location: 'bg-blue-500',
      },
      rightRailCardClass: 'border-sky-100 bg-sky-50/40',
      bookingAccentTextClass: 'text-sky-700',
      bookingPrimaryButtonClass: 'bg-sky-800 text-white hover:bg-sky-700',
      bookingSlotSelectedClass: 'border-sky-700 bg-sky-700 text-white',
      exchangeCardClass: 'border-sky-200 bg-sky-50 hover:border-sky-300 hover:bg-sky-100/70',
      exchangeIconClass: 'bg-sky-700 text-white',
      exchangeLinkClass: 'text-sky-700',
      stickyPrimaryButtonClass: 'bg-sky-800 text-white',
      swatches: ['#0c4a6e', '#0369a1', '#ecfeff'],
    },
    SLATE: {
      key: 'SLATE',
      label: PROVIDER_PROFILE_THEME_LABELS.SLATE,
      description: 'Neutral graphite palette for minimalist profiles.',
      heroShellClass: 'bg-gradient-to-br from-zinc-900 via-slate-800 to-zinc-800',
      heroGlowPrimaryClass: 'bg-slate-300/20',
      heroGlowSecondaryClass: 'bg-zinc-300/15',
      tabActiveClass: 'bg-zinc-800 text-white',
      accentTextClass: 'text-slate-700',
      badgeEmphasisClass: 'bg-slate-100 text-slate-800 border border-slate-200',
      sectionRailClassByKey: {
        introduction: 'bg-zinc-700',
        credentials: 'bg-slate-600',
        endorsements: 'bg-zinc-600',
        media: 'bg-slate-500',
        articles: 'bg-zinc-500',
        location: 'bg-slate-400',
      },
      rightRailCardClass: 'border-slate-200 bg-slate-50/30',
      bookingAccentTextClass: 'text-slate-700',
      bookingPrimaryButtonClass: 'bg-zinc-800 text-white hover:bg-zinc-700',
      bookingSlotSelectedClass: 'border-zinc-700 bg-zinc-700 text-white',
      exchangeCardClass:
        'border-slate-200 bg-slate-100/80 hover:border-slate-300 hover:bg-slate-100',
      exchangeIconClass: 'bg-zinc-700 text-white',
      exchangeLinkClass: 'text-slate-700',
      stickyPrimaryButtonClass: 'bg-zinc-800 text-white',
      swatches: ['#18181b', '#334155', '#f1f5f9'],
    },
  };

export const PROVIDER_PROFILE_THEME_OPTIONS = (
  Object.keys(PROVIDER_PROFILE_THEME_CONFIG) as ProviderProfileTheme[]
).map((key) => PROVIDER_PROFILE_THEME_CONFIG[key]);
