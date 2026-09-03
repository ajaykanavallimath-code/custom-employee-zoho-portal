import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Shield, 
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import UserModal from '../../components/admin/UserModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch available roles for filter & modal
  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      if (res.data.success && Array.isArray(res.data.data)) {
        setRoles(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  // Fetch paginated users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10
      });
      if (search) params.append('search', search);
      if (selectedRole) params.append('role', selectedRole);
      if (selectedStatus !== '') params.append('status', selectedStatus);

      const res = await api.get(`/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.data);
        setTotalUsers(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to fetch users list.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, selectedRole, selectedStatus, showError]);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle open add user modal with fresh roles
  const handleOpenAddUser = () => {
    fetchRoles();
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  // Handle open edit user modal with fresh roles
  const handleOpenEditUser = (userToEdit) => {
    fetchRoles();
    setEditingUser(userToEdit);
    setIsUserModalOpen(true);
  };

  // Toggle user activation status
  const handleToggleStatus = async (user) => {
    if (user.id === currentUser.id) {
      showError('You cannot deactivate your own account.');
      return;
    }

    try {
      const newStatus = !user.is_active;
      const res = await api.patch(`/users/${user.id}/status`, { isActive: newStatus });
      if (res.data.success) {
        showSuccess(`User ${user.name} is now ${newStatus ? 'active' : 'deactivated'}.`);
        fetchUsers();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  // Delete user execution
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmUser) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/users/${deleteConfirmUser.id}`);
      if (res.data.success) {
        showSuccess(`User ${deleteConfirmUser.name} deleted successfully.`);
        setDeleteConfirmUser(null);
        fetchUsers();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadgeClass = (roleName) => {
    switch (roleName?.toLowerCase()) {
      case 'admin': return 'badge-admin';
      case 'hr': return 'badge-hr';
      case 'sales': return 'badge-sales';
      case 'support': return 'badge-support';
      case 'finance': return 'badge-finance';
      case 'operations manager':
      case 'operations':
        return 'badge-finance';
      default: return 'badge-neutral';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            User Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage employee directory, assign RBAC roles, and control access permissions ({totalUsers} total)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => { fetchRoles(); fetchUsers(); }} 
            className="btn btn-secondary btn-sm"
            disabled={isLoading}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button 
            onClick={handleOpenAddUser}
            className="btn btn-gradient btn-sm"
          >
            <UserPlus size={16} />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          {/* Search */}
          <div className="input-with-icon" style={{ flex: '1 1 240px' }}>
            <Search className="input-icon-left" size={16} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ fontSize: '0.9rem', padding: '0.65rem 1rem 0.65rem 2.6rem' }}
            />
          </div>

          {/* Role Filter Dropdown */}
          <div style={{ width: '210px' }}>
            <select
              className="form-select"
              value={selectedRole}
              onChange={(e) => { setSelectedRole(e.target.value); setPage(1); }}
              aria-label="Filter by Role"
            >
              <option value="">All Roles ({roles.length})</option>
              {roles.map(r => (
                <option key={r.id} value={r.name}>{r.name || `Role #${r.id}`}</option>
              ))}
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div style={{ width: '170px' }}>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              aria-label="Filter by Status"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Deactivated Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Assigned Roles</th>
              <th>Status</th>
              <th>Created Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u.id}>
                  {/* User info */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--primary-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        color: '#ffffff'
                      }}>
                        {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.925rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.825rem', color: '#cbd5e1', marginTop: '1px' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Roles */}
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {u.roles && u.roles.length > 0 ? (
                        u.roles.map((r) => (
                          <span key={r.id} className={`badge ${getRoleBadgeClass(r.name)}`}>
                            {r.name}
                          </span>
                        ))
                      ) : (
                        <span className="badge badge-neutral">No Role</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                      {u.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>

                  {/* Date */}
                  <td style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                    {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>

                  {/* Action Buttons */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      {/* Toggle Status */}
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`btn btn-sm ${u.is_active ? 'btn-secondary' : 'btn-primary'}`}
                        title={u.is_active ? 'Deactivate user account' : 'Activate user account'}
                        disabled={u.id === currentUser.id}
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEditUser(u)}
                        className="btn-icon btn-secondary"
                        title="Edit user details"
                      >
                        <Edit size={15} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirmUser(u)}
                        className="btn-icon btn-danger-outline"
                        title="Delete user account"
                        disabled={u.id === currentUser.id}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  {isLoading ? 'Loading users...' : 'No users found matching query.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 500 }}>
            Page <strong style={{ color: '#ffffff' }}>{page}</strong> of <strong style={{ color: '#ffffff' }}>{totalPages}</strong> ({totalUsers} total employees)
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

      {/* User Create/Edit Modal */}
      {isUserModalOpen && (
        <UserModal
          isOpen={isUserModalOpen}
          onClose={() => { setIsUserModalOpen(false); setEditingUser(null); }}
          user={editingUser}
          roles={roles}
          onSaved={() => { fetchRoles(); fetchUsers(); }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmUser && (
        <ConfirmDialog
          isOpen={Boolean(deleteConfirmUser)}
          onClose={() => setDeleteConfirmUser(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete User Account"
          message={`Are you sure you want to delete the account for "${deleteConfirmUser?.name}" (${deleteConfirmUser?.email})? This action cannot be undone.`}
          confirmText="Delete User"
          isDangerous={true}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default UsersPage;
