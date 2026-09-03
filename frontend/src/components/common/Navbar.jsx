import React from 'react';
import { Menu, Shield, User, LogOut, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
    <header className="topbar">
      <div className="topbar-left">
        <button 
          className="mobile-menu-btn" 
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>
        <div className="page-title-crumb">
          Employee Portal
        </div>
      </div>

      <div className="topbar-right">
        {/* Role Badge Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`badge ${getRoleBadgeClass(user?.primaryRole)}`}>
            <Shield size={12} />
            {user?.primaryRole || 'Employee'}
          </span>
        </div>

        {/* Profile Pill Button */}
        <div 
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.35rem 0.75rem',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease'
          }}
          title="View profile settings"
        >
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#fff'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {user?.name?.split(' ')[0] || 'User'}
          </span>
        </div>

        {/* Quick Sign Out Button */}
        <button
          onClick={handleLogout}
          className="btn-icon btn-secondary"
          title="Sign out"
          style={{ color: '#fda4af', cursor: 'pointer' }}
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
