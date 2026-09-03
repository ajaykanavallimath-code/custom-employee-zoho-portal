import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  Calendar,
  Loader2 
} from 'lucide-react';

const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (newPassword) {
      if (newPassword.length < 6) {
        showError('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        showError('New passwords do not match.');
        return;
      }
      if (!currentPassword) {
        showError('Please enter your current password to make security changes.');
        return;
      }
    }

    setIsUpdating(true);
    try {
      const payload = {
        name: name.trim()
      };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await api.put('/auth/profile', payload);
      if (res.data.success) {
        showSuccess('Profile updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        await refreshProfile();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
          My Profile & Security
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Review your assigned roles, permissions, and security credentials
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Profile Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#ffffff',
              boxShadow: '0 0 20px var(--primary-glow)'
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700 }}>{user?.name}</h3>
              <div style={{ fontSize: '0.875rem', color: '#cbd5e1', marginTop: '3px' }}>
                {user?.email}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.775rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
                ASSIGNED ROLES
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {user?.roleNames?.map((role) => (
                  <span key={role} className={`badge ${getRoleBadgeClass(role)}`}>
                    <Shield size={13} />
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.775rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
                ACCOUNT STATUS
              </div>
              <span className={`badge ${user?.isActive ? 'badge-active' : 'badge-inactive'}`}>
                <CheckCircle2 size={13} />
                {user?.isActive ? 'Active Employee' : 'Deactivated'}
              </span>
            </div>

            <div>
              <div style={{ fontSize: '0.775rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
                AUTHORIZED APPLICATIONS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {user?.authorizedApps?.map((app) => (
                  <span key={app.id} className="badge badge-neutral" style={{ fontSize: '0.775rem', color: '#f1f5f9', background: '#1e293b', borderColor: '#334155' }}>
                    {app.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Update Profile & Password Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <Key size={19} color="#818cf8" />
            <span>Account Settings</span>
          </h3>

          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
              />
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '3px' }}>
                Email address is managed by system administrators.
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '1.25rem 0', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.85rem' }}>
                Change Password
              </div>

              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Permissions Breakdown Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <ShieldCheck size={20} color="#10b981" />
          <span>Active Role Permissions ({user?.permissionNames?.length || 0})</span>
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Granular permission flags inherited from your role assignments
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '0.85rem'
        }}>
          {user?.permissions?.map((p) => (
            <div
              key={p.id}
              style={{
                background: '#090d16',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)'
              }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#a5b4fc', fontFamily: 'monospace' }}>
                {p.name}
              </div>
              <div style={{ fontSize: '0.825rem', color: '#cbd5e1', marginTop: '3px', lineHeight: 1.4 }}>
                {p.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
