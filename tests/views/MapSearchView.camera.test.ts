import { describe, expect, it } from 'vitest';
import { buildCameraRequest, isElementFullyVisibleWithinContainer } from '../../src/utils/map/mapSearchHelpers';

describe('MapSearchView camera helpers', () => {
  it('increments camera event id and stores camera reason', () => {
    const currentRequest = { reason: 'INITIAL_LOAD' as const, eventId: 2 };
    const nextRequest = buildCameraRequest(currentRequest, 'MARKER_CLICK', [40, -73]);

    expect(nextRequest.eventId).toBe(3);
    expect(nextRequest.reason).toBe('MARKER_CLICK');
    expect(nextRequest.point).toEqual([40, -73]);
  });

  it('detects when an item is outside the scroll container', () => {
    const element = document.createElement('div');
    const container = document.createElement('div');

    Object.defineProperty(element, 'getBoundingClientRect', {
      value: () =>
        ({
          top: 10,
          bottom: 90,
          left: 0,
          right: 100,
        }) as DOMRect,
    });
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () =>
        ({
          top: 0,
          bottom: 80,
          left: 0,
          right: 120,
        }) as DOMRect,
    });

    expect(isElementFullyVisibleWithinContainer(element, container)).toBe(false);
  });
});
