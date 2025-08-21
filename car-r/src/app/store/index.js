/**
 * Main Store Configuration
 * 
 * This file sets up the combined store using Zustand with:
 * - Multiple store slices
 * - Persistence middleware
 * - DevTools integration
 * - Cross-store communication
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Import store slices
import { createAuthSlice } from './authStore.js';
import { createCarSlice } from './carStore.js';
import { createBookingSlice } from './bookingStore.js';
import { createUserSlice } from './userStore.js';

/**
 * Combined Store with Multiple Slices
 */
export const useAppStore = create()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get, api) => ({
          // Auth slice
          ...createAuthSlice(set, get, api),
          
          // Car management slice
          ...createCarSlice(set, get, api),
          
          // Booking management slice
          ...createBookingSlice(set, get, api),
          
          // User management slice
          ...createUserSlice(set, get, api),

          // Global actions
          resetAllStores: () => {
            set((state) => {
              // Reset all slices to initial state
              Object.assign(state, getInitialState());
            });
          },

          // Cross-store utilities
          getStoreSnapshot: () => {
            const state = get();
            return {
              auth: {
                isAuthenticated: state.isAuthenticated,
                user: state.currentUser,
                userRole: state.userRole
              },
              cars: {
                totalCars: state.cars.length,
                availableCars: state.cars.filter(car => car.available).length
              },
              bookings: {
                totalBookings: state.bookings.length,
                activeBookings: state.bookings.filter(b => b.status === 'active').length
              }
            };
          }
        }))
      ),
      {
        name: 'car-rental-store',
        partialize: (state) => ({
          // Persist only necessary data
          cars: state.cars,
          bookings: state.bookings,
          users: state.users,
          // Don't persist sensitive auth data (handled separately)
        }),
        version: 1,
        migrate: (persistedState, version) => {
          // Handle store migrations
          if (version === 0) {
            // Migration logic for version updates
            return persistedState;
          }
          return persistedState;
        }
      }
    ),
    {
      name: 'CarRentalStore',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

/**
 * Get initial state for reset functionality
 */
function getInitialState() {
  return {
    // Auth initial state
    isAuthenticated: false,
    currentUser: null,
    userRole: null,
    sessionExpiry: null,
    
    // Cars initial state
    cars: [],
    selectedCar: null,
    carFilters: {},
    
    // Bookings initial state
    bookings: [],
    selectedBooking: null,
    
    // Users initial state
    users: [],
    userProfiles: {}
  };
}

/**
 * Store utilities for debugging and testing
 */
export const storeUtils = {
  // Get current state snapshot
  getSnapshot: () => useAppStore.getState().getStoreSnapshot(),
  
  // Reset entire store
  reset: () => useAppStore.getState().resetAllStores(),
  
  // Subscribe to store changes
  subscribe: (callback) => useAppStore.subscribe(callback),
  
  // Get specific slice data
  getAuthData: () => {
    const state = useAppStore.getState();
    return {
      isAuthenticated: state.isAuthenticated,
      user: state.currentUser,
      role: state.userRole
    };
  },
  
  getCarsData: () => {
    const state = useAppStore.getState();
    return {
      cars: state.cars,
      total: state.cars.length,
      available: state.cars.filter(car => car.available).length
    };
  },
  
  getBookingsData: () => {
    const state = useAppStore.getState();
    return {
      bookings: state.bookings,
      total: state.bookings.length,
      active: state.bookings.filter(b => b.status === 'active').length
    };
  }
};

// Development helpers
if (process.env.NODE_ENV === 'development') {
  // Make store available globally for debugging
  window.carRentalStore = useAppStore;
  window.storeUtils = storeUtils;
  
  console.log('🏪 CarRental Store initialized with debugging tools');
  console.log('Access via: window.carRentalStore.getState()');
}
