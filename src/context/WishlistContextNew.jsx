import React, { createContext, useContext, useState, useEffect } from 'react';
import { normalizeProductId, productIdsMatch } from '../utils/wishlistHelpers';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  // Start with empty array - no localStorage, no Firebase, nothing
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  
  // Add item to wishlist
  const addToWishlist = async (productId) => {
    const normalizedId = normalizeProductId(productId);
    
    if (isInWishlist(productId)) {
      return true;
    }
    
    setWishlistItems(prev => [...prev, normalizedId]);
    return true;
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    const normalizedId = normalizeProductId(productId);
    setWishlistItems(prev => prev.filter(id => !productIdsMatch(id, normalizedId)));
    return true;
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
    setWishlistItems([]);
    return true;
  };

  const value = {
    wishlistItems,
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