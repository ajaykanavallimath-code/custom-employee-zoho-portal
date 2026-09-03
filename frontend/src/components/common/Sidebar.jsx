import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  User, 
  ShieldCheck, 
  Users, 
  KeyRound, 
  History, 
  LogOut, 
  ExternalLink,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showSuccess('You have been logged out securely.');
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
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="brand-logo">
          <div className="brand-icon">
            <Layers size={20} />
          </div>
          <div>
            <span>Zoho Portal</span>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
              ENTERPRISE WORKSPACE
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Links */}
      <div className="sidebar-content">
        {/* Core Workspace */}
        <div>
          <div className="nav-group-title">WORKSPACE</div>
          <ul className="nav-list">
            <li>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <LayoutDashboard className="nav-icon" />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/applications" 
                className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Layers className="nav-icon" />
                <span>My Applications</span>
                {user?.authorizedApps?.length > 0 && (
                  <span className="nav-badge-pill">{user.authorizedApps.length}</span>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/profile" 
                className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <User className="nav-icon" />
                <span>My Profile</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Administration Section (STRICTLY HIDDEN for non-admin users) */}
        {isAdmin && (
          <div>
            <div className="nav-group-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} />
              <span>ADMINISTRATION</span>
            </div>
            <ul className="nav-list">
              <li>
                <NavLink 
                  to="/admin" 
                  end
                  className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <ShieldCheck className="nav-icon" />
                  <span>Admin Center</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/admin/users" 
                  className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Users className="nav-icon" />
                  <span>User Management</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/admin/roles" 
                  className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <KeyRound className="nav-icon" />
                  <span>Roles & Permissions</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/admin/audit-logs" 
                  className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <History className="nav-icon" />
                  <span>Audit Logs</span>
                </NavLink>
              </li>
            </ul>
          </div>
        )}

        {/* User Mini Profile & Logout */}
        <div style={{ marginTop: 'auto' }}>
          <button 
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem', color: '#fda4af' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Sidebar Footer: Active User Pill */}
      <div className="sidebar-footer">
        <div className="user-mini-card">
          <div className="user-avatar-pill">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-mini-meta">
            <div className="user-mini-name">{user?.name || 'Employee'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span className={`badge ${getRoleBadgeClass(user?.primaryRole)}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                {user?.primaryRole || 'Member'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
