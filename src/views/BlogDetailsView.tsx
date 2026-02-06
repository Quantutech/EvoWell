import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigation } from '../App';
import { BlogPost } from '../types';
import Breadcrumb from '../components/Breadcrumb';
import { sanitizeHTML } from '../utils/content-sanitizer';
import { Section, Container } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button, Card, Badge, Tag } from '../components/ui';

const BlogDetailsView: React.FC<{ slug: string }> = ({ slug }) => {
  const { navigate } = useNavigation();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [latest, setLatest] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [sanitizedContent, setSanitizedContent] = useState('');

  useEffect(() => {
    Promise.all([
      api.getBlogBySlug(slug),
      api.getAllBlogs()
    ]).then(([b, all]) => {
      setBlog(b || null);
      if (b && b.content) {
        setSanitizedContent(sanitizeHTML(b.content));
      }
      setLatest(all.filter(x => x.slug !== slug && x.status === 'APPROVED').slice(0, 3));
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="pt-40 text-center text-slate-400 animate-pulse font-black uppercase tracking-widest">Opening clinical resource...</div>;
  if (!blog) return <div className="pt-40 text-center text-slate-400 font-medium">Blog post not found. <Button variant="ghost" onClick={() => navigate('#/blog')}>Back to Blog</Button></div>;

  return (
    <div className="bg-white min-h-screen">
      <Breadcrumb items={[{ label: 'Blog', href: '#/blog' }, { label: 'Article' }]} />

      <Section spacing="sm">
        <Container size="content">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <div className="flex items-center gap-4 mb-6 justify-center">
              <Badge variant="brand">{blog.category}</Badge>
              <Label variant="badge" color="muted">{blog.readTime} • {blog.publishedAt}</Label>
            </div>
            <Heading level={1} size="display" className="mb-8">{blog.title}</Heading>
            <Text variant="lead" color="secondary" className="mb-10">{blog.summary}</Text>
            
            <div className="flex items-center justify-center gap-4 mb-12">
               <img src={blog.authorImage} className="w-12 h-12 rounded-full border-2 border-slate-50 shadow-sm object-cover" alt="" />
               <div className="text-left">
                  <Text variant="small" weight="bold">{blog.authorName}</Text>
                  <Text variant="caption" color="muted">{blog.authorRole}</Text>
               </div>
            </div>
          </div>

          <div className="aspect-[21/9] rounded-[3rem] overflow-hidden mb-20 shadow-2xl border border-slate-100 max-w-6xl mx-auto">
             <img src={blog.imageUrl} className="w-full h-full object-cover" alt={blog.title} />
          </div>

          <div className="flex flex-col lg:flex-row gap-20 items-start max-w-6xl mx-auto">
             <aside className="hidden lg:block w-48 shrink-0 sticky top-32 space-y-12">
                <div>
                  <Label variant="overline" color="muted" className="mb-6">Share Article</Label>
                  <div className="flex flex-col gap-4">
                     <Button variant="ghost" className="w-10 h-10 p-0 flex items-center justify-center rounded-full border border-slate-100">🔗</Button>
                  </div>
                </div>
             </aside>

             <article className="flex-grow max-w-3xl">
                <div 
                  className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:font-medium prose-a:text-brand-600 hover:prose-a:text-brand-700"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />

                <Card variant="default" className="mt-20 bg-slate-900 text-white border-none p-12 text-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-[80px]"></div>
                   <div className="relative z-10">
                      <Heading level={3} color="white" className="mb-4">Subscribe to our Clinical Digest</Heading>
                      <Text color="muted" className="mb-8 max-w-md mx-auto">Get the latest evidence-based wellness strategies delivered to your inbox weekly.</Text>
                      <div className="flex max-w-md mx-auto bg-white/10 p-1 rounded-2xl border border-white/10 backdrop-blur-sm">
                         <input 
                            type="email" 
                            placeholder="email@address.com" 
                            className="flex-grow bg-transparent border-none text-white px-4 py-2 placeholder:text-slate-500 focus:ring-0 outline-none text-sm font-medium"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                         />
                         <Button size="sm" variant="brand">Subscribe</Button>
                      </div>
                   </div>
                </Card>

                <div className="flex flex-wrap gap-2 pt-10 mt-12 border-t border-slate-100">
                   {['Mental Health', 'Wellness', 'Science', 'Therapy'].map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                   ))}
                </div>
             </article>
          </div>

          <div className="mt-32 pt-20 border-t border-slate-100 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <Heading level={2}>Related Articles</Heading>
              <Button variant="ghost" onClick={() => navigate('#/blog')}>View All</Button>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {latest.map((post) => (
                <div key={post.id} onClick={() => navigate(`#/blog/${post.slug}`)} className="group cursor-pointer">
                  <div className="aspect-[16/10] rounded-[2rem] overflow-hidden mb-6 shadow-sm border border-slate-100 bg-slate-50 relative">
                     <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                     <div className="absolute top-4 left-4">
                        <Badge variant="neutral" className="bg-white/90 backdrop-blur-md">{post.category}</Badge>
                     </div>
                  </div>
                  <Heading level={4} className="mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">{post.title}</Heading>
                  <Text variant="small" color="muted" className="line-clamp-2">{post.summary}</Text>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};
export default BlogDetailsView;