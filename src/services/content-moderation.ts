
/**
 * Content Moderation Service
 * Enforces safety guardrails for AI-generated content.
 */

const FORBIDDEN_PATTERNS = [
  /diagnos(e|is|ing)/i,  // Prevention of AI medical diagnosis
  /prescri(be|ption)/i,   // Prevention of AI prescribing
  /suicid(e|al)/i,        // Sensitive topic trigger
  /self[- ]harm/i,        // Sensitive topic trigger
  /kill(ing|ed)? (myself|yourself)/i,
  /guarantee(d|s)? cure/i, // False medical claims
  /miracle cure/i
];

export const REQUIRED_DISCLAIMERS = {
  bio: '\n\n[Disclaimer: This bio was AI-assisted and verified by the provider.]',
  blog: '\n\n[Disclaimer: This article is for informational purposes only and does not constitute medical advice. Always consult with a qualified healthcare provider.]',
};

export interface ModerationResult {
  approved: boolean;
  flags: string[];
  sanitizedContent: string;
}

class ContentModerationService {
  
  /**
   * Checks content against forbidden patterns and appends required disclaimers.
   */
  async moderateContent(
    content: string, 
    type: 'bio' | 'blog'
  ): Promise<ModerationResult> {
    const flags: string[] = [];
    
    // 1. Check Forbidden Patterns
    FORBIDDEN_PATTERNS.forEach(pattern => {
      if (pattern.test(content)) {
        flags.push(`Matched pattern: ${pattern.toString()}`);
      }
    });

    // 2. Hallucination Guard (Basic Heuristic)
    if (content.includes("[Insert") || content.includes("[Your Name]")) {
      flags.push("Contains placeholder text (possible incomplete generation)");
    }

    // 3. Append Disclaimer if missing
    const disclaimer = REQUIRED_DISCLAIMERS[type];
    let sanitizedContent = content;
    
    if (disclaimer && !content.includes(disclaimer)) {
      sanitizedContent += disclaimer;
    }

    // If flags exist, we still return content but mark as not approved for auto-publishing
    // The calling service/UI should decide whether to block it or show a warning.
    return {
      approved: flags.length === 0,
      flags,
      sanitizedContent
    };
  }
}

export const contentModerationService = new ContentModerationService();
