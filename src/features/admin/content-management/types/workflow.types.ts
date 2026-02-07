export type ContentStatus = 
  | 'DRAFT' 
  | 'INTERNAL_REVIEW' 
  | 'SEO_REVIEW' 
  | 'LEGAL_REVIEW' 
  | 'APPROVED' 
  | 'PUBLISHED' 
  | 'ARCHIVED';

export type ContentType = 'BLOG_POST' | 'TESTIMONIAL' | 'RESOURCE' | 'PAGE';

export interface WorkflowState {
  status: ContentStatus;
  label: string;
  color: string;
  allowedRoles: string[];
  nextPossibleStates: ContentStatus[];
}

export const CONTENT_WORKFLOW: Record<ContentStatus, WorkflowState> = {
  DRAFT: {
    status: 'DRAFT',
    label: 'Draft',
    color: 'bg-slate-100 text-slate-600',
    allowedRoles: ['ADMIN', 'EDITOR', 'PROVIDER'],
    nextPossibleStates: ['INTERNAL_REVIEW']
  },
  INTERNAL_REVIEW: {
    status: 'INTERNAL_REVIEW',
    label: 'Internal Review',
    color: 'bg-blue-100 text-blue-700',
    allowedRoles: ['ADMIN', 'EDITOR'],
    nextPossibleStates: ['DRAFT', 'SEO_REVIEW', 'APPROVED']
  },
  SEO_REVIEW: {
    status: 'SEO_REVIEW',
    label: 'SEO Optimization',
    color: 'bg-purple-100 text-purple-700',
    allowedRoles: ['ADMIN', 'SEO_SPECIALIST'],
    nextPossibleStates: ['INTERNAL_REVIEW', 'APPROVED']
  },
  LEGAL_REVIEW: {
    status: 'LEGAL_REVIEW',
    label: 'Legal Compliance',
    color: 'bg-amber-100 text-amber-700',
    allowedRoles: ['ADMIN', 'LEGAL'],
    nextPossibleStates: ['DRAFT', 'APPROVED']
  },
  APPROVED: {
    status: 'APPROVED',
    label: 'Approved',
    color: 'bg-green-100 text-green-700',
    allowedRoles: ['ADMIN'],
    nextPossibleStates: ['PUBLISHED', 'DRAFT']
  },
  PUBLISHED: {
    status: 'PUBLISHED',
    label: 'Published',
    color: 'bg-emerald-500 text-white',
    allowedRoles: ['ADMIN'],
    nextPossibleStates: ['ARCHIVED', 'DRAFT']
  },
  ARCHIVED: {
    status: 'ARCHIVED',
    label: 'Archived',
    color: 'bg-slate-900 text-white',
    allowedRoles: ['ADMIN'],
    nextPossibleStates: ['DRAFT']
  }
};
