import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import { productsData } from '../data/productsData';

const ProductsContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState(productsData); // Use local data as fallback
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    // Check for localStorage data first
    const localProducts = localStorage.getItem('localProducts');
    if (localProducts) {
      console.log('ProductsContext: Found local products:', JSON.parse(localProducts));
      setProducts(JSON.parse(localProducts));
    }

    // Try to connect to Firebase Realtime Database
    try {
      console.log('ProductsContext: Connecting to Firebase Realtime Database...');
      const productsRef = ref(realtimeDb, 'products');
      
      // Real-time listener for products
      const unsubscribe = onValue(productsRef, 
        (snapshot) => {
          console.log('ProductsContext: Firebase snapshot received');
          const data = snapshot.val();
          console.log('ProductsContext: Firebase data:', data);
          
          if (data) {
            // Convert object to array with IDs
            const productsArray = Object.entries(data).map(([id, product]) => ({
              id,
              ...product
            }));
            console.log('ProductsContext: Processed products array:', productsArray);
            setProducts(productsArray);
            // Sync to localStorage
            localStorage.setItem('localProducts', JSON.stringify(productsArray));
          } else {
            console.log('ProductsContext: No data in Firebase, using localStorage');
            // No data in Firebase, check localStorage
            const storedProducts = localStorage.getItem('localProducts');
            if (storedProducts) {
              setProducts(JSON.parse(storedProducts));
            } else {
              console.log('ProductsContext: No local data either, using defaults');
            }
          }
          setLoading(false);
        },
        (error) => {
          console.error('ProductsContext: Firebase error:', error);
          console.error('ProductsContext: Error details:', error.code, error.message);
          console.log('ProductsContext: Using local storage or default data.');
          // Use localStorage data or fallback to default
          const storedProducts = localStorage.getItem('localProducts');
          if (storedProducts) {
            setProducts(JSON.parse(storedProducts));
          }
          setLoading(false);
        }
      );

      return () => {
        console.log('ProductsContext: Cleaning up Firebase listener');
        unsubscribe();
      };
    } catch (error) {
      // If Firebase is not configured, use local data
      console.error('ProductsContext: Firebase initialization error:', error);
      const storedProducts = localStorage.getItem('localProducts');
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
      setLoading(false);
    }
  }, []);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'localProducts' && e.newValue) {
        setProducts(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading }}>
      {children}
    </ProductsContext.Provider>
  );
};