
import { Message, BlogPost, Testimonial } from '../types';
import { SEED_DATA } from '../data/seed';

/**
 * @deprecated HYBRID LEGACY ADAPTER
 * This service manages client-side mock data for entities not yet migrated to Supabase 
 * (Blogs, Testimonials, Messages).
 * 
 * Users and Providers are now managed by Supabase/RLS. 
 * Do NOT use this for Authentication or Profile data.
 */
class Database {
  private KEYS = {
    MESSAGES: 'evowell_messages',
    BLOGS: 'evowell_blogs_v2', // Updated to force re-seed with new images
    TESTIMONIALS: 'evowell_testimonials',
    TICKETS: 'evowell_tickets',
    JOBS: 'evowell_jobs',
    INSURANCE: 'evowell_insurance',
    CATEGORIES: 'evowell_blog_categories'
  };

  private memoryStore: Record<string, any> = {};
  private useMemory = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!this.getItem(this.KEYS.INSURANCE)) this.setItem(this.KEYS.INSURANCE, JSON.stringify(SEED_DATA.insurance));
      if (!this.getItem(this.KEYS.BLOGS)) this.setItem(this.KEYS.BLOGS, JSON.stringify(SEED_DATA.blogs));
      if (!this.getItem(this.KEYS.TESTIMONIALS)) this.setItem(this.KEYS.TESTIMONIALS, JSON.stringify(SEED_DATA.testimonials));
      if (!this.getItem(this.KEYS.TICKETS)) this.setItem(this.KEYS.TICKETS, JSON.stringify(SEED_DATA.tickets));
      if (!this.getItem(this.KEYS.MESSAGES)) this.setItem(this.KEYS.MESSAGES, JSON.stringify(SEED_DATA.messages));
      if (!this.getItem(this.KEYS.JOBS)) this.setItem(this.KEYS.JOBS, JSON.stringify(SEED_DATA.jobs));
      if (!this.getItem(this.KEYS.CATEGORIES)) this.setItem(this.KEYS.CATEGORIES, JSON.stringify(SEED_DATA.categories));
    } catch (e) {
      console.warn("LocalStorage unavailable, falling back to memory store.");
      this.useMemory = true;
      this.memoryStore[this.KEYS.INSURANCE] = JSON.stringify(SEED_DATA.insurance);
      this.memoryStore[this.KEYS.BLOGS] = JSON.stringify(SEED_DATA.blogs);
      this.memoryStore[this.KEYS.TESTIMONIALS] = JSON.stringify(SEED_DATA.testimonials);
      this.memoryStore[this.KEYS.TICKETS] = JSON.stringify(SEED_DATA.tickets);
      this.memoryStore[this.KEYS.MESSAGES] = JSON.stringify(SEED_DATA.messages);
      this.memoryStore[this.KEYS.JOBS] = JSON.stringify(SEED_DATA.jobs);
      this.memoryStore[this.KEYS.CATEGORIES] = JSON.stringify(SEED_DATA.categories);
    }
  }

  private getItem(key: string): string | null {
    if (this.useMemory) return this.memoryStore[key] || null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      this.useMemory = true;
      return null;
    }
  }

  private setItem(key: string, value: string): void {
    if (this.useMemory) {
      this.memoryStore[key] = value;
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("LocalStorage save failed, falling back to memory store", e);
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        alert("Warning: The content is too large to save permanently in this browser. Some formatting or large images might be lost on reload.");
      }
      this.useMemory = true;
      this.memoryStore[key] = value;
    }
  }

  getMessages(): Message[] { 
    const raw = JSON.parse(this.getItem(this.KEYS.MESSAGES) || '[]');
    return Array.isArray(raw) ? raw.filter((m: any) => m && m.id) : [];
  }
  
  saveMessages(msgs: Message[]) { this.setItem(this.KEYS.MESSAGES, JSON.stringify(msgs)); }
  
  createMessage(data: Omit<Message, 'id' | 'created_at'>): Message {
    const msgs = this.getMessages();
    const newMessage: Message = {
      ...data,
      id: `msg-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.saveMessages([...msgs, newMessage]);
    return newMessage;
  }

  getBlogs(): BlogPost[] {
    const raw = JSON.parse(this.getItem(this.KEYS.BLOGS) || '[]');
    return Array.isArray(raw) ? raw : [];
  }

  saveBlogs(blogs: BlogPost[]) {
    this.setItem(this.KEYS.BLOGS, JSON.stringify(blogs));
  }

  createBlog(data: Partial<BlogPost>): void {
    const blogs = this.getBlogs();
    const newBlog = {
        ...data,
        id: data.id || `blog-${Date.now()}`,
    } as BlogPost;
    this.saveBlogs([...blogs, newBlog]);
  }

  updateBlog(id: string, data: Partial<BlogPost>): void {
    const blogs = this.getBlogs();
    const updated = blogs.map(b => b.id === id ? { ...b, ...data } : b);
    this.saveBlogs(updated);
  }

  deleteBlog(id: string): void {
    const blogs = this.getBlogs();
    this.saveBlogs(blogs.filter(b => b.id !== id));
  }

  // Added missing approveBlog method to support Admin API functionality
  approveBlog(id: string): void {
    this.updateBlog(id, { status: 'APPROVED' });
  }

  getTestimonials(page?: string): Testimonial[] {
    const raw = JSON.parse(this.getItem(this.KEYS.TESTIMONIALS) || '[]');
    const all = Array.isArray(raw) ? raw : [];
    if (page && page !== 'all') {
      return all.filter((t: Testimonial) => t.page === page);
    }
    return all;
  }

  deleteTestimonial(id: string): void {
    const testimonials = this.getTestimonials();
    const filtered = testimonials.filter(t => t.id !== id);
    this.setItem(this.KEYS.TESTIMONIALS, JSON.stringify(filtered));
  }

  createTestimonial(data: Partial<Testimonial>): void {
    const testimonials = this.getTestimonials();
    const newTestimonial = {
      ...data,
      id: data.id || `testimonial-${Date.now()}`,
    } as Testimonial;
    this.setItem(this.KEYS.TESTIMONIALS, JSON.stringify([...testimonials, newTestimonial]));
  }
}

export const db = new Database();
