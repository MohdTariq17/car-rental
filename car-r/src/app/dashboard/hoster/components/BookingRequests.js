import React, { useState } from 'react';

const BookingRequests = ({ data, isPreview = false }) => {
  const [filter, setFilter] = useState('all');

  const filteredData = data.filter(booking => {
    return filter === 'all' || booking.status === filter;
  });

  const displayData = isPreview ? filteredData.slice(0, 3) : filteredData;

  const handleBookingAction = (bookingId, action) => {
    console.log(`${action} booking with ID: ${bookingId}`);
    // Implement booking actions here
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: '#f39c12', bg: '#fff3cd', text: 'Pending Review' },
      'approved': { color: '#2ecc71', bg: '#d4edda', text: 'Approved' },
      'rejected': { color: '#e74c3c', bg: '#f8d7da', text: 'Rejected' },
      'completed': { color: '#6c757d', bg: '#f8f9fa', text: 'Completed' }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <span 
        className="status-badge"
        style={{ 
          color: config.color, 
          backgroundColor: config.bg,
          border: `1px solid ${config.color}30`
        }}
      >
        {config.text}
      </span>
    );
  };

  return (
    <div className="booking-requests-card">
      <div className="card-header">
        <h3>📅 Booking Requests</h3>
        {!isPreview && (
          <div className="booking-actions">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}
      </div>
      
      <div className="booking-list">
        {displayData.map((booking) => (
          <div key={booking.id} className="booking-request-card">
            <div className="booking-header">
              <div className="customer-info">
                <div className="customer-avatar">👤</div>
                <div className="customer-details">
                  <strong>{booking.customerName}</strong>
                  <small>⭐ {booking.customerRating} • {booking.customerTrips} trips</small>
                </div>
              </div>
              {getStatusBadge(booking.status)}
            </div>
            
            <div className="booking-details">
              <div className="detail-row">
                <span className="detail-label">Car:</span>
                <span className="detail-value">{booking.carName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{booking.duration}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Dates:</span>
                <span className="detail-value">{booking.startDate} to {booking.endDate}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total:</span>
                <span className="detail-value total-amount">${booking.totalAmount}</span>
              </div>
            </div>
            
            {booking.status === 'pending' && (
              <div className="booking-actions-buttons">
                <button 
                  className="action-btn approve"
                  onClick={() => handleBookingAction(booking.id, 'approve')}
                >
                  ✅ Approve
                </button>
                <button 
                  className="action-btn reject"
                  onClick={() => handleBookingAction(booking.id, 'reject')}
                >
                  ❌ Reject
                </button>
                <button 
                  className="action-btn contact"
                  onClick={() => handleBookingAction(booking.id, 'contact')}
                >
                  💬 Contact
                </button>
              </div>
            )}
            
            {(booking.status === 'approved' || booking.status === 'completed') && (
              <div className="booking-actions-buttons">
                <button 
                  className="action-btn contact"
                  onClick={() => handleBookingAction(booking.id, 'contact')}
                >
                  💬 Contact
                </button>
                <button 
                  className="action-btn details"
                  onClick={() => handleBookingAction(booking.id, 'details')}
                >
                  👁️ Details
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {isPreview && (
        <div className="card-footer">
          <button className="view-all-btn">View All Requests →</button>
        </div>
      )}
    </div>
  );
};

export default BookingRequests;
