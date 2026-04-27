import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import shopifyService from '../services/shopifyService';

const ShopifyContext = createContext(null);

export const useShopify = () => {
  const context = useContext(ShopifyContext);
  if (!context) {
    throw new Error('useShopify must be used within a ShopifyProvider');
  }
  return context;
};

export const ShopifyProvider = ({ children }) => {
  // Initialize with cached data if available
  const getCachedProducts = () => {
    try {
      const cache = localStorage.getItem('shopify_products_cache');
      if (cache) {
        const { products, timestamp } = JSON.parse(cache);
        // Use cache if it's less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return products || [];
        }
      }
    } catch (e) {
      console.error('Error reading cache:', e);
    }
    return [];
  };

  const [shopifyProducts, setShopifyProducts] = useState(getCachedProducts());
  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(false); // Start with false if we have cached data
  const [error, setError] = useState(null);
  const [collections, setCollections] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, completed, error

  // Initialize checkout on mount
  useEffect(() => {
    // Load checkout asynchronously without blocking
    initializeCheckout();
    
    // Fetch fresh products in background
    const timer = setTimeout(() => {
      fetchShopifyProducts();
    }, 100); // Small delay to let UI render first

    return () => clearTimeout(timer);
  }, []);

  // Initialize or fetch existing checkout
  const initializeCheckout = async () => {
    try {
      const checkout = await shopifyService.createCheckout();
      setCheckout(checkout);
    } catch (error) {
      console.error('Error initializing checkout:', error);
      setError(error.message);
    }
  };

  // Fetch all Shopify products
  const fetchShopifyProducts = async () => {
    try {
      console.log('ShopifyContext: Starting to fetch Shopify products...');
      // Only show loading if we don't have any products yet
      if (shopifyProducts.length === 0) {
        setLoading(true);
      }
      setSyncStatus('syncing');
      const products = await shopifyService.fetchProducts();
      console.log('ShopifyContext: Fetched products:', products);
      setShopifyProducts(products);
      setSyncStatus('completed');
      
      // Cache products in localStorage for offline access
      localStorage.setItem('shopify_products_cache', JSON.stringify({
        products,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching Shopify products:', error);
      setError(error.message);
      setSyncStatus('error');
      
      // Try to load from cache if fetch fails
      const cache = localStorage.getItem('shopify_products_cache');
      if (cache) {
        try {
          const { products } = JSON.parse(cache);
          setShopifyProducts(products || []);
        } catch (e) {
          console.error('Error parsing cache:', e);
          setShopifyProducts([]);
        }
      } else {
        // No cache available, set empty array
        setShopifyProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch collections
  const fetchCollections = async () => {
    try {
      const collections = await shopifyService.fetchCollections();
      setCollections(collections);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  // Add to cart
  const addToCart = useCallback(async (variantId, quantity = 1) => {
    try {
      setCartLoading(true);
      const updatedCheckout = await shopifyService.addToCart(variantId, quantity);
      setCheckout(updatedCheckout);
      return updatedCheckout;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      setCartLoading(false);
    }
  }, []);

  // Update cart item
  const updateCartItem = useCallback(async (lineItemId, quantity) => {
    try {
      setCartLoading(true);
      const updatedCheckout = await shopifyService.updateCartItem(lineItemId, quantity);
      setCheckout(updatedCheckout);
      return updatedCheckout;
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    } finally {
      setCartLoading(false);
    }
  }, []);

  // Remove from cart
  const removeFromCart = useCallback(async (lineItemId) => {
    try {
      setCartLoading(true);
      const updatedCheckout = await shopifyService.removeFromCart(lineItemId);
      setCheckout(updatedCheckout);
      return updatedCheckout;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    } finally {
      setCartLoading(false);
    }
  }, []);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      setCartLoading(true);
      const newCheckout = await shopifyService.clearCart();
      setCheckout(newCheckout);
      return newCheckout;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    } finally {
      setCartLoading(false);
    }
  }, []);

  // Apply discount
  const applyDiscount = useCallback(async (discountCode) => {
    try {
      setCartLoading(true);
      const updatedCheckout = await shopifyService.applyDiscount(discountCode);
      setCheckout(updatedCheckout);
      return updatedCheckout;
    } catch (error) {
      console.error('Error applying discount:', error);
      throw error;
    } finally {
      setCartLoading(false);
    }
  }, []);

  // Remove discount
  const removeDiscount = useCallback(async () => {
    try {
      setCartLoading(true);
      const updatedCheckout = await shopifyService.removeDiscount();
      setCheckout(updatedCheckout);
      return updatedCheckout;
    } catch (error) {
      console.error('Error removing discount:', error);
      throw error;
    } finally {
      setCartLoading(false);
    }
  }, []);

  // Get checkout URL
  const getCheckoutUrl = useCallback(() => {
    return checkout?.webUrl || null;
  }, [checkout]);

  // Search products
  const searchProducts = useCallback(async (query) => {
    try {
      const results = await shopifyService.searchProducts(query);
      return results;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }, []);

  // Get product by handle
  const getProductByHandle = useCallback(async (handle) => {
    try {
      const product = await shopifyService.fetchProductByHandle(handle);
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }, []);

  // Get cart count
  const getCartCount = useCallback(() => {
    if (!checkout || !checkout.lineItems) return 0;
    return checkout.lineItems.reduce((count, item) => count + item.quantity, 0);
  }, [checkout]);

  // Get cart total
  const getCartTotal = useCallback(() => {
    if (!checkout) return '0.00';
    return checkout.totalPrice?.amount || '0.00';
  }, [checkout]);

  // Check if product is in cart
  const isInCart = useCallback((variantId) => {
    if (!checkout || !checkout.lineItems) return false;
    return checkout.lineItems.some(item => item.variant.id === variantId);
  }, [checkout]);

  // Get cart items
  const getCartItems = useCallback(() => {
    if (!checkout || !checkout.lineItems) return [];
    return checkout.lineItems.map(item => ({
      id: item.id,
      variantId: item.variant.id,
      productId: item.variant.product.id,
      title: item.title,
      variantTitle: item.variant.title,
      price: item.variant.price.amount,
      compareAtPrice: item.variant.compareAtPrice?.amount || null,
      quantity: item.quantity,
      imageUrl: item.variant.image?.src || '',
      sku: item.variant.sku,
      vendor: item.variant.product.vendor,
      productType: item.variant.product.productType,
      handle: item.variant.product.handle
    }));
  }, [checkout]);

  // Refresh products
  const refreshProducts = useCallback(async () => {
    await fetchShopifyProducts();
  }, []);

  const value = {
    // Products
    shopifyProducts,
    collections,
    loading,
    error,
    syncStatus,
    
    // Cart/Checkout
    checkout,
    cartLoading,
    
    // Product methods
    fetchShopifyProducts,
    fetchCollections,
    searchProducts,
    getProductByHandle,
    refreshProducts,
    
    // Cart methods
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyDiscount,
    removeDiscount,
    getCheckoutUrl,
    
    // Cart helpers
    getCartCount,
    getCartTotal,
    isInCart,
    getCartItems
  };

  return (
    <ShopifyContext.Provider value={value}>
      {children}
    </ShopifyContext.Provider>
  );
};