'use client';
import { useAppStore } from '../store/index.js';

/**
 * Custom hook for accessing the main store
 * 
 * Provides easy access to store state and actions
 * with optional selectors for performance optimization
 */

export const useStore = (selector = null) => {
  if (selector) {
    return useAppStore(selector);
  }
  
  return useAppStore();
};

// Specific store slice hooks for better performance
export const useAuthStore = () => {
  return useAppStore((state) => ({
    // Auth state
    isAuthenticated: state.isAuthenticated,
    currentUser: state.currentUser,
    userRole: state.userRole,
    sessionExpiry: state.sessionExpiry,
    authLoading: state.authLoading,
    authError: state.authError,
    
    // Auth actions
    login: state.login,
    logout: state.logout,
    updateUserProfile: state.updateUserProfile,
    extendSession: state.extendSession,
    checkSession: state.checkSession,
    initializeAuth: state.initializeAuth,
    hasPermission: state.hasPermission,
    hasRole: state.hasRole,
    canAccessRoute: state.canAccessRoute
  }));
};

export const useCarStore = () => {
  return useAppStore((state) => ({
    // Car state
    cars: state.cars,
    selectedCar: state.selectedCar,
    carFilters: state.carFilters,
    carLoading: state.carLoading,
    carError: state.carError,
    
    // Car actions
    setCars: state.setCars,
    addCar: state.addCar,
    updateCar: state.updateCar,
    deleteCar: state.deleteCar,
    selectCar: state.selectCar,
    setCarAvailability: state.setCarAvailability,
    updateCarFilters: state.updateCarFilters,
    resetCarFilters: state.resetCarFilters,
    getFilteredCars: state.getFilteredCars,
    getCarsByHost: state.getCarsByHost,
    getCarStats: state.getCarStats,
    searchCars: state.searchCars
  }));
};

export const useBookingStore = () => {
  return useAppStore((state) => ({
    // Booking state
    bookings: state.bookings,
    selectedBooking: state.selectedBooking,
    bookingFilters: state.bookingFilters,
    bookingLoading: state.bookingLoading,
    bookingError: state.bookingError,
    
    // Booking actions
    createBooking: state.createBooking,
    updateBookingStatus: state.updateBookingStatus,
    updatePaymentStatus: state.updatePaymentStatus,
    selectBooking: state.selectBooking,
    cancelBooking: state.cancelBooking,
    getBookingsByUser: state.getBookingsByUser,
    getBookingsByStatus: state.getBookingsByStatus,
    getBookingsByDateRange: state.getBookingsByDateRange,
    updateBookingFilters: state.updateBookingFilters,
    getFilteredBookings: state.getFilteredBookings,
    getBookingStats: state.getBookingStats,
    getRevenueByPeriod: state.getRevenueByPeriod
  }));
};

export const useUserStore = () => {
  return useAppStore((state) => ({
    // User state
    users: state.users,
    userProfiles: state.userProfiles,
    selectedUser: state.selectedUser,
    userFilters: state.userFilters,
    userLoading: state.userLoading,
    userError: state.userError,
    
    // User actions
    createUser: state.createUser,
    updateUser: state.updateUser,
    deleteUser: state.deleteUser,
    selectUser: state.selectUser,
    updateUserStatus: state.updateUserStatus,
    updateUserProfile: state.updateUserProfile,
    getUserProfile: state.getUserProfile,
    updateUserFilters: state.updateUserFilters,
    getFilteredUsers: state.getFilteredUsers,
    getUsersByRole: state.getUsersByRole,
    getUserStats: state.getUserStats,
    updateUserStats: state.updateUserStats,
    recordUserLogin: state.recordUserLogin,
    searchUsers: state.searchUsers
  }));
};
