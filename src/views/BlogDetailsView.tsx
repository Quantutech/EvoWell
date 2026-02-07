import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { useNavigation } from '../App';
import { BlogPost } from '../types';
import Breadcrumb from '../components/Breadcrumb';
import { sanitizeHTML } from '../utils/content-sanitizer';
import { Container } from '../components/layout';
import { Heading, Text } from '../components/typography';
import { Button, Badge } from '../components/ui';
import SEO from '../components/SEO';

/* ─── Reading progress bar ───────────────────────────────────────────── */

const ReadingProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1.5 z-[100] bg-transparent pointer-events-none">
      <div
        className="h-full bg-brand-500 transition-[width] duration-150 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

/* ─── Loading skeleton ───────────────────────────────────────────────── */

const ArticleSkeleton: React.FC = () => (
  <div className="bg-white min-h-screen animate-pulse pt-20">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-12 gap-12">
      <div className="col-span-3 space-y-4 pt-10">
        {[...Array(5)].map((_, i) => <div key={i} className="h-3 bg-slate-50 rounded w-3/4" />)}
      </div>
      <div className="col-span-9 space-y-8">
        <div className="h-12 w-3/4 bg-slate-100 rounded-xl" />
        <div className="h-[400px] bg-slate-50 rounded-3xl" />
      </div>
    </div>
  </div>
);

/* ─── Main view ──────────────────────────────────────────────────────── */

const BlogDetailsView: React.FC<{ slug: string }> = ({ slug }) => {
  const { navigate } = useNavigation();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [latest, setLatest] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [sanitizedContent, setSanitizedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);

    Promise.all([
      api.getBlogBySlug(slug),
      api.getAllBlogs({ limit: 100 }),
    ]).then(([b, allResponse]) => {
      const all = allResponse.data || [];
      setBlog(b || null);
      if (b && b.content) {
        setSanitizedContent(sanitizeHTML(b.content));
        
        // Simple TOC extraction
        const doc = new DOMParser().parseFromString(b.content, 'text/html');
        const headings = Array.from(doc.querySelectorAll('h2, h3')).map(h => ({
          id: h.getAttribute('id') || h.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '',
          text: h.textContent || '',
          level: parseInt(h.tagName[1])
        }));
        setToc(headings);
      }
      const others = all.filter(x => x.slug !== slug && x.status === 'APPROVED');
      const sameCategory = others.filter(x => x.category === b?.category);
      const different = others.filter(x => x.category !== b?.category);
      setLatest([...sameCategory, ...different].slice(0, 3));
      setLoading(false);
    });
  }, [slug]);

  const formatDate = useCallback((dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const shareActions = [
    { label: 'LinkedIn', icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
    ), action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank') },
    { label: 'X', icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    ), action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog?.title || '')}&url=${encodeURIComponent(window.location.href)}`, '_blank') },
    { label: 'Facebook', icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    ), action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank') }
  ];

  if (loading) return <ArticleSkeleton />;

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-[#fbfcff]">
        <div className="text-6xl">📄</div>
        <Heading level={2} className="text-slate-900">Article not found</Heading>
        <Button variant="secondary" onClick={() => navigate('#/blog')} className="rounded-xl px-8">Back to Writing</Button>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfcff] min-h-screen font-sans selection:bg-brand-100 selection:text-brand-900">
      <SEO 
        title={blog.title}
        description={blog.summary}
        image={blog.imageUrl}
        type="article"
        url={`/blog/${blog.slug}`}
      />
      <ReadingProgressBar />
      
      {/* ── Lean Light Hero Section ────────────────── */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50/20 pt-20 pb-12 px-6 relative overflow-hidden border-b border-slate-100">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-brand-600">
                <span className="bg-brand-50 px-2 py-0.5 rounded">{blog.category}</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                {blog.title}
              </h1>

              <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
                {blog.summary}
              </p>

              {/* Author & Publication Box */}
              <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-xl p-3 rounded-2xl border border-slate-100 shadow-sm">
                {blog.authorImage ? (
                  <img 
                    src={blog.authorImage} 
                    className={`w-10 h-10 rounded-xl object-cover ${blog.providerId ? 'cursor-pointer hover:ring-2 hover:ring-brand-500 transition-all' : ''}`} 
                    alt="" 
                    onClick={() => blog.providerId && navigate(`#/provider/${blog.providerId}`)}
                  />
                ) : (
                  <div 
                    className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-100 ${blog.providerId ? 'cursor-pointer hover:bg-slate-100 transition-all' : ''}`}
                    onClick={() => blog.providerId && navigate(`#/provider/${blog.providerId}`)}
                  >
                    {blog.authorName?.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col pr-2">
                  {blog.providerId ? (
                    <button 
                      onClick={() => navigate(`#/provider/${blog.providerId}`)}
                      className="text-xs font-black text-slate-900 hover:text-brand-600 transition-colors text-left"
                    >
                      {blog.authorName}
                    </button>
                  ) : (
                    <span className="text-xs font-black text-slate-900">{blog.authorName}</span>
                  )}
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>{formatDate(blog.publishedAt)}</span>
                    <span className="text-slate-200">•</span>
                    <span>{blog.readTime || '5 min read'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Image */}
            {blog.imageUrl && (
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden border-[4px] border-white shadow-xl">
                  <img src={blog.imageUrl} className="w-full h-full object-cover" alt="" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Main content grid with TOC ────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Table of Contents */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28">
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">On this page</h4>
                <nav className="space-y-3">
                  {toc.length > 0 ? toc.map((item, i) => (
                    <a 
                      key={i} 
                      href={`#${item.id}`}
                      className={`block text-xs font-bold transition-all hover:text-brand-600 ${item.level === 3 ? 'pl-4 text-slate-400' : 'text-slate-500'}`}
                    >
                      {item.text}
                    </a>
                  )) : (
                    <span className="text-xs text-slate-400 italic">Reading mode active</span>
                  )}
                </nav>
              </div>
              
              <div className="pt-8 border-t border-slate-50">
                 <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Share</h4>
                 <div className="flex gap-2">
                    {shareActions.map(s => (
                      <button 
                        key={s.label} 
                        onClick={s.action}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-500 hover:border-brand-200 transition-all shadow-sm"
                      >
                        {s.icon}
                      </button>
                    ))}
                 </div>
              </div>
            </div>
          </aside>

          {/* MIDDLE: Article Body */}
          <main className="lg:col-span-9 max-w-3xl">
            <article ref={articleRef} className="bg-white p-8 md:p-12 lg:p-16 rounded-[2.5rem] border border-slate-50 shadow-sm shadow-slate-100">
              <div
                className="prose prose-slate prose-lg max-w-none 
                  prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight
                  prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:scroll-mt-32
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:scroll-mt-32
                  prose-p:text-slate-600 prose-p:leading-[1.8] prose-p:mb-6 prose-p:text-[1.05rem]
                  prose-a:text-brand-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-4 prose-blockquote:border-brand-500 prose-blockquote:bg-brand-50/20 prose-blockquote:rounded-r-2xl prose-blockquote:py-2 prose-blockquote:px-8 prose-blockquote:not-italic prose-blockquote:font-medium
                  prose-img:rounded-[1.5rem] prose-img:shadow-lg prose-img:my-10
                  prose-li:text-slate-600 prose-strong:text-slate-900 prose-hr:my-12"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />

              {/* ── Newsletter Dispatch ───────────────────── */}
              <div className="mt-16 bg-brand-50/30 border border-brand-100/50 rounded-[2rem] p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-slate-900 mb-1">The Dispatch</h3>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                      Join 5,000+ professionals getting weekly wellness strategies.
                    </p>
                  </div>
                  <div className="w-full md:w-auto md:min-w-[300px]">
                    {subscribed ? (
                      <div className="bg-white border border-brand-200 rounded-xl p-3 text-center animate-in zoom-in-95">
                        <p className="text-brand-600 font-bold text-xs">✓ You're in!</p>
                      </div>
                    ) : (
                      <div className="flex bg-white p-1 rounded-xl border border-slate-200 focus-within:border-brand-400 transition-all shadow-sm">
                         <input
                            type="email"
                            placeholder="Email address"
                            className="flex-grow bg-transparent border-none text-slate-800 px-4 py-2 placeholder:text-slate-400 focus:ring-0 outline-none text-sm font-medium min-w-0"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                         />
                         <button
                           onClick={() => { if(email) setSubscribed(true); }}
                           className="bg-slate-900 text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                         >
                           Join
                         </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </main>
        </div>
      </div>

      {/* ── Related articles ──────────────────────────────── */}
      {latest.length > 0 && (
        <div className="bg-white border-t border-slate-100 py-16">
          <Container>
            <div className="flex items-end justify-between mb-10">
              <Heading level={2} className="text-2xl font-black">Related Reading</Heading>
              <button onClick={() => navigate('#/blog')} className="text-xs font-bold text-brand-600 hover:text-brand-800">
                View all →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latest.map(post => (
                <div
                  key={post.id}
                  onClick={() => navigate(`#/blog/${post.slug}`)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-slate-100 border border-slate-50 group-hover:shadow-lg transition-all duration-300">
                     <img
                       src={post.imageUrl}
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                       alt=""
                     />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">{post.category}</span>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </div>
      )}
    </div>
  );
};

export default BlogDetailsView;
