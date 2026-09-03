import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const UserModal = ({ isOpen, onClose, user, onSaved, roles: initialRoles = [] }) => {
  const isEditing = Boolean(user && user.id);
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [availableRoles, setAvailableRoles] = useState(initialRoles);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamically fetch fresh roles from backend whenever modal opens
  const fetchFreshRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const res = await api.get('/roles');
      if (res.data.success && Array.isArray(res.data.data)) {
        setAvailableRoles(res.data.data);
        return res.data.data;
      }
    } catch (err) {
      console.error('Failed to fetch fresh roles in UserModal:', err);
    } finally {
      setIsLoadingRoles(false);
    }
    return initialRoles;
  };

  useEffect(() => {
    if (isOpen) {
      fetchFreshRoles().then((loadedRoles) => {
        const rolesList = (loadedRoles && loadedRoles.length > 0) ? loadedRoles : initialRoles;

        if (user) {
          setName(user.name || '');
          setEmail(user.email || '');
          setPassword('');

          setIsActive(
            user.is_active !== undefined
              ? user.is_active
              : user.isActive !== undefined
                ? user.isActive
                : true
          );

          const userRoleIds = user.roles
            ? user.roles.map((r) => (typeof r === 'object' ? r.id : r))
            : [];

          setSelectedRoleIds(userRoleIds);
        } else {
          setName('');
          setEmail('');
          setPassword('');
          setIsActive(true);

          // Select first role by default for new users if available
          if (rolesList && rolesList.length > 0) {
            setSelectedRoleIds([rolesList[0].id]);
          } else {
            setSelectedRoleIds([]);
          }
        }
      });
    }
  }, [user, isOpen]);

  const handleRoleToggle = (roleId) => {
    setSelectedRoleIds((previous) => {
      if (previous.includes(roleId)) {
        return previous.filter((id) => id !== roleId);
      }
      return [...previous, roleId];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showError('Please provide the employee name.');
      return;
    }

    if (!email.trim()) {
      showError('Please provide a valid email address.');
      return;
    }

    if (!isEditing && (!password || password.length < 6)) {
      showError('Password must be at least 6 characters long.');
      return;
    }

    if (selectedRoleIds.length === 0) {
      showError('Please assign at least one role to the user.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        isActive,
        roleIds: selectedRoleIds,
      };

      if (password.trim()) {
        payload.password = password;
      }

      if (isEditing) {
        await api.put(`/users/${user.id}`, payload);
        showSuccess(`User ${payload.name} updated successfully.`);
      } else {
        await api.post('/users', payload);
        showSuccess(`User ${payload.name} created successfully.`);
      }

      if (onSaved) {
        await onSaved();
      }

      onClose();
    } catch (err) {
      console.error('User save error:', err);
      showError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save user.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRoles = availableRoles.length > 0 ? availableRoles : initialRoles;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit User: ${user?.name || ''}` : 'Create New User'}
      maxWidth="580px"
    >
      <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Sarah Connor"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            placeholder="e.g. sarah@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label">
            {isEditing ? 'New Password (leave blank to keep current)' : 'Initial Password'}
          </label>
          <input
            type="password"
            className="form-input"
            placeholder={isEditing ? '••••••••' : 'Minimum 6 characters'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!isEditing}
            minLength={isEditing ? undefined : 6}
          />
        </div>

        {/* Account Status */}
        <div className="form-group">
          <label className="form-label">Account Status</label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              marginTop: '0.25rem',
            }}
          >
            {/* Active */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              <input
                type="radio"
                name="user_status"
                checked={isActive === true}
                onChange={() => setIsActive(true)}
              />
              <span className="badge badge-active">Active</span>
            </label>

            {/* Deactivated */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              <input
                type="radio"
                name="user_status"
                checked={isActive === false}
                onChange={() => setIsActive(false)}
              />
              <span className="badge badge-inactive">Deactivated</span>
            </label>
          </div>
        </div>

        {/* Assigned Roles */}
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label className="form-label" style={{ margin: 0 }}>Assigned Roles</label>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {displayRoles.length} {displayRoles.length === 1 ? 'role' : 'roles'} available
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '0.6rem',
              background: '#090d16',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              maxHeight: '190px',
              overflowY: 'auto',
            }}
          >
            {isLoadingRoles && displayRoles.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                Loading available roles...
              </div>
            ) : displayRoles.length === 0 ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  padding: '0.75rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                }}
              >
                No roles available.
              </div>
            ) : (
              displayRoles.map((role) => {
                const isSelected = selectedRoleIds.includes(role.id);
                const roleDisplayName = role.name || role.role_name || `Role #${role.id}`;

                return (
                  <label
                    key={role.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      fontSize: '0.9rem',
                      color: isSelected ? '#ffffff' : '#e2e8f0',
                      cursor: 'pointer',
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--bg-surface-elevated)' : '#0f172a',
                      border: isSelected
                        ? '1.5px solid var(--primary-light)'
                        : '1px solid rgba(255, 255, 255, 0.15)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleRoleToggle(role.id)}
                    />
                    <span style={{ fontWeight: isSelected ? 700 : 500, color: '#ffffff', wordBreak: 'break-word' }}>
                      {roleDisplayName}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.75rem',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEditing ? 'Save Changes' : 'Create User'}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;