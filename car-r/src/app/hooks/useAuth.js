'use client';
import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { 
  getCurrentAuthStatus, 
  logout, 
  extendSession, 
  getTimeUntilExpiry,
  hasPermission,
  hasRole,
  getDashboardRoute
} from '../lib/auth.js';
import { canAccessRoute } from '../lib/guards.js';

/**
 * Custom Authentication Hook
 * 
 * This hook provides a comprehensive authentication interface including:
 * - Authentication state management
 * - Session monitoring
 * - Permission checking
 * - Auto-logout functionality
 * - Loading states
 */

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    userRole: null,
    permissions: {},
    sessionExpiry: null,
    timeUntilExpiry: 0
  });

  const [sessionWarning, setSessionWarning] = useState(false);

  /**
   * Initialize authentication state
   */
  const initializeAuth = useCallback(() => {
    try {
      const authStatus = getCurrentAuthStatus();
      
      if (authStatus) {
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          user: authStatus.user,
          userRole: authStatus.userRole,
          permissions: authStatus.user.permissions || {},
          sessionExpiry: authStatus.expiresAt,
          timeUntilExpiry: getTimeUntilExpiry()
        });
        
        console.log('✅ Auth state initialized:', authStatus.user.role);
      } else {
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          userRole: null,
          permissions: {},
          sessionExpiry: null,
          timeUntilExpiry: 0
        });
        
        console.log('❌ No valid authentication found');
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false
      }));
    }
  }, []);

  /**
   * Update session expiry time
   */
  const updateSessionTimer = useCallback(() => {
    if (authState.isAuthenticated) {
      const timeLeft = getTimeUntilExpiry();
      
      setAuthState(prev => ({
        ...prev,
        timeUntilExpiry: timeLeft
      }));

      // Show warning if session is about to expire (5 minutes)
      const warningThreshold = 5 * 60 * 1000; // 5 minutes
      if (timeLeft <= warningThreshold && timeLeft > 0 && !sessionWarning) {
        setSessionWarning(true);
        console.warn('⚠️  Session expiring soon:', Math.floor(timeLeft / 1000 / 60), 'minutes');
      }

      // Auto-logout if session expired
      if (timeLeft <= 0) {
        handleLogout('Session expired');
      }
    }
  }, [authState.isAuthenticated, sessionWarning]);

  /**
   * Handle logout
   */
  const handleLogout = useCallback((reason = 'User logout') => {
    console.log(`🚪 Logging out: ${reason}`);
    
    setAuthState({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      userRole: null,
      permissions: {},
      sessionExpiry: null,
      timeUntilExpiry: 0
    });
    
    setSessionWarning(false);
    logout();
  }, []);

  /**
   * Handle session extension
   */
  const handleExtendSession = useCallback(() => {
    if (extendSession()) {
      setSessionWarning(false);
      
      // Update auth state with new expiry
      const authStatus = getCurrentAuthStatus();
      if (authStatus) {
        setAuthState(prev => ({
          ...prev,
          sessionExpiry: authStatus.expiresAt,
          timeUntilExpiry: getTimeUntilExpiry()
        }));
      }
      
      console.log('🔄 Session extended successfully');
      return true;
    }
    
    console.error('❌ Failed to extend session');
    return false;
  }, []);

  /**
   * Check if user has specific permission
   */
  const checkPermission = useCallback((permission) => {
    return hasPermission(permission);
  }, []);

  /**
   * Check if user has specific role
   */
  const checkRole = useCallback((role) => {
    return hasRole(role);
  }, []);

  /**
   * Check if user can access route
   */
  const checkRouteAccess = useCallback((route) => {
    return canAccessRoute(route, authState.userRole);
  }, [authState.userRole]);

  /**
   * Get user's dashboard URL
   */
  const getDashboardUrl = useCallback(() => {
    if (!authState.userRole) return '/';
    return getDashboardRoute(authState.userRole);
  }, [authState.userRole]);

  /**
   * Refresh authentication state
   */
  const refreshAuth = useCallback(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Set up session monitoring
  useEffect(() => {
    let interval;
    
    if (authState.isAuthenticated) {
      // Update timer every minute
      interval = setInterval(updateSessionTimer, 60000);
      
      // Initial timer update
      updateSessionTimer();
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [authState.isAuthenticated, updateSessionTimer]);

  // Format time until expiry for display
  const formatTimeUntilExpiry = useCallback(() => {
    const minutes = Math.floor(authState.timeUntilExpiry / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }, [authState.timeUntilExpiry]);

  return {
    // Auth State
    ...authState,
    
    // Session Management
    sessionWarning,
    setSessionWarning,
    timeUntilExpiryFormatted: formatTimeUntilExpiry(),
    
    // Actions
    logout: handleLogout,
    extendSession: handleExtendSession,
    refreshAuth,
    
    // Checkers
    hasPermission: checkPermission,
    hasRole: checkRole,
    canAccessRoute: checkRouteAccess,
    
    // Utilities
    getDashboardUrl,
    
    // Role helpers
    isAdmin: authState.userRole === 'admin',
    isHoster: authState.userRole === 'hoster',
    isCustomer: authState.userRole === 'customer'
  };
};

/**
 * Authentication Context for Provider pattern
 */
const AuthContext = createContext(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
