
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI } from "https://esm.sh/@google/genai@0.1.3"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_GENAI_KEY');
    if (!apiKey) {
      throw new Error('Missing GOOGLE_GENAI_KEY in Edge Function secrets');
    }

    const ai = new GoogleGenAI({ apiKey });
    const { action, prompt, context, authorRole } = await req.json();

    let resultText = '';

    if (action === 'generate_content') {
      const fullPrompt = context 
        ? `Context: ${context}\n\nTask: ${prompt}` 
        : prompt;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: fullPrompt,
        config: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        }
      });
      resultText = response.text || "No response generated.";

    } else if (action === 'generate_blog') {
      const fullPrompt = `Write a professional, engaging blog post about "${prompt}". 
      The author is a ${authorRole || 'Health Professional'}. 
      Format the output as JSON with keys: "title" and "content". 
      The content should be approximately 300 words, formatted with HTML paragraphs <p>.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: fullPrompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      resultText = response.text || "{}";
    } else {
      throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ text: resultText }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})