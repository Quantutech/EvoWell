import React, { useMemo } from 'react';

interface SEOAnalysis {
  score: number;
  suggestions: string[];
}

interface SEOPreviewProps {
  title: string;
  description: string;
  content: string;
  slug: string;
}

export const SEOPreview: React.FC<SEOPreviewProps> = ({ title, description, content, slug }) => {
  const analysis = useMemo<SEOAnalysis>(() => {
    const suggestions: string[] = [];
    let score = 100;

    if (title.length < 30) { score -= 10; suggestions.push('Title is too short (min 30 chars)'); }
    if (title.length > 60) { score -= 10; suggestions.push('Title is too long (max 60 chars)'); }
    if (description.length < 120) { score -= 15; suggestions.push('Meta description is too short (min 120 chars)'); }
    if (content.split(' ').length < 300) { score -= 20; suggestions.push('Content length is low for SEO (aim for 300+ words)'); }
    if (!content.includes('<img')) { score -= 5; suggestions.push('Add at least one image with alt text'); }

    return { score: Math.max(0, score), suggestions };
  }, [title, description, content]);

  return (
    <div className="space-y-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">SEO Optimizer</h3>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase">Health Score</span>
            <div className={`px-3 py-1 rounded-full text-xs font-black ${
                analysis.score > 80 ? 'bg-green-100 text-green-700' :
                analysis.score > 50 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
            }`}>
                {analysis.score}/100
            </div>
        </div>
      </div>

      {/* Google Preview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1 max-w-xl">
         <p className="text-[10px] text-slate-500 font-mono">evowell.com {' > '} blog {' > '} {slug || '...'}</p>
         <h4 className="text-xl text-[#1a0dab] hover:underline cursor-pointer font-medium">{title || 'Page Title Preview'}</h4>
         <p className="text-sm text-[#4d5156] line-clamp-2">{description || 'Please provide a meta description to see how your post will appear in Google search results...'}</p>
      </div>

      {/* Improvement Suggestions */}
      <div className="space-y-3">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actionable Improvements</p>
         <div className="grid gap-2">
            {analysis.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100 text-[11px] font-bold text-slate-600">
                   <span className="text-amber-500">⚡</span>
                   {s}
                </div>
            ))}
            {analysis.suggestions.length === 0 && (
                <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl border border-green-100 text-[11px] font-bold text-green-700">
                    <span className="text-lg">🎉</span>
                    This content is fully optimized for search engines!
                </div>
            )}
         </div>
      </div>
    </div>
  );
};
