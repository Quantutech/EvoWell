import { supabase } from '@/services/supabase';
import { AuditActionType, AuditResourceType, AuditLog } from '@/types';

class AuditService {
  /**
   * Log an action to the audit_logs table.
   * This handles application-level events like VIEW, LOGIN, SEARCH.
   * Database mutations (INSERT/UPDATE/DELETE) are handled by DB triggers automatically.
   */
  async log(
    action: AuditActionType, 
    resource: AuditResourceType, 
    resourceId?: string, 
    metadata?: any
  ): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session, we can't log a user ID, but we might log a system attempt
      // For this implementation, we require a user or we skip (or log as 'anonymous' if schema allowed null)
      if (!session?.user) {
        // Option: Log failed login attempts where session is null but email is in metadata
        if (action !== AuditActionType.LOGIN && action !== AuditActionType.ACCESS_DENIED) {
            return; 
        }
      }

      const payload = {
        user_id: session?.user?.id || null, // Nullable in schema? No, strictly references users. 
        // If login failed, we might not have a user_id. 
        // In this schema, user_id is FK. We can only log for existing users.
        // For failed logins of existing users, we fetch user by email first? 
        // For now, let's assume we log only authenticated actions or actions where we can resolve the UID.
        
        action_type: action,
        resource_type: resource,
        resource_id: resourceId,
        user_agent: navigator.userAgent,
        metadata: metadata || {}
      };

      if (payload.user_id) {
          const { error } = await supabase.from('audit_logs').insert(payload);
          if (error) console.warn("Audit Log Error:", error.message);
      } else {
          console.warn("Skipping audit log: No authenticated user.");
      }

    } catch (e) {
      console.error("Audit Service Failure:", e);
      // Fail silent to not block main app flow, but log to console
    }
  }

  /**
   * Admin only: Fetch logs
   */
  async getLogs(filters?: { userId?: string, action?: string, from?: string, to?: string }): Promise<AuditLog[]> {
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        users (email)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (filters?.userId) query = query.eq('user_id', filters.userId);
    if (filters?.action) query = query.eq('action_type', filters.action);
    if (filters?.from) query = query.gte('created_at', filters.from);
    if (filters?.to) query = query.lte('created_at', filters.to);

    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map((log: any) => ({
      ...log,
      user_email: log.users?.email || 'Unknown'
    }));
  }
}

export const auditService = new AuditService();