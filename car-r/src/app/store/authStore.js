/**
 * Authentication Store Slice
 * 
 * Manages authentication state including:
 * - Login/logout functionality
 * - Session management
 * - User profile data
 * - Permission checking
 */

export const createAuthSlice = (set, get, api) => ({
  // Auth State
  isAuthenticated: false,
  currentUser: null,
  userRole: null,
  sessionExpiry: null,
  loginAttempts: 0,
  lastLoginTime: null,
  authLoading: false,
  authError: null,

  // Auth Actions
  login: async (credentials) => {
    set((state) => {
      state.authLoading = true;
      state.authError = null;
    });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { role, identifier, accessCode } = credentials;
      
      // Mock authentication logic
      if (!identifier.trim() || !accessCode.trim()) {
        throw new Error('Please provide both identifier and access code');
      }

      const userData = createUserData(role, identifier);
      const sessionExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

      set((state) => {
        state.isAuthenticated = true;
        state.currentUser = userData;
        state.userRole = role;
        state.sessionExpiry = sessionExpiry;
        state.lastLoginTime = Date.now();
        state.loginAttempts = 0;
        state.authLoading = false;
        state.authError = null;
      });

      // Store in localStorage for persistence
      localStorage.setItem('authData', JSON.stringify({
        user: userData,
        role: role,
        sessionExpiry: sessionExpiry,
        isAuthenticated: true
      }));

      return { success: true, user: userData };

    } catch (error) {
      set((state) => {
        state.authLoading = false;
        state.authError = error.message;
        state.loginAttempts += 1;
      });

      return { success: false, error: error.message };
    }
  },

  logout: () => {
    set((state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.userRole = null;
      state.sessionExpiry = null;
      state.authError = null;
    });

    // Clear localStorage
    localStorage.removeItem('authData');
    
    console.log('🚪 User logged out successfully');
  },

  updateUserProfile: (updates) => {
    set((state) => {
      if (state.currentUser) {
        Object.assign(state.currentUser, updates);
      }
    });
  },

  extendSession: () => {
    const newExpiry = Date.now() + (24 * 60 * 60 * 1000);
    
    set((state) => {
      state.sessionExpiry = newExpiry;
    });

    // Update localStorage
    const authData = JSON.parse(localStorage.getItem('authData') || '{}');
    authData.sessionExpiry = newExpiry;
    localStorage.setItem('authData', JSON.stringify(authData));

    return newExpiry;
  },

  checkSession: () => {
    const state = get();
    
    if (!state.isAuthenticated) return false;
    
    const now = Date.now();
    if (state.sessionExpiry && now > state.sessionExpiry) {
      // Session expired
      state.logout();
      return false;
    }
    
    return true;
  },

  initializeAuth: () => {
    try {
      const authData = localStorage.getItem('authData');
      if (!authData) return false;

      const parsed = JSON.parse(authData);
      const now = Date.now();

      // Check if session is expired
      if (parsed.sessionExpiry && now > parsed.sessionExpiry) {
        localStorage.removeItem('authData');
        return false;
      }

      set((state) => {
        state.isAuthenticated = parsed.isAuthenticated || false;
        state.currentUser = parsed.user || null;
        state.userRole = parsed.role || null;
        state.sessionExpiry = parsed.sessionExpiry || null;
      });

      return true;
    } catch (error) {
      console.error('Error initializing auth:', error);
      return false;
    }
  },

  // Permission helpers
  hasPermission: (permission) => {
    const state = get();
    if (!state.currentUser || !state.currentUser.permissions) return false;
    return state.currentUser.permissions[permission] === true;
  },

  hasRole: (role) => {
    const state = get();
    return state.userRole === role;
  },

  canAccessRoute: (route) => {
    const state = get();
    if (!state.isAuthenticated) return false;
    
    // Route access logic based on role
    const roleRoutes = {
      admin: ['/dashboard/admin', '/cars', '/dashboard/hoster'],
      hoster: ['/dashboard/hoster'],
      customer: ['/cars']
    };
    
    const allowedRoutes = roleRoutes[state.userRole] || [];
    return allowedRoutes.some(allowedRoute => route.startsWith(allowedRoute));
  }
});

/**
 * Create user data based on role
 */
function createUserData(role, identifier) {
  const baseUser = {
    id: `${role}_${Date.now()}`,
    identifier: identifier,
    role: role,
    loginTime: new Date().toISOString(),
    avatar: '👤',
    status: 'active'
  };

  const roleSpecificData = {
    admin: {
      name: 'Administrator',
      permissions: {
        canManageUsers: true,
        canManageFleet: true,
        canViewReports: true,
        canAccessAdmin: true,
        canAccessHoster: true,
        canAccessCustomer: true
      },
      stats: {
        totalUsers: 1247,
        totalCars: 485,
        activeBookings: 123,
        monthlyRevenue: 89456
      }
    },
    hoster: {
      name: identifier.split('@')[0] || 'Hoster',
      permissions: {
        canManageOwnCars: true,
        canViewOwnEarnings: true,
        canAccessHoster: true
      },
      stats: {
        totalCars: 8,
        activeBookings: 12,
        monthlyEarnings: 3240,
        averageRating: 4.8
      }
    },
    customer: {
      name: identifier.split('@')[0] || 'Customer',
      permissions: {
        canBookCars: true,
        canViewOwnBookings: true,
        canAccessCustomer: true
      },
      stats: {
        totalTrips: 15,
        rating: 4.9,
        memberSince: '2023',
        favoriteCarType: 'SUV'
      }
    }
  };

  return {
    ...baseUser,
    ...roleSpecificData[role]
  };
}

