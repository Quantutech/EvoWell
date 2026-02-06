
import { describe, it, expect } from 'vitest';
import { sanitizeInput, checkPasswordStrength } from '../../utils/security';
import { sanitizeHTML } from '../../utils/content-sanitizer';

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('removes script tags', () => {
      const input = '<script>alert(1)</script>';
      expect(sanitizeInput(input)).not.toContain('<script>');
    });

    it('escapes html entities', () => {
      const input = '<b>Bold</b>';
      expect(sanitizeInput(input)).toBe('&lt;b&gt;Bold&lt;/b&gt;');
    });
  });

  describe('sanitizeHTML (DOMPurify)', () => {
    it('allows safe tags', () => {
      const input = '<p>Hello <b>World</b></p>';
      expect(sanitizeHTML(input)).toBe('<p>Hello <b>World</b></p>');
    });

    it('strips dangerous attributes', () => {
      const input = '<img src=x onerror=alert(1) />';
      expect(sanitizeHTML(input)).toContain('<img src="x"');
      expect(sanitizeHTML(input)).not.toContain('onerror');
    });
  });

  describe('checkPasswordStrength', () => {
    it('scores weak passwords correctly', () => {
      expect(checkPasswordStrength('12345').feedback).toBe('Weak');
    });

    it('scores strong passwords correctly', () => {
      const strong = 'SuperS3cur3!Pass';
      const result = checkPasswordStrength(strong);
      expect(result.score).toBeGreaterThanOrEqual(5);
      expect(result.feedback).toBe('Strong');
    });
  });
});
