import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch logged-in user profile on load
    apiClient.get('/api/me')
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {
        // Unauthenticated or guest mode
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try {
      await apiClient.post('/logout');
      setUser(null);
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
