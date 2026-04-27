import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import { useAuth } from './AuthContext';
import { normalizeProductId, productIdsMatch, getFirebaseSafeId } from '../utils/wishlistHelpers';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  
  
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  
  // Monitor wishlistItems changes
  useEffect(() => {
    console.log('[WishlistContext] wishlistItems state changed to:', wishlistItems);
    console.log('[WishlistContext] Length:', wishlistItems.length);
    console.log('[WishlistContext] Type:', typeof wishlistItems);
    console.log('[WishlistContext] Is Array:', Array.isArray(wishlistItems));
    
    if (wishlistItems.length > 0) {
      console.log('[WishlistContext] ALERT: Items detected!');
      console.trace('Stack trace for items:');
    }
  }, [wishlistItems]);
  

  // Handle user state changes
  useEffect(() => {
    if (!user) {
      // Only set loading to false for non-signed-in users
      // The initial state already handles localStorage
      setLoading(false);
    }
  }, [user]);

  // DISABLED: Firebase loading for debugging
  useEffect(() => {
    console.log('[WishlistContext] Firebase loading DISABLED');
    setLoading(false);
  }, []);

  // Save wishlist to localStorage for non-signed-in users
  const saveToLocalStorage = (items) => {
    localStorage.setItem('kushie_wishlist', JSON.stringify(items));
  };

  // Add item to wishlist
  const addToWishlist = async (productId) => {
    // Normalize the product ID for consistent storage
    const normalizedId = normalizeProductId(productId);
    
    // Check if item is already in wishlist
    if (isInWishlist(productId)) {
      return true;
    }
    
    if (!user) {
      // Handle non-signed-in users with localStorage
      setWishlistItems(prevItems => {
        const newWishlist = [...prevItems, normalizedId];
        saveToLocalStorage(newWishlist);
        return newWishlist;
      });
      return true;
    }

    try {
      // For Firebase, use a safe key but store the normalized ID as value
      const firebaseKey = getFirebaseSafeId(normalizedId);
      const wishlistRef = ref(realtimeDb, `wishlists/${user.uid}/${firebaseKey}`);
      await set(wishlistRef, normalizedId); // Store the normalized ID as the value
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    const normalizedId = normalizeProductId(productId);
    
    if (!user) {
      // Handle non-signed-in users with localStorage
      setWishlistItems(prevItems => {
        const newWishlist = prevItems.filter(id => !productIdsMatch(id, normalizedId));
        saveToLocalStorage(newWishlist);
        return newWishlist;
      });
      return true;
    }

    try {
      // For Firebase, use a safe key
      const firebaseKey = getFirebaseSafeId(normalizedId);
      const wishlistRef = ref(realtimeDb, `wishlists/${user.uid}/${firebaseKey}`);
      await set(wishlistRef, null);
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };

  // Toggle wishlist item
  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    const normalizedId = normalizeProductId(productId);
    return wishlistItems.some(item => productIdsMatch(item, normalizedId));
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  // Clear wishlist
  const clearWishlist = async () => {
    if (!user) {
      // Handle non-signed-in users with localStorage
      setWishlistItems([]);
      localStorage.removeItem('kushie_wishlist');
      return true;
    }

    try {
      const wishlistRef = ref(realtimeDb, `wishlists/${user.uid}`);
      await set(wishlistRef, null);
      return true;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return false;
    }
  };

  // Migrate localStorage wishlist to Firebase when user signs in
  // DISABLED FOR DEBUGGING
  /*
  useEffect(() => {
    if (user && wishlistItems.length === 0) {
      const storedWishlist = localStorage.getItem('kushie_wishlist');
      if (storedWishlist) {
        try {
          const items = JSON.parse(storedWishlist);
          if (items.length > 0) {
            // Migrate items to Firebase
            items.forEach(async (productId) => {
              const normalizedId = normalizeProductId(productId);
              const firebaseKey = getFirebaseSafeId(normalizedId);
              const wishlistRef = ref(realtimeDb, `wishlists/${user.uid}/${firebaseKey}`);
              await set(wishlistRef, normalizedId);
            });
            // Clear localStorage after migration
            localStorage.removeItem('kushie_wishlist');
          }
        } catch (error) {
          console.error('Error migrating wishlist:', error);
        }
      }
    }
  }, [user]);
  */

  const value = {
    wishlistItems: wishlistItems,
    loading,
    isWishlistOpen,
    setIsWishlistOpen,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    getWishlistCount,
    clearWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};