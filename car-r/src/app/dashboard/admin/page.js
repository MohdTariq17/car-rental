"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from './components/AdminHeader';
import StatsCards from './components/StatsCards';
import UserManagement from './components/UserManagement';
import FleetOverview from './components/FleetOverview';
import RecentActivity from './components/RecentActivity';
import './admin.css';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState('');
  const router = useRouter();

  // Check authentication and role on component mount
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const role = localStorage.getItem('userRole');
      
      if (!isLoggedIn || role !== 'admin') {
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
  const dashboardData = {
    stats: {
      totalUsers: 1247,
      totalCars: 485,
      activeBookings: 123,
      monthlyRevenue: 89456,
      newUsersToday: 12,
      availableCars: 298,
      completedBookings: 2891,
      pendingApprovals: 18
    },
    recentUsers: [
      { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Customer', status: 'Active', joinedDate: '2025-08-21' },
      { id: 2, name: 'Mike Wilson', email: 'mike@example.com', role: 'Hoster', status: 'Pending', joinedDate: '2025-08-21' },
      { id: 3, name: 'Emma Davis', email: 'emma@example.com', role: 'Customer', status: 'Active', joinedDate: '2025-08-20' },
      { id: 4, name: 'John Smith', email: 'john@example.com', role: 'Hoster', status: 'Active', joinedDate: '2025-08-20' }
    ],
    recentActivity: [
      { id: 1, type: 'user_registration', message: 'New customer Sarah Johnson registered', timestamp: '2 mins ago', icon: '👤' },
      { id: 2, type: 'car_approval', message: 'BMW X3 2023 approved for listing', timestamp: '15 mins ago', icon: '🚗' },
      { id: 3, type: 'booking_completed', message: 'Booking #1247 completed successfully', timestamp: '1 hour ago', icon: '✅' },
      { id: 4, type: 'payment_processed', message: 'Payment of $450 processed', timestamp: '2 hours ago', icon: '💳' },
      { id: 5, type: 'car_maintenance', message: 'Tesla Model S scheduled for maintenance', timestamp: '3 hours ago', icon: '🔧' }
    ],
    fleetData: {
      totalCars: 485,
      availableCars: 298,
      rentedCars: 123,
      maintenanceCars: 64,
      carTypes: [
        { type: 'Economy', count: 145, percentage: 30 },
        { type: 'Compact', count: 121, percentage: 25 },
        { type: 'SUV', count: 97, percentage: 20 },
        { type: 'Luxury', count: 73, percentage: 15 },
        { type: 'Electric', count: 49, percentage: 10 }
      ]
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <AdminHeader 
        onLogout={handleLogout}
        userIdentifier={localStorage.getItem('userIdentifier')}
      />

      {/* Navigation Tabs */}
      <div className="admin-nav">
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
              className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="tab-icon">👥</span>
              Users
            </button>
            <button 
              className={`nav-tab ${activeTab === 'fleet' ? 'active' : ''}`}
              onClick={() => setActiveTab('fleet')}
            >
              <span className="tab-icon">🚗</span>
              Fleet
            </button>
            <button 
              className={`nav-tab ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <span className="tab-icon">📋</span>
              Activity
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-container">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="page-header">
                <h2>Dashboard Overview</h2>
                <p>Complete system statistics and insights</p>
              </div>
              
              <StatsCards data={dashboardData.stats} />
              
              <div className="overview-grid">
                <div className="overview-section">
                  <UserManagement data={dashboardData.recentUsers} isPreview={true} />
                </div>
                <div className="overview-section">
                  <RecentActivity data={dashboardData.recentActivity} />
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="tab-content">
              <div className="page-header">
                <h2>User Management</h2>
                <p>Manage all registered users and their roles</p>
              </div>
              <UserManagement data={dashboardData.recentUsers} isPreview={false} />
            </div>
          )}

          {/* Fleet Tab */}
          {activeTab === 'fleet' && (
            <div className="tab-content">
              <div className="page-header">
                <h2>Fleet Management</h2>
                <p>Overview and management of all vehicles</p>
              </div>
              <FleetOverview data={dashboardData.fleetData} />
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="tab-content">
              <div className="page-header">
                <h2>System Activity</h2>
                <p>Recent activities and system logs</p>
              </div>
              <RecentActivity data={dashboardData.recentActivity} isDetailed={true} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
