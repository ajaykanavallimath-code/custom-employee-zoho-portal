import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('portal_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('portal_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize state with current user profile from server
  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('portal_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('portal_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Session verification failed, logging out:', err.response?.data?.message || err.message);
      localStorage.removeItem('portal_token');
      localStorage.removeItem('portal_user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    // Listen for global unauthorized trigger
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [fetchCurrentUser]);

  // Login action
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success && res.data.token) {
      const receivedToken = res.data.token;
      const receivedUser = res.data.user;

      localStorage.setItem('portal_token', receivedToken);
      localStorage.setItem('portal_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  // Logout action
  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (err) {
      console.warn('Logout API error:', err.message);
    } finally {
      localStorage.removeItem('portal_token');
      localStorage.removeItem('portal_user');
      setUser(null);
      setToken(null);
    }
  };

  // RBAC Helper functions
  const hasRole = (role) => {
    if (!user) return false;
    const roles = user.roleNames || (user.roles && user.roles.map(r => r.name)) || [];
    if (roles.includes('Admin')) return true;
    if (Array.isArray(role)) {
      return role.some(r => roles.includes(r));
    }
    return roles.includes(role);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const roles = user.roleNames || [];
    if (roles.includes('Admin')) return true;
    const permissions = user.permissionNames || [];
    if (Array.isArray(permission)) {
      return permission.some(p => permissions.includes(p));
    }
    return permissions.includes(permission);
  };

  const canAccessApp = (appId) => {
    if (!user) return false;
    const authorized = user.authorizedApps || [];
    return authorized.some(
      app => app.id === appId || app.key === appId || app.name?.toLowerCase() === appId?.toLowerCase()
    );
  };

  const isAdmin = Boolean(user && (user.roleNames?.includes('Admin') || user.primaryRole === 'Admin'));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        isAdmin,
        login,
        logout,
        hasRole,
        hasPermission,
        canAccessApp,
        refreshProfile: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
