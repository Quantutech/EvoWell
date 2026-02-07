import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { configCatalogService } from '../../src/services/config-catalog.service';
import { mockStore } from '../../src/services/mockStore';

describe('ConfigCatalogService', () => {
  let snapshot: string;

  beforeEach(() => {
    snapshot = JSON.stringify(mockStore.store);
  });

  afterEach(() => {
    mockStore.store = JSON.parse(snapshot);
    mockStore.save();
  });

  it('lists seeded catalogs and entries with filtering', async () => {
    const catalogs = await configCatalogService.listCatalogs();
    expect(catalogs.length).toBeGreaterThan(0);

    const specialties = await configCatalogService.listEntries({
      catalogKey: 'specialties',
      page: 1,
      pageSize: 10,
      status: 'ACTIVE',
    });

    expect(specialties.data.length).toBeGreaterThan(0);
    expect(specialties.data.every((entry) => entry.catalogKey === 'specialties')).toBe(true);
  });

  it('creates, updates, and deletes catalog entries', async () => {
    const created = await configCatalogService.createEntry({
      catalogKey: 'notification_templates',
      code: 'APPT_CONFIRMATION',
      label: 'Appointment Confirmation',
      status: 'ACTIVE',
      sortOrder: 999,
    });

    expect(created.id).toBeTruthy();
    expect(created.code).toBe('APPT_CONFIRMATION');

    const updated = await configCatalogService.updateEntry(created.id, {
      label: 'Appointment Confirmation v2',
      status: 'INACTIVE',
    });

    expect(updated.label).toBe('Appointment Confirmation v2');
    expect(updated.status).toBe('INACTIVE');

    await configCatalogService.deleteEntry(created.id);

    const afterDelete = await configCatalogService.listEntries({
      catalogKey: 'notification_templates',
      page: 1,
      pageSize: 200,
      status: 'ALL',
      search: 'APPT_CONFIRMATION',
    });

    expect(afterDelete.data.some((entry) => entry.id === created.id)).toBe(false);
  });
});
