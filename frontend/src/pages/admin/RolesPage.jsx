import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Plus, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  Users, 
  Check, 
  RefreshCw,
  Lock
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import RoleModal from '../../components/admin/RoleModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const RolesPage = () => {
  const { showSuccess, showError } = useToast();

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteConfirmRole, setDeleteConfirmRole] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions')
      ]);

      if (rolesRes.data.success) setRoles(rolesRes.data.data);
      if (permsRes.data.success) setPermissions(permsRes.data.data);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to fetch roles and permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteRole = async () => {
    if (!deleteConfirmRole) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/roles/${deleteConfirmRole.id}`);
      if (res.data.success) {
        showSuccess(`Role '${deleteConfirmRole.name}' deleted.`);
        setDeleteConfirmRole(null);
        fetchData();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete role.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isDefaultRole = (name) => {
    return ['Admin', 'HR', 'Sales', 'Support', 'Finance'].includes(name);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            Roles & Permissions Matrix
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Configure RBAC roles, assign granular permissions, and control Zoho One application scopes
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={fetchData} 
            className="btn btn-secondary btn-sm"
            disabled={isLoading}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => { setEditingRole(null); setIsRoleModalOpen(true); }}
            className="btn btn-gradient btn-sm"
          >
            <Plus size={16} />
            <span>Create Custom Role</span>
          </button>
        </div>
      </div>

      {/* Roles Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem'
      }}>
        {roles.map((r) => (
          <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Card Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className={`badge ${getRoleBadgeClass(r.name)}`} style={{ fontSize: '0.85rem' }}>
                    {r.name}
                  </span>
                  {isDefaultRole(r.name) && (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                      <Lock size={11} />
                      System
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#cbd5e1', marginTop: '0.4rem', lineHeight: 1.45 }}>
                  {r.description || 'No description provided.'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  onClick={() => { setEditingRole(r); setIsRoleModalOpen(true); }}
                  className="btn-icon btn-secondary"
                  title="Edit role permissions"
                >
                  <Edit size={14} />
                </button>
                {!isDefaultRole(r.name) && (
                  <button
                    onClick={() => setDeleteConfirmRole(r)}
                    className="btn-icon btn-danger-outline"
                    title="Delete role"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Meta statistics */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: '#090d16',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
                <Users size={15} color="#94a3b8" />
                <span>Assigned Users:</span>
                <strong style={{ color: '#ffffff', fontWeight: 700 }}>{r.user_count || 0}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
                <ShieldCheck size={15} color="#10b981" />
                <span>Permissions:</span>
                <strong style={{ color: '#a5b4fc', fontWeight: 700 }}>{r.permissions?.length || 0}</strong>
              </div>
            </div>

            {/* Permissions list chips */}
            <div style={{ marginTop: 'auto' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                GRANTED PERMISSIONS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '140px', overflowY: 'auto' }}>
                {r.permissions && r.permissions.length > 0 ? (
                  r.permissions.map((p) => (
                    <span 
                      key={p.id} 
                      className="badge badge-neutral" 
                      style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#f1f5f9', background: '#1e293b', borderColor: '#334155' }}
                      title={p.description}
                    >
                      {p.name}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No permissions granted.</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Permissions Catalog */}
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={22} color="#6366f1" />
          <span>System Permissions Catalog ({permissions.length})</span>
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Standardized granular security capabilities available across the portal
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '0.85rem'
        }}>
          {permissions.map((p) => (
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
              <div style={{ fontSize: '0.825rem', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.4 }}>
                {p.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Create/Edit Modal */}
      {isRoleModalOpen && (
        <RoleModal
          isOpen={isRoleModalOpen}
          onClose={() => { setIsRoleModalOpen(false); setEditingRole(null); }}
          role={editingRole}
          allPermissions={permissions}
          onSaved={fetchData}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmRole && (
        <ConfirmDialog
          isOpen={Boolean(deleteConfirmRole)}
          onClose={() => setDeleteConfirmRole(null)}
          onConfirm={handleDeleteRole}
          title="Delete Custom Role"
          message={`Are you sure you want to delete role '${deleteConfirmRole?.name}'? Users assigned to this role will lose its permissions.`}
          confirmText="Delete Role"
          isDangerous={true}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default RolesPage;
