import { useState, useEffect, useRef } from 'react';
import { ref, onValue, push, set, remove, update, serverTimestamp, get } from 'firebase/database';
import { realtimeDb } from '../../config/firebase';
import { useEnhancedProducts } from '../../context/EnhancedProductsContext';
import { 
  Bell, X, User, Package, Music, FileText, 
  UserPlus, UserCheck, RefreshCw, Trash2, Plus,
  Clock, CheckCircle, Activity, ShoppingCart
} from 'lucide-react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const popupRef = useRef(null);
  const { shopifyProducts } = useEnhancedProducts();
  const previousShopifyProductsRef = useRef([]);
  
  // Activity types configuration
  const activityConfig = {
    user_new: { icon: UserPlus, color: 'text-green-400', label: 'New User' },
    user_active: { icon: UserCheck, color: 'text-blue-400', label: 'User Active' },
    user_inactive: { icon: User, color: 'text-gray-400', label: 'User Inactive' },
    user_deleted: { icon: Trash2, color: 'text-red-400', label: 'User Deleted' },
    user_restored: { icon: RefreshCw, color: 'text-green-400', label: 'User Restored' },
    product_added: { icon: Plus, color: 'text-green-400', label: 'Product Added' },
    product_edited: { icon: RefreshCw, color: 'text-yellow-400', label: 'Product Updated' },
    product_deleted: { icon: Trash2, color: 'text-red-400', label: 'Product Deleted' },
    music_added: { icon: Music, color: 'text-purple-400', label: 'Music Added' },
    music_edited: { icon: RefreshCw, color: 'text-purple-300', label: 'Music Updated' },
    music_deleted: { icon: Music, color: 'text-red-400', label: 'Music Deleted' },
    blog_added: { icon: FileText, color: 'text-green-400', label: 'Blog Published' },
    blog_edited: { icon: RefreshCw, color: 'text-yellow-400', label: 'Blog Updated' },
    blog_deleted: { icon: FileText, color: 'text-red-400', label: 'Blog Deleted' },
    invoice_created: { icon: FileText, color: 'text-blue-400', label: 'Invoice Created' },
    order_placed: { icon: Package, color: 'text-green-400', label: 'Order Placed' },
    wholesale_order: { icon: Package, color: 'text-purple-400', label: 'Wholesale Order' },
    shopify_order: { icon: ShoppingCart, color: 'text-orange-400', label: 'Shopify Order' }
  };

  // Load notifications from Firebase
  useEffect(() => {
    const notificationsRef = ref(realtimeDb, 'admin_notifications');
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const notificationsList = Object.entries(data)
          .map(([id, notification]) => ({ id, ...notification }))
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 50); // Keep only last 50 notifications
        
        setNotifications(notificationsList);
        setUnreadCount(notificationsList.filter(n => !n.read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Set up activity listeners
  useEffect(() => {
    const listeners = [];
    
    // Listen for user changes
    const usersRef = ref(realtimeDb, 'users');
    let initialUsersLoaded = false;
    let previousUsers = {};
    
    const userListener = onValue(usersRef, async (snapshot) => {
      if (!initialUsersLoaded) {
        initialUsersLoaded = true;
        if (snapshot.exists()) {
          previousUsers = snapshot.val();
        }
        return;
      }
      
      if (snapshot.exists()) {
        const currentUsers = snapshot.val();
        
        // Check for new users
        Object.entries(currentUsers).forEach(([userId, userData]) => {
          if (!previousUsers[userId]) {
            createNotification({
              type: 'user_new',
              title: 'New User Registered',
              message: `${userData.displayName || userData.email || 'New user'} just signed up`,
              metadata: { userId, userData }
            });
          } else {
            // Check for status changes
            const prevStatus = previousUsers[userId].status || 'inactive';
            const currStatus = userData.status || 'inactive';
            
            if (prevStatus !== currStatus) {
              createNotification({
                type: currStatus === 'active' ? 'user_active' : 'user_inactive',
                title: `User ${currStatus === 'active' ? 'Active' : 'Inactive'}`,
                message: `${userData.displayName || userData.email} is now ${currStatus}`,
                metadata: { userId, userData }
              });
            }
          }
        });
        
        previousUsers = { ...currentUsers };
      }
    });
    listeners.push(userListener);
    
    // Listen for wholesale product changes
    const productsRef = ref(realtimeDb, 'products');
    let initialProductsLoaded = false;
    let previousProducts = {};
    
    const productListener = onValue(productsRef, (snapshot) => {
      if (!initialProductsLoaded) {
        initialProductsLoaded = true;
        if (snapshot.exists()) {
          previousProducts = snapshot.val();
        }
        return;
      }
      
      if (snapshot.exists()) {
        const currentProducts = snapshot.val();
        
        // Check for new products
        Object.entries(currentProducts).forEach(([productId, productData]) => {
          if (!previousProducts[productId]) {
            createNotification({
              type: 'product_added',
              title: 'New Wholesale Product',
              message: `${productData.name} added to wholesale catalog`,
              metadata: { productId, productData, source: 'wholesale' }
            });
          } else if (JSON.stringify(previousProducts[productId]) !== JSON.stringify(productData)) {
            createNotification({
              type: 'product_edited',
              title: 'Wholesale Product Updated',
              message: `${productData.name} was modified`,
              metadata: { productId, productData, source: 'wholesale' }
            });
          }
        });
        
        // Check for deleted products
        Object.entries(previousProducts).forEach(([productId, productData]) => {
          if (!currentProducts[productId]) {
            createNotification({
              type: 'product_deleted',
              title: 'Wholesale Product Deleted',
              message: `${productData.name} was removed`,
              metadata: { productId, productData, source: 'wholesale' }
            });
          }
        });
        
        previousProducts = { ...currentProducts };
      }
    });
    listeners.push(productListener);
    
    // Listen for music changes
    const musicRef = ref(realtimeDb, 'musicTracks');
    let initialMusicLoaded = false;
    let previousMusic = {};
    
    const musicListener = onValue(musicRef, (snapshot) => {
      if (!initialMusicLoaded) {
        initialMusicLoaded = true;
        if (snapshot.exists()) {
          previousMusic = snapshot.val();
        }
        return;
      }
      
      if (snapshot.exists()) {
        const currentMusic = snapshot.val();
        
        Object.entries(currentMusic).forEach(([trackId, trackData]) => {
          if (!previousMusic[trackId]) {
            createNotification({
              type: 'music_added',
              title: 'New Music Track',
              message: `${trackData.title} by ${trackData.artist} added`,
              metadata: { trackId, trackData }
            });
          } else if (JSON.stringify(previousMusic[trackId]) !== JSON.stringify(trackData)) {
            createNotification({
              type: 'music_edited',
              title: 'Music Track Updated',
              message: `${trackData.title} was modified`,
              metadata: { trackId, trackData }
            });
          }
        });
        
        Object.entries(previousMusic).forEach(([trackId, trackData]) => {
          if (!currentMusic[trackId]) {
            createNotification({
              type: 'music_deleted',
              title: 'Music Track Deleted',
              message: `${trackData.title} was removed`,
              metadata: { trackId, trackData }
            });
          }
        });
        
        previousMusic = { ...currentMusic };
      }
    });
    listeners.push(musicListener);
    
    // Listen for blog changes
    const blogRef = ref(realtimeDb, 'blogPosts');
    let initialBlogLoaded = false;
    let previousBlog = {};
    
    const blogListener = onValue(blogRef, (snapshot) => {
      if (!initialBlogLoaded) {
        initialBlogLoaded = true;
        if (snapshot.exists()) {
          previousBlog = snapshot.val();
        }
        return;
      }
      
      if (snapshot.exists()) {
        const currentBlog = snapshot.val();
        
        Object.entries(currentBlog).forEach(([postId, postData]) => {
          if (!previousBlog[postId]) {
            createNotification({
              type: 'blog_added',
              title: 'New Blog Post',
              message: `"${postData.title}" was published`,
              metadata: { postId, postData }
            });
          } else if (JSON.stringify(previousBlog[postId]) !== JSON.stringify(postData)) {
            createNotification({
              type: 'blog_edited',
              title: 'Blog Post Updated',
              message: `"${postData.title}" was modified`,
              metadata: { postId, postData }
            });
          }
        });
        
        Object.entries(previousBlog).forEach(([postId, postData]) => {
          if (!currentBlog[postId]) {
            createNotification({
              type: 'blog_deleted',
              title: 'Blog Post Deleted',
              message: `"${postData.title}" was removed`,
              metadata: { postId, postData }
            });
          }
        });
        
        previousBlog = { ...currentBlog };
      }
    });
    listeners.push(blogListener);
    
    // Listen for wholesale invoices
    const invoicesRef = ref(realtimeDb, 'wholesale_invoices');
    let initialInvoicesLoaded = false;
    
    const invoiceListener = onValue(invoicesRef, (snapshot) => {
      if (!initialInvoicesLoaded) {
        initialInvoicesLoaded = true;
        return;
      }
      
      if (snapshot.exists()) {
        const currentInvoices = snapshot.val();
        const latestInvoice = Object.entries(currentInvoices)
          .map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          
        if (latestInvoice) {
          createNotification({
            type: 'invoice_created',
            title: 'New Invoice Generated',
            message: `Invoice ${latestInvoice.invoiceNumber} - $${latestInvoice.total?.toFixed(2)}`,
            metadata: { invoiceId: latestInvoice.id, invoiceData: latestInvoice }
          });
        }
      }
    });
    listeners.push(invoiceListener);
    
    // Listen for wholesale orders
    const ordersRef = ref(realtimeDb, 'wholesale_orders');
    let initialOrdersLoaded = false;
    
    const orderListener = onValue(ordersRef, (snapshot) => {
      if (!initialOrdersLoaded) {
        initialOrdersLoaded = true;
        return;
      }
      
      if (snapshot.exists()) {
        const currentOrders = snapshot.val();
        const latestOrder = Object.entries(currentOrders)
          .map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          
        if (latestOrder) {
          createNotification({
            type: 'wholesale_order',
            title: 'New Wholesale Order',
            message: `Order from ${latestOrder.customer?.name || 'Guest'} - $${latestOrder.total?.toFixed(2)}`,
            metadata: { orderId: latestOrder.id, orderData: latestOrder }
          });
        }
      }
    });
    listeners.push(orderListener);
    
    // Listen for user activities (login/logout)
    const usersActivityRef = ref(realtimeDb, 'users');
    const userActivityListener = onValue(usersActivityRef, (snapshot) => {
      if (snapshot.exists()) {
        const users = snapshot.val();
        Object.entries(users).forEach(([userId, userData]) => {
          // Check if user has been deleted or restored
          if (userData.isDeleted && !previousUsers[userId]?.isDeleted) {
            createNotification({
              type: 'user_deleted',
              title: 'User Deleted',
              message: `${userData.displayName || userData.email} has been marked as deleted`,
              metadata: { userId, userData }
            });
          } else if (!userData.isDeleted && previousUsers[userId]?.isDeleted) {
            createNotification({
              type: 'user_restored',
              title: 'User Restored',
              message: `${userData.displayName || userData.email} has been restored`,
              metadata: { userId, userData }
            });
          }
        });
      }
    });
    listeners.push(userActivityListener);
    
    // Cleanup
    return () => {
      listeners.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // Listen for Shopify product changes
  useEffect(() => {
    if (!shopifyProducts || shopifyProducts.length === 0) {
      previousShopifyProductsRef.current = [];
      return;
    }
    
    // Skip initial load
    if (previousShopifyProductsRef.current.length === 0) {
      previousShopifyProductsRef.current = [...shopifyProducts];
      return;
    }
    
    const previousProducts = previousShopifyProductsRef.current;
    
    // Check for new products
    shopifyProducts.forEach(product => {
      const prevProduct = previousProducts.find(p => p.id === product.id);
      if (!prevProduct) {
        createNotification({
          type: 'product_added',
          title: 'New Shopify Product',
          message: `${product.title} added to shop catalog`,
          metadata: { productId: product.id, productData: product, source: 'shopify' }
        });
      } else if (JSON.stringify(prevProduct) !== JSON.stringify(product)) {
        createNotification({
          type: 'product_edited',
          title: 'Shopify Product Updated',
          message: `${product.title} was modified`,
          metadata: { productId: product.id, productData: product, source: 'shopify' }
        });
      }
    });
    
    // Check for deleted products
    previousProducts.forEach(prevProduct => {
      if (!shopifyProducts.find(p => p.id === prevProduct.id)) {
        createNotification({
          type: 'product_deleted',
          title: 'Shopify Product Deleted',
          message: `${prevProduct.title} was removed`,
          metadata: { productId: prevProduct.id, productData: prevProduct, source: 'shopify' }
        });
      }
    });
    
    previousShopifyProductsRef.current = [...shopifyProducts];
  }, [shopifyProducts]);

  // Create notification helper
  const createNotification = async (data) => {
    try {
      const notificationsRef = ref(realtimeDb, 'admin_notifications');
      await push(notificationsRef, {
        ...data,
        timestamp: Date.now(),
        read: false,
        createdAt: serverTimestamp()
      });
      
      // Clean up old notifications (keep only last 100)
      const snapshot = await get(notificationsRef);
      if (snapshot.exists()) {
        const allNotifications = Object.entries(snapshot.val());
        if (allNotifications.length > 100) {
          const sortedNotifications = allNotifications
            .sort(([, a], [, b]) => (b.timestamp || 0) - (a.timestamp || 0));
          
          const toDelete = sortedNotifications.slice(100);
          for (const [id] of toDelete) {
            await remove(ref(realtimeDb, `admin_notifications/${id}`));
          }
        }
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await set(ref(realtimeDb, `admin_notifications/${notificationId}/read`), true);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const updates = {};
      notifications.forEach(notification => {
        if (!notification.read) {
          updates[`admin_notifications/${notification.id}/read`] = true;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        // Use update instead of set for partial updates
        await update(ref(realtimeDb), updates);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        await remove(ref(realtimeDb, 'admin_notifications'));
      } catch (error) {
        console.error('Error clearing notifications:', error);
      }
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }
      `}</style>
      <div className="relative inline-block" ref={popupRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowPopup(!showPopup)}
        className="relative text-[#b3b3b3] hover:text-white transition-colors p-2"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-spotify-green text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Popup */}
      {showPopup && (
        <div
          className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] lg:max-w-96 rounded-lg shadow-2xl border border-[#404040] max-h-[500px] overflow-hidden z-[9999] animate-slideIn"
          style={{
            backgroundColor: '#1a1a1a',
            background: '#1a1a1a',
            position: 'absolute',
            right: '0',
            top: '100%',
            marginTop: '8px',
            zIndex: 9999,
            opacity: 1,
            backdropFilter: 'none'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#404040]" style={{ backgroundColor: '#282828' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Notifications</h3>
                <p className="text-xs text-gray-400">{notifications.length} total • {unreadCount} unread</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-spotify-green hover:text-green-400 transition-colors px-2 py-1 bg-green-500/10 rounded"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[400px]" style={{ backgroundColor: '#1a1a1a' }}>
            {loading ? (
              <div className="p-8 text-center text-gray-400" style={{ backgroundColor: '#1a1a1a' }}>
                <Activity className="w-8 h-8 animate-spin mx-auto mb-2" />
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400" style={{ backgroundColor: '#1a1a1a' }}>
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-[#404040]" style={{ backgroundColor: '#1a1a1a' }}>
                {notifications.map((notification) => {
                  const config = activityConfig[notification.type] || {};

                  return (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-[#3e3e3e] transition-colors cursor-pointer"
                      style={{ backgroundColor: !notification.read ? '#252525' : '#1a1a1a' }}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="text-white font-medium text-sm">
                                {notification.title}
                              </h4>
                              <p className="text-gray-400 text-sm mt-0.5">
                                {notification.message}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-spotify-green rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.timestamp)}
                            </span>
                            <span className={`text-xs ${config.color}`}>
                              {config.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

// Export createNotification helper for use in other components
export const createAdminNotification = async (data) => {
  try {
    const notificationsRef = ref(realtimeDb, 'admin_notifications');
    await push(notificationsRef, {
      ...data,
      timestamp: Date.now(),
      read: false,
      createdAt: serverTimestamp()
    });
    
    // Clean up old notifications (keep only last 100)
    const snapshot = await get(notificationsRef);
    if (snapshot.exists()) {
      const allNotifications = Object.entries(snapshot.val());
      if (allNotifications.length > 100) {
        const sortedNotifications = allNotifications
          .sort(([, a], [, b]) => (b.timestamp || 0) - (a.timestamp || 0));
        
        const toDelete = sortedNotifications.slice(100);
        for (const [id] of toDelete) {
          await remove(ref(realtimeDb, `admin_notifications/${id}`));
        }
      }
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export default NotificationSystem;