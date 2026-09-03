import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Headphones, 
  DollarSign, 
  ExternalLink, 
  Check, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';
import AppLaunchModal from './AppLaunchModal';

const AppCard = ({ app, onLaunch }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pick suitable Lucide icon
  const getAppIcon = (iconName) => {
    switch (iconName) {
      case 'Users':
        return <Users size={24} color={app.themeColor || '#10b981'} />;
      case 'Briefcase':
        return <Briefcase size={24} color={app.themeColor || '#3b82f6'} />;
      case 'Headphones':
        return <Headphones size={24} color={app.themeColor || '#f59e0b'} />;
      case 'DollarSign':
        return <DollarSign size={24} color={app.themeColor || '#8b5cf6'} />;
      default:
        return <Briefcase size={24} color="#6366f1" />;
    }
  };

  const handleOpenClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="app-card">
        {/* Header */}
        <div className="app-card-header">
          <div 
            className="app-card-icon-wrap"
            style={{ 
              backgroundColor: app.accentBg || 'rgba(99, 102, 241, 0.12)',
              border: `1px solid ${app.themeColor || '#6366f1'}33`
            }}
          >
            {getAppIcon(app.icon)}
          </div>
          <span 
            className="badge" 
            style={{ 
              backgroundColor: app.accentBg || 'rgba(255,255,255,0.05)',
              color: app.themeColor || '#94a3b8',
              borderColor: `${app.themeColor || '#94a3b8'}44`
            }}
          >
            {app.category || 'Zoho One'}
          </span>
        </div>

        {/* Title & Tagline */}
        <h3 className="app-card-title">{app.name}</h3>
        <div className="app-card-category" style={{ color: app.themeColor, marginBottom: '0.75rem' }}>
          {app.tagline || 'Enterprise Module'}
        </div>

        {/* Description */}
        <p className="app-card-description">
          {app.description}
        </p>

        {/* Highlighted Module Features */}
        {app.features && app.features.length > 0 && (
          <ul className="app-features-list">
            {app.features.slice(0, 3).map((feat, idx) => (
              <li key={idx} className="app-feature-item">
                <Check size={14} color={app.themeColor || '#10b981'} style={{ flexShrink: 0 }} />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Footer & Action Button */}
        <div className="app-card-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>Authorized Access</span>
          </div>

          <button 
            className="btn btn-primary"
            onClick={handleOpenClick}
            style={{
              backgroundColor: app.themeColor || 'var(--primary)',
              borderColor: app.themeColor || 'var(--primary)',
              boxShadow: `0 2px 8px ${app.themeColor || '#4f46e5'}40`
            }}
          >
            <span>Open {app.name}</span>
            <ExternalLink size={15} />
          </button>
        </div>
      </div>

      {/* Secure Launch Modal */}
      {isModalOpen && (
        <AppLaunchModal 
          app={app} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};

export default AppCard;
