/**
 * Enhanced Authentication Utilities
 * 
 * This module provides comprehensive authentication functions including:
 * - User login/logout
 * - Session management
 * - Token handling
 * - Role verification
 * - Auto-logout functionality
 */

// Session configuration
const SESSION_CONFIG = {
  EXPIRY_TIME: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  WARNING_TIME: 5 * 60 * 1000, // 5 minutes warning before expiry
  REFRESH_INTERVAL: 15 * 60 * 1000 // Check every 15 minutes
};

// Valid roles in the system
export const USER_ROLES = {
  ADMIN: 'admin',
  HOSTER: 'hoster',
  CUSTOMER: 'customer'
};

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    canAccessAdmin: true,
    canAccessHoster: true,
    canAccessCustomer: true,
    canManageUsers: true,
    canManageFleet: true,
    canViewReports: true
  },
  [USER_ROLES.HOSTER]: {
    canAccessAdmin: false,
    canAccessHoster: true,
    canAccessCustomer: false,
    canManageOwnCars: true,
    canViewOwnEarnings: true
  },
  [USER_ROLES.CUSTOMER]: {
    canAccessAdmin: false,
    canAccessHoster: false,
    canAccessCustomer: true,
    canBookCars: true,
    canViewOwnBookings: true
  }
};

/**
 * Enhanced user authentication with session management
 */
export const authenticateUser = async (role, identifier, accessCode) => {
  console.log(`🔐 Authenticating: ${role} | ${identifier}`);

  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Basic validation
    if (!identifier?.trim() || !accessCode?.trim()) {
      return {
        success: false,
        message: 'Please provide both identifier and access code',
        error: 'MISSING_CREDENTIALS'
      };
    }

    // Validate role
    if (!Object.values(USER_ROLES).includes(role)) {
      return {
        success: false,
        message: 'Invalid user role',
        error: 'INVALID_ROLE'
      };
    }

    // Mock authentication - accepts any non-empty credentials
    const authResult = performMockAuthentication(role, identifier, accessCode);
    
    if (authResult.success) {
      // Create session
      const sessionData = createUserSession(role, identifier, authResult.userData);
      
      // Store in both localStorage and cookies for middleware
      storeAuthData(sessionData);
      
      // Set up session monitoring
      setupSessionMonitoring();
      
      console.log('✅ Authentication successful');
      return {
        success: true,
        message: 'Authentication successful',
        userData: authResult.userData,
        sessionData
      };
    }

    return authResult;

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      message: 'Authentication service unavailable',
      error: 'SERVICE_ERROR'
    };
  }
};

/**
 * Mock authentication logic
 */
function performMockAuthentication(role, identifier, accessCode) {
  // Role-specific mock validation
  const validators = {
    [USER_ROLES.ADMIN]: validateAdminCredentials,
    [USER_ROLES.HOSTER]: validateHosterCredentials,
    [USER_ROLES.CUSTOMER]: validateCustomerCredentials
  };

  const validator = validators[role];
  if (validator) {
    return validator(identifier, accessCode);
  }

  return {
    success: false,
    message: 'Invalid authentication method',
    error: 'INVALID_AUTH_METHOD'
  };
}

/**
 * Mock validation functions
 */
function validateAdminCredentials(identifier, accessCode) {
  if (identifier.trim() && accessCode.trim()) {
    return {
      success: true,
      userData: {
        id: 'admin_' + Date.now(),
        role: USER_ROLES.ADMIN,
        identifier: identifier,
        permissions: ROLE_PERMISSIONS[USER_ROLES.ADMIN],
        loginTime: new Date().toISOString()
      }
    };
  }
  return { success: false, message: 'Invalid admin credentials', error: 'INVALID_CREDENTIALS' };
}

function validateHosterCredentials(identifier, accessCode) {
  if (identifier.trim() && accessCode.trim()) {
    return {
      success: true,
      userData: {
        id: 'hoster_' + Date.now(),
        role: USER_ROLES.HOSTER,
        identifier: identifier,
        permissions: ROLE_PERMISSIONS[USER_ROLES.HOSTER],
        loginTime: new Date().toISOString()
      }
    };
  }
  return { success: false, message: 'Invalid hoster credentials', error: 'INVALID_CREDENTIALS' };
}

function validateCustomerCredentials(identifier, accessCode) {
  if (identifier.trim() && accessCode.trim()) {
    return {
      success: true,
      userData: {
        id: 'customer_' + Date.now(),
        role: USER_ROLES.CUSTOMER,
        identifier: identifier,
        permissions: ROLE_PERMISSIONS[USER_ROLES.CUSTOMER],
        loginTime: new Date().toISOString()
      }
    };
  }
  return { success: false, message: 'Invalid customer credentials', error: 'INVALID_CREDENTIALS' };
}

/**
 * Create user session with expiry
 */
function createUserSession(role, identifier, userData) {
  const now = Date.now();
  const expiresAt = now + SESSION_CONFIG.EXPIRY_TIME;

  return {
    user: userData,
    sessionId: 'session_' + now + '_' + Math.random().toString(36).substr(2, 9),
    isLoggedIn: true,
    userRole: role,
    userIdentifier: identifier,
    loginTime: now,
    expiresAt: expiresAt,
    lastActivity: now
  };
}

/**
 * Store authentication data
 */
function storeAuthData(sessionData) {
  // Store in localStorage for client-side access
  localStorage.setItem('authData', JSON.stringify(sessionData));
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('userRole', sessionData.userRole);
  localStorage.setItem('userIdentifier', sessionData.userIdentifier);
  localStorage.setItem('sessionExpiry', sessionData.expiresAt.toString());

  // Store in cookies for middleware access
  if (typeof document !== 'undefined') {
    const expiryDate = new Date(sessionData.expiresAt);
    document.cookie = `isLoggedIn=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = `userRole=${sessionData.userRole}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = `sessionExpiry=${sessionData.expiresAt}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  }
}

/**
 * Get current authentication status
 */
export const getCurrentAuthStatus = () => {
  try {
    const authDataStr = localStorage.getItem('authData');
    if (!authDataStr) return null;

    const authData = JSON.parse(authDataStr);
    
    // Check if session is expired
    if (Date.now() > authData.expiresAt) {
      console.log('🕐 Session expired, logging out...');
      logout();
      return null;
    }

    // Update last activity
    authData.lastActivity = Date.now();
    localStorage.setItem('authData', JSON.stringify(authData));

    return authData;
  } catch (error) {
    console.error('Error getting auth status:', error);
    return null;
  }
};

/**
 * Check if current session is valid
 */
export const isSessionValid = () => {
  const authStatus = getCurrentAuthStatus();
  return authStatus !== null;
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (permission) => {
  const authStatus = getCurrentAuthStatus();
  if (!authStatus) return false;

  const userPermissions = authStatus.user.permissions;
  return userPermissions && userPermissions[permission] === true;
};

/**
 * Check if user has specific role
 */
export const hasRole = (role) => {
  const authStatus = getCurrentAuthStatus();
  return authStatus?.userRole === role;
};

/**
 * Get time until session expires
 */
export const getTimeUntilExpiry = () => {
  const authStatus = getCurrentAuthStatus();
  if (!authStatus) return 0;

  return Math.max(0, authStatus.expiresAt - Date.now());
};

/**
 * Extend session expiry
 */
export const extendSession = () => {
  const authStatus = getCurrentAuthStatus();
  if (!authStatus) return false;

  const newExpiryTime = Date.now() + SESSION_CONFIG.EXPIRY_TIME;
  authStatus.expiresAt = newExpiryTime;
  
  storeAuthData(authStatus);
  console.log('🔄 Session extended');
  return true;
};

/**
 * Setup session monitoring
 */
function setupSessionMonitoring() {
  // Clear any existing interval
  if (window.sessionMonitorInterval) {
    clearInterval(window.sessionMonitorInterval);
  }

  // Set up new monitoring interval
  window.sessionMonitorInterval = setInterval(() => {
    const timeLeft = getTimeUntilExpiry();
    
    // Session expired
    if (timeLeft <= 0) {
      console.log('🕐 Session expired during monitoring');
      logout();
      return;
    }
    
    // Warning time reached
    if (timeLeft <= SESSION_CONFIG.WARNING_TIME && !window.sessionWarningShown) {
      window.sessionWarningShown = true;
      console.log('⚠️  Session expiring soon');
      
      // You could show a modal or notification here
      if (confirm('Your session is about to expire. Do you want to extend it?')) {
        extendSession();
        window.sessionWarningShown = false;
      }
    }
  }, SESSION_CONFIG.REFRESH_INTERVAL);
}

/**
 * Enhanced logout function
 */
export const logout = () => {
  console.log('🚪 Logging out user...');

  // Clear localStorage
  const keysToRemove = [
    'authData', 'isLoggedIn', 'userRole', 
    'userIdentifier', 'sessionExpiry'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  // Clear cookies
  if (typeof document !== 'undefined') {
    const cookiesToClear = ['isLoggedIn', 'userRole', 'sessionExpiry'];
    cookiesToClear.forEach(cookie => {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  }

  // Clear session monitoring
  if (window.sessionMonitorInterval) {
    clearInterval(window.sessionMonitorInterval);
    delete window.sessionMonitorInterval;
  }

  // Clear warning flag
  delete window.sessionWarningShown;

  // Redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

/**
 * Force logout (for security reasons)
 */
export const forceLogout = (reason = 'Security logout') => {
  console.log(`🚨 Force logout: ${reason}`);
  logout();
};

/**
 * Validate auth token format (for future API integration)
 */
export const validateAuthToken = (token) => {
  if (!token) return false;
  
  // Basic token format validation
  // In real app, this would validate JWT structure
  return token.length > 10 && token.includes('_');
};

/**
 * Get user dashboard route based on role
 */
export const getDashboardRoute = (role) => {
  const routes = {
    [USER_ROLES.ADMIN]: '/pages/dashboard/admin',
    [USER_ROLES.HOSTER]: '/pages/dashboard/hoster',
    [USER_ROLES.CUSTOMER]: '/pages/cars'
  };

  return routes[role] || '/';
};

/**
 * Initialize auth system
 */
export const initializeAuth = () => {
  // Check for existing session
  const authStatus = getCurrentAuthStatus();
  
  if (authStatus) {
    console.log('🔄 Resuming existing session');
    setupSessionMonitoring();
    return authStatus;
  }
  
  console.log('🆕 No existing session found');
  return null;
};
