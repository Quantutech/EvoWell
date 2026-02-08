import type { MapCameraReason } from '@/types/ui/map';

export type MapInteraction = 'INITIAL_LOAD' | 'FILTER_APPLY' | 'MARKER_CLICK' | 'HOVER';

/**
 * Maps UI interactions to allowed camera reasons.
 * Hover is explicitly non-camera-driving to avoid jumpy behavior.
 */
export function getCameraReasonForInteraction(interaction: MapInteraction): MapCameraReason | null {
  if (interaction === 'HOVER') {
    return null;
  }

  return interaction;
}

