import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

const WholesaleCartContext = createContext();

export const useWholesaleCart = () => {
  const context = useContext(WholesaleCartContext);
  if (!context) {
    throw new Error('useWholesaleCart must be used within a WholesaleCartProvider');
  }
  return context;
};

export const WholesaleCartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerForOrder, setCustomerForOrder] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load cart from localStorage for non-authenticated users
  useEffect(() => {
    if (!user) {
      const savedCart = localStorage.getItem('wholesaleCart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
  }, [user]);

  // Sync cart with Firebase for authenticated users
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const cartRef = doc(db, 'users', user.uid, 'carts', 'wholesale');

    // Set up real-time listener
    const unsubscribe = onSnapshot(cartRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setCart(data.items || []);
      } else {
        // Initialize empty cart in Firebase
        setDoc(cartRef, { items: [], updatedAt: new Date() }).catch(err => {
          console.error('Error initializing cart in Firebase:', err);
          // Continue with local storage if Firebase fails
        });
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching wholesale cart:', error);
      // If we can't access Firebase, fall back to localStorage
      const savedCart = localStorage.getItem('wholesaleCart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Save cart to localStorage for non-authenticated users
  useEffect(() => {
    if (!user) {
      localStorage.setItem('wholesaleCart', JSON.stringify(cart));
    }
  }, [cart, user]);

  // Save cart to Firebase for authenticated users
  const saveCartToFirebase = async (newCart) => {
    if (!user) return;

    try {
      const cartRef = doc(db, 'users', user.uid, 'carts', 'wholesale');
      await setDoc(cartRef, {
        items: newCart,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error saving wholesale cart to Firebase:', error);
      // If Firebase save fails, the cart is still saved in localStorage
      // This allows the app to continue working even with permission issues
    }
  };

  const addToCart = async (product, quantity = 1) => {
    // Only accept wholesale (Firebase) products
    if (product.source === 'shopify') {
      console.warn('WholesaleCartContext only handles wholesale products');
      return;
    }

    const newCart = [...cart];
    const existingItemIndex = newCart.findIndex(item => item.id === product.id);

    // Get minimum order quantity (default to 1 if not set)
    const minOrder = product.minimumOrder || 1;

    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      // Quantity represents number of packs, not individual items
      newCart[existingItemIndex].quantity += quantity;
      newCart[existingItemIndex].minimumOrder = minOrder; // Update in case it changed
    } else {
      // Add new item with minimum order quantity
      // Default quantity is 1 pack (which equals minOrder items)
      newCart.push({
        ...product,
        quantity: quantity, // This represents packs
        minimumOrder: minOrder // Store min order for cart calculations
      });
    }

    setCart(newCart);
    if (user) {
      await saveCartToFirebase(newCart);
    }

    // Show toast notification
    setToastMessage(`${product.name} added to cart`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const removeFromCart = async (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    if (user) {
      await saveCartToFirebase(newCart);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
    } else {
      const newCart = cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      setCart(newCart);
      if (user) {
        await saveCartToFirebase(newCart);
      }
    }
  };

  const clearCart = async () => {
    setCart([]);
    setCustomerForOrder(null); // Clear selected customer when cart is cleared
    if (user) {
      await saveCartToFirebase([]);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const minOrder = item.minimumOrder || 1;
      // Total = price * packs * items per pack
      const totalItems = item.quantity * minOrder;
      return total + (price * totalItems);
    }, 0).toFixed(2);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => {
      const minOrder = item.minimumOrder || 1;
      // Return total items (packs * items per pack)
      return total + (item.quantity * minOrder);
    }, 0);
  };

  const isInCart = (productId) => {
    return cart.some(item => item.id === productId);
  };

  // Merge local cart with Firebase cart when user logs in
  const mergeCartsOnLogin = async () => {
    if (!user) return;

    const localCart = localStorage.getItem('wholesaleCart');
    if (localCart) {
      const localItems = JSON.parse(localCart);
      if (localItems.length > 0) {
        // Merge local cart with existing Firebase cart
        const cartRef = doc(db, 'users', user.uid, 'carts', 'wholesale');
        const cartDoc = await getDoc(cartRef);
        
        let mergedCart = [...localItems];
        if (cartDoc.exists()) {
          const firebaseItems = cartDoc.data().items || [];
          
          // Merge items, combining quantities for duplicates
          firebaseItems.forEach(firebaseItem => {
            const existingIndex = mergedCart.findIndex(item => item.id === firebaseItem.id);
            if (existingIndex !== -1) {
              mergedCart[existingIndex].quantity += firebaseItem.quantity;
            } else {
              mergedCart.push(firebaseItem);
            }
          });
        }
        
        await saveCartToFirebase(mergedCart);
        localStorage.removeItem('wholesaleCart');
      }
    }
  };

  // Call merge function when user logs in
  useEffect(() => {
    if (user) {
      mergeCartsOnLogin();
    }
  }, [user]);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    cartCount: getCartItemsCount(),
    cartTotal: getCartTotal(),
    isOpen,
    setIsOpen,
    loading,
    customerForOrder,
    setCustomerForOrder,
    showToast,
    toastMessage
  };

  return (
    <WholesaleCartContext.Provider value={value}>
      {children}
    </WholesaleCartContext.Provider>
  );
};