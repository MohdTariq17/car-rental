import React from 'react';

const HosterHeader = ({ onLogout, userIdentifier }) => {
  const getCurrentTime = () => {
    return new Date().toLocaleString();
  };

  return (
    <header className="hoster-header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo-section">
            <h1>🚗 CarRental Pro</h1>
            <span className="hoster-badge">Car Hoster</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="quick-actions">
            <button className="quick-action-btn">
              <span>➕</span>
              Add Car
            </button>
            <button className="quick-action-btn">
              <span>📸</span>
              Update Photos
            </button>
            <button className="quick-action-btn">
              <span>💬</span>
              Messages
            </button>
          </div>
        </div>
        
        <div className="header-right">
          <div className="header-info">
            <div className="time-display">
              <small>{getCurrentTime()}</small>
            </div>
            <div className="hoster-profile">
              <div className="profile-info">
                <span className="profile-name">Hoster</span>
                <small className="profile-id">{userIdentifier}</small>
              </div>
              <div className="profile-avatar">🚗</div>
            </div>
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

export default HosterHeader;
