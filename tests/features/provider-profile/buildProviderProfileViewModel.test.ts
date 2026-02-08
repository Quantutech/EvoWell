import { describe, expect, it } from 'vitest';
import { providers } from '../../../src/data/seed/providers';
import { buildProviderProfileViewModel } from '../../../src/features/provider-profile/model/buildProviderProfileViewModel';

describe('buildProviderProfileViewModel', () => {
  it('applies theme and availability fallbacks for legacy provider rows', () => {
    const provider = {
      ...providers[0],
      profileTheme: undefined,
      profileTemplate: undefined,
      availabilityStatus: undefined,
      acceptingNewClients: false,
    };

    const model = buildProviderProfileViewModel({
      provider,
      endorsements: [],
      blogs: [],
    });

    expect(model.theme).toBe('MIDNIGHT');
    expect(model.identity.status.value).toBe('NOT_ACCEPTING');
    expect(model.identity.status.label).toBe('Not accepting');
  });

  it('maps legacy elevated template rows to forest theme', () => {
    const provider = {
      ...providers[0],
      profileTheme: undefined,
      profileTemplate: 'ELEVATED' as const,
    };

    const model = buildProviderProfileViewModel({
      provider,
      endorsements: [],
      blogs: [],
    });

    expect(model.theme).toBe('FOREST');
  });

  it('hides license numbers unless provider explicitly enables public license number visibility', () => {
    const provider = {
      ...providers[0],
      showLicenseNumber: false,
      licenses: [{ state: 'CA', number: 'ABC123', verified: true }],
    };

    const hiddenModel = buildProviderProfileViewModel({
      provider,
      endorsements: [],
      blogs: [],
    });
    expect(hiddenModel.credentials.licenses[0]?.number).toBeUndefined();

    const visibleModel = buildProviderProfileViewModel({
      provider: { ...provider, showLicenseNumber: true },
      endorsements: [],
      blogs: [],
    });
    expect(visibleModel.credentials.licenses[0]?.number).toBe('ABC123');
  });

  it('does not treat credential text as a provider full name', () => {
    const provider = {
      ...providers[0],
      firstName: 'PhD,',
      lastName: 'Clinical Psychologist',
      email: 'test.provider@evowell.com',
    };

    const model = buildProviderProfileViewModel({
      provider,
      endorsements: [],
      blogs: [],
    });

    expect(model.identity.fullName).toBe('Test Provider');
  });
});
