
import React, { useEffect, useState } from 'react';
import { auditService } from '../../../../services/audit';
import { AuditLog } from '../../../../types';

const AdminAuditTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [filterAction, filterUser]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await auditService.getLogs({
        action: filterAction || undefined,
        userId: filterUser || undefined
      });
      setLogs(data);
    } catch (e) {
      console.error("Failed to fetch audit logs", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      
      <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Compliance Audit Log</h2>
          <p className="text-slate-500 text-xs mt-1">Immutable record of all system access and data modifications.</p>
        </div>
        <div className="flex gap-4">
          <input 
            placeholder="Filter by User ID" 
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500/10 outline-none w-48"
          />
          <select 
            value={filterAction} 
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500/10 outline-none cursor-pointer"
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="VIEW">View Record</option>
            <option value="UPDATE">Update Data</option>
            <option value="CREATE">Create Data</option>
            <option value="DELETE">Delete Data</option>
          </select>
          <button onClick={fetchLogs} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800">Refresh</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400 animate-pulse">Loading secure logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">No logs found matching criteria.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {log.user_email || log.user_id}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      log.action_type === 'DELETE' ? 'bg-red-100 text-red-700' :
                      log.action_type === 'UPDATE' ? 'bg-amber-100 text-amber-700' :
                      log.action_type === 'LOGIN' ? 'bg-green-100 text-green-700' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {log.action_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="font-bold">{log.resource_type}</span>
                    <span className="text-slate-400 text-xs ml-2 font-mono">{log.resource_id?.substring(0, 8)}...</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono max-w-xs truncate" title={JSON.stringify(log.metadata)}>
                    {JSON.stringify(log.metadata)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAuditTab;
