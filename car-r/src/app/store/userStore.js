/**
 * User Store Slice
 * 
 * Manages user profiles and data:
 * - User profiles
 * - User statistics
 * - User management (admin)
 * - User preferences
 */

export const createUserSlice = (set, get, api) => ({
  // User State
  users: getInitialUsers(),
  userProfiles: {},
  selectedUser: null,
  userFilters: {
    role: 'all',
    status: 'all',
    joinedDate: 'all'
  },
  userLoading: false,
  userError: null,

  // User Actions
  createUser: (userData) => {
    const newUser = {
      id: `user_${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      lastLogin: null,
      stats: getInitialUserStats(userData.role)
    };

    set((state) => {
      state.users.push(newUser);
    });

    return newUser;
  },

  updateUser: (userId, updates) => {
    set((state) => {
      const userIndex = state.users.findIndex(user => user.id === userId);
      if (userIndex !== -1) {
        Object.assign(state.users[userIndex], {
          ...updates,
          updatedAt: new Date().toISOString()
        });
      }
    });
  },

  deleteUser: (userId) => {
    set((state) => {
      state.users = state.users.filter(user => user.id !== userId);
      if (state.selectedUser?.id === userId) {
        state.selectedUser = null;
      }
    });
  },

  selectUser: (userId) => {
    const state = get();
    const user = state.users.find(user => user.id === userId);
    
    set((draft) => {
      draft.selectedUser = user || null;
    });
  },

  updateUserStatus: (userId, status) => {
    set((state) => {
      const user = state.users.find(user => user.id === userId);
      if (user) {
        user.status = status;
        user.updatedAt = new Date().toISOString();
      }
    });
  },

  updateUserProfile: (userId, profileData) => {
    set((state) => {
      state.userProfiles[userId] = {
        ...state.userProfiles[userId],
        ...profileData,
        updatedAt: new Date().toISOString()
      };
    });
  },

  getUserProfile: (userId) => {
    const state = get();
    return state.userProfiles[userId] || null;
  },

  updateUserFilters: (newFilters) => {
    set((state) => {
      Object.assign(state.userFilters, newFilters);
    });
  },

  getFilteredUsers: () => {
    const state = get();
    const { users, userFilters } = state;

    let filtered = [...users];

    // Role filter
    if (userFilters.role !== 'all') {
      filtered = filtered.filter(user => user.role === userFilters.role);
    }

    // Status filter
    if (userFilters.status !== 'all') {
      filtered = filtered.filter(user => user.status === userFilters.status);
    }

    // Joined date filter
    if (userFilters.joinedDate !== 'all') {
      const now = new Date();
      const ranges = {
        today: [new Date(now.setHours(0, 0, 0, 0)), new Date(now.setHours(23, 59, 59, 999))],
        week: [new Date(now.setDate(now.getDate() - 7)), new Date()],
        month: [new Date(now.setMonth(now.getMonth() - 1)), new Date()]
      };
      
      const [start, end] = ranges[userFilters.joinedDate] || [null, null];
      if (start && end) {
        filtered = filtered.filter(user => {
          const joinedDate = new Date(user.createdAt);
          return joinedDate >= start && joinedDate <= end;
        });
      }
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getUsersByRole: (role) => {
    const state = get();
    return state.users.filter(user => user.role === role);
  },

  getUserStats: () => {
    const state = get();
    const { users } = state;

    return {
      total: users.length,
      customers: users.filter(u => u.role === 'customer').length,
      hosters: users.filter(u => u.role === 'hoster').length,
      admins: users.filter(u => u.role === 'admin').length,
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      newThisMonth: users.filter(u => {
        const userDate = new Date(u.createdAt);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return userDate >= monthAgo;
      }).length
    };
  },

  updateUserStats: (userId, statUpdates) => {
    set((state) => {
      const user = state.users.find(user => user.id === userId);
      if (user && user.stats) {
        Object.assign(user.stats, statUpdates);
        user.updatedAt = new Date().toISOString();
      }
    });
  },

  recordUserLogin: (userId) => {
    set((state) => {
      const user = state.users.find(user => user.id === userId);
      if (user) {
        user.lastLogin = new Date().toISOString();
        user.stats.totalLogins = (user.stats.totalLogins || 0) + 1;
      }
    });
  },

  // Search users
  searchUsers: (query) => {
    const state = get();
    const searchLower = query.toLowerCase();
    
    return state.users.filter(user =>
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  }
});

/**
 * Get initial user statistics based on role
 */
function getInitialUserStats(role) {
  const baseStats = {
    totalLogins: 0,
    accountCreated: new Date().toISOString()
  };

  const roleStats = {
    customer: {
      totalBookings: 0,
      completedTrips: 0,
      totalSpent: 0,
      averageRating: 5.0,
      favoriteCarType: null
    },
    hoster: {
      totalCars: 0,
      totalBookings: 0,
      totalEarnings: 0,
      averageRating: 5.0,
      responseTime: '2 hours'
    },
    admin: {
      usersManaged: 0,
      carsApproved: 0,
      reportsGenerated: 0,
      systemUptime: '99.9%'
    }
  };

  return {
    ...baseStats,
    ...roleStats[role]
  };
}

/**
 * Initial user data for demonstration
 */
function getInitialUsers() {
  return [
    {
      id: 'user_1692731200001',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'customer',
      status: 'active',
      avatar: '👩',
      phone: '+1-555-0101',
      location: 'New York, NY',
      joinedDate: '2025-01-15',
      lastLogin: '2025-08-22T01:30:00Z',
      stats: {
        totalLogins: 47,
        totalBookings: 8,
        completedTrips: 6,
        totalSpent: 1240,
        averageRating: 4.8,
        favoriteCarType: 'SUV'
      },
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-08-22T01:30:00Z'
    },
    {
      id: 'user_1692731200002',
      name: 'Mike Wilson',
      email: 'mike@example.com',
      role: 'hoster',
      status: 'active',
      avatar: '👨',
      phone: '+1-555-0102',
      location: 'Los Angeles, CA',
      joinedDate: '2024-11-20',
      lastLogin: '2025-08-21T19:45:00Z',
      stats: {
        totalLogins: 123,
        totalCars: 5,
        totalBookings: 89,
        totalEarnings: 8950,
        averageRating: 4.9,
        responseTime: '1.5 hours'
      },
      createdAt: '2024-11-20T14:30:00Z',
      updatedAt: '2025-08-21T19:45:00Z'
    },
    {
      id: 'user_1692731200003',
      name: 'Emma Davis',
      email: 'emma@example.com',
      role: 'customer',
      status: 'active',
      avatar: '👩',
      phone: '+1-555-0103',
      location: 'Chicago, IL',
      joinedDate: '2025-03-10',
      lastLogin: '2025-08-22T00:15:00Z',
      stats: {
        totalLogins: 23,
        totalBookings: 3,
        completedTrips: 2,
        totalSpent: 320,
        averageRating: 4.7,
        favoriteCarType: 'Compact'
      },
      createdAt: '2025-03-10T09:20:00Z',
      updatedAt: '2025-08-22T00:15:00Z'
    },
    {
      id: 'user_1692731200004',
      name: 'Admin User',
      email: 'admin@carrental.com',
      role: 'admin',
      status: 'active',
      avatar: '👤',
      phone: '+1-555-0000',
      location: 'System',
      joinedDate: '2024-01-01',
      lastLogin: '2025-08-22T02:00:00Z',
      stats: {
        totalLogins: 456,
        usersManaged: 1247,
        carsApproved: 485,
        reportsGenerated: 67,
        systemUptime: '99.9%'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-08-22T02:00:00Z'
    }
  ];
}
