import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ref, onValue } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import { productsData } from '../data/productsData';
import { useShopify } from './ShopifyContext';

const EnhancedProductsContext = createContext();

export const useEnhancedProducts = () => {
  const context = useContext(EnhancedProductsContext);
  if (!context) {
    throw new Error('useEnhancedProducts must be used within an EnhancedProductsProvider');
  }
  return context;
};

export const EnhancedProductsProvider = ({ children }) => {
  // Initialize with cached data if available
  const getCachedFirebaseProducts = () => {
    try {
      const localProducts = localStorage.getItem('localProducts');
      if (localProducts) {
        return JSON.parse(localProducts);
      }
    } catch (e) {
      console.error('Error reading cached products:', e);
    }
    return [];
  };

  const [firebaseProducts, setFirebaseProducts] = useState(getCachedFirebaseProducts());
  const [loading, setLoading] = useState(false); // Start with false if we have cached data
  const { shopifyProducts, loading: shopifyLoading } = useShopify();

  // Combine products from both sources
  const allProducts = useMemo(() => {
    // Mark Firebase products with source
    const firebaseProductsWithSource = firebaseProducts.map(product => ({
      ...product,
      source: product.source || 'firebase'
    }));

    // Shopify products already have source: 'shopify' from the service
    
    // Combine both arrays
    return [...firebaseProductsWithSource, ...shopifyProducts];
  }, [firebaseProducts, shopifyProducts]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    return allProducts.reduce((acc, product) => {
      const category = product.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
  }, [allProducts]);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(allProducts.map(product => product.category || 'Uncategorized'))];
  }, [allProducts]);

  useEffect(() => {
    // Delay Firebase connection to let UI render first
    const timer = setTimeout(() => {
      // Only show loading if we don't have cached data
      if (firebaseProducts.length === 0) {
        setLoading(true);
      }
      
      // Try to connect to Firebase Realtime Database
      try {
        console.log('EnhancedProductsContext: Connecting to Firebase Realtime Database...');
        const productsRef = ref(realtimeDb, 'products');
        
        // Real-time listener for products
        const unsubscribe = onValue(productsRef, 
        (snapshot) => {
          console.log('EnhancedProductsContext: Firebase snapshot received');
          const data = snapshot.val();
          
          if (data) {
            // Convert object to array with IDs
            const productsArray = Object.entries(data).map(([id, product]) => ({
              id,
              ...product
            }));
            console.log('EnhancedProductsContext: Processed products array:', productsArray);
            setFirebaseProducts(productsArray);
            // Sync to localStorage
            localStorage.setItem('localProducts', JSON.stringify(productsArray));
          } else {
            console.log('EnhancedProductsContext: No data in Firebase, using localStorage');
            // No data in Firebase, check localStorage
            const storedProducts = localStorage.getItem('localProducts');
            if (storedProducts) {
              setFirebaseProducts(JSON.parse(storedProducts));
            } else {
              console.log('EnhancedProductsContext: No local data either, using defaults');
              setFirebaseProducts(productsData);
            }
          }
          setLoading(false);
        },
        (error) => {
          console.error('EnhancedProductsContext: Firebase error:', error);
          // Use localStorage data or fallback to default
          const storedProducts = localStorage.getItem('localProducts');
          if (storedProducts) {
            setFirebaseProducts(JSON.parse(storedProducts));
          } else {
            setFirebaseProducts(productsData);
          }
          setLoading(false);
        }
      );

        return unsubscribe;
      } catch (error) {
        // If Firebase is not configured, use local data
        console.error('EnhancedProductsContext: Firebase initialization error:', error);
        const storedProducts = localStorage.getItem('localProducts');
        if (storedProducts) {
          setFirebaseProducts(JSON.parse(storedProducts));
        } else {
          setFirebaseProducts(productsData);
        }
        setLoading(false);
      }
    }, 100); // 100ms delay to let UI render first

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'localProducts' && e.newValue) {
        setFirebaseProducts(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Search products
  const searchProducts = (query) => {
    if (!query) return allProducts;
    
    const lowerQuery = query.toLowerCase();
    return allProducts.filter(product => 
      product.name?.toLowerCase().includes(lowerQuery) ||
      product.description?.toLowerCase().includes(lowerQuery) ||
      product.category?.toLowerCase().includes(lowerQuery) ||
      product.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  };

  // Filter products by source
  const getProductsBySource = (source) => {
    return allProducts.filter(product => product.source === source);
  };

  // Get product by ID (checks both sources)
  const getProductById = (id) => {
    return allProducts.find(product => 
      product.id === id || product.shopifyId === id
    );
  };

  const value = {
    products: allProducts,
    firebaseProducts,
    shopifyProducts,
    loading: (loading || shopifyLoading) && allProducts.length === 0, // Only show loading if no products at all
    productsByCategory,
    categories,
    searchProducts,
    getProductsBySource,
    getProductById
  };

  return (
    <EnhancedProductsContext.Provider value={value}>
      {children}
    </EnhancedProductsContext.Provider>
  );
};