import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigation, useAuth } from '../App';
import { BlogPost, UserRole } from '../types';
import Breadcrumb from '../components/Breadcrumb';
import { PageHero, Section, Container, Grid } from '../components/layout';
import { Button, Card, CardBody, Badge, Tag } from '../components/ui';
import { Heading, Text, Label } from '../components/typography';

const BlogListView: React.FC = () => {
  const { navigate } = useNavigation();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('View all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['View all', 'Mental Health', 'Wellness', 'Nutrition', 'Lifestyle', 'Design', 'Product'];

  useEffect(() => {
    api.getAllBlogs().then(data => {
      const visibleBlogs = data.filter(b => b.status === 'APPROVED' || user?.role === UserRole.ADMIN);
      setBlogs(visibleBlogs);
      setLoading(false);
    });
  }, [user]);

  const filteredBlogs = blogs.filter(b => {
    const matchesCategory = activeCategory === 'View all' || b.category === activeCategory;
    const matchesQuery = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         b.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const featured = filteredBlogs.find(b => b.isFeatured && b.status === 'APPROVED') || filteredBlogs[0];
  const regularPosts = filteredBlogs.filter(b => b.id !== featured?.id);

  if (loading) return <div className="pt-40 text-center text-slate-500 animate-pulse font-black uppercase tracking-widest">Resources loading...</div>;

  return (
    <div className="bg-[#fbfcff] min-h-screen">
      <Breadcrumb items={[{ label: 'Wellness Blog' }]} />

      <PageHero
        overline="Our Blog"
        title="Resources & Insights"
        description="The latest clinical news, wellness strategies, and community stories."
        variant="left-aligned"
        actions={
          user?.role === UserRole.ADMIN ? (
            <Button variant="primary" onClick={() => navigate('#/dashboard')}>Admin Console</Button>
          ) : undefined
        }
      />

      <Section spacing="md" background="default">
        <Container>
          {featured && (
            <Card 
              variant="default" 
              size="lg" 
              className="mb-16 p-0 overflow-hidden cursor-pointer group" 
              onClick={() => navigate(`#/blog/${featured.slug}`)}
            >
              <div className="grid lg:grid-cols-2">
                <div className="aspect-video lg:aspect-auto overflow-hidden relative">
                  <img src={featured.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-10 lg:p-16 flex flex-col justify-center relative bg-white">
                  <div className="flex items-center gap-4 mb-6">
                     <Badge variant="brand">{featured.category}</Badge>
                     <Label variant="badge" color="muted">{featured.readTime} • {featured.publishedAt}</Label>
                     {featured.status && featured.status !== 'APPROVED' && <Badge variant="warning">{featured.status}</Badge>}
                  </div>
                  <Heading level={2} className="mb-6 group-hover:text-brand-600 transition-colors">{featured.title}</Heading>
                  <Text variant="lead" className="mb-8">{featured.summary}</Text>
                  <div className="flex items-center gap-4">
                     <img src={featured.authorImage} className="w-12 h-12 rounded-full border-2 border-slate-50 shadow-sm object-cover" alt="" />
                     <div>
                        <Text variant="small" weight="bold">{featured.authorName}</Text>
                        <Text variant="caption" color="muted">{featured.authorRole}</Text>
                     </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row justify-between gap-6 mb-12 sticky top-24 z-20 bg-[#fbfcff]/95 backdrop-blur-sm py-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
              {categories.map(cat => (
                <Tag 
                  key={cat} 
                  selected={activeCategory === cat} 
                  onSelect={() => setActiveCategory(cat)}
                >
                  {cat}
                </Tag>
              ))}
            </div>
            <div className="relative w-full lg:w-72 group">
               <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               <input 
                  type="text" 
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none shadow-sm transition-all"
               />
            </div>
          </div>

          <Grid cols={3} gap="lg">
            {regularPosts.map((post) => (
              <Card key={post.id} className="cursor-pointer group flex flex-col h-full p-0 overflow-hidden" onClick={() => navigate(`#/blog/${post.slug}`)}>
                <div className="aspect-[4/3] overflow-hidden relative border-b border-slate-100 bg-slate-50">
                   <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                   <div className="absolute top-4 left-4">
                      <Badge variant="neutral" className="bg-white/90 backdrop-blur-md">{post.category}</Badge>
                   </div>
                </div>
                <CardBody className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <Label variant="badge" color="muted">{post.publishedAt} • {post.readTime}</Label>
                  </div>
                  <Heading level={4} className="mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">{post.title}</Heading>
                  <Text variant="small" color="muted" className="line-clamp-3 mb-6">{post.summary}</Text>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-50 mt-auto">
                     <img src={post.authorImage} className="w-8 h-8 rounded-full border border-slate-100 object-cover" alt="" />
                     <div>
                        <Text variant="caption" weight="bold">{post.authorName}</Text>
                        <Text variant="caption" color="muted" className="text-[10px]">{post.authorRole}</Text>
                     </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </Grid>
          
          {regularPosts.length === 0 && featured === undefined && (
             <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <Text color="muted" weight="bold">No articles found matching your criteria.</Text>
                <Button variant="ghost" onClick={() => { setSearchQuery(''); setActiveCategory('View all'); }} className="mt-4">Clear Filters</Button>
             </div>
          )}
        </Container>
      </Section>
    </div>
  );
};
export default BlogListView;