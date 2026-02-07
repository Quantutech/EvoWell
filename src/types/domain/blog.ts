export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  authorName: string;
  authorRole: string;
  authorImage: string;
  readTime: string;
  imageUrl: string;
  publishedAt?: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  isFeatured?: boolean;
  providerId?: string;
  isAiGenerated?: boolean;
  moderationFlags?: string[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug?: string;
}


export interface BlogPostForm {
  id?: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  authorName?: string;
  authorRole?: string;
  authorImage?: string;
  readTime?: string;
  imageUrl: string;
  publishedAt?: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  isFeatured?: boolean;
  providerId?: string;
  isAiGenerated?: boolean;
  moderationFlags?: string[];
  slug?: string;
}