const FNV_OFFSET_BASIS = 2166136261;
const FNV_PRIME = 16777619;

function hashSeed(seed: string): number {
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0;
}

/**
 * Returns deterministic XY offsets for marker jitter that remains stable across renders.
 */
export function getStableMarkerOffset(seed: string, radiusPx = 3): { x: number; y: number } {
  const hash = hashSeed(seed);
  const angle = ((hash % 360) * Math.PI) / 180;
  const magnitude = ((hash >>> 8) % 10_000) / 10_000;
  const radius = magnitude * radiusPx;

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

