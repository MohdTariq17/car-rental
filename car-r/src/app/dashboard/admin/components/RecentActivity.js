import React from 'react';

const RecentActivity = ({ data, isDetailed = false }) => {
  const getActivityColor = (type) => {
    const colors = {
      'user_registration': '#3498db',
      'car_approval': '#2ecc71',
      'booking_completed': '#f39c12',
      'payment_processed': '#9b59b6',
      'car_maintenance': '#e74c3c'
    };
    return colors[type] || '#7f8c8d';
  };

  const displayData = isDetailed ? data : data.slice(0, 5);

  return (
    <div className="recent-activity-card">
      <div className="card-header">
        <h3>📋 Recent Activity</h3>
        {!isDetailed && (
          <button className="view-all-btn-small">View All</button>
        )}
      </div>
      
      <div className="activity-timeline">
        {displayData.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div 
              className="activity-icon"
              style={{ backgroundColor: getActivityColor(activity.type) + '20' }}
            >
              <span style={{ color: getActivityColor(activity.type) }}>
                {activity.icon}
              </span>
            </div>
            <div className="activity-content">
              <p className="activity-message">{activity.message}</p>
              <small className="activity-time">{activity.timestamp}</small>
            </div>
            {isDetailed && (
              <div className="activity-actions">
                <button className="activity-action-btn">View Details</button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {isDetailed && (
        <div className="activity-footer">
          <button className="load-more-btn">Load More Activities</button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
