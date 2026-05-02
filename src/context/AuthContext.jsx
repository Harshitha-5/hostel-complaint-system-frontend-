import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth on first mount
  useEffect(() => {
    // Simply finish loading since we already loaded from localStorage via initializers
    setLoading(false);
  }, []);

  const login = async (email, password, selectedRole) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error occurred' }));
        return { success: false, message: errorData.message || `Server error: ${response.status}` };
      }

      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        setRole(data.user.role);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', data.user.role);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      // Handle network errors or CORS issues
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        return { 
          success: false, 
          message: `Cannot connect to server. Please make sure the backend server is running on ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}` 
        };
      }
      return { success: false, message: error.message || 'An unexpected error occurred' };
    }
  };

  const register = async (name, email, password, selectedRole = 'student', roomNo, hostel) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: selectedRole, roomNo, hostel }),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error occurred' }));
        return { success: false, message: errorData.message || `Server error: ${response.status}` };
      }

      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        setRole(data.user.role);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', data.user.role);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      // Handle network errors or CORS issues
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        return { 
          success: false, 
          message: `Cannot connect to server. Please make sure the backend server is running on ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}` 
        };
      }
      return { success: false, message: error.message || 'An unexpected error occurred' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  const value = {
    user,
    token,
    role,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
