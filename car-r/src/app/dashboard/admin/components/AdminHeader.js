import React from 'react';

const AdminHeader = ({ onLogout, userIdentifier }) => {
  const getCurrentTime = () => {
    return new Date().toLocaleString();
  };

  return (
    <header className="admin-header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo-section">
            <h1>🚗 CarRental Pro</h1>
            <span className="admin-badge">Administrator</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search users, cars, bookings..." 
              className="search-input"
            />
            <button className="search-button">🔍</button>
          </div>
        </div>
        
        <div className="header-right">
          <div className="header-info">
            <div className="time-display">
              <small>{getCurrentTime()}</small>
            </div>
            <div className="admin-profile">
              <div className="profile-info">
                <span className="profile-name">Admin</span>
                <small className="profile-id">{userIdentifier}</small>
              </div>
              <div className="profile-avatar">👤</div>
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

export default AdminHeader;
