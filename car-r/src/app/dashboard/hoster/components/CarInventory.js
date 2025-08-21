import React, { useState } from 'react';

const CarInventory = ({ data, isPreview = false }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(car => {
    const matchesFilter = filter === 'all' || car.status === filter;
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const displayData = isPreview ? filteredData.slice(0, 3) : filteredData;

  const getStatusBadge = (status) => {
    const statusConfig = {
      'available': { color: '#2ecc71', bg: '#d4edda', text: 'Available' },
      'rented': { color: '#f39c12', bg: '#fff3cd', text: 'Currently Rented' },
      'maintenance': { color: '#e74c3c', bg: '#f8d7da', text: 'In Maintenance' }
    };
    
    const config = statusConfig[status] || statusConfig['available'];
    
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

  const handleCarAction = (carId, action) => {
    console.log(`${action} car with ID: ${carId}`);
    // Implement car actions here
  };

  return (
    <div className="car-inventory-card">
      <div className="card-header">
        <h3>🚗 My Car Inventory</h3>
        {!isPreview && (
          <div className="car-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search cars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-small"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <button className="add-car-btn">+ Add New Car</button>
          </div>
        )}
      </div>
      
      <div className="car-grid">
        {displayData.map((car) => (
          <div key={car.id} className="car-card">
            <div className="car-image">
              <span className="car-emoji">{car.image}</span>
              {getStatusBadge(car.status)}
            </div>
            
            <div className="car-details">
              <h4>{car.name}</h4>
              <div className="car-info">
                <div className="info-row">
                  <span className="info-label">Price:</span>
                  <span className="info-value">${car.price}/day</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Rating:</span>
                  <span className="info-value">⭐ {car.rating}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Location:</span>
                  <span className="info-value">{car.location}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Bookings:</span>
                  <span className="info-value">{car.bookings} total</span>
                </div>
                {car.nextBooking && (
                  <div className="info-row">
                    <span className="info-label">Next:</span>
                    <span className="info-value">{car.nextBooking}</span>
                  </div>
                )}
              </div>
            </div>
            
            {!isPreview && (
              <div className="car-actions-buttons">
                <button 
                  className="action-btn edit"
                  onClick={() => handleCarAction(car.id, 'edit')}
                  title="Edit Car"
                >
                  ✏️ Edit
                </button>
                <button 
                  className="action-btn photos"
                  onClick={() => handleCarAction(car.id, 'photos')}
                  title="Manage Photos"
                >
                  📸 Photos
                </button>
                <button 
                  className="action-btn schedule"
                  onClick={() => handleCarAction(car.id, 'schedule')}
                  title="View Schedule"
                >
                  📅 Schedule
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {isPreview && (
        <div className="card-footer">
          <button className="view-all-btn">View All Cars →</button>
        </div>
      )}
    </div>
  );
};

export default CarInventory;
