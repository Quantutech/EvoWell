import { describe, expect, it } from 'vitest';
import { getCameraReasonForInteraction } from '../../../src/utils/map/cameraPolicy';

describe('getCameraReasonForInteraction', () => {
  it('returns null for hover interactions to prevent jumpy map recentering', () => {
    expect(getCameraReasonForInteraction('HOVER')).toBeNull();
  });

  it('maps supported interactions to camera reasons', () => {
    expect(getCameraReasonForInteraction('INITIAL_LOAD')).toBe('INITIAL_LOAD');
    expect(getCameraReasonForInteraction('FILTER_APPLY')).toBe('FILTER_APPLY');
    expect(getCameraReasonForInteraction('MARKER_CLICK')).toBe('MARKER_CLICK');
  });
});

