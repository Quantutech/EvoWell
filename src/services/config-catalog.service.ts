import { mockStore } from './mockStore';
import { supabase, isConfigured } from './supabase';
import {
  ConfigCatalog,
  ConfigCatalogKey,
  ConfigEntry,
  ConfigEntryInput,
  ConfigEntryStatus,
  PermissionCode,
} from '@/types';
import { accessService } from './access.service';
import { persistence } from './persistence';

export interface ListConfigEntriesParams {
  catalogKey: ConfigCatalogKey;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ConfigEntryStatus | 'ALL';
}

export interface PaginatedConfigEntries {
  data: ConfigEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IConfigCatalogService {
  listCatalogs(): Promise<ConfigCatalog[]>;
  listEntries(params: ListConfigEntriesParams): Promise<PaginatedConfigEntries>;
  createEntry(input: ConfigEntryInput): Promise<ConfigEntry>;
  updateEntry(id: string, input: Partial<ConfigEntryInput>): Promise<ConfigEntry>;
  deleteEntry(id: string): Promise<void>;
}

async function assertCatalogPermission(permission: PermissionCode): Promise<void> {
  const actorId = persistence.getSession().userId;
  if (!actorId) return;

  const allowed = await accessService.hasPermission(permission, actorId);
  if (!allowed) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

class MockConfigCatalogService implements IConfigCatalogService {
  async listCatalogs(): Promise<ConfigCatalog[]> {
    return [...mockStore.store.configCatalogs].sort((a, b) => a.label.localeCompare(b.label));
  }

  async listEntries(params: ListConfigEntriesParams): Promise<PaginatedConfigEntries> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;

    let rows = mockStore.store.configEntries.filter((entry) => entry.catalogKey === params.catalogKey);

    if (params.status && params.status !== 'ALL') {
      rows = rows.filter((entry) => entry.status === params.status);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      rows = rows.filter(
        (entry) =>
          entry.label.toLowerCase().includes(q) ||
          entry.code.toLowerCase().includes(q),
      );
    }

    rows = rows.sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));

    const total = rows.length;
    const from = (page - 1) * pageSize;
    const data = rows.slice(from, from + pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async createEntry(input: ConfigEntryInput): Promise<ConfigEntry> {
    await assertCatalogPermission('platform.config.write');

    const now = new Date().toISOString();
    const entry: ConfigEntry = {
      id: `cfg-${input.catalogKey}-${Date.now().toString(36)}`,
      catalogKey: input.catalogKey,
      code: input.code,
      label: input.label,
      status: input.status || 'ACTIVE',
      sortOrder: input.sortOrder || this.nextSortOrder(input.catalogKey),
      ownerRole: input.ownerRole,
      usageCount: input.usageCount || 0,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo,
      metadata: input.metadata,
      createdAt: now,
      updatedAt: now,
    };

    this.assertUnique(input.catalogKey, input.code, input.label);

    mockStore.store.configEntries.push(entry);
    mockStore.save();
    return entry;
  }

  async updateEntry(id: string, input: Partial<ConfigEntryInput>): Promise<ConfigEntry> {
    await assertCatalogPermission('platform.config.write');

    const index = mockStore.store.configEntries.findIndex((entry) => entry.id === id);
    if (index === -1) throw new Error('Config entry not found');

    const current = mockStore.store.configEntries[index];

    const next: ConfigEntry = {
      ...current,
      catalogKey: input.catalogKey || current.catalogKey,
      code: input.code || current.code,
      label: input.label || current.label,
      status: input.status || current.status,
      sortOrder: input.sortOrder ?? current.sortOrder,
      ownerRole: input.ownerRole ?? current.ownerRole,
      usageCount: input.usageCount ?? current.usageCount,
      effectiveFrom: input.effectiveFrom ?? current.effectiveFrom,
      effectiveTo: input.effectiveTo ?? current.effectiveTo,
      metadata: input.metadata ?? current.metadata,
      updatedAt: new Date().toISOString(),
    };

    this.assertUnique(next.catalogKey, next.code, next.label, id);

    mockStore.store.configEntries[index] = next;
    mockStore.save();
    return next;
  }

  async deleteEntry(id: string): Promise<void> {
    await assertCatalogPermission('platform.config.write');

    mockStore.store.configEntries = mockStore.store.configEntries.filter((entry) => entry.id !== id);
    mockStore.save();
  }

  private nextSortOrder(catalogKey: ConfigCatalogKey): number {
    const rows = mockStore.store.configEntries.filter((entry) => entry.catalogKey === catalogKey);
    if (rows.length === 0) return 1;

    return Math.max(...rows.map((entry) => entry.sortOrder)) + 1;
  }

  private assertUnique(
    catalogKey: ConfigCatalogKey,
    code: string,
    label: string,
    ignoreId?: string,
  ) {
    const exists = mockStore.store.configEntries.some((entry) => {
      if (entry.catalogKey !== catalogKey) return false;
      if (ignoreId && entry.id === ignoreId) return false;
      return (
        entry.code.toLowerCase() === code.toLowerCase() ||
        entry.label.toLowerCase() === label.toLowerCase()
      );
    });

    if (exists) throw new Error('Config entry code or label already exists in this catalog.');
  }
}

class SupabaseConfigCatalogService implements IConfigCatalogService {
  private fallback = new MockConfigCatalogService();

  async listCatalogs(): Promise<ConfigCatalog[]> {
    if (!supabase) return this.fallback.listCatalogs();

    try {
      const { data, error } = await (supabase.from('config_catalogs') as any)
        .select('*')
        .order('label', { ascending: true });
      if (error) throw error;

      return (data || []).map((row: any) => ({
        key: row.key,
        label: row.label,
        description: row.description || undefined,
      }));
    } catch {
      return this.fallback.listCatalogs();
    }
  }

  async listEntries(params: ListConfigEntriesParams): Promise<PaginatedConfigEntries> {
    if (!supabase) return this.fallback.listEntries(params);

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      let query = (supabase.from('config_entries') as any)
        .select('*', { count: 'exact' })
        .eq('catalog_key', params.catalogKey);

      if (params.status && params.status !== 'ALL') {
        query = query.eq('status', params.status);
      }

      if (params.search) {
        query = query.or(`code.ilike.%${params.search}%,label.ilike.%${params.search}%`);
      }

      const { data, count, error } = await query
        .order('sort_order', { ascending: true })
        .range(from, to);

      if (error) throw error;

      return {
        data: (data || []).map(this.mapEntry),
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil((count || 0) / pageSize)),
      };
    } catch {
      return this.fallback.listEntries(params);
    }
  }

  async createEntry(input: ConfigEntryInput): Promise<ConfigEntry> {
    await assertCatalogPermission('platform.config.write');
    if (!supabase) return this.fallback.createEntry(input);

    try {
      const payload = {
        catalog_key: input.catalogKey,
        code: input.code,
        label: input.label,
        status: input.status || 'ACTIVE',
        sort_order: input.sortOrder || 1,
        owner_role: input.ownerRole || null,
        usage_count: input.usageCount || 0,
        effective_from: input.effectiveFrom || null,
        effective_to: input.effectiveTo || null,
        metadata: input.metadata || null,
      };

      const { data, error } = await (supabase.from('config_entries') as any)
        .insert(payload)
        .select('*')
        .single();

      if (error) throw error;
      return this.mapEntry(data);
    } catch {
      return this.fallback.createEntry(input);
    }
  }

  async updateEntry(id: string, input: Partial<ConfigEntryInput>): Promise<ConfigEntry> {
    await assertCatalogPermission('platform.config.write');
    if (!supabase) return this.fallback.updateEntry(id, input);

    try {
      const payload: Record<string, unknown> = {};
      if (input.catalogKey) payload.catalog_key = input.catalogKey;
      if (input.code) payload.code = input.code;
      if (input.label) payload.label = input.label;
      if (input.status) payload.status = input.status;
      if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
      if (input.ownerRole !== undefined) payload.owner_role = input.ownerRole;
      if (input.usageCount !== undefined) payload.usage_count = input.usageCount;
      if (input.effectiveFrom !== undefined) payload.effective_from = input.effectiveFrom;
      if (input.effectiveTo !== undefined) payload.effective_to = input.effectiveTo;
      if (input.metadata !== undefined) payload.metadata = input.metadata;

      const { data, error } = await (supabase.from('config_entries') as any)
        .update(payload)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return this.mapEntry(data);
    } catch {
      return this.fallback.updateEntry(id, input);
    }
  }

  async deleteEntry(id: string): Promise<void> {
    await assertCatalogPermission('platform.config.write');
    if (!supabase) return this.fallback.deleteEntry(id);

    try {
      const { error } = await (supabase.from('config_entries') as any).delete().eq('id', id);
      if (error) throw error;
    } catch {
      await this.fallback.deleteEntry(id);
    }
  }

  private mapEntry(row: any): ConfigEntry {
    return {
      id: row.id,
      catalogKey: row.catalog_key,
      code: row.code,
      label: row.label,
      status: row.status,
      sortOrder: row.sort_order,
      ownerRole: row.owner_role || undefined,
      usageCount: row.usage_count || 0,
      effectiveFrom: row.effective_from || undefined,
      effectiveTo: row.effective_to || undefined,
      metadata: row.metadata || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const configCatalogService: IConfigCatalogService =
  isConfigured && supabase ? new SupabaseConfigCatalogService() : new MockConfigCatalogService();
