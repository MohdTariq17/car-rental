/**
 * Role-Based Guards and Access Control
 * 
 * This module provides granular access control functions for different
 * user roles and permissions within the car rental application.
 */

import { USER_ROLES, ROLE_PERMISSIONS, getCurrentAuthStatus, hasPermission, hasRole } from './auth.js';

/**
 * Route access definitions
 */
export const ROUTE_ACCESS = {
  // Public routes (no authentication required)
  PUBLIC: [
    '/',
    '/login',
    '/register',
    '/about',
    '/contact',
    '/terms',
    '/privacy'
  ],

  // Admin-only routes
  ADMIN_ONLY: [
    '/pages/dashboard/admin',
    '/pages/dashboard/admin/*'
  ],

  // Hoster-only routes
  HOSTER_ONLY: [
    '/pages/dashboard/hoster',
    '/pages/dashboard/hoster/*'
  ],

  // Customer-only routes
  CUSTOMER_ONLY: [
    '/pages/cars',
    '/pages/cars/*'
  ],

  // Multi-role routes (specify allowed roles)
  MULTI_ROLE: {
    '/api/cars': [USER_ROLES.ADMIN, USER_ROLES.HOSTER, USER_ROLES.CUSTOMER],
    '/api/bookings': [USER_ROLES.ADMIN, USER_ROLES.HOSTER, USER_ROLES.CUSTOMER],
    '/api/profile': [USER_ROLES.ADMIN, USER_ROLES.HOSTER, USER_ROLES.CUSTOMER]
  }
};

/**
 * Permission-based access definitions
 */
export const PERMISSION_ACCESS = {
  'canManageUsers': ['admin'],
  'canManageFleet': ['admin'],
  'canViewReports': ['admin'],
  'canManageOwnCars': ['admin', 'hoster'],
  'canViewOwnEarnings': ['admin', 'hoster'],
  'canBookCars': ['admin', 'customer'],
  'canViewOwnBookings': ['admin', 'hoster', 'customer']
};

/**
 * Check if user can access a specific route
 */
export const canAccessRoute = (route, userRole = null) => {
  // Get current user role if not provided
  if (!userRole) {
    const authStatus = getCurrentAuthStatus();
    if (!authStatus) {
      // Only allow public routes for unauthenticated users
      return isPublicRoute(route);
    }
    userRole = authStatus.userRole;
  }

  // Check public routes
  if (isPublicRoute(route)) {
    return true;
  }

  // Check admin-only routes
  if (isAdminOnlyRoute(route)) {
    return userRole === USER_ROLES.ADMIN;
  }

  // Check hoster-only routes
  if (isHosterOnlyRoute(route)) {
    return userRole === USER_ROLES.HOSTER;
  }

  // Check customer-only routes
  if (isCustomerOnlyRoute(route)) {
    return userRole === USER_ROLES.CUSTOMER;
  }

  // Check multi-role routes
  const allowedRoles = getMultiRoleAccess(route);
  if (allowedRoles) {
    return allowedRoles.includes(userRole);
  }

  // Default: require authentication but allow any authenticated role
  return !!userRole;
};

/**
 * Check if route is public (no authentication required)
 */
export const isPublicRoute = (route) => {
  return ROUTE_ACCESS.PUBLIC.some(publicRoute => {
    if (publicRoute.endsWith('*')) {
      return route.startsWith(publicRoute.slice(0, -1));
    }
    return route === publicRoute;
  });
};

/**
 * Check if route requires admin access
 */
export const isAdminOnlyRoute = (route) => {
  return ROUTE_ACCESS.ADMIN_ONLY.some(adminRoute => {
    if (adminRoute.endsWith('*')) {
      return route.startsWith(adminRoute.slice(0, -1));
    }
    return route === adminRoute;
  });
};

/**
 * Check if route requires hoster access
 */
export const isHosterOnlyRoute = (route) => {
  return ROUTE_ACCESS.HOSTER_ONLY.some(hosterRoute => {
    if (hosterRoute.endsWith('*')) {
      return route.startsWith(hosterRoute.slice(0, -1));
    }
    return route === hosterRoute;
  });
};

/**
 * Check if route requires customer access
 */
export const isCustomerOnlyRoute = (route) => {
  return ROUTE_ACCESS.CUSTOMER_ONLY.some(customerRoute => {
    if (customerRoute.endsWith('*')) {
      return route.startsWith(customerRoute.slice(0, -1));
    }
    return route === customerRoute;
  });
};

/**
 * Get allowed roles for multi-role routes
 */
export const getMultiRoleAccess = (route) => {
  for (const [multiRoute, roles] of Object.entries(ROUTE_ACCESS.MULTI_ROLE)) {
    if (multiRoute.endsWith('*')) {
      if (route.startsWith(multiRoute.slice(0, -1))) {
        return roles;
      }
    } else if (route === multiRoute) {
      return roles;
    }
  }
  return null;
};

/**
 * Role-based guard functions
 */
export const guards = {
  /**
   * Admin Guard - Only allows admin users
   */
  admin: () => {
    const authStatus = getCurrentAuthStatus();
    if (!authStatus) {
      return { allowed: false, reason: 'NOT_AUTHENTICATED', redirect: '/' };
    }
    
    if (authStatus.userRole !== USER_ROLES.ADMIN) {
      return { 
        allowed: false, 
        reason: 'INSUFFICIENT_PRIVILEGES', 
        redirect: getDashboardRouteForRole(authStatus.userRole)
      };
    }
    
    return { allowed: true };
  },

  /**
   * Hoster Guard - Only allows hoster users
   */
  hoster: () => {
    const authStatus = getCurrentAuthStatus();
    if (!authStatus) {
      return { allowed: false, reason: 'NOT_AUTHENTICATED', redirect: '/' };
    }
    
    if (authStatus.userRole !== USER_ROLES.HOSTER) {
      return { 
        allowed: false, 
        reason: 'INSUFFICIENT_PRIVILEGES', 
        redirect: getDashboardRouteForRole(authStatus.userRole)
      };
    }
    
    return { allowed: true };
  },

  /**
   * Customer Guard - Only allows customer users
   */
  customer: () => {
    const authStatus = getCurrentAuthStatus();
    if (!authStatus) {
      return { allowed: false, reason: 'NOT_AUTHENTICATED', redirect: '/' };
    }
    
    if (authStatus.userRole !== USER_ROLES.CUSTOMER) {
      return { 
        allowed: false, 
        reason: 'INSUFFICIENT_PRIVILEGES', 
        redirect: getDashboardRouteForRole(authStatus.userRole)
      };
    }
    
    return { allowed: true };
  },

  /**
   * Authenticated Guard - Allows any authenticated user
   */
  authenticated: () => {
    const authStatus = getCurrentAuthStatus();
    if (!authStatus) {
      return { allowed: false, reason: 'NOT_AUTHENTICATED', redirect: '/' };
    }
    
    return { allowed: true };
  },

  /**
   * Permission-based Guard - Checks specific permissions
   */
  permission: (requiredPermission) => {
    const authStatus = getCurrentAuthStatus();
    if (!authStatus) {
      return { allowed: false, reason: 'NOT_AUTHENTICATED', redirect: '/' };
    }
    
    if (!hasPermission(requiredPermission)) {
      return { 
        allowed: false, 
        reason: 'INSUFFICIENT_PERMISSIONS', 
        redirect: getDashboardRouteForRole(authStatus.userRole)
      };
    }
    
    return { allowed: true };
  },

  /**
   * Multi-role Guard - Allows multiple specific roles
   */
  roles: (allowedRoles) => {
    const authStatus = getCurrentAuthStatus();
    if (!authStatus) {
      return { allowed: false, reason: 'NOT_AUTHENTICATED', redirect: '/' };
    }
    
    if (!allowedRoles.includes(authStatus.userRole)) {
      return { 
        allowed: false, 
        reason: 'ROLE_NOT_ALLOWED', 
        redirect: getDashboardRouteForRole(authStatus.userRole)
      };
    }
    
    return { allowed: true };
  }
};

/**
 * Get appropriate dashboard route for user role
 */
function getDashboardRouteForRole(role) {
  const dashboards = {
    [USER_ROLES.ADMIN]: '/pages/dashboard/admin',
    [USER_ROLES.HOSTER]: '/pages/dashboard/hoster',
    [USER_ROLES.CUSTOMER]: '/pages/cars'
  };
  
  return dashboards[role] || '/';
}

/**
 * High-level access control function
 */
export const checkAccess = (route, requiredRole = null, requiredPermission = null) => {
  console.log(`🔐 Checking access: ${route} | Role: ${requiredRole} | Permission: ${requiredPermission}`);
  
  // Check route access
  if (!canAccessRoute(route)) {
    return { 
      allowed: false, 
      reason: 'ROUTE_FORBIDDEN',
      message: 'You do not have permission to access this page'
    };
  }
  
  // Check specific role if required
  if (requiredRole) {
    const roleCheck = guards.roles([requiredRole]);
    if (!roleCheck.allowed) {
      return roleCheck;
    }
  }
  
  // Check specific permission if required
  if (requiredPermission) {
    const permissionCheck = guards.permission(requiredPermission);
    if (!permissionCheck.allowed) {
      return permissionCheck;
    }
  }
  
  return { allowed: true };
};

/**
 * Get user access summary
 */
export const getUserAccessSummary = () => {
  const authStatus = getCurrentAuthStatus();
  if (!authStatus) {
    return {
      authenticated: false,
      role: null,
      permissions: {},
      accessibleRoutes: ROUTE_ACCESS.PUBLIC
    };
  }
  
  const userRole = authStatus.userRole;
  const permissions = ROLE_PERMISSIONS[userRole] || {};
  
  // Determine accessible routes based on role
  let accessibleRoutes = [...ROUTE_ACCESS.PUBLIC];
  
  if (userRole === USER_ROLES.ADMIN) {
    accessibleRoutes.push(...ROUTE_ACCESS.ADMIN_ONLY);
  } else if (userRole === USER_ROLES.HOSTER) {
    accessibleRoutes.push(...ROUTE_ACCESS.HOSTER_ONLY);
  } else if (userRole === USER_ROLES.CUSTOMER) {
    accessibleRoutes.push(...ROUTE_ACCESS.CUSTOMER_ONLY);
  }
  
  // Add multi-role routes where user has access
  Object.entries(ROUTE_ACCESS.MULTI_ROLE).forEach(([route, allowedRoles]) => {
    if (allowedRoles.includes(userRole)) {
      accessibleRoutes.push(route);
    }
  });
  
  return {
    authenticated: true,
    role: userRole,
    permissions: permissions,
    accessibleRoutes: accessibleRoutes,
    userId: authStatus.user.id,
    sessionExpiry: authStatus.expiresAt
  };
};

/**
 * Debug function to test access controls
 */
export const debugAccess = (route, role = null) => {
  console.group(`🔍 Access Debug: ${route}`);
  console.log('Public Route:', isPublicRoute(route));
  console.log('Admin Only:', isAdminOnlyRoute(route));
  console.log('Hoster Only:', isHosterOnlyRoute(route));
  console.log('Customer Only:', isCustomerOnlyRoute(route));
  console.log('Multi-Role Access:', getMultiRoleAccess(route));
  console.log('Can Access:', canAccessRoute(route, role));
  console.groupEnd();
};
