import { useState, useEffect, useRef } from 'react';
import { ref, onValue, push, set, remove, update, serverTimestamp, get } from 'firebase/database';
import { realtimeDb } from '../../config/firebase';
import { useEnhancedProducts } from '../../context/EnhancedProductsContext';
import GradientLoader from './GradientLoader';
import {
  Bell, X, User, Package, Music, FileText,
  UserPlus, UserCheck, RefreshCw, Trash2, Plus,
  Clock, CheckCircle, Activity, ShoppingCart,
  LogIn, LogOut, Receipt, Check, CheckCheck
} from 'lucide-react';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const { firebaseProducts, shopifyProducts } = useEnhancedProducts();
  const previousFirebaseProductsRef = useRef([]);
  const previousShopifyProductsRef = useRef([]);
  
  // Activity types configuration
  const activityConfig = {
    user_login: { icon: LogIn, color: 'text-green-400', label: 'User Login' },
    user_logout: { icon: LogOut, color: 'text-gray-400', label: 'User Logout' },
    user_new: { icon: UserPlus, color: 'text-green-400', label: 'New User' },
    user_active: { icon: UserCheck, color: 'text-blue-400', label: 'User Active' },
    user_inactive: { icon: User, color: 'text-gray-400', label: 'User Inactive' },
    user_deleted: { icon: Trash2, color: 'text-red-400', label: 'User Deleted' },
    user_restored: { icon: RefreshCw, color: 'text-green-400', label: 'User Restored' },
    user_deactivated: { icon: UserCheck, color: 'text-orange-400', label: 'User Deactivated' },
    user_marked_deletion: { icon: Trash2, color: 'text-red-300', label: 'User Marked for Deletion' },
    user_edited: { icon: RefreshCw, color: 'text-blue-400', label: 'User Profile Updated' },
    product_added: { icon: Plus, color: 'text-green-400', label: 'Product Added' },
    product_edited: { icon: RefreshCw, color: 'text-yellow-400', label: 'Product Updated' },
    product_deleted: { icon: Trash2, color: 'text-red-400', label: 'Product Deleted' },
    shopify_product_added: { icon: Plus, color: 'text-green-400', label: 'Shopify Product Added' },
    shopify_product_edited: { icon: RefreshCw, color: 'text-yellow-400', label: 'Shopify Product Updated' },
    shopify_product_deleted: { icon: Trash2, color: 'text-red-400', label: 'Shopify Product Deleted' },
    music_added: { icon: Music, color: 'text-purple-400', label: 'Music Added' },
    music_edited: { icon: RefreshCw, color: 'text-purple-300', label: 'Music Updated' },
    music_deleted: { icon: Music, color: 'text-red-400', label: 'Music Deleted' },
    blog_added: { icon: FileText, color: 'text-green-400', label: 'Blog Published' },
    blog_edited: { icon: RefreshCw, color: 'text-yellow-400', label: 'Blog Updated' },
    blog_deleted: { icon: FileText, color: 'text-red-400', label: 'Blog Deleted' },
    invoice_created: { icon: Receipt, color: 'text-blue-400', label: 'Invoice Created' },
    invoice_deleted: { icon: Trash2, color: 'text-red-400', label: 'Invoice Deleted' },
    wholesale_order: { icon: Package, color: 'text-purple-400', label: 'Wholesale Order' },
  };

  // Create a notification
  const createNotification = async (notificationData) => {
    try {
      const notificationsRef = ref(realtimeDb, 'admin_notifications');
      await push(notificationsRef, {
        ...notificationData,
        timestamp: serverTimestamp(),
        read: false
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = ref(realtimeDb, `admin_notifications/${notificationId}`);
      await update(notificationRef, { read: true });
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
      await update(ref(realtimeDb), updates);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      const notificationsRef = ref(realtimeDb, 'admin_notifications');
      await remove(notificationsRef);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Load notifications from Firebase
  useEffect(() => {
    const notificationsRef = ref(realtimeDb, 'admin_notifications');
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const notificationsList = Object.entries(data)
          .map(([id, notification]) => ({ id, ...notification }))
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
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

  // Listen for wholesale products changes
  useEffect(() => {
    if (!firebaseProducts || firebaseProducts.length === 0) {
      previousFirebaseProductsRef.current = [];
      return;
    }
    
    // Skip initial load
    if (previousFirebaseProductsRef.current.length === 0) {
      previousFirebaseProductsRef.current = [...firebaseProducts];
      return;
    }
    
    const previousProducts = previousFirebaseProductsRef.current;
    
    // Check for changes
    firebaseProducts.forEach(product => {
      const prevProduct = previousProducts.find(p => p.id === product.id);
      if (!prevProduct) {
        createNotification({
          type: 'product_added',
          title: 'New Wholesale Product',
          message: `${product.name} added to wholesale catalog`,
          metadata: { productId: product.id, productData: product }
        });
      } else if (JSON.stringify(prevProduct) !== JSON.stringify(product)) {
        createNotification({
          type: 'product_edited',
          title: 'Wholesale Product Updated',
          message: `${product.name} was modified`,
          metadata: { productId: product.id, productData: product }
        });
      }
    });
    
    // Check for deletions
    previousProducts.forEach(prevProduct => {
      if (!firebaseProducts.find(p => p.id === prevProduct.id)) {
        createNotification({
          type: 'product_deleted',
          title: 'Wholesale Product Deleted',
          message: `${prevProduct.name} was removed`,
          metadata: { productId: prevProduct.id, productData: prevProduct }
        });
      }
    });
    
    previousFirebaseProductsRef.current = [...firebaseProducts];
  }, [firebaseProducts]);

  // Listen for Shopify products changes
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
    
    // Check for changes
    shopifyProducts.forEach(product => {
      const prevProduct = previousProducts.find(p => p.id === product.id);
      if (!prevProduct) {
        createNotification({
          type: 'shopify_product_added',
          title: 'New Shopify Product',
          message: `${product.title} added to shop`,
          metadata: { productId: product.id, productData: product }
        });
      } else if (JSON.stringify(prevProduct) !== JSON.stringify(product)) {
        createNotification({
          type: 'shopify_product_edited',
          title: 'Shopify Product Updated',
          message: `${product.title} was modified`,
          metadata: { productId: product.id, productData: product }
        });
      }
    });
    
    // Check for deletions
    previousProducts.forEach(prevProduct => {
      if (!shopifyProducts.find(p => p.id === prevProduct.id)) {
        createNotification({
          type: 'shopify_product_deleted',
          title: 'Shopify Product Deleted',
          message: `${prevProduct.title} was removed`,
          metadata: { productId: prevProduct.id, productData: prevProduct }
        });
      }
    });
    
    previousShopifyProductsRef.current = [...shopifyProducts];
  }, [shopifyProducts]);

  // Set up other activity listeners
  useEffect(() => {
    const listeners = [];
    
    // Listen for user activity - check both locations
    let initialUsersLoaded = false;
    let previousUsers = {};
    
    // Primary: Listen to adminData/users (where sync puts them)
    const adminUsersRef = ref(realtimeDb, 'adminData/users');
    const adminUserListener = onValue(adminUsersRef, async (snapshot) => {
      if (!initialUsersLoaded) {
        initialUsersLoaded = true;
        if (snapshot.exists()) {
          previousUsers = snapshot.val();
        }
        return;
      }
      
      if (snapshot.exists()) {
        const currentUsers = snapshot.val();
        
        // Check for new users or status changes
        Object.entries(currentUsers).forEach(([userId, userData]) => {
          const prevUser = previousUsers[userId];
          if (!prevUser) {
            createNotification({
              type: 'user_new',
              title: 'New User Registered',
              message: `${userData.displayName || userData.email || 'New user'} just signed up`,
              metadata: { userId, userData }
            });
          } else {
            // Check for various changes
            const changes = [];
            
            // Check for deletion
            if (userData.isDeleted === true && prevUser.isDeleted !== true) {
              createNotification({
                type: 'user_deleted',
                title: 'User Deleted',
                message: `${userData.displayName || userData.email} has been deleted`,
                metadata: { userId, userData }
              });
            }
            
            // Check for restoration
            if (userData.isDeleted === false && prevUser.isDeleted === true) {
              createNotification({
                type: 'user_restored',
                title: 'User Restored',
                message: `${userData.displayName || userData.email} has been restored`,
                metadata: { userId, userData }
              });
            }
            
            // Check for role changes
            if (prevUser.role !== userData.role) {
              createNotification({
                type: 'user_edited',
                title: 'User Role Updated',
                message: `${userData.displayName || userData.email} role changed from ${prevUser.role} to ${userData.role}`,
                metadata: { userId, userData, previousRole: prevUser.role, newRole: userData.role }
              });
            }
            
            // Check for online status changes
            if (prevUser.isOnline !== userData.isOnline) {
              if (userData.isOnline === true) {
                createNotification({
                  type: 'user_login',
                  title: 'User Came Online',
                  message: `${userData.displayName || userData.email} is now online`,
                  metadata: { userId, userData }
                });
              } else if (userData.isOnline === false) {
                createNotification({
                  type: 'user_logout',
                  title: 'User Went Offline',
                  message: `${userData.displayName || userData.email} went offline`,
                  metadata: { userId, userData }
                });
              }
            }
            
            // Check for profile updates (excluding timestamps)
            const profileChanged = 
              prevUser.displayName !== userData.displayName ||
              prevUser.email !== userData.email ||
              prevUser.phone !== userData.phone ||
              prevUser.address !== userData.address ||
              prevUser.photoURL !== userData.photoURL ||
              prevUser.licenseNumber !== userData.licenseNumber;
              
            if (profileChanged) {
              const changes = [];
              if (prevUser.displayName !== userData.displayName) changes.push('name');
              if (prevUser.email !== userData.email) changes.push('email');
              if (prevUser.phone !== userData.phone) changes.push('phone');
              if (prevUser.address !== userData.address) changes.push('address');
              if (prevUser.photoURL !== userData.photoURL) changes.push('photo');
              if (prevUser.licenseNumber !== userData.licenseNumber) changes.push('license');
              
              createNotification({
                type: 'user_edited',
                title: 'User Profile Updated',
                message: `${userData.displayName || userData.email} updated: ${changes.join(', ')}`,
                metadata: { userId, userData, changes }
              });
            }
          }
        });
        
        // Check for users that were deleted (exist in previous but not in current)
        Object.entries(previousUsers).forEach(([userId, prevUserData]) => {
          if (!currentUsers[userId]) {
            createNotification({
              type: 'user_deleted',
              title: 'User Removed',
              message: `${prevUserData.displayName || prevUserData.email} was removed from the system`,
              metadata: { userId, userData: prevUserData }
            });
          }
        });
        
        previousUsers = { ...currentUsers };
      }
    });
    listeners.push(adminUserListener);
    
    // Fallback: Also listen to standard users location
    const usersRef = ref(realtimeDb, 'users');
    let fallbackInitialLoaded = false;
    let fallbackPreviousUsers = {};
    
    const userListener = onValue(usersRef, async (snapshot) => {
      // Only process if adminData/users is empty
      const adminSnapshot = await get(adminUsersRef);
      if (adminSnapshot.exists()) return; // Skip if we have admin data
      
      if (!fallbackInitialLoaded) {
        fallbackInitialLoaded = true;
        if (snapshot.exists()) {
          fallbackPreviousUsers = snapshot.val();
        }
        return;
      }
      
      if (snapshot.exists()) {
        const currentUsers = snapshot.val();
        
        // Use same logic as admin listener
        Object.entries(currentUsers).forEach(([userId, userData]) => {
          const prevUser = fallbackPreviousUsers[userId];
          if (!prevUser) {
            createNotification({
              type: 'user_new',
              title: 'New User Registered',
              message: `${userData.displayName || userData.email || 'New user'} just signed up`,
              metadata: { userId, userData }
            });
          }
          // ... rest of the change detection logic
        });
        
        fallbackPreviousUsers = { ...currentUsers };
      }
    });
    listeners.push(userListener);
    
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
    
    // Listen for invoice changes
    const invoicesRef = ref(realtimeDb, 'wholesale_invoices');
    let initialInvoicesLoaded = false;
    let previousInvoices = {};
    
    const invoiceListener = onValue(invoicesRef, (snapshot) => {
      if (!initialInvoicesLoaded) {
        initialInvoicesLoaded = true;
        if (snapshot.exists()) {
          previousInvoices = snapshot.val();
        }
        return;
      }
      
      if (snapshot.exists()) {
        const currentInvoices = snapshot.val();
        
        Object.entries(currentInvoices).forEach(([invoiceId, invoiceData]) => {
          if (!previousInvoices[invoiceId]) {
            createNotification({
              type: 'invoice_created',
              title: 'New Invoice Created',
              message: `Invoice #${invoiceData.invoiceNumber} for ${invoiceData.customerName}`,
              metadata: { invoiceId, invoiceData }
            });
          }
        });
        
        Object.entries(previousInvoices).forEach(([invoiceId, invoiceData]) => {
          if (!currentInvoices[invoiceId]) {
            createNotification({
              type: 'invoice_deleted',
              title: 'Invoice Deleted',
              message: `Invoice #${invoiceData.invoiceNumber} was removed`,
              metadata: { invoiceId, invoiceData }
            });
          }
        });
        
        previousInvoices = { ...currentInvoices };
      }
    });
    listeners.push(invoiceListener);
    
    // Cleanup
    return () => {
      listeners.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  // Render notifications list (shared between mobile and desktop)
  const renderNotificationsList = () => {
    if (loading) {
      return <GradientLoader />;
    }
    
    if (notifications.length === 0) {
      return (
        <div className="w-full h-full p-8 text-center text-white bg-[#121212] flex flex-col items-center justify-center">
          <Bell className="w-16 h-16 mb-4 opacity-50 text-gray-400" />
          <p className="text-white text-lg">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-2">Activity will appear here</p>
        </div>
      );
    }
    
    return (
      <div className="divide-y divide-[#282828] bg-[#121212] w-full">
        {notifications.map((notification) => {
          const config = activityConfig[notification.type] || {};
          const Icon = config.icon || Activity;
          
          return (
            <div
              key={notification.id}
              className={`p-4 hover:bg-[#282828] transition-colors cursor-pointer w-full ${
                !notification.read ? 'bg-[#1a1a1a]' : 'bg-[#121212]'
              }`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="flex gap-3">
                <div className={`${config.color} mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
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
                      <div className="w-2 h-2 bg-[#1db954] rounded-full flex-shrink-0 mt-1.5" />
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
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors relative"
      >
        <Bell className="w-5 h-5 text-gray-300 hover:text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#1db954] rounded-full"></span>
        )}
      </button>

      {/* Dropdown Menu - Desktop */}
      {showDropdown && (
        <>
          {/* Mobile Fullscreen */}
          <div className={`md:hidden fixed inset-0 z-[100] bg-[#121212] transition-all duration-300 ${
            showDropdown ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}>
              {/* Header - Fixed */}
              <div className="p-4 border-b border-[#282828] bg-[#181818]">
                <div className="flex items-center justify-between gap-2">
                  {/* Title & Badge */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <h3 className="text-white font-bold text-lg truncate">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="bg-[#1db954] text-black text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {notifications.length > 0 && unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="p-2 text-[#b3b3b3] hover:text-white hover:bg-[#282828] rounded-full transition-all"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="p-2 text-[#b3b3b3] hover:text-white hover:bg-[#282828] rounded-full transition-all"
                        title="Clear all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setShowDropdown(false)}
                      className="p-2 hover:bg-[#282828] rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-[#b3b3b3]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications List - Scrollable */}
              <div className="h-[calc(100vh-80px)] overflow-y-auto overflow-x-hidden bg-[#121212] p-0">
                {renderNotificationsList()}
              </div>
          </div>

          {/* Desktop Dropdown - Spotify Style */}
          <div
            className="hidden md:block absolute right-0 mt-2 w-[340px] rounded-lg shadow-2xl border border-[#282828] z-[9999] overflow-hidden"
            style={{ backgroundColor: '#121212' }}
          >
            {/* Compact Header */}
            <div className="px-4 py-3 border-b border-[#282828] flex items-center justify-between" style={{ backgroundColor: '#181818' }}>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-white" />
                <span className="text-white font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-[#1db954] text-black text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 text-[#b3b3b3] hover:text-white hover:bg-[#282828] rounded-full transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="p-1.5 text-[#b3b3b3] hover:text-white hover:bg-[#282828] rounded-full transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Compact Notifications List */}
            <div className="max-h-[320px] overflow-y-auto" style={{ backgroundColor: '#121212' }}>
              {loading ? (
                <div className="p-6 text-center" style={{ backgroundColor: '#121212' }}>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#1db954] border-t-transparent mx-auto mb-2"></div>
                  <p className="text-[#b3b3b3] text-sm">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center" style={{ backgroundColor: '#121212' }}>
                  <Bell className="w-10 h-10 text-[#535353] mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">No notifications</p>
                  <p className="text-[#b3b3b3] text-xs mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div style={{ backgroundColor: '#121212' }}>
                  {notifications.slice(0, 8).map((notification) => {
                    const config = activityConfig[notification.type] || {};
                    const Icon = config.icon || Activity;

                    return (
                      <div
                        key={notification.id}
                        className="px-4 py-3 hover:bg-[#1a1a1a] transition-colors cursor-pointer border-b border-[#282828] last:border-b-0"
                        style={{ backgroundColor: !notification.read ? '#1a1a1a' : '#121212' }}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex gap-3 items-start">
                          <div className={`${config.color} mt-0.5`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium truncate">
                                  {notification.title}
                                </p>
                                <p className="text-[#b3b3b3] text-xs mt-0.5 truncate">
                                  {notification.message}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-[#1db954] rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[#535353] text-xs">
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
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;