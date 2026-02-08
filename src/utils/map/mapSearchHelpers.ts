import type { MapCameraReason } from '@/types/ui/map';

export interface MapCameraRequest {
  reason: MapCameraReason;
  eventId: number;
  point?: [number, number];
}

export function isElementFullyVisibleWithinContainer(element: HTMLElement, container: HTMLElement): boolean {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return (
    elementRect.top >= containerRect.top &&
    elementRect.bottom <= containerRect.bottom &&
    elementRect.left >= containerRect.left &&
    elementRect.right <= containerRect.right
  );
}

export function buildCameraRequest(
  previousRequest: MapCameraRequest,
  reason: MapCameraReason,
  point?: [number, number],
): MapCameraRequest {
  return {
    reason,
    point,
    eventId: previousRequest.eventId + 1,
  };
}

