'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedUser = window.localStorage.getItem('contactos_usuario');
      const token = window.localStorage.getItem('contactos_token');
      if (savedUser && token) setUser(JSON.parse(savedUser));
    } catch {
      window.localStorage.removeItem('contactos_usuario');
      window.localStorage.removeItem('contactos_token');
    } finally {
      setReady(true);
    }

    const handleUnauthorized = () => setUser(null);
    window.addEventListener('contactos:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('contactos:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    window.localStorage.setItem('contactos_token', data.token);
    window.localStorage.setItem('contactos_usuario', JSON.stringify(data.usuario));
    setUser(data.usuario);
    return data.usuario;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem('contactos_token');
    window.localStorage.removeItem('contactos_usuario');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
