import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '../config/firebase';
import { startUserSync, stopUserSync } from '../utils/syncUsersToRealtimeDB';

const AdminAuthContext = createContext({});

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

// Admin credentials - In production, this should be stored securely
const ADMIN_EMAIL = 'admin@brand.com';
const ADMIN_PASSWORD = 'KushieAdmin2024!'; // Change this to a secure password

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sign in admin silently when PIN is verified
  const signInAdmin = async () => {
    try {
      // Set session persistence - admin login only lasts for the browser session
      await setPersistence(auth, browserSessionPersistence);
      const result = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      setAdminUser(result.user);
      setError('');
      return true;
    } catch (error) {
      console.error('Admin sign in error:', error);
      // Handle specific Firebase auth errors
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        console.warn('Admin account not found. Please create the admin account in Firebase.');
        setError('Admin account not configured. Please contact support.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Invalid admin credentials.');
      } else {
        setError(error.message);
      }
      return false;
    }
  };

  // Sign out admin
  const signOutAdmin = async () => {
    try {
      await signOut(auth);
      setAdminUser(null);
    } catch (error) {
      console.error('Admin sign out error:', error);
    }
  };

  // Check if admin is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === ADMIN_EMAIL) {
        setAdminUser(user);
        // Start user sync when admin is authenticated
        startUserSync();
      } else {
        setAdminUser(null);
        // Stop user sync when admin is not authenticated
        stopUserSync();
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      // Stop user sync when component unmounts
      stopUserSync();
    };
  }, []);

  // Remove auto sign in - admin must enter PIN every time

  const value = {
    adminUser,
    loading,
    error,
    signInAdmin,
    signOutAdmin,
    isAdminAuthenticated: !!adminUser
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};