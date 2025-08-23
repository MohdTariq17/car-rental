'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CustomerHeader from './components/CustomerHeader.js';
import CarGrid from './components/CarGrid.js';
import SearchFilters from './components/SearchFilters.js';
import BookingModal from './components/BookingModal.js';
import CustomerProfile from './components/CustomerProfile.js';
import './cars.css';

const CustomerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: '',
    carType: 'all',
    priceRange: 'all',
    location: 'all',
    sortBy: 'featured'
  });
  const [customerData, setCustomerData] = useState({
    name: 'John Customer',
    email: 'customer@example.com',
    memberSince: 2023,
    totalTrips: 15,
    rating: 4.9,
    currentBooking: {
      carName: 'BMW X5 2023',
      pickupDate: '2025-08-25',
      returnDate: '2025-08-28',
      location: 'Downtown'
    },
    recentTrips: [
      { id: 1, car: 'Tesla Model 3', date: '2025-08-15', rating: 5 },
      { id: 2, car: 'Honda Civic', date: '2025-08-10', rating: 4 },
      { id: 3, car: 'BMW X3', date: '2025-08-05', rating: 5 }
    ]
  });

  const router = useRouter();

  // ✅ FIXED: Check authentication safely with useEffect
  useEffect(() => {
    const checkAuth = () => {
      // Safe localStorage access only in browser
      if (typeof window !== 'undefined') {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const role = localStorage.getItem('userRole');
        const userIdentifier = localStorage.getItem('userIdentifier');

        if (!isLoggedIn || role !== 'customer') {
          router.push('/');
          return;
        }

        // Update customer data with stored user info
        if (userIdentifier) {
          setCustomerData(prev => ({
            ...prev,
            email: userIdentifier,
            name: userIdentifier.split('@')[0] || 'Customer'
          }));
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // ✅ FIXED: Handle logout safely
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userIdentifier');
    }
    router.push('/');
  };

  // Handle car booking
  const handleBookCar = (car) => {
    setSelectedCar(car);
    setShowBookingModal(true);
  };

  // Handle booking confirmation
  const handleConfirmBooking = (bookingData) => {
    console.log('Booking confirmed:', bookingData);
    setShowBookingModal(false);
    setSelectedCar(null);
    // Here you would typically save the booking
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading CarRental Pro...</p>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      {/* Header */}
      <CustomerHeader 
        onLogout={handleLogout}
        onToggleProfile={() => setShowProfile(!showProfile)}
        customerData={customerData}
      />

      {/* Main Content */}
      <div className="dashboard-layout">
        {/* Sidebar Profile (toggleable on mobile) */}
        <aside className={`profile-sidebar ${showProfile ? 'show' : ''}`}>
          <CustomerProfile 
            customerData={customerData}
            onClose={() => setShowProfile(false)}
          />
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          <div className="content-container">
            {/* Welcome Section */}
            <section className="welcome-section">
              <div className="welcome-content">
                <h1>Welcome back, {customerData.name}!</h1>
                <p>Find your perfect ride from our premium car collection</p>
              </div>
              <div className="quick-stats">
                <div className="stat-item">
                  <span className="stat-number">{customerData.totalTrips}</span>
                  <span className="stat-label">Trips</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">⭐ {customerData.rating}</span>
                  <span className="stat-label">Rating</span>
                </div>
              </div>
            </section>

            {/* Search Filters */}
            <SearchFilters 
              filters={searchFilters}
              onFiltersChange={setSearchFilters}
            />

            {/* Car Grid */}
            <CarGrid 
              filters={searchFilters}
              onBookCar={handleBookCar}
            />
          </div>
        </main>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedCar && (
        <BookingModal 
          car={selectedCar}
          onConfirm={handleConfirmBooking}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedCar(null);
          }}
        />
      )}

      {/* Overlay for mobile profile */}
      {showProfile && (
        <div 
          className="profile-overlay" 
          onClick={() => setShowProfile(false)}
        ></div>
      )}
    </div>
  );
};

export default CustomerDashboard;
