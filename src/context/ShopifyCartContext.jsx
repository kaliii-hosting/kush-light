import React, { createContext, useContext, useState, useEffect } from 'react';
import { useShopify } from './ShopifyContext';
import { useAuth } from './AuthContext';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

const ShopifyCartContext = createContext();

export const useCart = () => {
  const context = useContext(ShopifyCartContext);
  if (!context) {
    throw new Error('useCart must be used within a ShopifyCartProvider');
  }
  return context;
};

export const ShopifyCartProvider = ({ children }) => {
  const { 
    addToCart: shopifyAddToCart, 
    removeFromCart: shopifyRemoveFromCart,
    updateCartItem: shopifyUpdateCartItem,
    clearCart: shopifyClearCart,
    getCartItems,
    getCartCount,
    getCartTotal,
    isInCart: shopifyIsInCart,
    getCheckoutUrl,
    checkout,
    cartLoading
  } = useShopify();

  const { user, userData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [savedCheckoutId, setSavedCheckoutId] = useState(null);
  
  // Don't sync for sales reps or admin users
  const shouldSkipSync = userData?.role === 'salesRep' || userData?.role === 'admin';

  // Sync Shopify checkout ID with Firebase for authenticated users
  useEffect(() => {
    if (!user || !checkout?.id || shouldSkipSync) return;

    const syncCheckoutId = async () => {
      try {
        const cartRef = doc(db, 'users', user.uid, 'carts', 'shopify');
        await setDoc(cartRef, {
          checkoutId: checkout.id,
          updatedAt: new Date()
        }, { merge: true });
      } catch (error) {
        console.error('Error syncing Shopify checkout ID:', error);
        // Continue without Firebase sync if permissions fail
      }
    };

    syncCheckoutId();
  }, [user, checkout?.id, shouldSkipSync]);

  // Load saved checkout ID from Firebase for authenticated users
  useEffect(() => {
    if (!user || shouldSkipSync) return;

    const loadCheckoutId = async () => {
      try {
        const cartRef = doc(db, 'users', user.uid, 'carts', 'shopify');
        const cartDoc = await getDoc(cartRef);
        
        if (cartDoc.exists()) {
          const data = cartDoc.data();
          if (data.checkoutId) {
            setSavedCheckoutId(data.checkoutId);
            // You might want to restore the checkout here if the Shopify context supports it
          }
        }
      } catch (error) {
        console.error('Error loading Shopify checkout ID:', error);
      }
    };

    loadCheckoutId();
  }, [user, shouldSkipSync]);

  // Add to cart (only handles Shopify products)
  const addToCart = async (product, quantity = 1) => {
    if (product.source !== 'shopify') {
      console.warn('ShopifyCartContext only handles Shopify products');
      return;
    }
    
    // For Shopify products, use the first variant if no specific variant is selected
    const variantId = product.selectedVariantId || product.variants[0]?.id;
    if (variantId) {
      await shopifyAddToCart(variantId, quantity);
    }
  };

  // Remove from cart (only handles Shopify products)
  const removeFromCart = async (productId, isShopifyProduct = false, lineItemId = null) => {
    if (isShopifyProduct && lineItemId) {
      await shopifyRemoveFromCart(lineItemId);
    }
  };

  // Update quantity (only handles Shopify products)
  const updateQuantity = async (productId, quantity, isShopifyProduct = false, lineItemId = null) => {
    if (quantity <= 0) {
      await removeFromCart(productId, isShopifyProduct, lineItemId);
      return;
    }

    if (isShopifyProduct && lineItemId) {
      await shopifyUpdateCartItem(lineItemId, quantity);
    }
  };

  // Clear cart (only Shopify products)
  const clearCart = async () => {
    await shopifyClearCart();
    
    // Clear saved checkout ID in Firebase
    if (user) {
      try {
        const cartRef = doc(db, 'users', user.uid, 'carts', 'shopify');
        await setDoc(cartRef, {
          checkoutId: null,
          updatedAt: new Date()
        }, { merge: true });
      } catch (error) {
        console.error('Error clearing Shopify checkout ID in Firebase:', error);
      }
    }
  };

  // Get all cart items (only Shopify products)
  const getAllCartItems = () => {
    return getCartItems();
  };

  // Get total cart count (only Shopify products)
  const getTotalCartCount = () => {
    return getCartCount();
  };

  // Get cart subtotal (only Shopify products)
  const getCartSubtotal = () => {
    return getCartTotal();
  };

  // Check if product is in cart (only checks Shopify products)
  const isInCart = (productId) => {
    // For Shopify products, check if any variant is in cart
    const cartItems = getCartItems();
    return cartItems.some(item => item.product?.id === productId);
  };

  // Checkout handler (only handles Shopify products)
  const handleCheckout = async () => {
    if (getCartCount() > 0) {
      const checkoutUrl = getCheckoutUrl();
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    }
  };

  const value = {
    cart: getAllCartItems(),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount: getTotalCartCount(),
    cartTotal: getCartSubtotal(),
    isInCart,
    isOpen,
    setIsOpen,
    handleCheckout,
    loading: cartLoading,
    checkout // Shopify checkout object
  };

  return (
    <ShopifyCartContext.Provider value={value}>
      {children}
    </ShopifyCartContext.Provider>
  );
};