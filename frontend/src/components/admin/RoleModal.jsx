import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const RoleModal = ({ isOpen, onClose, role, onSaved, allPermissions = [] }) => {
  const isEditing = Boolean(role && role.id);
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermIds, setSelectedPermIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (role) {
      setName(role.name || '');
      setDescription(role.description || '');
      const permIds = role.permissions ? role.permissions.map(p => p.id) : [];
      setSelectedPermIds(permIds);
    } else {
      setName('');
      setDescription('');
      setSelectedPermIds([]);
    }
  }, [role, isOpen]);

  const handlePermToggle = (permId) => {
    setSelectedPermIds(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPermIds.length === allPermissions.length) {
      setSelectedPermIds([]);
    } else {
      setSelectedPermIds(allPermissions.map(p => p.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Role name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        permissionIds: selectedPermIds
      };

      if (isEditing) {
        await api.put(`/roles/${role.id}`, payload);
        showSuccess(`Role '${payload.name}' updated successfully.`);
      } else {
        await api.post('/roles', payload);
        showSuccess(`Role '${payload.name}' created successfully.`);
      }

      onSaved();
      onClose();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Role: ${role?.name}` : 'Create New Role'}
      maxWidth="640px"
    >
      <form onSubmit={handleSubmit}>
        {/* Role Name */}
        <div className="form-group">
          <label className="form-label">Role Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Operations Manager"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isEditing && role?.name === 'Admin'}
            required
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Summarize the responsibilities and scope of this role..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Permission Matrix */}
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label className="form-label" style={{ margin: 0 }}>Permissions Matrix</label>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleSelectAll}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.775rem', fontWeight: 600 }}
            >
              {selectedPermIds.length === allPermissions.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '0.6rem',
            background: '#090d16',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            maxHeight: '240px',
            overflowY: 'auto'
          }}>
            {allPermissions.map((perm) => {
              const isSelected = selectedPermIds.includes(perm.id);
              return (
                <label 
                  key={perm.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    fontSize: '0.85rem',
                    color: '#ffffff',
                    cursor: 'pointer',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--bg-surface-elevated)' : '#0f172a',
                    border: isSelected
                      ? '1.5px solid var(--primary-light)'
                      : '1px solid rgba(255, 255, 255, 0.15)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ marginTop: '3px' }}
                    checked={isSelected}
                    onChange={() => handlePermToggle(perm.id)}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: isSelected ? '#ffffff' : '#f1f5f9' }}>
                      {perm.name}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#cbd5e1', marginTop: '3px', lineHeight: 1.35 }}>
                      {perm.description}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEditing ? 'Save Changes' : 'Create Role'}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RoleModal;
