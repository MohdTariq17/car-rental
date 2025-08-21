import React, { useState } from 'react';

const UserManagement = ({ data, isPreview = false }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(user => {
    const matchesFilter = filter === 'all' || user.role.toLowerCase() === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const displayData = isPreview ? filteredData.slice(0, 4) : filteredData;

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { color: '#2ecc71', bg: '#d4edda' },
      'Pending': { color: '#f39c12', bg: '#fff3cd' },
      'Inactive': { color: '#e74c3c', bg: '#f8d7da' }
    };
    
    const config = statusConfig[status] || statusConfig['Inactive'];
    
    return (
      <span 
        className="status-badge"
        style={{ 
          color: config.color, 
          backgroundColor: config.bg,
          border: `1px solid ${config.color}30`
        }}
      >
        {status}
      </span>
    );
  };

  const getRoleIcon = (role) => {
    const icons = {
      'Customer': '🧑‍💼',
      'Hoster': '🚗',
      'Admin': '👤'
    };
    return icons[role] || '👤';
  };

  return (
    <div className="user-management-card">
      <div className="card-header">
        <h3>👥 User Management</h3>
        {!isPreview && (
          <div className="user-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search users..."
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
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="hoster">Hosters</option>
              <option value="admin">Admins</option>
            </select>
            <button className="add-user-btn">+ Add User</button>
          </div>
        )}
      </div>
      
      <div className="user-table">
        <div className="table-header">
          <div className="header-cell">User</div>
          <div className="header-cell">Role</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Joined</div>
          {!isPreview && <div className="header-cell">Actions</div>}
        </div>
        
        <div className="table-body">
          {displayData.map((user) => (
            <div key={user.id} className="table-row">
              <div className="user-info">
                <div className="user-avatar">
                  {getRoleIcon(user.role)}
                </div>
                <div className="user-details">
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
              </div>
              <div className="role-cell">
                <span className="role-badge">{user.role}</span>
              </div>
              <div className="status-cell">
                {getStatusBadge(user.status)}
              </div>
              <div className="date-cell">
                {new Date(user.joinedDate).toLocaleDateString()}
              </div>
              {!isPreview && (
                <div className="actions-cell">
                  <button className="action-btn edit" title="Edit">✏️</button>
                  <button className="action-btn delete" title="Delete">🗑️</button>
                  <button className="action-btn view" title="View">👁️</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {isPreview && (
        <div className="card-footer">
          <button className="view-all-btn">View All Users →</button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
