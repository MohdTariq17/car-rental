import React from 'react';

const EarningsOverview = ({ data }) => {
  const earningsStats = [
    { label: 'This Month', value: data.thisMonth, icon: '📅', color: '#3498db' },
    { label: 'This Week', value: data.thisWeek, icon: '📊', color: '#2ecc71' },
    { label: 'Today', value: data.today, icon: '⚡', color: '#f39c12' },
    { label: 'Total Earned', value: data.thisMonth, icon: '💰', color: '#e74c3c' }
  ];

  const formatCurrency = (amount) => {
    return '$' + amount.toLocaleString();
  };

  return (
    <div className="earnings-overview">
      {/* Earnings Statistics */}
      <div className="earnings-stats-grid">
        {earningsStats.map((stat, index) => (
          <div key={index} className="earnings-stat-card" style={{ '--stat-color': stat.color }}>
            <div className="stat-icon-large" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h4>{stat.label}</h4>
              <p className="stat-value">{formatCurrency(stat.value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Breakdown */}
      <div className="monthly-breakdown-section">
        <h4>Monthly Earnings Trend</h4>
        <div className="earnings-chart">
          {data.monthlyBreakdown.map((month, index) => (
            <div key={index} className="chart-bar">
              <div className="bar-label">{month.month}</div>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ 
                    height: `${(month.amount / 4000) * 100}%`,
                    backgroundColor: '#3498db'
                  }}
                ></div>
              </div>
              <div className="bar-value">${month.amount}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Payout Information */}
      <div className="payout-section">
        <h4>Payout Information</h4>
        <div className="payout-cards">
          <div className="payout-card">
            <div className="payout-header">
              <span className="payout-icon">💳</span>
              <h5>Pending Payout</h5>
            </div>
            <div className="payout-amount">{formatCurrency(data.pendingPayouts)}</div>
            <div className="payout-date">Next payout: {data.nextPayout}</div>
          </div>
          
          <div className="payout-card">
            <div className="payout-header">
              <span className="payout-icon">📈</span>
              <h5>Growth</h5>
            </div>
            <div className="payout-amount">+12%</div>
            <div className="payout-date">vs last month</div>
          </div>
          
          <div className="payout-card">
            <div className="payout-header">
              <span className="payout-icon">🎯</span>
              <h5>Goal Progress</h5>
            </div>
            <div className="payout-amount">81%</div>
            <div className="payout-date">of $4,000 goal</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="earnings-actions">
        <h4>Quick Actions</h4>
        <div className="action-buttons">
          <button className="earnings-action-btn">
            📊 Download Report
          </button>
          <button className="earnings-action-btn">
            💳 Update Payout Method
          </button>
          <button className="earnings-action-btn">
            📧 Tax Documents
          </button>
          <button className="earnings-action-btn">
            ❓ Earnings Help
          </button>
        </div>
      </div>
    </div>
  );
};

export default EarningsOverview;

