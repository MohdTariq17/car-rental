"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HosterHeader from './components/HosterHeader.js';
import HosterStats from './components/HosterStats.js';
import CarInventory from './components/CarInventory.js';
import BookingRequests from './components/BookingRequests.js';
import EarningsOverview from './components/EarningsOverview.js';
import './hoster.css';

const HosterDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState('');
  const router = useRouter();

  // Check authentication and role on component mount
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const role = localStorage.getItem('userRole');
      
      if (!isLoggedIn || role !== 'hoster') {
        router.push('/');
        return;
      }
      
      setUserRole(role);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userIdentifier');
    router.push('/');
  };

  // Mock data for demonstration
  const hosterData = {
    stats: {
      totalCars: 8,
      activeBookings: 12,
      monthlyEarnings: 3240,
      averageRating: 4.8,
      availableCars: 5,
      completedRentals: 89,
      totalEarned: 18950,
      thisWeekEarnings: 810
    },
    cars: [
      { 
        id: 1, 
        name: 'BMW X3 2023', 
        status: 'available', 
        price: 65, 
        rating: 4.9, 
        bookings: 23,
        image: '🚙',
        location: 'Downtown',
        nextBooking: null
      },
      { 
        id: 2, 
        name: 'Toyota Camry 2022', 
        status: 'rented', 
        price: 45, 
        rating: 4.7, 
        bookings: 31,
        image: '🚗',
        location: 'Airport',
        nextBooking: '2025-08-25'
      },
      { 
        id: 3, 
        name: 'Honda Civic 2023', 
        status: 'maintenance', 
        price: 40, 
        rating: 4.6, 
        bookings: 18,
        image: '🚘',
        location: 'City Center',
        nextBooking: '2025-08-28'
      },
      { 
        id: 4, 
        name: 'Tesla Model 3 2023', 
        status: 'available', 
        price: 85, 
        rating: 4.9, 
        bookings: 45,
        image: '⚡',
        location: 'Tech District',
        nextBooking: null
      }
    ],
    bookingRequests: [
      {
        id: 1,
        customerName: 'Sarah Johnson',
        carName: 'BMW X3 2023',
        duration: '3 days',
        startDate: '2025-08-25',
        endDate: '2025-08-28',
        totalAmount: 195,
        status: 'pending',
        customerRating: 4.8,
        customerTrips: 23
      },
      {
        id: 2,
        customerName: 'Mike Wilson',
        carName: 'Tesla Model 3 2023',
        duration: '5 days',
        startDate: '2025-08-26',
        endDate: '2025-08-31',
        totalAmount: 425,
        status: 'pending',
        customerRating: 4.9,
        customerTrips: 15
      },
      {
        id: 3,
        customerName: 'Emily Davis',
        carName: 'Honda Civic 2023',
        duration: '2 days',
        startDate: '2025-08-24',
        endDate: '2025-08-26',
        totalAmount: 80,
        status: 'approved',
        customerRating: 4.7,
        customerTrips: 8
      }
    ],
    earnings: {
      thisMonth: 3240,
      lastMonth: 2890,
      thisWeek: 810,
      today: 125,
      monthlyBreakdown: [
        { month: 'Jan', amount: 2100 },
        { month: 'Feb', amount: 2450 },
        { month: 'Mar', amount: 2890 },
        { month: 'Apr', amount: 3240 },
        { month: 'May', amount: 3100 },
        { month: 'Jun', amount: 3400 }
      ],
      pendingPayouts: 450,
      nextPayout: '2025-08-25'
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Hoster Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="hoster-dashboard">
      {/* Header */}
      <HosterHeader 
        onLogout={handleLogout}
        userIdentifier={localStorage.getItem('userIdentifier')}
      />

      {/* Navigation Tabs */}
      <div className="hoster-nav">
        <div className="nav-container">
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="tab-icon">📊</span>
              Overview
            </button>
            <button 
              className={`nav-tab ${activeTab === 'cars' ? 'active' : ''}`}
              onClick={() => setActiveTab('cars')}
            >
              <span className="tab-icon">🚗</span>
              My Cars
            </button>
            <button 
              className={`nav-tab ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <span className="tab-icon">📅</span>
              Bookings
            </button>
            <button 
              className={`nav-tab ${activeTab === 'earnings' ? 'active' : ''}`}
              onClick={() => setActiveTab('earnings')}
            >
              <span className="tab-icon">💰</span>
              Earnings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="hoster-main">
        <div className="hoster-container">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="page-header">
                <h2>Dashboard Overview</h2>
                <p>Manage your car rental business</p>
              </div>
              
              <HosterStats data={hosterData.stats} />
              
              <div className="overview-grid">
                <div className="overview-section">
                  <CarInventory data={hosterData.cars} isPreview={true} />
                </div>
                <div className="overview-section">
                  <BookingRequests data={hosterData.bookingRequests} isPreview={true} />
                </div>
              </div>
            </div>
          )}

          {/* Cars Tab */}
          {activeTab === 'cars' && (
            <div className="tab-content">
              <div className="page-header">
                <h2>My Car Inventory</h2>
                <p>Manage your listed vehicles</p>
              </div>
              <CarInventory data={hosterData.cars} isPreview={false} />
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="tab-content">
              <div className="page-header">
                <h2>Booking Management</h2>
                <p>Review and manage booking requests</p>
              </div>
              <BookingRequests data={hosterData.bookingRequests} isPreview={false} />
            </div>
          )}

          {/* Earnings Tab */}
          {activeTab === 'earnings' && (
            <div className="tab-content">
              <div className="page-header">
                <h2>Earnings & Payouts</h2>
                <p>Track your rental income and payments</p>
              </div>
              <EarningsOverview data={hosterData.earnings} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HosterDashboard;
