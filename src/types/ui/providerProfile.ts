import {
  ProviderAvailabilityStatus,
  ProviderProfileTemplate,
  ProviderProfileTheme,
} from '@/types/domain/provider';

export const PROVIDER_PROFILE_THEMES: ProviderProfileTheme[] = [
  'MIDNIGHT',
  'FOREST',
  'OCEAN',
  'SLATE',
];

export const PROVIDER_PROFILE_THEME_LABELS: Record<ProviderProfileTheme, string> = {
  MIDNIGHT: 'Midnight',
  FOREST: 'Forest',
  OCEAN: 'Ocean',
  SLATE: 'Slate',
};

export const LEGACY_PROVIDER_TEMPLATE_THEME_MAP: Record<
  ProviderProfileTemplate,
  ProviderProfileTheme
> = {
  CLASSIC: 'MIDNIGHT',
  ELEVATED: 'FOREST',
};

export function resolveProviderProfileTheme(
  profileTheme?: ProviderProfileTheme,
  legacyTemplate?: ProviderProfileTemplate,
): ProviderProfileTheme {
  if (profileTheme && PROVIDER_PROFILE_THEMES.includes(profileTheme)) {
    return profileTheme;
  }
  if (legacyTemplate) {
    return LEGACY_PROVIDER_TEMPLATE_THEME_MAP[legacyTemplate];
  }
  return 'MIDNIGHT';
}

export interface ProviderAvailabilityStatusMeta {
  label: string;
  badgeClassName: string;
}

export const PROVIDER_AVAILABILITY_STATUS_META: Record<
  ProviderAvailabilityStatus,
  ProviderAvailabilityStatusMeta
> = {
  ACCEPTING: {
    label: 'Accepting Clients',
    badgeClassName: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
  WAITLIST: {
    label: 'Waitlist',
    badgeClassName: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  NOT_ACCEPTING: {
    label: 'Not accepting',
    badgeClassName: 'bg-slate-100 text-slate-700 border border-slate-200',
  },
};

export type ProviderProfileSectionKey =
  | 'introduction'
  | 'credentials'
  | 'endorsements'
  | 'media'
  | 'articles'
  | 'location';
