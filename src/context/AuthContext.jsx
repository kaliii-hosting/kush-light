import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  updateEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Google provider
  const googleProvider = new GoogleAuthProvider();

  // Create user document in Firestore
  const createUserDocument = async (user, additionalInfo = {}) => {
    if (!user) return null;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          phone: additionalInfo.phone || '',
          address: additionalInfo.address || '',
          licenseNumber: additionalInfo.licenseNumber || '',
          role: 'customer', // Default role
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          isOnline: true,
          preferences: {
            newsletter: false,
            notifications: true
          }
        };

        await setDoc(userRef, userData);
        return userData;
      } else {
        // Update last login and online status
        try {
          await updateDoc(userRef, {
            lastLoginAt: serverTimestamp(),
            isOnline: true
          });
        } catch (updateError) {
          console.log('Could not update last login:', updateError);
        }
        return userSnap.data();
      }
    } catch (error) {
      console.error('Error creating/updating user document:', error);
      // Don't throw the error, just log it
      // User can still use the app even if Firestore document creation fails
      return null;
    }
  };

  // Set user offline status
  const setUserOffline = async (userId) => {
    if (userId) {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          isOnline: false,
          lastSeenAt: serverTimestamp()
        });
      } catch (error) {
        console.log('Could not update offline status:', error);
      }
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, displayName, additionalInfo = {}) => {
    try {
      setError('');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      // Create user document with additional info
      await createUserDocument(result.user, additionalInfo);
      
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setError('');
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await createUserDocument(result.user);
      
      // Check if user is deleted
      if (userDoc && userDoc.isDeleted) {
        await signOut(auth);
        setError('This account has been disabled. Please contact support.');
        throw new Error('Account disabled');
      }
      
      // Check if user is a sales rep and redirect
      if (userDoc && userDoc.role === 'sales') {
        window.location.href = '/sales';
      }
      
      return result.user;
    } catch (error) {
      if (error.message !== 'Account disabled') {
        setError(error.message);
      }
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError('');
      // Try popup first, fallback to redirect if it fails
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const userDoc = await createUserDocument(result.user);
        
        // Check if user is deleted
        if (userDoc && userDoc.isDeleted) {
          await signOut(auth);
          setError('This account has been disabled. Please contact support.');
          throw new Error('Account disabled');
        }
        
        // Check if user is a sales rep and redirect
        if (userDoc && userDoc.role === 'sales') {
          window.location.href = '/sales';
        }
        
        return result.user;
      } catch (popupError) {
        // If popup blocked or COOP error, use redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.message.includes('Cross-Origin-Opener-Policy')) {
          await signInWithRedirect(auth, googleProvider);
          return null; // Redirect will reload the page
        }
        throw popupError;
      }
    } catch (error) {
      if (error.message !== 'Account disabled') {
        setError(error.message);
      }
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await setUserOffline(user?.uid);
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Handle redirect result
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const userDoc = await createUserDocument(result.user);
          
          // Check if user is a sales rep and redirect
          if (userDoc && userDoc.role === 'sales') {
            window.location.href = '/sales';
          }
        }
      } catch (error) {
        console.error('Redirect error:', error);
        setError(error.message);
      }
    };
    
    handleRedirectResult();
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Fetch user data from Firestore
          try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              
              // Check if user is deleted
              if (userData.isDeleted) {
                await signOut(auth);
                setUser(null);
                setUserData(null);
                setError('This account has been disabled. Please contact support.');
                return;
              }
              
              setUser(user);
              setUserData(userData);
            } else {
              // Create user document if it doesn't exist
              const newUserData = await createUserDocument(user);
              setUser(user);
              setUserData(newUserData);
            }
          } catch (firestoreError) {
            console.log('Could not fetch user data:', firestoreError);
            setUser(user);
            setUserData(null);
          }
        } else {
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    // Set user offline on window close
    const handleBeforeUnload = () => {
      if (user?.uid) {
        setUserOffline(user.uid);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user?.uid]);

  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      // Update Firebase Auth profile
      if (profileData.displayName !== undefined || profileData.photoURL !== undefined) {
        await updateProfile(user, profileData);
      }
      
      // Update Firestore document
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      });
      
      // Refresh userData
      const updatedDoc = await getDoc(userDocRef);
      if (updatedDoc.exists()) {
        setUserData(updatedDoc.data());
      }
      
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Change password
  const changePassword = async (newPassword) => {
    try {
      if (!user) throw new Error('No user logged in');
      await updatePassword(user, newPassword);
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update email
  const updateUserEmail = async (newEmail) => {
    try {
      if (!user) throw new Error('No user logged in');
      await updateEmail(user, newEmail);
      
      // Update Firestore document
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        email: newEmail,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reauthenticate user
  const reauthenticateUser = async (password) => {
    try {
      if (!user || !user.email) throw new Error('No user logged in');
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update user preferences
  const updateUserPreferences = async (preferences) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        preferences: {
          ...userData?.preferences,
          ...preferences
        },
        updatedAt: serverTimestamp()
      });
      
      // Refresh userData
      const updatedDoc = await getDoc(userDocRef);
      if (updatedDoc.exists()) {
        setUserData(updatedDoc.data());
      }
      
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    updateUserProfile,
    changePassword,
    resetPassword,
    updateUserEmail,
    reauthenticateUser,
    updateUserPreferences
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};