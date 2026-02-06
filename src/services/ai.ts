
import { supabase } from './supabase';
import { contentModerationService } from './content-moderation';
import { AuditResourceType } from '../types';

// System Prompts for Safety
const BIO_SYSTEM_PROMPT = `
You are an assistant writing a professional bio for a mental health provider.
RULES:
- Do NOT make specific medical claims or promise cures.
- Do NOT mention specific diagnoses the provider can treat unless provided in context.
- Focus on credentials, therapeutic approach, and experience.
- Keep tone warm, professional, and empathetic.
- Do NOT fabricate credentials, awards, or university affiliations.
- Output should be 150-200 words.
`;

const BLOG_SYSTEM_PROMPT = `
You are an assistant drafting a wellness article for a clinical platform.
RULES:
- Content must be informational, NOT medical advice.
- Do NOT diagnose or prescribe.
- Use evidence-based tone but accessible language.
- Include a structure with clear headings.
- Avoid sensitive topics like self-harm or severe crisis management in detail; refer to emergency services instead.
`;

class AiService {
  
  /**
   * Generates text content by calling the secure Edge Function with safety guardrails.
   */
  async generateContent(prompt: string, context?: string): Promise<{ text: string; flags: string[] }> {
    try {
      const fullPrompt = `${BIO_SYSTEM_PROMPT}\n\n${context ? `Context: ${context}\n` : ''}Task: ${prompt}`;

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          action: 'generate_content', 
          prompt: fullPrompt
        }
      });

      if (error) throw error;

      // Moderate the output
      const moderation = await contentModerationService.moderateContent(data.text || '', 'bio');
      
      // Log the generation
      await this.logGeneration('bio', fullPrompt, moderation.sanitizedContent, moderation.flags);

      return { 
        text: moderation.sanitizedContent,
        flags: moderation.flags
      };

    } catch (error) {
      console.error("AI Service Error:", error);
      throw new Error("AI service unavailable.");
    }
  }

  /**
   * Generates a blog post draft with safety guardrails.
   */
  async generateBlogPost(topic: string, authorRole: string): Promise<{ title: string; content: string; flags: string[] }> {
    try {
      // We inject the system prompt into the request to the edge function
      // The edge function for 'generate_blog' constructs specific JSON format instructions, 
      // so we append our guidelines to the prompt payload.
      const safetyContext = `${BLOG_SYSTEM_PROMPT}\n\nTopic: ${topic}`;

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          action: 'generate_blog', 
          prompt: safetyContext, 
          authorRole 
        }
      });

      if (error) throw error;

      const jsonResponse = JSON.parse(data.text);
      let content = jsonResponse.content || "";
      const title = jsonResponse.title || `Draft: ${topic}`;

      // Moderate
      const moderation = await contentModerationService.moderateContent(content, 'blog');
      
      // Log
      await this.logGeneration('blog', safetyContext, moderation.sanitizedContent, moderation.flags);

      return {
        title,
        content: moderation.sanitizedContent,
        flags: moderation.flags
      };

    } catch (error) {
      console.error("Blog Generation Error:", error);
      return { 
        title: `Draft: ${topic}`, 
        content: "<p>Could not auto-generate content. Please start writing manually...</p>",
        flags: ['Generation failed'] 
      };
    }
  }

  /**
   * Internal logging to the new ai_audit_logs table
   */
  private async logGeneration(type: string, prompt: string, output: string, flags: string[]) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.from('ai_audit_logs').insert({
        user_id: session.user.id,
        request_type: type,
        prompt_used: prompt,
        generated_content: output,
        is_flagged: flags.length > 0,
        flags: flags
      });
    } catch (e) {
      console.warn("Failed to audit AI generation", e);
    }
  }
}

export const aiService = new AiService();
