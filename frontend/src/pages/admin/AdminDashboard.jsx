import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ShieldCheck, 
  KeyRound, 
  History, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  ArrowRight,
  RefreshCw,
  Server,
  Lock,
  Globe
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showError } = useToast();

  const [stats, setStats] = useState(null);
  const [zohoStatus, setZohoStatus] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, statusRes, logsRes] = await Promise.all([
        api.get('/users/stats'),
        api.get('/apps/status'),
        api.get('/audit-logs/recent?limit=8')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (statusRes.data.success) setZohoStatus(statusRes.data.integration);
      if (logsRes.data.success) setRecentLogs(logsRes.data.data);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to fetch admin metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            Admin Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Enterprise user governance, role permissions matrix, and audit monitoring
          </p>
        </div>

        <button 
          onClick={fetchAdminData} 
          className="btn btn-secondary btn-sm"
          disabled={isLoading}
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Stat Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Total Users */}
        <div className="stat-card">
          <div>
            <div className="stat-value">{stats?.totalUsers ?? '—'}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc' }}>
            <Users size={26} />
          </div>
        </div>

        {/* Active Accounts */}
        <div className="stat-card">
          <div>
            <div className="stat-value" style={{ color: '#34d399' }}>{stats?.activeUsers ?? '—'}</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-icon-wrap" style={{ background: 'var(--accent-emerald-bg)', color: '#10b981' }}>
            <CheckCircle2 size={26} />
          </div>
        </div>

        {/* Defined Roles */}
        <div className="stat-card">
          <div>
            <div className="stat-value" style={{ color: '#93c5fd' }}>{stats?.totalRoles ?? '—'}</div>
            <div className="stat-label">System Roles</div>
          </div>
          <div className="stat-icon-wrap" style={{ background: 'var(--accent-blue-bg)', color: '#3b82f6' }}>
            <KeyRound size={26} />
          </div>
        </div>

        {/* Zoho One Apps */}
        <div className="stat-card">
          <div>
            <div className="stat-value" style={{ color: '#fcd34d' }}>4</div>
            <div className="stat-label">Zoho One Apps</div>
          </div>
          <div className="stat-icon-wrap" style={{ background: 'var(--accent-amber-bg)', color: '#f59e0b' }}>
            <Layers size={26} />
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem'
      }}>
        <div 
          className="card card-hoverable" 
          onClick={() => navigate('/admin/users')}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a5b4fc' }}>
              <Users size={22} />
            </div>
            <ArrowRight size={18} color="#cbd5e1" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.35rem' }}>User Management</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.45 }}>
              Create accounts, assign roles, toggle status, and manage employee access.
            </p>
          </div>
        </div>

        <div 
          className="card card-hoverable" 
          onClick={() => navigate('/admin/roles')}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--accent-blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
              <KeyRound size={22} />
            </div>
            <ArrowRight size={18} color="#cbd5e1" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.35rem' }}>Roles & Permissions</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.45 }}>
              Configure RBAC permissions matrix and custom organization roles.
            </p>
          </div>
        </div>

        <div 
          className="card card-hoverable" 
          onClick={() => navigate('/admin/audit-logs')}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--accent-emerald-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <History size={22} />
            </div>
            <ArrowRight size={18} color="#cbd5e1" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.35rem' }}>Audit Trail & Security</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.45 }}>
              Inspect immutable audit records of logins, RBAC blocks, and app launches.
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Section: Zoho One Integration Diagnostic & Recent Audit Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Zoho One Integration Diagnostic Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={20} color="#818cf8" />
              <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Zoho Integration Status</h3>
            </div>
            <span className={`badge ${zohoStatus?.configured ? 'badge-active' : 'badge-inactive'}`}>
              {zohoStatus?.status || (zohoStatus?.configured ? 'CONNECTED' : 'UNCONFIGURED')}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: '#090d16',
              padding: '1.1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              fontSize: '0.9rem'
            }}>
              <div style={{ color: '#f1f5f9', marginBottom: '0.75rem', lineHeight: 1.45, fontWeight: 500 }}>
                {zohoStatus?.message}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontFamily: 'monospace', fontSize: '0.825rem', color: '#cbd5e1' }}>
                <div>Accounts URL: <span style={{ color: '#ffffff', fontWeight: 600 }}>{zohoStatus?.accountsUrl}</span></div>
                <div>API Base URL: <span style={{ color: '#ffffff', fontWeight: 600 }}>{zohoStatus?.apiBaseUrl}</span></div>
                <div>Token Cached: <span style={{ color: zohoStatus?.tokenCached ? '#34d399' : '#cbd5e1', fontWeight: 700 }}>{zohoStatus?.tokenCached ? 'Yes' : 'No'}</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#cbd5e1' }}>
              <Lock size={15} color="#10b981" />
              <span>Backend secrets isolation: Credentials never disclosed to frontend.</span>
            </div>
          </div>
        </div>

        {/* Recent Audit Logs Feed */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="#10b981" />
              <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Recent Security Events</h3>
            </div>
            <button 
              onClick={() => navigate('/admin/audit-logs')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.775rem', padding: '0.25rem 0.65rem' }}
            >
              View All
            </button>
          </div>

          {recentLogs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recentLogs.map((log) => (
                <div 
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.7rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    background: '#090d16',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{log.action}</div>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                      {log.user_name ? <span style={{ color: '#ffffff', fontWeight: 600 }}>{log.user_name} • </span> : ''}
                      <span style={{ color: '#a5b4fc', fontFamily: 'monospace' }}>{log.resource}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.875rem' }}>
              No recent audit events recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
