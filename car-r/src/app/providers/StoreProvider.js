'use client';
import React, { useEffect } from 'react';
import { useAppStore } from '../store/index.js';

/**
 * Store Provider Component
 * 
 * Provides store initialization and global store setup.
 * This component should wrap your entire application.
 */

export const StoreProvider = ({ children }) => {
  const initializeAuth = useAppStore((state) => state.initializeAuth);

  useEffect(() => {
    // Initialize auth from localStorage on app start
    initializeAuth();

    // Set up store event listeners
    const unsubscribe = useAppStore.subscribe(
      (state) => state.isAuthenticated,
      (isAuthenticated, previousIsAuthenticated) => {
        if (isAuthenticated !== previousIsAuthenticated) {
          console.log('🔄 Auth state changed:', isAuthenticated);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [initializeAuth]);

  return <>{children}</>;
};

/**
 * Development Store Inspector Component
 */
export const StoreInspector = () => {
  const store = useAppStore();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      maxHeight: '200px',
      overflow: 'auto'
    }}>
      <div><strong>🏪 Store State</strong></div>
      <div>Auth: {store.isAuthenticated ? '✅' : '❌'}</div>
      <div>Role: {store.userRole || 'None'}</div>
      <div>Cars: {store.cars.length}</div>
      <div>Bookings: {store.bookings.length}</div>
      <div>Users: {store.users.length}</div>
    </div>
  );
};

export default StoreProvider;
