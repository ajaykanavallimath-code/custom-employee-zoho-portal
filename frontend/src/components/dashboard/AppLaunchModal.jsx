import React, { useState } from 'react';
import Modal from '../common/Modal';
import { ExternalLink, ShieldCheck, CheckCircle2, Lock, ArrowRight, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AppLaunchModal = ({ app, isOpen, onClose }) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const { showError, showSuccess } = useToast();

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      // Secure backend launch verification & audit logging
      const res = await api.post(`/apps/${app.id}/launch`);
      
      if (res.data.success) {
        showSuccess(`Launching ${app.name} workspace...`);
        // Open the authorized application URL
        const targetUrl = res.data.launchUrl || app.url;
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
        onClose();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to verify application launch.');
    } finally {
      setIsLaunching(false);
    }
  };

  if (!app) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Launch ${app.name}`} maxWidth="520px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* App Banner Card */}
        <div style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          background: app.accentBg || 'rgba(99, 102, 241, 0.1)',
          border: `1px solid ${app.themeColor || '#6366f1'}33`,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: app.themeColor || '#4f46e5',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.1rem'
          }}>
            {app.name.charAt(0)}
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '2px' }}>{app.name}</h4>
            <div style={{ fontSize: '0.8rem', color: app.themeColor || 'var(--text-secondary)' }}>
              {app.tagline || 'Zoho One Integrated Application'}
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          {app.description}
        </p>

        {/* Security & Access Guarantee Box */}
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
            <ShieldCheck size={16} />
            <span>Role-Based Access Verified</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Your session is securely authorized. All OAuth secrets and refresh tokens are isolated on the backend server.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={isLaunching}>
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleLaunch}
            disabled={isLaunching}
            style={{
              backgroundColor: app.themeColor || 'var(--primary)',
              borderColor: app.themeColor || 'var(--primary)'
            }}
          >
            {isLaunching ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Verifying Launch...</span>
              </>
            ) : (
              <>
                <span>Open {app.name}</span>
                <ExternalLink size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AppLaunchModal;
