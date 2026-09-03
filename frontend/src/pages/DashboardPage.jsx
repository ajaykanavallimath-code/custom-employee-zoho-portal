import React from 'react';
import { useAuth } from '../context/AuthContext';
import AppCard from '../components/dashboard/AppCard';
import { Shield, Sparkles, Layers, CheckCircle2, Lock, ArrowUpRight, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const authorizedApps = user?.authorizedApps || [];

  const getRoleBadgeClass = (roleName) => {
    switch (roleName?.toLowerCase()) {
      case 'admin': return 'badge-admin';
      case 'hr': return 'badge-hr';
      case 'sales': return 'badge-sales';
      case 'support': return 'badge-support';
      case 'finance': return 'badge-finance';
      default: return 'badge-neutral';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem 2.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          right: '-5%',
          top: '-30%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span className={`badge ${getRoleBadgeClass(user?.primaryRole)}`} style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                <Shield size={13} />
                Role: {user?.primaryRole || 'Employee'}
              </span>
              <span className="badge badge-active" style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                <CheckCircle2 size={13} />
                Active Session
              </span>
            </div>

            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              Welcome, {user?.name || 'Employee'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '650px', lineHeight: 1.5 }}>
              Access your personalized workspace with enterprise single sign-on. Your access is governed by strict Role-Based Access Control (RBAC).
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="btn btn-gradient"
              style={{ padding: '0.75rem 1.25rem' }}
            >
              <span>Go to Admin Center</span>
              <ArrowUpRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Authorized Applications Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>
              Authorized Applications
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Displaying only applications allowed for role <strong style={{ color: 'var(--text-main)' }}>{user?.primaryRole}</strong>
            </p>
          </div>
          <span className="badge badge-neutral" style={{ fontSize: '0.8rem' }}>
            {authorizedApps.length} {authorizedApps.length === 1 ? 'App' : 'Apps'} Available
          </span>
        </div>

        {/* Application Cards Grid */}
        {authorizedApps.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {authorizedApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <Layers size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Applications Assigned</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto' }}>
              Your account currently does not have any authorized applications assigned. Please contact your system administrator.
            </p>
          </div>
        )}
      </div>

      {/* Enterprise Security Architecture Note */}
      <div className="card" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Lock size={20} color="#818cf8" />
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
              Enterprise Security & Role-Based Isolation
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              All OAuth 2.0 secrets, client keys, and refresh tokens are securely stored in backend environment variables.
              Neither credentials nor unauthorized application routes are accessible by the client browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
