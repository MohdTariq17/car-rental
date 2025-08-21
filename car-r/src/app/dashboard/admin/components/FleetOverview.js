import React from 'react';

const FleetOverview = ({ data }) => {
  const fleetStats = [
    { label: 'Total Cars', value: data.totalCars, icon: '🚗', color: '#3498db' },
    { label: 'Available', value: data.availableCars, icon: '✅', color: '#2ecc71' },
    { label: 'Rented', value: data.rentedCars, icon: '🔑', color: '#f39c12' },
    { label: 'Maintenance', value: data.maintenanceCars, icon: '🔧', color: '#e74c3c' }
  ];

  return (
    <div className="fleet-overview">
      {/* Fleet Statistics */}
      <div className="fleet-stats-grid">
        {fleetStats.map((stat, index) => (
          <div key={index} className="fleet-stat-card" style={{ '--stat-color': stat.color }}>
            <div className="stat-icon-large" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h4>{stat.label}</h4>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Car Types Distribution */}
      <div className="car-types-section">
        <h4>Fleet Distribution by Type</h4>
        <div className="car-types-grid">
          {data.carTypes.map((type, index) => (
            <div key={index} className="car-type-card">
              <div className="type-header">
                <h5>{type.type}</h5>
                <span className="type-count">{type.count} cars</span>
              </div>
              <div className="type-progress">
                <div 
                  className="progress-fill" 
                  style={{ width: `${type.percentage}%` }}
                ></div>
              </div>
              <div className="type-percentage">{type.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Fleet Actions */}
      <div className="recent-fleet-actions">
        <h4>Recent Fleet Actions</h4>
        <div className="actions-list">
          <div className="action-item">
            <span className="action-icon">✅</span>
            <div className="action-content">
              <strong>BMW X3 2023 approved</strong>
              <small>Listed by John Doe • 2 hours ago</small>
            </div>
            <button className="action-btn">View</button>
          </div>
          <div className="action-item">
            <span className="action-icon">🔧</span>
            <div className="action-content">
              <strong>Tesla Model S maintenance scheduled</strong>
              <small>Service due in 3 days • 5 hours ago</small>
            </div>
            <button className="action-btn">Manage</button>
          </div>
          <div className="action-item">
            <span className="action-icon">🚗</span>
            <div className="action-content">
              <strong>Honda Civic 2023 returned</strong>
              <small>5-day rental completed • 1 day ago</small>
            </div>
            <button className="action-btn">Review</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetOverview;
