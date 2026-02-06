
import { supabase } from './supabase';

class AiService {
  
  /**
   * Generates text content by calling the secure Edge Function.
   */
  async generateContent(prompt: string, context?: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          action: 'generate_content', 
          prompt, 
          context 
        }
      });

      if (error) {
        console.error('Edge Function Error:', error);
        throw error;
      }

      return data.text || "I couldn't generate a response at this time.";
    } catch (error) {
      console.error("AI Service Error:", error);
      return "AI service is currently unavailable. Please try again later.";
    }
  }

  /**
   * Generates a blog post draft via Edge Function.
   */
  async generateBlogPost(topic: string, authorRole: string): Promise<{ title: string; content: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          action: 'generate_blog', 
          prompt: topic, 
          authorRole 
        }
      });

      if (error) {
        console.error('Edge Function Error:', error);
        throw error;
      }

      // The Edge Function returns JSON string in the 'text' field for blog posts
      const jsonResponse = JSON.parse(data.text);
      
      return {
        title: jsonResponse.title || `Draft: ${topic}`,
        content: jsonResponse.content || "<p>Could not parse generated content.</p>"
      };

    } catch (error) {
      console.error("Blog Generation Error:", error);
      return { 
        title: `Draft: ${topic}`, 
        content: "<p>Could not auto-generate content. Please start writing manually...</p>" 
      };
    }
  }
}

export const aiService = new AiService();
