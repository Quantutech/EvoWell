import { describe, expect, it } from 'vitest';
import {
  LEGACY_PROVIDER_TEMPLATE_THEME_MAP,
  PROVIDER_AVAILABILITY_STATUS_META,
  PROVIDER_PROFILE_THEME_LABELS,
  PROVIDER_PROFILE_THEMES,
} from '../../src/types/ui/providerProfile';

describe('provider profile template UI types', () => {
  it('exposes all supported profile themes', () => {
    expect(PROVIDER_PROFILE_THEMES).toEqual(['MIDNIGHT', 'FOREST', 'OCEAN', 'SLATE']);
    expect(PROVIDER_PROFILE_THEME_LABELS.MIDNIGHT).toBe('Midnight');
    expect(PROVIDER_PROFILE_THEME_LABELS.FOREST).toBe('Forest');
  });

  it('maps legacy templates into theme equivalents', () => {
    expect(LEGACY_PROVIDER_TEMPLATE_THEME_MAP.CLASSIC).toBe('MIDNIGHT');
    expect(LEGACY_PROVIDER_TEMPLATE_THEME_MAP.ELEVATED).toBe('FOREST');
  });

  it('maps availability status metadata consistently', () => {
    expect(PROVIDER_AVAILABILITY_STATUS_META.ACCEPTING.label).toBe('Accepting Clients');
    expect(PROVIDER_AVAILABILITY_STATUS_META.WAITLIST.label).toBe('Waitlist');
    expect(PROVIDER_AVAILABILITY_STATUS_META.NOT_ACCEPTING.label).toBe('Not accepting');
  });
});
