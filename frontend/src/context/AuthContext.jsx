import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('sec_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sec_auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data?.success) {
            setAdmin(res.data.admin);
            localStorage.setItem('sec_admin_user', JSON.stringify(res.data.admin));
          }
        } catch (err) {
          console.warn('[AuthContext] Verification token expired or invalid');
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data?.success && res.data.token) {
      setToken(res.data.token);
      setAdmin(res.data.admin);
      localStorage.setItem('sec_auth_token', res.data.token);
      localStorage.setItem('sec_admin_user', JSON.stringify(res.data.admin));
      return { success: true };
    }
    return { success: false, message: res.data?.message || 'Login failed' };
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('sec_auth_token');
    localStorage.removeItem('sec_admin_user');
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        loading,
        isAuthenticated: !!token && !!admin,
        login,
        logout,
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
