"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";

const LoginScreen = () => {
  // State management - Customer is default
  const [selectedRole, setSelectedRole] = useState("customer");
  const [formData, setFormData] = useState({
    identifier: "",
    accessCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  
  const router = useRouter();

 
const roles = [
  {
    id: "customer",
    title: "Customer",
    description: "Browse and rent available cars",
    icon: "🧑‍💼",
    color: "#2ecc71",
    route: "/cars"  // Remove "/pages"
  },
  {
    id: "admin",
    title: "Administrator", 
    description: "Manage the entire system",
    icon: "👤",
    color: "#e74c3c",
    route: "/dashboard/admin"  // Remove "/pages"
  },
  {
    id: "hoster",
    title: "Car Hoster",
    description: "Manage your rental cars",
    icon: "🚗",
    color: "#3498db",
    route: "/dashboard/hoster"  // Remove "/pages"
  }
];




  // Handle role selection
  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setShowRoleDropdown(false);
    setError("");
    // Clear form when switching roles
    setFormData({ identifier: "", accessCode: "" });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  
  console.log('🚀 LOGIN DEBUG - Starting login process...');
  console.log('📝 Form data:', { 
    role: selectedRole, 
    identifier: formData.identifier, 
    accessCode: formData.accessCode 
  });

  // Basic validation
  if (!formData.identifier.trim()) {
    console.log('❌ Validation failed: Empty identifier');
    setError('Please enter your identifier');
    return;
  }
  
  if (!formData.accessCode.trim()) {
    console.log('❌ Validation failed: Empty access code');
    setError('Please enter your access code');
    return;
  }

  setLoading(true);
  console.log('⏳ Setting loading state to true');
  
  try {
    console.log('📞 Calling authenticateUser function...');
    
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('⏱️ Authentication delay completed');
    
    // Mock authentication - accepts any non-empty credentials
    const selectedRoleData = roles.find(role => role.id === selectedRole);
    console.log('👤 Selected role data:', selectedRoleData);
    
    // Store user session
    console.log('💾 Storing session data...');
    localStorage.setItem('userRole', selectedRole);
    localStorage.setItem('userIdentifier', formData.identifier);
    localStorage.setItem('isLoggedIn', 'true');
    
    console.log('✅ Session data stored successfully');
    console.log('📊 LocalStorage contents:', {
      userRole: localStorage.getItem('userRole'),
      userIdentifier: localStorage.getItem('userIdentifier'),
      isLoggedIn: localStorage.getItem('isLoggedIn')
    });
    
    // Redirect to appropriate dashboard
    console.log('🔄 Attempting redirect to:', selectedRoleData.route);
    router.push(selectedRoleData.route);
    
  } catch (err) {
    console.log('🚨 LOGIN ERROR:', err);
    setError('An error occurred during login. Please try again.');
  } finally {
    console.log('🔄 Setting loading state to false');
    setLoading(false);
  }
};

  // Get role-specific configuration
  const getRoleConfig = () => {
    const configs = {
      admin: {
        title: "Administrator Login",
        identifierLabel: "Admin ID",
        identifierPlaceholder: "Enter your admin ID",
        codeLabel: "Access Code",
        codePlaceholder: "Enter admin access code",
      },
      hoster: {
        title: "Car Hoster Login",
        identifierLabel: "Hoster Email", 
        identifierPlaceholder: "Enter your hoster email",
        codeLabel: "Hoster Code",
        codePlaceholder: "Enter hoster access code",
      },
      customer: {
        title: "Customer Login",
        identifierLabel: "Email Address",
        identifierPlaceholder: "Enter your email address",
        codeLabel: "Access Code",
        codePlaceholder: "Enter your access code",
      }
    };
    return configs[selectedRole];
  };

  const roleConfig = getRoleConfig();
  const currentRole = roles.find(role => role.id === selectedRole);

  return (
    <div className="login-container">
      {/* Role Selector - Top Left Corner */}
      <div className="role-selector-corner">
        <div className="role-dropdown">
          <button 
            className="role-toggle"
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            style={{ borderColor: currentRole?.color }}
          >
            <span className="role-icon-small">{currentRole?.icon}</span>
            <span>{currentRole?.title}</span>
            <span className={`dropdown-arrow ${showRoleDropdown ? 'open' : ''}`}>▼</span>
          </button>
          
          {showRoleDropdown && (
            <div className="role-dropdown-menu">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`role-option ${selectedRole === role.id ? 'active' : ''}`}
                  onClick={() => handleRoleSelect(role.id)}
                  style={{ '--role-color': role.color }}
                >
                  <span className="role-icon-small">{role.icon}</span>
                  <div className="role-details">
                    <strong>{role.title}</strong>
                    <small>{role.description}</small>
                  </div>
                  {selectedRole === role.id && <span className="check-mark">✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Login Card */}
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h1>🚗 CarRental Pro</h1>
          <p>Your trusted car rental platform</p>
        </div>

        {/* Login Form */}
        <div className="login-form-container">
          <div className="form-header">
            <h2 
              style={{ color: currentRole?.color }}
              className="role-title"
            >
              {roleConfig.title}
            </h2>
            <p className="role-subtitle">
              {currentRole?.description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="identifier">
                {roleConfig.identifierLabel}
              </label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                value={formData.identifier}
                onChange={handleInputChange}
                placeholder={roleConfig.identifierPlaceholder}
                className="form-input"
                disabled={loading}
                style={{ borderColor: error ? '#e74c3c' : '' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="accessCode">
                {roleConfig.codeLabel}
              </label>
              <input
                type="text"
                id="accessCode"
                name="accessCode"
                value={formData.accessCode}
                onChange={handleInputChange}
                placeholder={roleConfig.codePlaceholder}
                className="form-input"
                disabled={loading}
                style={{ borderColor: error ? '#e74c3c' : '' }}
              />
            </div>

            <button
              type="submit"
              className="login-button"
              style={{ backgroundColor: currentRole?.color }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                <>
                  <span>{currentRole?.icon}</span>
                  Login as {currentRole?.title}
                </>
              )}
            </button>

            <div className="demo-info">
              <small>
                <strong>Demo Access:</strong> Use any identifier and code to login
              </small>
            </div>
          </form>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showRoleDropdown && (
        <div 
          className="dropdown-overlay"
          onClick={() => setShowRoleDropdown(false)}
        />
      )}
    </div>
  );
};

export default LoginScreen;
