import React from 'react';
import Modal from '../common/Modal';
import { Shield, Clock, Globe, User, Tag } from 'lucide-react';

const AuditDetailsModal = ({ isOpen, onClose, log }) => {
  if (!log) return null;

  const formattedDate = new Date(log.created_at).toLocaleString();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Security Audit Event Details" maxWidth="600px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Header Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem',
          background: 'var(--bg-app)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Tag size={13} />
              <span>ACTION</span>
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
              {log.action}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Clock size={13} />
              <span>TIMESTAMP</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {formattedDate}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <User size={13} />
              <span>ACTOR</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '2px' }}>
              {log.user_name ? `${log.user_name} (${log.user_email})` : 'System / Unauthenticated'}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Globe size={13} />
              <span>IP ADDRESS</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'monospace' }}>
              {log.ip_address || '127.0.0.1'}
            </div>
          </div>
        </div>

        {/* Resource URL */}
        <div>
          <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            TARGET RESOURCE / ENDPOINT
          </label>
          <div style={{
            background: 'var(--bg-app)',
            padding: '0.6rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            color: '#a5b4fc'
          }}>
            {log.resource}
          </div>
        </div>

        {/* Event Details JSON */}
        <div>
          <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            EVENT PAYLOAD & METADATA
          </label>
          <pre style={{
            background: '#040711',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: '#34d399',
            maxHeight: '220px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            {typeof log.details === 'object' 
              ? JSON.stringify(log.details, null, 2) 
              : (log.details || 'No additional payload.')}
          </pre>
        </div>

        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AuditDetailsModal;
