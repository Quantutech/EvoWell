import { describe, expect, it } from 'vitest';
import { detectSafetyFlags, resolveSafetyCopy } from '../../../src/components/evo/intentRouter';

describe('evo intent router safety detection', () => {
  it('detects crisis language with highest priority', () => {
    const flags = detectSafetyFlags('I am thinking about suicide and feel unsafe right now');
    expect(flags).toContain('CRISIS');
  });

  it('detects medical and medication advice requests', () => {
    const flags = detectSafetyFlags('What dosage should I take and what do I have?');
    expect(flags).toContain('MEDICAL_ADVICE');
    expect(flags).toContain('MEDICATION');
  });

  it('returns the correct refusal template for medication guidance', () => {
    const copy = resolveSafetyCopy(['MEDICATION']);
    expect(copy).toContain("can't advise on medications");
  });
});

