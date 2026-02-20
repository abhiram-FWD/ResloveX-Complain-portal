import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem('resolvex_token') || null
  );
  const [loading, setLoading] = useState(true);

  // On mount: restore session if token exists
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('resolvex_token');
      if (savedToken) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (err) {
          localStorage.removeItem('resolvex_token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('resolvex_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    // Clear everything first
    localStorage.removeItem('resolvex_token');
    setToken(null);
    setUser(null);
    // Hard redirect — no lag, no stale dashboard
    window.location.href = '/';
  };

  const register = async (formData, type) => {
    const fn = type === 'authority'
      ? authService.registerAuthority
      : authService.registerCitizen;
    return await fn(formData);
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isAuthenticated: !!user,
      isCitizen: user?.role === 'citizen',
      isAuthority: user?.role === 'authority',
      isAdmin: user?.role === 'admin',
      login, logout, register
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);