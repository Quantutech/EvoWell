import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const DECORATIVE_EMOJIS = ['💬', '📞', '🌍', '🤝', '🧬', '🔒', '⚡', '🌱', '🎬', '👋', '🛡️', '📝', '📍', '✍️', '🎥', '📭', '😕'];

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

describe('front surface iconography consistency', () => {
  it('uses svg icon paths instead of decorative emoji in reviewed surfaces', () => {
    const aboutSource = readSource('src/views/AboutView.tsx');
    const providerProfileSource = readSource('src/views/ProviderProfileView.tsx');
    const dynamicMapSource = readSource('src/components/maps/DynamicMap.tsx');

    expect(aboutSource).toContain('iconPaths');
    expect(providerProfileSource).toContain('iconPaths');
    expect(dynamicMapSource).toContain('iconPaths');

    expect(DECORATIVE_EMOJIS.some((emoji) => aboutSource.includes(emoji))).toBe(false);
    expect(DECORATIVE_EMOJIS.some((emoji) => providerProfileSource.includes(emoji))).toBe(false);
    expect(DECORATIVE_EMOJIS.some((emoji) => dynamicMapSource.includes(emoji))).toBe(false);
  });
});
