
/**
 * Security Utilities
 * Prevents XSS and enforces password strength
 */

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  // Basic XSS prevention: remove script tags and html entities
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const checkPasswordStrength = (password: string): { score: number; feedback: string } => {
  let score = 0;
  if (!password) return { score: 0, feedback: '' };

  if (password.length > 8) score++;
  if (password.length > 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  let feedback = 'Weak';
  if (score >= 3) feedback = 'Moderate';
  if (score >= 5) feedback = 'Strong';

  return { score, feedback };
};

export const generateMFACode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
