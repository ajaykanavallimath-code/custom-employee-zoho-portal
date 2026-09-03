import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AppCard from '../components/dashboard/AppCard';
import { Layers, Search, ShieldCheck } from 'lucide-react';

const ApplicationsPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const authorizedApps = user?.authorizedApps || [];

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(authorizedApps.map(a => a.category).filter(Boolean)))];

  const filteredApps = authorizedApps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
            My Applications
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Launch and manage your assigned Zoho One enterprise modules
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="input-with-icon" style={{ width: '260px' }}>
            <Search className="input-icon-left" size={16} />
            <input
              type="text"
              className="form-input"
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '0.55rem 1rem 0.55rem 2.5rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 2 && (
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filteredApps.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <Layers size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            No matching applications found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Try adjusting your search criteria or category filter.
          </p>
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
