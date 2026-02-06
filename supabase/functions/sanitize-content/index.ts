
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import DOMPurify from "https://esm.sh/dompurify@3.0.9";
import { JSDOM } from "https://esm.sh/jsdom@24.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content } = await req.json();

    if (!content) {
      throw new Error('No content provided');
    }

    // Set up DOMPurify in Node/Deno environment
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);

    const clean = purify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'blockquote', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'class'],
      FORBID_TAGS: ['script', 'iframe', 'object'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'style']
    });

    return new Response(
      JSON.stringify({ sanitized: clean }),
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
        status: 400
      }
    )
  }
})
