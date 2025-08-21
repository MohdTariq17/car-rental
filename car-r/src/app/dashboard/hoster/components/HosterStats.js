import React from 'react';

const HosterStats = ({ data }) => {
  const statsConfig = [
    {
      key: 'totalCars',
      title: 'My Cars',
      icon: '🚗',
      color: '#3498db',
      trend: { value: '+2', label: 'this month', positive: true }
    },
    {
      key: 'activeBookings',
      title: 'Active Bookings',
      icon: '📅',
      color: '#f39c12',
      trend: { value: '+8', label: 'this week', positive: true }
    },
    {
      key: 'averageRating',
      title: 'Average Rating',
      icon: '⭐',
      color: '#2ecc71',
      trend: { value: '+0.2', label: 'vs last month', positive: true }
    },
    {
      key: 'monthlyEarnings',
      title: 'Monthly Earnings',
      icon: '💰',
      color: '#e74c3c',
      trend: { value: '+12%', label: 'vs last month', positive: true }
    }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (num) => {
    return '$' + formatNumber(num);
  };

  const formatRating = (rating) => {
    return rating.toFixed(1);
  };

  return (
    <div className="stats-grid">
      {statsConfig.map((stat) => (
        <div key={stat.key} className="stat-card" style={{ '--accent-color': stat.color }}>
          <div className="stat-header">
            <div className="stat-icon" style={{ backgroundColor: stat.color + '20', color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-trend">
              <span className={`trend-value ${stat.trend.positive ? 'positive' : 'negative'}`}>
                {stat.trend.value}
              </span>
              <span className="trend-label">{stat.trend.label}</span>
            </div>
          </div>
          <div className="stat-content">
            <h3>{stat.title}</h3>
            <p className="stat-number">
              {stat.key === 'monthlyEarnings' 
                ? formatCurrency(data[stat.key]) 
                : stat.key === 'averageRating'
                ? formatRating(data[stat.key])
                : formatNumber(data[stat.key])
              }
            </p>
          </div>
          <div className="stat-progress">
            <div 
              className="progress-bar" 
              style={{ backgroundColor: stat.color, width: '75%' }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HosterStats;
