'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAccess } from '../../lib/guards.js';
import { getCurrentAuthStatus, getDashboardRoute } from '../../lib/auth.js';

/**
 * Protected Route Component
 * 
 * This component wraps other components to provide route-level protection.
 * It checks authentication and authorization before rendering the wrapped component.
 */

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredPermission = null,
  fallback = null,
  redirectTo = null,
  showLoading = true
}) => {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthorized: false,
    authData: null,
    error: null
  });
  
  const router = useRouter();

  useEffect(() => {
    const checkRouteAccess = async () => {
      try {
        // Get current path
        const currentPath = window.location.pathname;
        
        // Check authentication status
        const authData = getCurrentAuthStatus();
        
        if (!authData) {
          // Not authenticated
          setAuthState({
            isLoading: false,
            isAuthorized: false,
            authData: null,
            error: 'NOT_AUTHENTICATED'
          });
          
          // Redirect to login with return URL
          const loginUrl = new URL('/', window.location.origin);
          loginUrl.searchParams.set('redirect', currentPath);
          
          setTimeout(() => {
            router.push(loginUrl.toString());
          }, 100);
          
          return;
        }

        // Check access permissions
        const accessResult = checkAccess(currentPath, requiredRole, requiredPermission);
        
        if (!accessResult.allowed) {
          setAuthState({
            isLoading: false,
            isAuthorized: false,
            authData: authData,
            error: accessResult.reason
          });
          
          // Determine redirect destination
          let redirectPath = redirectTo;
          
          if (!redirectPath) {
            if (accessResult.redirect) {
              redirectPath = accessResult.redirect;
            } else {
              // Redirect to user's appropriate dashboard
              redirectPath = getDashboardRoute(authData.userRole);
            }
          }
          
          setTimeout(() => {
            router.push(redirectPath);
          }, 100);
          
          return;
        }

        // Access granted
        setAuthState({
          isLoading: false,
          isAuthorized: true,
          authData: authData,
          error: null
        });

      } catch (error) {
        console.error('Route protection error:', error);
        setAuthState({
          isLoading: false,
          isAuthorized: false,
          authData: null,
          error: 'SYSTEM_ERROR'
        });
      }
    };

    checkRouteAccess();
  }, [requiredRole, requiredPermission, redirectTo, router]);

  // Show loading state
  if (authState.isLoading && showLoading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner"></div>
        <p>Verifying access...</p>
      </div>
    );
  }

  // Show error state or fallback
  if (!authState.isAuthorized) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="protected-route-error">
        <div className="error-content">
          <span className="error-icon">🚫</span>
          <h3>Access Denied</h3>
          <p>{getErrorMessage(authState.error)}</p>
          <button 
            className="error-action-btn"
            onClick={() => router.push('/')}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
};

/**
 * Get user-friendly error message
 */
function getErrorMessage(errorCode) {
  const messages = {
    'NOT_AUTHENTICATED': 'Please log in to access this page.',
    'INSUFFICIENT_PRIVILEGES': 'You do not have permission to access this page.',
    'INSUFFICIENT_PERMISSIONS': 'You lack the required permissions for this action.',
    'ROLE_NOT_ALLOWED': 'Your account type cannot access this section.',
    'ROUTE_FORBIDDEN': 'This page is restricted.',
    'SYSTEM_ERROR': 'A system error occurred. Please try again.',
  };
  
  return messages[errorCode] || 'Access denied.';
}

/**
 * Higher-order component for route protection
 */
export const withProtectedRoute = (Component, options = {}) => {
  const ProtectedComponent = (props) => {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
  
  ProtectedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`;
  
  return ProtectedComponent;
};

/**
 * Specific guard components for different roles
 */
export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="admin" {...props}>
    {children}
  </ProtectedRoute>
);

export const HosterRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="hoster" {...props}>
    {children}
  </ProtectedRoute>
);

export const CustomerRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="customer" {...props}>
    {children}
  </ProtectedRoute>
);

/**
 * Authentication-only route (any authenticated user)
 */
export const AuthenticatedRoute = ({ children, ...props }) => (
  <ProtectedRoute {...props}>
    {children}
  </ProtectedRoute>
);

// Add default styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .protected-route-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #f8f9fa;
    }

    .protected-route-loading .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e3e3e3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .protected-route-loading p {
      color: #6c757d;
      font-size: 1rem;
    }

    .protected-route-error {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #f8f9fa;
      padding: 20px;
    }

    .error-content {
      text-align: center;
      background: white;
      padding: 40px;
      border-radius: 15px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 400px;
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 20px;
      display: block;
    }

    .error-content h3 {
      color: #2c3e50;
      font-size: 1.5rem;
      margin: 0 0 10px 0;
    }

    .error-content p {
      color: #6c757d;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }

    .error-action-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .error-action-btn:hover {
      background: #2980b9;
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(style);
}

export default ProtectedRoute;
