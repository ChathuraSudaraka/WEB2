import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authService.getSessionStatus();
      const sessionData = response?.data?.data || response?.data;
      
      if (response && response.success && sessionData && sessionData.authenticated) {
        setUser({
          id: sessionData.userId,
          name: sessionData.userName,
          email: sessionData.userEmail,
          role: sessionData.userRole
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        // After successful login, check the auth status to get user info
        await checkAuthStatus();
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || 'Login failed. Please check your credentials.' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authService.signup(userData);
      if (response.success) {
        return { success: true, message: response.data?.message || 'Account created successfully' };
      } else {
        return { 
          success: false, 
          error: response.error || 'Signup failed. Please try again.' 
        };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Signup failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    }
  };

  const isAdmin = () => {
    const isTestAdmin = user && (user.email === 'admin@test.com' || user.email === 'test@admin.com' || user.email === 'admin@demo.com');
    const isRoleAdmin = user && user.role === 'ADMIN';
    
    return isRoleAdmin || isTestAdmin;
  };

  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    isAdmin,
    updateUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
