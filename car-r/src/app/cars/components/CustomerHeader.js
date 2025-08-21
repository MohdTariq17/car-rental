import React from 'react';

const CustomerHeader = ({ onLogout, onToggleProfile, customerData }) => {
  const getCurrentTime = () => {
    return new Date().toLocaleString();
  };

  return (
    <header className="customer-header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo-section">
            <h1>🚗 CarRental Pro</h1>
            <span className="customer-badge">Customer</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="search-bar-header">
            <input 
              type="text" 
              placeholder="Search cars, locations..." 
              className="header-search-input"
            />
            <button className="header-search-button">🔍</button>
          </div>
        </div>
        
        <div className="header-right">
          <div className="header-actions">
            <button className="notification-btn" title="Notifications">
              🔔
              <span className="notification-badge">2</span>
            </button>
            
            <button className="messages-btn" title="Messages">
              💬
            </button>
            
            <button 
              className="profile-toggle-btn"
              onClick={onToggleProfile}
              title="Toggle Profile"
            >
              <div className="profile-info">
                <span className="profile-name">{customerData.name}</span>
                <small className="profile-email">{customerData.email}</small>
              </div>
              <div className="profile-avatar">👤</div>
            </button>
          </div>
          
          <button 
            className="logout-button"
            onClick={onLogout}
            title="Logout"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
