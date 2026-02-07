import { BlogPost, Testimonial, JobPosting, SupportTicket, BlogCategory } from '../types';
import { db } from './db';
import { SEED_DATA } from '../data/seed';
import { isConfigured } from './supabase';
import { handleRequest } from './serviceUtils';

export interface IContentService {
  getAllBlogs(params?: { page?: number, limit?: number }): Promise<{ data: BlogPost[], total: number }>;
  getBlogBySlug(slug: string): Promise<BlogPost | undefined>;
  getBlogsByProvider(id: string): Promise<BlogPost[]>;
  createBlog(data: any): Promise<void>;
  updateBlog(id: string, data: any): Promise<void>;
  deleteBlog(id: string): Promise<void>;
  approveBlog(id: string): Promise<void>;
  
  getAllBlogCategories(): Promise<BlogCategory[]>;
  createBlogCategory(name: string): Promise<void>;
  deleteBlogCategory(id: string): Promise<void>;
  
  getTestimonials(page?: string): Promise<Testimonial[]>;
  createTestimonial(data: any): Promise<void>;
  deleteTestimonial(id: string): Promise<void>;
  
  getAllJobs(): Promise<JobPosting[]>;
  getJobById(id: string): Promise<JobPosting | undefined>;
  applyToJob(id: string, data: any): Promise<void>;
  createJob(job: Partial<JobPosting>): Promise<void>;
  deleteJob(id: string): Promise<void>;
  
  getTickets(userId?: string): Promise<SupportTicket[]>;
}

// =========================================================
// MOCK IMPLEMENTATION (Currently used for both environments in legacy)
// =========================================================

class MockContentService implements IContentService {
  async getAllBlogs(params?: { page?: number, limit?: number }): Promise<{ data: BlogPost[], total: number }> { 
    const all = await db.getBlogs(); 
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    return {
        data: all.slice(start, start + limit),
        total: all.length
    };
  }
  
  async getBlogBySlug(slug: string): Promise<BlogPost | undefined> { 
    const { data: all } = await this.getAllBlogs({ limit: 1000 }); 
    return all.find((b: BlogPost) => b.slug === slug); 
  }
  
  async getBlogsByProvider(id: string): Promise<BlogPost[]> { 
    const all = await db.getBlogs(); 
    return all.filter(b => b.providerId === id); 
  }
  
  async createBlog(data: any): Promise<void> { db.createBlog(data); }
  async updateBlog(id: string, data: any): Promise<void> { db.updateBlog(id, data); }
  async deleteBlog(id: string): Promise<void> { db.deleteBlog(id); }
  async approveBlog(id: string): Promise<void> { db.approveBlog(id); }
  
  async getAllBlogCategories(): Promise<BlogCategory[]> { return [{id:'1', name:'General'}]; }
  async createBlogCategory(name: string): Promise<void> {}
  async deleteBlogCategory(id: string): Promise<void> {}
  
  async getTestimonials(page?: string): Promise<Testimonial[]> { return db.getTestimonials(page); }
  async createTestimonial(data: any): Promise<void> {
    db.createTestimonial(data);
  }
  async deleteTestimonial(id: string): Promise<void> { db.deleteTestimonial(id); }
  
  async getAllJobs(): Promise<JobPosting[]> { 
    return JSON.parse(localStorage.getItem('evowell_jobs') || '[]'); 
  }
  
  async getJobById(id: string): Promise<JobPosting | undefined> { 
    return (await this.getAllJobs()).find(j => j.id === id); 
  }
  
  async applyToJob(id: string, data: any): Promise<void> {}
  
  async createJob(job: Partial<JobPosting>): Promise<void> {
      const newJob = { ...job, id: `job-${Date.now()}`, postedAt: new Date().toISOString() } as JobPosting;
      const jobs = await this.getAllJobs();
      localStorage.setItem('evowell_jobs', JSON.stringify([...jobs, newJob]));
  }
  
  async deleteJob(id: string): Promise<void> {
      const jobs = await this.getAllJobs();
      localStorage.setItem('evowell_jobs', JSON.stringify(jobs.filter(j => j.id !== id)));
  }
  
  async getTickets(userId?: string): Promise<SupportTicket[]> { return SEED_DATA.tickets; }
}

// =========================================================
// SUPABASE IMPLEMENTATION
// =========================================================
// For now, mirroring Mock implementation as per original API behavior
// In future, this should be replaced with real Supabase calls

class SupabaseContentService extends MockContentService {}

export const contentService = isConfigured ? new SupabaseContentService() : new MockContentService();
