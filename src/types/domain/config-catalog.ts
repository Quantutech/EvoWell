import { StaffRole } from './access';

export type ConfigCatalogKey =
  | 'specialties'
  | 'insurance'
  | 'languages'
  | 'genders'
  | 'blog_categories'
  | 'exchange_categories'
  | 'exchange_tags'
  | 'appointment_types'
  | 'intake_statuses'
  | 'moderation_reasons'
  | 'notification_templates';

export type ConfigEntryStatus = 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';

export interface ConfigCatalog {
  key: ConfigCatalogKey;
  label: string;
  description?: string;
}

export interface ConfigEntry {
  id: string;
  catalogKey: ConfigCatalogKey;
  code: string;
  label: string;
  status: ConfigEntryStatus;
  sortOrder: number;
  ownerRole?: StaffRole;
  usageCount: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigEntryInput {
  catalogKey: ConfigCatalogKey;
  code: string;
  label: string;
  status?: ConfigEntryStatus;
  sortOrder?: number;
  ownerRole?: StaffRole;
  usageCount?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  metadata?: Record<string, string | number | boolean | null>;
}
