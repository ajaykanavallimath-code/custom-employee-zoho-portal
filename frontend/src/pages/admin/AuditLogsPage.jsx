import React, { useState, useEffect, useCallback } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Globe, 
  User 
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import AuditDetailsModal from '../../components/admin/AuditDetailsModal';

const AuditLogsPage = () => {
  const { showError } = useToast();

  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 15
      });
      if (search) params.append('search', search);
      if (actionFilter) params.append('action', actionFilter);

      const res = await api.get(`/audit-logs?${params.toString()}`);
      if (res.data.success) {
        setLogs(res.data.data);
        setTotalLogs(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to fetch audit logs.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, actionFilter, showError]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadgeClass = (action) => {
    if (action.includes('DENIED') || action.includes('FAILED') || action.includes('BLOCKED')) {
      return 'badge-inactive';
    }
    if (action.includes('SUCCESS') || action.includes('LAUNCHED') || action.includes('ACTIVATED')) {
      return 'badge-active';
    }
    if (action.includes('CREATED') || action.includes('UPDATED')) {
      return 'badge-admin';
    }
    return 'badge-neutral';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            Security Audit Trail
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Immutable security log recording authentications, RBAC evaluations, and administrative events ({totalLogs} recorded)
          </p>
        </div>

        <button 
          onClick={fetchLogs} 
          className="btn btn-secondary btn-sm"
          disabled={isLoading}
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          {/* Search */}
          <div className="input-with-icon" style={{ flex: '1 1 260px' }}>
            <Search className="input-icon-left" size={16} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by action, user, or IP..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ fontSize: '0.9rem', padding: '0.65rem 1rem 0.65rem 2.6rem' }}
            />
          </div>

          {/* Action Filter */}
          <div style={{ width: '230px' }}>
            <select
              className="form-select"
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              aria-label="Filter by Security Action"
            >
              <option value="">All Security Actions</option>
              <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
              <option value="LOGIN_FAILED">LOGIN_FAILED (All)</option>
              <option value="ACCESS_DENIED">ACCESS_DENIED (RBAC Block)</option>
              <option value="ZOHO_APP_LAUNCHED">ZOHO_APP_LAUNCHED</option>
              <option value="USER_CREATED">USER_CREATED</option>
              <option value="USER_UPDATED">USER_UPDATED</option>
              <option value="USER_DEACTIVATED">USER_DEACTIVATED</option>
              <option value="ROLE_CREATED">ROLE_CREATED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Security Action</th>
              <th>Target Resource</th>
              <th>Actor</th>
              <th>Client IP</th>
              <th>Timestamp</th>
              <th style={{ textAlign: 'right' }}>Payload</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id}>
                  {/* Action */}
                  <td>
                    <span className={`badge ${getActionBadgeClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>

                  {/* Resource */}
                  <td>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#a5b4fc', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.resource}
                    </div>
                  </td>

                  {/* Actor */}
                  <td>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>
                      {log.user_name || <span style={{ color: '#94a3b8' }}>System</span>}
                    </div>
                    {log.user_email && (
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                        {log.user_email}
                      </div>
                    )}
                  </td>

                  {/* IP Address */}
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {log.ip_address || '127.0.0.1'}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td style={{ fontSize: '0.85rem', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>

                  {/* Details Viewer Button */}
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="btn-icon btn-secondary"
                      title="Inspect full JSON payload"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  {isLoading ? 'Loading audit records...' : 'No audit events found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
            Page <strong style={{ color: '#ffffff' }}>{page}</strong> of <strong style={{ color: '#ffffff' }}>{totalPages}</strong> ({totalLogs} events)
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Audit Log Details Modal */}
      {selectedLog && (
        <AuditDetailsModal
          isOpen={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          log={selectedLog}
        />
      )}
    </div>
  );
};

export default AuditLogsPage;
