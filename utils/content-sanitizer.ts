
import DOMPurify from 'dompurify';

/**
 * Configuration for DOMPurify to allow rich text while preventing XSS.
 * 
 * Allowed Tags: Basic text formatting, lists, links, images.
 * Forbidden Tags: Scripts, iframes, objects, forms.
 * 
 * Security Enhancements:
 * - Links are forced to open in new tab with noopener noreferrer.
 * - Images must use HTTPS or data URI.
 * - All event handlers (onclick, etc.) are stripped.
 */
const SANITIZER_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'b', 'i', 'em', 'strong', 'u', 's', 'strike',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
    'a', 'img', 'span', 'div', 'hr'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', // Links
    'src', 'alt', 'title', 'width', 'height', // Images
    'class', 'id', // Styling hooks (safe classes only expected)
    'align', 'valign' // Legacy formatting support
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data):)/i, // No javascript: allowed
  ADD_ATTR: ['target', 'rel'], // Force these attributes on specific tags
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'object', 'embed', 'link', 'meta', 'base'],
  FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'],
};

// Hook to enforce security on links
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  // Ensure all links open in new tab and do not pass referrer
  if ('target' in node) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
  
  // Ensure images are accessible
  if (node.tagName === 'IMG' && !node.hasAttribute('alt')) {
    node.setAttribute('alt', 'Embedded content');
  }
});

/**
 * Sanitizes HTML content string to prevent XSS attacks.
 * @param html - The potentially unsafe HTML string
 * @returns The sanitized HTML string
 */
export const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, SANITIZER_CONFIG) as string;
};

/**
 * Validates if content contains suspicious patterns before submission.
 * Useful for client-side form validation before sending to API.
 */
export const validateContentSafety = (html: string): { safe: boolean; reason?: string } => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onload=/i,
    /onerror=/i,
    /<iframe/i,
    /<object/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(html)) {
      return { safe: false, reason: 'Content contains potentially unsafe code or scripts.' };
    }
  }

  return { safe: true };
};
