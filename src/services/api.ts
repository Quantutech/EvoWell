import { 
  User, ProviderProfile, ClientProfile, Message, BlogPost, Testimonial, 
  SupportTicket, Specialty, Appointment, SearchFilters, 
  InsuranceCompany, BlogCategory, JobPosting, UserRole, AppointmentType,
  SubscriptionTier, SubscriptionStatus, ModerationStatus,
  Availability, Conversation, AuditActionType, AuditResourceType,
  PermissionCode, StaffRole, FeatureCode, Entitlement, ConfigCatalog, ConfigEntryInput, ConfigEntry
} from '../types';
import { aiService } from './ai';
import { auditService } from './audit';
import { authService } from './auth.service';
import { providerService } from './provider.service';
import { clientService } from './client.service';
import { contentService } from './content.service';
import { resourceService } from './resource.service';
import { endorsementService } from './endorsement.service';
import { mockStore } from './mockStore';
import { SEED_DATA } from '../data/seed';
import { accessService } from './access.service';
import { entitlementService } from './entitlements';
import { configCatalogService, ListConfigEntriesParams } from './config-catalog.service';

// Re-export services for direct usage
export { authService, providerService, clientService, contentService, resourceService, endorsementService, mockStore };

class ApiService {
  private audit = auditService;
  public ai = aiService;

  private toCatalogCode(value: string): string {
    return value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  // Backward compatibility for _tempStore
  get _tempStore() {
    return mockStore.store;
  }

  // Auth Service Delegates
  login(email: string, password?: string) { return authService.login(email, password); }
  register(data: any) { return authService.register(data); }
  logout() { return authService.logout(); }
  
  // Provider Service Delegates
  search(filters: SearchFilters) { return providerService.search(filters); }
  getProviderById(id: string) { return providerService.getProviderById(id); }
  getProviderByUserId(userId: string) { return providerService.getProviderByUserId(userId); }
  updateProvider(id: string, data: Partial<ProviderProfile>) { return providerService.updateProvider(id, data); }
  getAllProviders(params?: { page?: number, limit?: number }) { return providerService.getAllProviders(params); }
  getProviderBySlug(slug: string) { return providerService.getProviderBySlug(slug); }
  fetchProviderBySlugOrId(slugOrId: string) { return providerService.fetchProviderBySlugOrId(slugOrId); }
  moderateProvider(id: string, status: ModerationStatus) { return providerService.moderateProvider(id, status); }
  updateProviderSlug(pid: string, first: string, last: string, spec?: string, city?: string) { return providerService.updateProviderSlug(pid, first, last, spec, city); }
  async getAllSpecialties() {
    const response = await configCatalogService.listEntries({
      catalogKey: 'specialties',
      page: 1,
      pageSize: 200,
      status: 'ACTIVE',
    });
    return response.data.map((entry) => ({ id: entry.id, name: entry.label }));
  }
  async createSpecialty(name: string) {
    await configCatalogService.createEntry({
      catalogKey: 'specialties',
      code: this.toCatalogCode(name),
      label: name.trim(),
      status: 'ACTIVE',
    });
  }
  deleteSpecialty(id: string) { return configCatalogService.deleteEntry(id); }

  async getAllInsurance() {
    const response = await configCatalogService.listEntries({
      catalogKey: 'insurance',
      page: 1,
      pageSize: 200,
      status: 'ACTIVE',
    });
    return response.data.map((entry) => ({ id: entry.id, name: entry.label }));
  }
  async createInsurance(name: string) {
    await configCatalogService.createEntry({
      catalogKey: 'insurance',
      code: this.toCatalogCode(name),
      label: name.trim(),
      status: 'ACTIVE',
    });
  }
  deleteInsurance(id: string) { return configCatalogService.deleteEntry(id); }

  async getAllLanguages() {
    const response = await configCatalogService.listEntries({
      catalogKey: 'languages',
      page: 1,
      pageSize: 200,
      status: 'ACTIVE',
    });
    return response.data.map((entry) => entry.label);
  }
  async createLanguage(name: string) {
    await configCatalogService.createEntry({
      catalogKey: 'languages',
      code: this.toCatalogCode(name),
      label: name.trim(),
      status: 'ACTIVE',
    });
  }
  deleteLanguage(id: string) { return configCatalogService.deleteEntry(id); }

  async getAllGenders() {
    const response = await configCatalogService.listEntries({
      catalogKey: 'genders',
      page: 1,
      pageSize: 200,
      status: 'ACTIVE',
    });
    return response.data.map((entry) => entry.label);
  }
  async createGender(name: string) {
    await configCatalogService.createEntry({
      catalogKey: 'genders',
      code: this.toCatalogCode(name),
      label: name.trim(),
      status: 'ACTIVE',
    });
  }
  deleteGender(id: string) { return configCatalogService.deleteEntry(id); }

  // Access Control Service Delegates
  getMyPermissions(userId?: string) { return accessService.getMyPermissions(userId); }
  hasPermission(code: PermissionCode, userId?: string) { return accessService.hasPermission(code, userId); }
  listRoleTemplates() { return accessService.listRoleTemplates(); }
  assignStaffRole(userId: string, role: StaffRole, assignedBy?: string) {
    return accessService.assignStaffRole(userId, role, assignedBy);
  }
  setPermissionOverride(userId: string, code: PermissionCode, allowed: boolean, updatedBy?: string) {
    return accessService.setPermissionOverride(userId, code, allowed, updatedBy);
  }

  // Entitlement Service Delegates
  getProviderEntitlements(providerId: string): Promise<Entitlement[]> {
    return entitlementService.getProviderEntitlements(providerId);
  }
  canUseFeature(providerId: string, featureCode: FeatureCode) {
    return entitlementService.canUseFeature(providerId, featureCode);
  }
  setProviderEntitlementOverride(
    providerId: string,
    featureCode: FeatureCode,
    enabled: boolean,
    updatedBy?: string,
  ) {
    return entitlementService.setEntitlementOverride(providerId, featureCode, enabled, updatedBy);
  }

  // Config Catalog Service Delegates
  listConfigCatalogs(): Promise<ConfigCatalog[]> { return configCatalogService.listCatalogs(); }
  listConfigEntries(params: ListConfigEntriesParams) { return configCatalogService.listEntries(params); }
  createConfigEntry(input: ConfigEntryInput): Promise<ConfigEntry> { return configCatalogService.createEntry(input); }
  updateConfigEntry(id: string, input: Partial<ConfigEntryInput>): Promise<ConfigEntry> {
    return configCatalogService.updateEntry(id, input);
  }
  deleteConfigEntry(id: string) { return configCatalogService.deleteEntry(id); }

  // Endorsement Service Delegates
  createEndorsement(pid: string, reason?: any) { return endorsementService.createEndorsement(pid, reason); }
  getEndorsementsForProvider(pid: string) { return endorsementService.getEndorsementsForProvider(pid); }
  revokeEndorsement(eid: string) { return endorsementService.revokeEndorsement(eid); }
  hasEndorsed(pid: string, uid: string) { return endorsementService.hasEndorsed(pid, uid); }
  getEndorsementSummary(pid: string) { return endorsementService.getEndorsementSummary(pid); }

  // Client Service Delegates
  getUserById(id: string) { return clientService.getUserById(id); }
  updateUser(id: string, data: Partial<User>) { return clientService.updateUser(id, data); }
  getClientProfile(userId: string) { return clientService.getClientProfile(userId); }
  updateClientProfile(userId: string, data: Partial<ClientProfile>) { return clientService.updateClientProfile(userId, data); }
  getAllClients() { return clientService.getAllClients(); }
  getAllUsers() { return clientService.getAllUsers(); }
  deleteUser(id: string) { return clientService.deleteUser(id); }
  getAllAppointments() { return clientService.getAllAppointments(); }
  getAppointmentsForUser(uid: string, role: UserRole) { return clientService.getAppointmentsForUser(uid, role); }
  createAppointment(input: {
    providerId: string;
    clientId: string;
    dateTime: string;
    durationMinutes: number;
    type: AppointmentType;
    notes?: string;
    amountCents?: number;
  }) { return clientService.createAppointment(input); }
  bookAppointment(pid: string, cid: string, time: string) { return clientService.bookAppointment(pid, cid, time); }
  getConversations(uid?: string) { return clientService.getConversations(uid); }
  getMessages(cid: string) { return clientService.getMessages(cid); }
  sendMessage(params: any) { return clientService.sendMessage(params); }
  getOrCreateConversation(u1: string, u2: string) { return clientService.getOrCreateConversation(u1, u2); }
  markAsRead(cid: string, uid: string) { return clientService.markAsRead(cid, uid); }
  deleteMessage(id: string) { return clientService.deleteMessage(id); }
  deleteMessagesByRoom(cid: string) { return clientService.deleteMessagesByRoom(cid); }
  getUnreadCount(uid: string) { return clientService.getUnreadCount(uid); }
  addClientJournalEntry(userId: string, note: string) { return clientService.addClientJournalEntry(userId, note); }
  getClientJournalEntries(userId: string) { return clientService.getClientJournalEntries(userId); }
  upsertProviderClientNote(providerId: string, clientId: string, note: string) {
    return clientService.upsertProviderClientNote(providerId, clientId, note);
  }
  getProviderClientNote(providerId: string, clientId: string) {
    return clientService.getProviderClientNote(providerId, clientId);
  }

  // Content Service Delegates (includes Blog methods)
  getAllBlogs(params?: { page?: number, limit?: number }) { return contentService.getAllBlogs(params); }
  getBlogBySlug(slug: string) { return contentService.getBlogBySlug(slug); }
  getBlogsByProvider(id: string) { return contentService.getBlogsByProvider(id); }
  createBlog(data: any) { return contentService.createBlog(data); }
  updateBlog(id: string, data: any) { return contentService.updateBlog(id, data); }
  deleteBlog(id: string) { return contentService.deleteBlog(id); }
  approveBlog(id: string) { return contentService.approveBlog(id); }
  async getAllBlogCategories() {
    const response = await configCatalogService.listEntries({
      catalogKey: 'blog_categories',
      page: 1,
      pageSize: 200,
      status: 'ACTIVE',
    });
    return response.data.map((entry) => ({
      id: entry.id,
      name: entry.label,
      slug: entry.code.toLowerCase(),
    }));
  }
  async createBlogCategory(name: string) {
    await configCatalogService.createEntry({
      catalogKey: 'blog_categories',
      code: this.toCatalogCode(name),
      label: name.trim(),
      status: 'ACTIVE',
    });
  }
  deleteBlogCategory(id: string) { return configCatalogService.deleteEntry(id); }
  getTestimonials(page?: string) { return contentService.getTestimonials(page); }
  createTestimonial(data: any) { return contentService.createTestimonial(data); }
  deleteTestimonial(id: string) { return contentService.deleteTestimonial(id); }
  getAllJobs() { return contentService.getAllJobs(); }
  getJobById(id: string) { return contentService.getJobById(id); }
  applyToJob(id: string, data: any) { return contentService.applyToJob(id, data); }
  createJob(job: Partial<JobPosting>) { return contentService.createJob(job); }
  deleteJob(id: string) { return contentService.deleteJob(id); }
  getTickets(userId?: string) { return contentService.getTickets(userId); }

  // Resource Service Delegates
  getAllResources() { return resourceService.getAllResources(); }
  getResourceById(id: string) { return resourceService.getResourceById(id); }
  fetchResourceBySlugOrId(id: string) { return resourceService.fetchResourceBySlugOrId(id); }
  getResourcesByProvider(providerId: string) { return resourceService.getResourcesByProvider(providerId); }
  createResource(resource: any) { return resourceService.createResource(resource); }
  updateResource(id: string, updates: any) { return resourceService.updateResource(id, updates); }
  deleteResource(id: string) { return resourceService.deleteResource(id); }
  searchResources(filters: any) { return resourceService.searchResources(filters); }
  moderateResource(id: string, status: any) { return resourceService.moderateResource(id, status); }

  // Misc
  async seedDatabase() {}
}

export const api = new ApiService();
