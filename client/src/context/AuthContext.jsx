import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('userInfo');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  const updateBalanceLocally = useCallback((newBalance) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, virtualBalance: newBalance };
      localStorage.setItem('userInfo', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/profile');
      setUser(prev => {
        const updated = { ...prev, ...data };
        localStorage.setItem('userInfo', JSON.stringify(updated));
        return updated;
      });
    } catch {
      // silently fail
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, updateBalanceLocally, refreshProfile }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
