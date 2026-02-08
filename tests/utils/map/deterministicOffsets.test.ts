import { describe, expect, it } from 'vitest';
import { getStableMarkerOffset } from '../../../src/utils/map/deterministicOffsets';

describe('getStableMarkerOffset', () => {
  it('returns the same offset for the same seed', () => {
    const first = getStableMarkerOffset('provider-123', 3);
    const second = getStableMarkerOffset('provider-123', 3);

    expect(second).toEqual(first);
  });

  it('returns offsets within the provided radius bounds', () => {
    const radius = 3;
    const offset = getStableMarkerOffset('provider-456', radius);

    expect(offset.x).toBeGreaterThanOrEqual(-radius);
    expect(offset.x).toBeLessThanOrEqual(radius);
    expect(offset.y).toBeGreaterThanOrEqual(-radius);
    expect(offset.y).toBeLessThanOrEqual(radius);
  });

  it('changes offsets for different seeds', () => {
    const first = getStableMarkerOffset('provider-alpha', 3);
    const second = getStableMarkerOffset('provider-beta', 3);

    expect(first.x === second.x && first.y === second.y).toBe(false);
  });
});

