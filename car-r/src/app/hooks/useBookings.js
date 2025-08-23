'use client';
import { useCallback, useMemo } from 'react';
import { useBookingStore, useCarStore, useAuthStore } from './useStore.js';

/**
 * Specialized hook for booking operations
 * 
 * Provides booking-specific functionality with business logic,
 * validation, and computed values
 */

export const useBookings = () => {
  const bookingStore = useBookingStore();
  const carStore = useCarStore();
  const authStore = useAuthStore();

  // Computed values
  // ✅ AFTER (Fixed)
    // ✅ AFTER (Only necessary dependencies)
const filteredBookings = useMemo(() => {
  return bookingStore.getFilteredBookings();
}, [bookingStore]); // Only store needed

const bookingStats = useMemo(() => {
  return bookingStore.getBookingStats();
}, [bookingStore]); // Only store needed

const userBookings = useMemo(() => {
  return bookingStore.getBookingsByUser();
}, [bookingStore]); // Only store needed



  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return userBookings.filter(booking => {
      const startDate = new Date(booking.startDate);
      return startDate > now && booking.status === 'approved';
    });
  }, [userBookings]);

  const activeBookings = useMemo(() => {
    const now = new Date();
    return userBookings.filter(booking => {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      return startDate <= now && endDate >= now && booking.status === 'active';
    });
  }, [userBookings]);

  const pastBookings = useMemo(() => {
    const now = new Date();
    return userBookings.filter(booking => {
      const endDate = new Date(booking.endDate);
      return endDate < now && booking.status === 'completed';
    });
  }, [userBookings]);

  // Create booking with validation
  const createBookingWithValidation = useCallback(async (bookingData) => {
    try {
      // Validation
      const validation = validateBookingData(bookingData);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Check car availability
      const car = carStore.cars.find(c => c.id === bookingData.carId);
      if (!car) {
        throw new Error('Car not found');
      }

      if (!car.available) {
        throw new Error('Car is not available for booking');
      }

      // Check date conflicts
      const hasConflict = checkDateConflicts(
        bookingData.carId,
        bookingData.startDate,
        bookingData.endDate,
        bookingStore.bookings
      );

      if (hasConflict) {
        throw new Error('Car is already booked for the selected dates');
      }

      // Add car details to booking
      const enrichedBookingData = {
        ...bookingData,
        carName: car.name,
        carPrice: car.price,
        hostId: car.hostId,
        hostName: car.hostName,
        customerId: authStore.currentUser?.id,
        customerName: authStore.currentUser?.name,
        customerEmail: authStore.currentUser?.identifier
      };

      // Create booking
      const result = await bookingStore.createBooking(enrichedBookingData);
      
      if (result.success) {
        console.log('✅ Booking created successfully:', result.booking.bookingNumber);
      }

      return result;

    } catch (error) {
      console.error('❌ Booking creation failed:', error.message);
      return { success: false, error: error.message };
    }
  }, [bookingStore, carStore.cars, authStore.currentUser]);

  // Cancel booking with refund calculation
  const cancelBookingWithRefund = useCallback(async (bookingId, reason) => {
    try {
      const booking = bookingStore.bookings.find(b => b.id === bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Calculate refund based on cancellation policy
      const refundInfo = calculateRefund(booking);
      
      const result = bookingStore.cancelBooking(bookingId, reason);
      
      if (result.success && refundInfo.refundAmount > 0) {
        // Process refund
        bookingStore.updatePaymentStatus(bookingId, 'refunded', {
          refundAmount: refundInfo.refundAmount,
          refundReason: reason,
          refundPolicy: refundInfo.policy
        });
      }

      return {
        ...result,
        refundInfo
      };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [bookingStore]);

  // Get available time slots for a car on a date
  const getAvailableTimeSlots = useCallback((carId, date) => {
    const dayBookings = bookingStore.bookings.filter(booking =>
      booking.carId === carId &&
      booking.status !== 'cancelled' &&
      booking.status !== 'rejected' &&
      (booking.startDate === date || booking.endDate === date)
    );

    // Default available slots (this would come from car settings)
    const allSlots = [
      '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
    ];

    // Filter out booked slots
    return allSlots.filter(slot => {
      return !dayBookings.some(booking => {
        return (booking.startDate === date && booking.startTime <= slot) ||
               (booking.endDate === date && booking.endTime >= slot);
      });
    });
  }, [bookingStore.bookings]);

  // Extend booking duration
  const extendBooking = useCallback(async (bookingId, newEndDate, newEndTime) => {
    try {
      const booking = bookingStore.bookings.find(b => b.id === bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Validate extension
      if (new Date(newEndDate) <= new Date(booking.endDate)) {
        throw new Error('New end date must be after current end date');
      }

      // Check for conflicts
      const hasConflict = checkDateConflicts(
        booking.carId,
        booking.endDate,
        newEndDate,
        bookingStore.bookings,
        bookingId // Exclude current booking
      );

      if (hasConflict) {
        throw new Error('Extension conflicts with another booking');
      }

      // Calculate additional cost
      const additionalDays = Math.ceil(
        (new Date(newEndDate) - new Date(booking.endDate)) / (1000 * 60 * 60 * 24)
      );
      const additionalCost = additionalDays * booking.carPrice;

      // Update booking
      bookingStore.updateBooking(bookingId, {
        endDate: newEndDate,
        endTime: newEndTime,
        totalAmount: booking.totalAmount + additionalCost,
        extensionHistory: [
          ...(booking.extensionHistory || []),
          {
            originalEndDate: booking.endDate,
            newEndDate: newEndDate,
            additionalCost: additionalCost,
            timestamp: new Date().toISOString()
          }
        ]
      });

      return {
        success: true,
        additionalCost: additionalCost,
        newTotal: booking.totalAmount + additionalCost
      };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [bookingStore]);

  // Rate completed booking
  const rateBooking = useCallback(async (bookingId, rating, review = '') => {
    try {
      const booking = bookingStore.bookings.find(b => b.id === bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== 'completed') {
        throw new Error('Can only rate completed bookings');
      }

      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Update booking with rating
      bookingStore.updateBooking(bookingId, {
        rating: rating,
        review: review,
        ratedAt: new Date().toISOString()
      });

      // Update car's average rating
      const carBookings = bookingStore.bookings.filter(b => 
        b.carId === booking.carId && 
        b.rating && 
        b.status === 'completed'
      );

      const averageRating = carBookings.reduce((sum, b) => sum + b.rating, 0) / carBookings.length;
      carStore.updateCar(booking.carId, { 
        rating: Math.round(averageRating * 10) / 10,
        reviews: carBookings.length
      });

      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [bookingStore, carStore]);

  // Get booking analytics
  const getBookingAnalytics = useCallback((period = 'month') => {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const periodBookings = bookingStore.bookings.filter(booking =>
      new Date(booking.createdAt) >= startDate
    );

    return {
      totalBookings: periodBookings.length,
      completedBookings: periodBookings.filter(b => b.status === 'completed').length,
      cancelledBookings: periodBookings.filter(b => b.status === 'cancelled').length,
      revenue: periodBookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalAmount, 0),
      averageBookingValue: periodBookings.length > 0
        ? periodBookings.reduce((sum, b) => sum + b.totalAmount, 0) / periodBookings.length
        : 0,
      conversionRate: periodBookings.length > 0
        ? (periodBookings.filter(b => b.status === 'completed').length / periodBookings.length) * 100
        : 0
    };
  }, [bookingStore.bookings]);

  return {
    // Data
    bookings: bookingStore.bookings,
    filteredBookings,
    userBookings,
    upcomingBookings,
    activeBookings,
    pastBookings,
    selectedBooking: bookingStore.selectedBooking,
    bookingStats,
    
    // Filters
    filters: bookingStore.bookingFilters,
    updateFilters: bookingStore.updateBookingFilters,
    
    // CRUD Operations
    createBooking: createBookingWithValidation,
    updateStatus: bookingStore.updateBookingStatus,
    updatePaymentStatus: bookingStore.updatePaymentStatus,
    selectBooking: bookingStore.selectBooking,
    cancelBooking: cancelBookingWithRefund,
    extendBooking,
    
    // Specialized Operations
    rateBooking,
    getAvailableTimeSlots,
    getBookingAnalytics,
    getRevenueByPeriod: bookingStore.getRevenueByPeriod,
    
    // Queries
    getByStatus: bookingStore.getBookingsByStatus,
    getByDateRange: bookingStore.getBookingsByDateRange,
    getByUser: bookingStore.getBookingsByUser,
    
    // Loading states
    loading: bookingStore.bookingLoading,
    error: bookingStore.bookingError
  };
};

// Helper functions
function validateBookingData(data) {
  const required = ['carId', 'startDate', 'endDate', 'startTime', 'endTime'];
  
  for (const field of required) {
    if (!data[field]) {
      return { valid: false, error: `${field} is required` };
    }
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const now = new Date();

  if (startDate < now) {
    return { valid: false, error: 'Start date cannot be in the past' };
  }

  if (endDate <= startDate) {
    return { valid: false, error: 'End date must be after start date' };
  }

  return { valid: true };
}

function checkDateConflicts(carId, startDate, endDate, bookings, excludeId = null) {
  return bookings.some(booking => {
    if (booking.id === excludeId) return false;
    if (booking.carId !== carId) return false;
    if (booking.status === 'cancelled' || booking.status === 'rejected') return false;

    const bookingStart = new Date(booking.startDate);
    const bookingEnd = new Date(booking.endDate);
    const checkStart = new Date(startDate);
    const checkEnd = new Date(endDate);

    return (checkStart < bookingEnd && checkEnd > bookingStart);
  });
}

function calculateRefund(booking) {
  const now = new Date();
  const startDate = new Date(booking.startDate);
  const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);

  let refundPercentage = 0;
  let policy = '';

  if (hoursUntilStart >= 48) {
    refundPercentage = 100;
    policy = 'Full refund (48+ hours notice)';
  } else if (hoursUntilStart >= 24) {
    refundPercentage = 50;
    policy = 'Partial refund (24-48 hours notice)';
  } else {
    refundPercentage = 0;
    policy = 'No refund (less than 24 hours notice)';
  }

  return {
    refundAmount: Math.round(booking.totalAmount * (refundPercentage / 100) * 100) / 100,
    refundPercentage,
    policy
  };
}
