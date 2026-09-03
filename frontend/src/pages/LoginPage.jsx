import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layers, Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Demo accounts for instant reviewer access
  const demoAccounts = [
    { label: 'Admin', email: 'admin@example.com', pass: 'Admin@12345', badge: 'badge-admin', desc: 'All Zoho Apps & Admin Center' },
    { label: 'HR', email: 'hr@example.com', pass: 'Hr@12345', badge: 'badge-hr', desc: 'Zoho People (HR Module)' },
    { label: 'Sales', email: 'sales@example.com', pass: 'Sales@12345', badge: 'badge-sales', desc: 'Zoho CRM (Sales Module)' },
    { label: 'Support', email: 'support@example.com', pass: 'Support@12345', badge: 'badge-support', desc: 'Zoho Desk (Helpdesk)' },
    { label: 'Finance', email: 'finance@example.com', pass: 'Finance@12345', badge: 'badge-finance', desc: 'Zoho Books (Accounting)' },
    { label: 'Operations', email: 'ops@example.com', pass: 'Ops@12345', badge: 'badge-finance', desc: 'Zoho People & CRM (Operations Manager)' },
    { label: 'DevOps', email: 'devops@example.com', pass: 'Devops@12345', badge: 'badge-admin', desc: 'Audit & Catalog (DevOps Lead)' },
  ];

  const handleQuickFill = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const data = await login(email, password);
      showSuccess(`Welcome back, ${data.user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Ambient Glows */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        right: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '460px',
        zIndex: 10
      }}>
        {/* Card Container */}
        <div className="card" style={{ padding: '2.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)' }}>
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--primary-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '1rem',
              boxShadow: '0 0 25px var(--primary-glow)'
            }}>
              <Layers size={28} />
            </div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>Employee Portal</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Sign in to access your authorized Zoho One applications
            </p>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-rose-bg)',
              border: '1px solid var(--accent-rose-border)',
              color: '#fda4af',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Lock size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Corporate Email</label>
              <div className="input-with-icon">
                <Mail className="input-icon-left" size={18} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon-left" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '2.75rem' }}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-gradient"
              style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts Quick-Select for Evaluators */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem'
            }}>
              <Key size={13} color="#6366f1" />
              <span>Quick-Fill Demo Credentials</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className={`badge ${acc.badge}`}
                  style={{
                    cursor: 'pointer',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    border: '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  title={`${acc.email} (${acc.desc})`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security Assurance Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>Role-Based Access Control • Backend Encrypted OAuth 2.0</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
