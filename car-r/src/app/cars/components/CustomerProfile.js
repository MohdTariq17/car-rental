import React from 'react';

const CustomerProfile = ({ customerData, onClose }) => {
  return (
    <div className="customer-profile">
      <div className="profile-header">
        <button className="close-profile-btn" onClick={onClose}>×</button>
        <div className="profile-avatar-large">👤</div>
        <h3>{customerData.name}</h3>
        <p>{customerData.email}</p>
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-number">{customerData.totalTrips}</span>
            <span className="stat-label">Total Trips</span>
          </div>
          <div className="stat">
            <span className="stat-number">⭐ {customerData.rating}</span>
            <span className="stat-label">Rating</span>
          </div>
          <div className="stat">
            <span className="stat-number">{customerData.memberSince}</span>
            <span className="stat-label">Member Since</span>
          </div>
        </div>
      </div>

      {/* Current Booking */}
      {customerData.currentBooking && (
        <div className="current-booking-section">
          <h4>🚗 Current Booking</h4>
          <div className="current-booking-card">
            <div className="booking-info">
              <strong>{customerData.currentBooking.carName}</strong>
              <div className="booking-details">
                <p>📅 {customerData.currentBooking.pickupDate} - {customerData.currentBooking.returnDate}</p>
                <p>📍 {customerData.currentBooking.location}</p>
              </div>
            </div>
            <div className="booking-actions">
              <button className="booking-action-btn">📞 Contact Host</button>
              <button className="booking-action-btn">📋 View Details</button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Trips */}
      <div className="recent-trips-section">
        <h4>📋 Recent Trips</h4>
        <div className="trips-list">
          {customerData.recentTrips.map(trip => (
            <div key={trip.id} className="trip-item">
              <div className="trip-info">
                <strong>{trip.car}</strong>
                <small>{trip.date}</small>
              </div>
              <div className="trip-rating">
                {'⭐'.repeat(trip.rating)}
              </div>
            </div>
          ))}
        </div>
        <button className="view-all-trips-btn">View All Trips</button>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h4>⚡ Quick Actions</h4>
        <div className="action-buttons">
          <button className="action-btn">
            <span>👤</span>
            Edit Profile
          </button>
          <button className="action-btn">
            <span>💳</span>
            Payment Methods
          </button>
          <button className="action-btn">
            <span>📍</span>
            Saved Addresses
          </button>
          <button className="action-btn">
            <span>❤️</span>
            Favorite Cars
          </button>
          <button className="action-btn">
            <span>🎫</span>
            Promotions
          </button>
          <button className="action-btn">
            <span>❓</span>
            Help & Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
