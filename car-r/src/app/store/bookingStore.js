/**
 * Booking Store Slice
 * 
 * Manages booking operations:
 * - Booking creation and management
 * - Status updates
 * - Payment handling
 * - Booking history
 */

export const createBookingSlice = (set, get, api) => ({
  // Booking State
  bookings: getInitialBookings(),
  selectedBooking: null,
  bookingFilters: {
    status: 'all',
    dateRange: 'all',
    carType: 'all',
    hostId: null,
    customerId: null
  },
  bookingLoading: false,
  bookingError: null,

  // Booking Actions
  createBooking: async (bookingData) => {
    set((state) => {
      state.bookingLoading = true;
      state.bookingError = null;
    });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newBooking = {
        id: `booking_${Date.now()}`,
        ...bookingData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bookingNumber: generateBookingNumber(),
        totalAmount: calculateTotalAmount(bookingData),
        paymentStatus: 'pending'
      };

      set((state) => {
        state.bookings.push(newBooking);
        state.bookingLoading = false;
      });

      // Update car availability
      const carStore = get();
      carStore.setCarAvailability(bookingData.carId, false);

      console.log('✅ Booking created:', newBooking.bookingNumber);
      return { success: true, booking: newBooking };

    } catch (error) {
      set((state) => {
        state.bookingLoading = false;
        state.bookingError = error.message;
      });

      return { success: false, error: error.message };
    }
  },

  updateBookingStatus: (bookingId, status, reason = '') => {
    set((state) => {
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.status = status;
        booking.updatedAt = new Date().toISOString();
        booking.statusHistory = booking.statusHistory || [];
        booking.statusHistory.push({
          status,
          reason,
          timestamp: new Date().toISOString()
        });

        // Handle car availability based on status
        if (status === 'approved' || status === 'active') {
          // Car remains unavailable
        } else if (status === 'completed' || status === 'cancelled' || status === 'rejected') {
          // Make car available again
          const carStore = get();
          carStore.setCarAvailability(booking.carId, true);
        }
      }
    });
  },

  updatePaymentStatus: (bookingId, paymentStatus, paymentDetails = {}) => {
    set((state) => {
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.paymentStatus = paymentStatus;
        booking.paymentDetails = {
          ...booking.paymentDetails,
          ...paymentDetails,
          updatedAt: new Date().toISOString()
        };
        booking.updatedAt = new Date().toISOString();
      }
    });
  },

  selectBooking: (bookingId) => {
    const state = get();
    const booking = state.bookings.find(b => b.id === bookingId);
    
    set((draft) => {
      draft.selectedBooking = booking || null;
    });
  },

  cancelBooking: (bookingId, reason) => {
    const state = get();
    const booking = state.bookings.find(b => b.id === bookingId);
    
    if (booking) {
      state.updateBookingStatus(bookingId, 'cancelled', reason);
      
      // Process refund if payment was made
      if (booking.paymentStatus === 'paid') {
        state.updatePaymentStatus(bookingId, 'refunded', {
          refundAmount: booking.totalAmount,
          refundReason: reason
        });
      }

      return { success: true };
    }

    return { success: false, error: 'Booking not found' };
  },

  getBookingsByUser: (userId, userRole) => {
    const state = get();
    
    if (userRole === 'customer') {
      return state.bookings.filter(booking => booking.customerId === userId);
    } else if (userRole === 'hoster') {
      return state.bookings.filter(booking => booking.hostId === userId);
    } else if (userRole === 'admin') {
      return state.bookings;
    }
    
    return [];
  },

  getBookingsByStatus: (status) => {
    const state = get();
    return state.bookings.filter(booking => booking.status === status);
  },

  getBookingsByDateRange: (startDate, endDate) => {
    const state = get();
    return state.bookings.filter(booking => {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      return bookingStart >= new Date(startDate) && bookingEnd <= new Date(endDate);
    });
  },

  updateBookingFilters: (newFilters) => {
    set((state) => {
      Object.assign(state.bookingFilters, newFilters);
    });
  },

  getFilteredBookings: () => {
    const state = get();
    const { bookings, bookingFilters } = state;

    let filtered = [...bookings];

    // Status filter
    if (bookingFilters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === bookingFilters.status);
    }

    // Date range filter
    if (bookingFilters.dateRange !== 'all') {
      const now = new Date();
      const ranges = {
        today: [new Date(now.setHours(0, 0, 0, 0)), new Date(now.setHours(23, 59, 59, 999))],
        week: [new Date(now.setDate(now.getDate() - 7)), new Date()],
        month: [new Date(now.setMonth(now.getMonth() - 1)), new Date()]
      };
      
      const [start, end] = ranges[bookingFilters.dateRange] || [null, null];
      if (start && end) {
        filtered = filtered.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate >= start && bookingDate <= end;
        });
      }
    }

    // Host/Customer filter
    if (bookingFilters.hostId) {
      filtered = filtered.filter(booking => booking.hostId === bookingFilters.hostId);
    }
    if (bookingFilters.customerId) {
      filtered = filtered.filter(booking => booking.customerId === bookingFilters.customerId);
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getBookingStats: () => {
    const state = get();
    const { bookings } = state;

    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      approved: bookings.filter(b => b.status === 'approved').length,
      active: bookings.filter(b => b.status === 'active').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      totalRevenue: bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalAmount, 0),
      pendingPayments: bookings
        .filter(b => b.paymentStatus === 'pending')
        .reduce((sum, b) => sum + b.totalAmount, 0)
    };

    return stats;
  },

  // Revenue and analytics
  getRevenueByPeriod: (period = 'month') => {
    const state = get();
    const paidBookings = state.bookings.filter(b => b.paymentStatus === 'paid');
    
    const now = new Date();
    const periodStart = new Date();
    
    switch (period) {
      case 'day':
        periodStart.setDate(now.getDate() - 1);
        break;
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    return paidBookings
      .filter(booking => new Date(booking.completedAt || booking.createdAt) >= periodStart)
      .reduce((sum, booking) => sum + booking.totalAmount, 0);
  }
});

/**
 * Generate unique booking number
 */
function generateBookingNumber() {
  const prefix = 'CR';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 3).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

/**
 * Calculate total booking amount
 */
function calculateTotalAmount(bookingData) {
  const { startDate, endDate, carPrice, extras = [] } = bookingData;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  const baseAmount = days * carPrice;
  const extrasAmount = extras.reduce((sum, extra) => sum + extra.price, 0);
  const subtotal = baseAmount + extrasAmount;
  
  // Add taxes and fees (mock calculation)
  const tax = subtotal * 0.08; // 8% tax
  const serviceFee = subtotal * 0.05; // 5% service fee
  
  return Math.round((subtotal + tax + serviceFee) * 100) / 100; // Round to 2 decimal places
}

/**
 * Initial booking data for demonstration
 */
function getInitialBookings() {
  return [
    {
      id: 'booking_1692731200000',
      bookingNumber: 'CR731200ABC',
      customerId: 'customer_123',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      hostId: 'hoster_1',
      hostName: 'Sarah M.',
      carId: 1,
      carName: 'BMW X3 2023',
      carPrice: 85,
      startDate: '2025-08-25',
      endDate: '2025-08-28',
      startTime: '10:00',
      endTime: '10:00',
      pickupLocation: 'downtown',
      totalAmount: 275.40,
      status: 'approved',
      paymentStatus: 'paid',
      paymentDetails: {
        method: 'credit_card',
        last4: '4242',
        paidAt: '2025-08-22T10:30:00Z'
      },
      extras: [],
      notes: 'Pickup from downtown office',
      createdAt: '2025-08-22T08:00:00Z',
      updatedAt: '2025-08-22T10:30:00Z'
    },
    {
      id: 'booking_1692644800000',
      bookingNumber: 'CR644800DEF',
      customerId: 'customer_456',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      hostId: 'hoster_2',
      hostName: 'Mike W.',
      carId: 2,
      carName: 'Tesla Model 3 2023',
      carPrice: 95,
      startDate: '2025-08-26',
      endDate: '2025-08-31',
      startTime: '14:00',
      endTime: '14:00',
      pickupLocation: 'city-center',
      totalAmount: 513.50,
      status: 'pending',
      paymentStatus: 'pending',
      extras: [
        { name: 'GPS Navigation', price: 15 },
        { name: 'Child Seat', price: 25 }
      ],
      notes: '',
      createdAt: '2025-08-21T15:20:00Z',
      updatedAt: '2025-08-21T15:20:00Z'
    },
    {
      id: 'booking_1692558400000',
      bookingNumber: 'CR558400GHI',
      customerId: 'customer_789',
      customerName: 'Bob Johnson',
      customerEmail: 'bob@example.com',
      hostId: 'hoster_3',
      hostName: 'Emily D.',
      carId: 3,
      carName: 'Honda Civic 2022',
      carPrice: 45,
      startDate: '2025-08-24',
      endDate: '2025-08-26',
      startTime: '09:00',
      endTime: '18:00',
      pickupLocation: 'airport',
      totalAmount: 102.60,
      status: 'completed',
      paymentStatus: 'paid',
      paymentDetails: {
        method: 'debit_card',
        last4: '1234',
        paidAt: '2025-08-20T12:45:00Z'
      },
      completedAt: '2025-08-26T18:30:00Z',
      rating: 5,
      review: 'Great car, excellent service!',
      extras: [],
      notes: 'Early morning pickup',
      createdAt: '2025-08-20T11:00:00Z',
      updatedAt: '2025-08-26T19:00:00Z'
    }
  ];
}
