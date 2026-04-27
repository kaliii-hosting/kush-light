import { useState, useEffect } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { realtimeDb } from '../../config/firebase';
import { useEnhancedProducts } from '../../context/EnhancedProductsContext';
import { useBlog } from '../../context/BlogContext';
import PopupManager from './PopupManager';
import HeroVideoManager from './HeroVideoManager';
import LabsEditor from './LabsEditor';
import GradientLoader from './GradientLoader';
import {
  Package, ShoppingBag, Users, TrendingUp,
  Eye, CheckCircle, XCircle, Clock,
  BarChart3, PieChart, Activity, Play,
  MoreHorizontal, Download, Filter,
  Music, FileText, Database, Receipt, RefreshCw, X, UserPlus, MessageSquare
} from 'lucide-react';
import { seedSampleUsers } from '../../utils/seedUsers';
import { startUserSync } from '../../utils/syncUsersToRealtimeDB';
import { collection, getDocs } from 'firebase/firestore';
import { db as firestoreDb } from '../../config/firebase';

const Dashboard = () => {
  const { shopifyProducts = [], firebaseProducts = [], loading: productsLoading } = useEnhancedProducts();
  const { posts: blogPosts = [] } = useBlog();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cardRefreshing, setCardRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const [seedingUsers, setSeedingUsers] = useState(false);
  const [stats, setStats] = useState({
    totalShopifyProducts: 0,
    totalWholesaleProducts: 0,
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    onlineNow: 0,
    totalMusicTracks: 0,
    totalInvoices: 0,
    totalBlogPosts: 0,
    storageSize: 0,
    totalContactMessages: 0,
    totalCareerApplications: 0
  });
  
  // Debug logging
  useEffect(() => {
    console.log('Dashboard mounted');
    console.log('Shopify products:', shopifyProducts);
    console.log('Firebase products:', firebaseProducts);
    console.log('Blog posts:', blogPosts);
    console.log('Products loading:', productsLoading);
  }, [shopifyProducts, firebaseProducts, blogPosts, productsLoading]);

  // Fetch all stats data - wrapped to fix closure issue
  const fetchAllStats = async (isRefreshing = false) => {
    console.log('Starting to fetch dashboard stats...');
    if (!isRefreshing) setLoading(true);
    try {
        // Initialize counts
        let totalUsers = 0;
        let activeUsers = 0;
        let inactiveUsers = 0;
        let musicTracks = 0;
        let invoices = 0;
        let contactMessages = 0;
        let careerApplications = 0;
        
        // Fetch users data - check multiple locations
        try {
          console.log('Fetching users...');
          let usersData = null;
          let usersArray = [];
          
          // First try adminData/users location (where sync puts them)
          const adminUsersRef = ref(realtimeDb, 'adminData/users');
          const adminUsersSnapshot = await get(adminUsersRef);
          
          if (adminUsersSnapshot.exists()) {
            usersData = adminUsersSnapshot.val();
            console.log('Found users in /adminData/users');
          } else {
            // Try standard users location
            console.log('No users in /adminData/users, checking /users...');
            const usersRef = ref(realtimeDb, 'users');
            const usersSnapshot = await get(usersRef);
            
            if (usersSnapshot.exists()) {
              usersData = usersSnapshot.val();
              console.log('Found users in /users');
            } else {
              // If no users in Realtime DB, fetch directly from Firestore
              console.log('No users in Realtime DB, fetching from Firestore...');
              try {
                const usersCollection = collection(firestoreDb, 'users');
                const firestoreSnapshot = await getDocs(usersCollection);
                
                if (!firestoreSnapshot.empty) {
                  usersData = {};
                  firestoreSnapshot.forEach((doc) => {
                    usersData[doc.id] = { id: doc.id, ...doc.data() };
                  });
                  console.log(`Found ${firestoreSnapshot.size} users in Firestore`);
                  
                  // Trigger sync to populate Realtime DB
                  startUserSync();
                }
              } catch (error) {
                console.error('Error fetching from Firestore:', error);
              }
            }
          }
          
          if (usersData) {
            usersArray = Object.keys(usersData).map(key => ({
              id: key,
              ...usersData[key]
            }));
            
            // Filter out deleted and permanently inactive users
            const activeUsersArray = usersArray.filter(user => {
              // Exclude if marked as deleted (soft delete)
              if (user.isDeleted === true) {
                console.log(`Excluding deleted user: ${user.displayName || user.email}`);
                return false;
              }
              // Include all others (even if temporarily offline)
              return true;
            });
            
            // Count total users (including deleted)
            totalUsers = usersArray.length;
            
            // Count active users (not deleted)
            activeUsers = activeUsersArray.length;
            
            // Count inactive/deleted users
            inactiveUsers = usersArray.filter(user => user.isDeleted === true).length;
            
            console.log(`Total users in DB: ${usersArray.length}`);
            console.log(`Active users (excluding deleted): ${totalUsers}`);
            console.log(`Currently active/online: ${activeUsers}`);
            console.log(`Deleted users: ${usersArray.length - activeUsersArray.length}`);
            
            // Log deleted users for debugging
            const deletedUsers = usersArray.filter(user => user.isDeleted === true);
            if (deletedUsers.length > 0) {
              console.log('Deleted users:', deletedUsers.map(u => ({
                name: u.displayName || u.email,
                isDeleted: u.isDeleted,
                deletedAt: u.deletedAt
              })));
            }
            
            if (activeUsersArray.length > 0) {
              console.log('Sample active user:', {
                name: activeUsersArray[0].displayName || activeUsersArray[0].email,
                isDeleted: activeUsersArray[0].isDeleted,
                isOnline: activeUsersArray[0].isOnline,
                role: activeUsersArray[0].role
              });
            }
          } else {
            console.log('No users found in any location');
            console.log('Note: Make sure users are being synced from Firestore.');
            console.log('Users are created in Firestore and synced to Realtime DB at /adminData/users');
          }
        } catch (error) {
          console.error('Error fetching users:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            name: error.name
          });
        }
        
        // Fetch music tracks count
        try {
          console.log('Fetching music tracks...');
          const musicRef = ref(realtimeDb, 'musicTracks');
          const musicSnapshot = await get(musicRef);
          
          if (musicSnapshot.exists()) {
            musicTracks = Object.keys(musicSnapshot.val()).length;
            console.log(`Found ${musicTracks} music tracks`);
          } else {
            console.log('No music tracks found');
          }
        } catch (error) {
          console.error('Error fetching music tracks:', error);
        }

        // Fetch invoices count
        try {
          console.log('Fetching invoices...');
          const invoicesRef = ref(realtimeDb, 'wholesale_invoices');
          const invoicesSnapshot = await get(invoicesRef);
          
          if (invoicesSnapshot.exists()) {
            invoices = Object.keys(invoicesSnapshot.val()).length;
            console.log(`Found ${invoices} invoices`);
          } else {
            console.log('No invoices found');
          }
        } catch (error) {
          console.error('Error fetching invoices:', error);
        }

        // Fetch contact messages count
        try {
          console.log('Fetching contact messages...');
          const messagesRef = ref(realtimeDb, 'messages');
          const messagesSnapshot = await get(messagesRef);
          
          if (messagesSnapshot.exists()) {
            contactMessages = Object.keys(messagesSnapshot.val()).length;
            console.log(`Found ${contactMessages} contact messages`);
          } else {
            console.log('No contact messages found');
          }
        } catch (error) {
          console.error('Error fetching contact messages:', error);
        }

        // Fetch career applications count
        try {
          console.log('Fetching career applications...');
          const careerRef = ref(realtimeDb, 'career_applications');
          const careerSnapshot = await get(careerRef);
          
          if (careerSnapshot.exists()) {
            careerApplications = Object.keys(careerSnapshot.val()).length;
            console.log(`Found ${careerApplications} career applications`);
          } else {
            console.log('No career applications found');
          }
        } catch (error) {
          console.error('Error fetching career applications:', error);
        }

        // Use blog posts from context (already fetched)
        console.log('Using blog posts from context...');
        const blogPostsCount = blogPosts?.length || 0;
        console.log(`Found ${blogPostsCount} blog posts from context`);

        // Calculate storage size with performance optimization
        let storageSize = 0;
        try {
            console.log('Fetching storage size...');
            
            // Import from supabase config
            const { supabase, STORAGE_BUCKET } = await import('../../config/supabase');
            
            console.log('Using storage bucket:', STORAGE_BUCKET);
            
            // Function to get storage size - optimized for initial load
            const calculateTotalSize = async (path = '', depth = 0) => {
              if (depth > 1) return 0; // Limit to 1 level deep for faster loading
              let totalSize = 0;
              
              const { data: items, error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .list(path, {
                  limit: 50, // Smaller limit for faster initial load
                  offset: 0
                });
              
              if (error) {
                console.error(`Error listing files in ${path}:`, error);
                return 0;
              }
              
              if (!items || items.length === 0) {
                return 0;
              }
            
              // Process items in parallel for faster execution
              const promises = items.map(async (item) => {
                // Files have an id property, folders don't
                if (item.id !== null && item.id !== undefined) {
                  // It's a file
                  return item.metadata?.size || 0;
                } else if (depth === 0) {
                  // Only recurse into folders at the root level
                  const folderPath = path ? `${path}/${item.name}` : item.name;
                  return calculateTotalSize(folderPath, depth + 1);
                }
                return 0;
              });
              
              const sizes = await Promise.all(promises);
              totalSize = sizes.reduce((sum, size) => sum + size, 0);
              
              return totalSize;
            };
          
            // Calculate total storage size
            storageSize = await calculateTotalSize();
            console.log(`\nTotal storage size: ${storageSize} bytes (${(storageSize / 1024 / 1024).toFixed(2)} MB)`);
            
        } catch (error) {
          console.error('Error calculating storage size:', error);
        }

        // Log product counts
        console.log(`Shopify products: ${shopifyProducts ? shopifyProducts.length : 0}`);
        console.log(`Wholesale products: ${firebaseProducts ? firebaseProducts.length : 0}`);

        // Update all stats
        const newStats = {
          totalShopifyProducts: shopifyProducts ? shopifyProducts.length : 0,
          totalWholesaleProducts: firebaseProducts ? firebaseProducts.length : 0,
          totalUsers: totalUsers,
          activeUsers: activeUsers || 0,
          inactiveUsers: inactiveUsers || 0,
          totalMusicTracks: musicTracks,
          totalInvoices: invoices,
          totalBlogPosts: blogPostsCount,
          storageSize: storageSize,
          totalContactMessages: contactMessages,
          totalCareerApplications: careerApplications
        };
        
        console.log('Setting stats:', newStats);
        setStats(newStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
        if (isRefreshing) {
          setRefreshing(false);
        }
      }
    };
    
    // Manual refresh function
    const handleRefresh = async () => {
      console.log('Manual refresh triggered');
      setRefreshing(true);
      setCardRefreshing(true);
      
      // Force restart user sync to get latest data from Firestore
      try {
        console.log('Restarting user sync...');
        startUserSync();
      } catch (error) {
        console.error('Error restarting user sync:', error);
      }
      
      // Add a small delay to show the animation and allow sync to complete
      setTimeout(async () => {
        await fetchAllStats(true);
        setTimeout(() => {
          setCardRefreshing(false);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }, 300);
      }, 500); // Increased delay to allow sync
    };

    // Handle seeding sample users
    const handleSeedUsers = async () => {
      setSeedingUsers(true);
      try {
        const success = await seedSampleUsers();
        if (success) {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
          // Refresh stats after seeding
          await fetchAllStats();
        }
      } catch (error) {
        console.error('Error seeding users:', error);
      } finally {
        setSeedingUsers(false);
      }
    };

    // Initial fetch - debounced to prevent multiple calls
    useEffect(() => {
      // Start user sync when component mounts
      startUserSync();
      
      const timer = setTimeout(() => {
        fetchAllStats();
      }, 100);
      
      return () => clearTimeout(timer);
  }, [shopifyProducts, firebaseProducts, blogPosts]);
  
  // Add real-time listeners for dynamic updates
  useEffect(() => {
    console.log('Setting up real-time listeners...');
    
    // Listen for users changes - check both locations
    let unsubscribeUsers;
    let unsubscribeAdminUsers;
    
    const handleUserData = (snapshot, source) => {
      console.log(`Users data updated from ${source} - Real-time event triggered`);
      setRealtimeActive(true);
      setTimeout(() => setRealtimeActive(false), 1000);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersArray = Object.keys(usersData).map(key => ({
          id: key,
          ...usersData[key]
        }));
        
        // Count total users (including deleted)
        const totalUsers = usersArray.length;
        
        // Filter active users (not deleted)
        const activeUsersArray = usersArray.filter(user => user.isDeleted !== true);
        const activeUsers = activeUsersArray.length;
        
        // Count inactive/deleted users
        const inactiveUsers = usersArray.filter(user => user.isDeleted === true).length;
        
        // Log for debugging
        if (inactiveUsers > 0) {
          console.log(`Found ${inactiveUsers} deleted/inactive users`);
        }
        
        console.log(`Users - Total: ${totalUsers}, Active: ${activeUsers}`);
        
        setStats(prev => ({
          ...prev,
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers
        }));
      } else if (source === '/users') {
        // If no users in /users, try adminData/users
        console.log('No users found in /users, setting up listener for /adminData/users');
        const adminUsersRef = ref(realtimeDb, 'adminData/users');
        unsubscribeAdminUsers = onValue(adminUsersRef, (snapshot) => {
          handleUserData(snapshot, '/adminData/users');
        });
      } else {
        console.log(`No users found in ${source}`);
        setStats(prev => ({
          ...prev,
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0
        }));
      }
    };
    
    // Start with adminData/users location (where sync puts them)
    const adminUsersRef = ref(realtimeDb, 'adminData/users');
    unsubscribeAdminUsers = onValue(adminUsersRef, (snapshot) => {
      handleUserData(snapshot, '/adminData/users');
    });
    
    // Also listen to standard users location as fallback
    const usersRef = ref(realtimeDb, 'users');
    unsubscribeUsers = onValue(usersRef, (snapshot) => {
      // Only use this if adminData/users is empty
      const adminRef = ref(realtimeDb, 'adminData/users');
      get(adminRef).then(adminSnapshot => {
        if (!adminSnapshot.exists() && snapshot.exists()) {
          handleUserData(snapshot, '/users');
        }
      });
    });
    
    // Also listen for presence data if it exists
    const presenceRef = ref(realtimeDb, 'presence');
    const unsubscribePresence = onValue(presenceRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log('Presence data updated');
        const presenceData = snapshot.val();
        let onlineNow = 0;
        
        Object.keys(presenceData).forEach(userId => {
          if (presenceData[userId]?.online === true) {
            onlineNow++;
          }
        });
        
        console.log(`Users online now: ${onlineNow}`);
        
        // Update subtitle to show online status
        setStats(prev => ({
          ...prev,
          onlineNow // Store separately for subtitle
        }));
      }
    });
    
    // Listen for music tracks changes
    const musicRef = ref(realtimeDb, 'musicTracks');
    const unsubscribeMusic = onValue(musicRef, (snapshot) => {
      if (snapshot.exists()) {
        const musicTracks = Object.keys(snapshot.val()).length;
        setStats(prev => ({ ...prev, totalMusicTracks: musicTracks }));
      }
    });
    
    // Listen for invoices changes
    const invoicesRef = ref(realtimeDb, 'wholesale_invoices');
    const unsubscribeInvoices = onValue(invoicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const invoices = Object.keys(snapshot.val()).length;
        setStats(prev => ({ ...prev, totalInvoices: invoices }));
      }
    });
    
    // Listen for contact messages changes
    const messagesRef = ref(realtimeDb, 'messages');
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messages = Object.keys(snapshot.val()).length;
        setStats(prev => ({ ...prev, totalContactMessages: messages }));
      }
    });
    
    // Listen for career applications changes
    const careerRef = ref(realtimeDb, 'career_applications');
    const unsubscribeCareer = onValue(careerRef, (snapshot) => {
      if (snapshot.exists()) {
        const applications = Object.keys(snapshot.val()).length;
        setStats(prev => ({ ...prev, totalCareerApplications: applications }));
      }
    });
    
    return () => {
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeAdminUsers) unsubscribeAdminUsers();
      unsubscribePresence();
      unsubscribeMusic();
      unsubscribeInvoices();
      unsubscribeMessages();
      unsubscribeCareer();
    };
  }, []);
  
  // Update blog posts count when context changes
  useEffect(() => {
    setStats(prev => ({ ...prev, totalBlogPosts: blogPosts?.length || 0 }));
  }, [blogPosts]);

  // Format storage size
  const formatStorageSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Spotify-style card component
  const SpotifyCard = ({ title, value, subtitle, icon: Icon, color = '#1db954', trend, isLoading }) => {
    return (
      <div className={`bg-[#181818] rounded-lg p-3 sm:p-4 hover:bg-[#282828] transition-all duration-300 cursor-pointer group relative overflow-hidden h-[120px] sm:min-h-[120px] ${
        cardRefreshing ? 'animate-pulse' : ''
      }`}>
        {/* Refresh animation overlay */}
        {cardRefreshing && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        )}
        
        <div className="flex flex-col h-full">
          {/* Header with title and icon */}
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs sm:text-sm text-[#b3b3b3] font-medium leading-tight flex-1 pr-2">{title}</p>
            <div className={`p-1.5 rounded-full transition-all duration-300 flex-shrink-0 ${
              cardRefreshing ? 'animate-spin' : ''
            }`} style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" style={{ color }} />
              {title === 'Total Users' && realtimeActive && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
          </div>
          
          {/* Value */}
          {isLoading ? (
            <div className="mb-2">
              <div className="h-6 sm:h-8 w-12 sm:w-16 bg-[#282828] rounded animate-pulse" />
            </div>
          ) : (
            <h3 className={`text-lg sm:text-2xl font-bold text-white mb-1 transition-all duration-300 leading-tight ${
              cardRefreshing ? 'opacity-50' : 'opacity-100'
            }`}>{value !== null && value !== undefined ? value : '0'}</h3>
          )}
          
          {/* Subtitle */}
          {subtitle && !isLoading && (
            <p className="text-xs text-[#b3b3b3] leading-tight line-clamp-2 flex-1 overflow-hidden">{subtitle}</p>
          )}
          
          {/* Trend */}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className={`w-3 h-3 ${trend > 0 ? 'text-spotify-green' : 'text-red-500 rotate-180'}`} />
              <span className={`text-xs font-medium ${trend > 0 ? 'text-spotify-green' : 'text-red-500'}`}>
                {Math.abs(trend)}%
              </span>
              <span className="text-xs text-[#b3b3b3]">vs last month</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Show single loader until both dashboard stats AND products are loaded
  if (loading || productsLoading) {
    return <GradientLoader />;
  }

  return (
    <div>
      {/* Add shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        @keyframes slideIn {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-100%); opacity: 0; }
        }
        .toast-enter {
          animation: slideIn 0.3s ease-out;
        }
        .toast-exit {
          animation: slideOut 0.3s ease-out;
        }
      `}</style>
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-2 right-2 left-2 sm:left-auto z-50 toast-enter">
          <div className="bg-spotify-green text-black px-2 sm:px-3 py-1 sm:py-2 rounded-lg shadow-lg flex items-center gap-1 text-sm sm:text-base">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium">Dashboard refreshed successfully!</span>
          </div>
        </div>
      )}
      
      {/* Welcome Section */}
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}</h1>
          <p className="text-[#b3b3b3] text-sm sm:text-base">Here's what's happening with your store today</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-[#282828] hover:bg-[#3e3e3e] text-white rounded-full transition-colors disabled:opacity-50 text-sm sm:text-base self-start"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Grid - Compact Square Cards with Simple Dark Backgrounds */}
      <div className="mb-4">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {/* Total Users */}
          <div className="aspect-square rounded-lg bg-gray-dark border border-border cursor-pointer hover:bg-[#2a2a2a] transition-colors flex flex-col items-center justify-center text-center p-2">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 mb-1 text-green-400" />
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalUsers}</p>
            <p className="text-gray-400 text-[10px] sm:text-xs leading-tight truncate w-full">Users</p>
          </div>

          {/* Storage Used */}
          <div className="aspect-square rounded-lg bg-gray-dark border border-border cursor-pointer hover:bg-[#2a2a2a] transition-colors flex flex-col items-center justify-center text-center p-2">
            <Database className="w-6 h-6 sm:w-8 sm:h-8 mb-1 text-blue-400" />
            <p className="text-xl sm:text-2xl font-bold text-white">{(stats.storageSize / 1024 / 1024).toFixed(1)}</p>
            <p className="text-gray-400 text-[10px] sm:text-xs leading-tight truncate w-full">Storage MB</p>
          </div>

          {/* Shopify Products */}
          <div className="aspect-square rounded-lg bg-gray-dark border border-border cursor-pointer hover:bg-[#2a2a2a] transition-colors flex flex-col items-center justify-center text-center p-2">
            <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 mb-1 text-purple-400" />
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalShopifyProducts}</p>
            <p className="text-gray-400 text-[10px] sm:text-xs leading-tight truncate w-full">Shopify</p>
          </div>

          {/* Wholesale Products */}
          <div className="aspect-square rounded-lg bg-gray-dark border border-border cursor-pointer hover:bg-[#2a2a2a] transition-colors flex flex-col items-center justify-center text-center p-2">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 mb-1 text-pink-400" />
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalWholesaleProducts}</p>
            <p className="text-gray-400 text-[10px] sm:text-xs leading-tight truncate w-full">Wholesale</p>
          </div>

          {/* Music Tracks */}
          <div className="aspect-square rounded-lg bg-gray-dark border border-border cursor-pointer hover:bg-[#2a2a2a] transition-colors flex flex-col items-center justify-center text-center p-2">
            <Music className="w-6 h-6 sm:w-8 sm:h-8 mb-1 text-yellow-400" />
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalMusicTracks}</p>
            <p className="text-gray-400 text-[10px] sm:text-xs leading-tight truncate w-full">Music</p>
          </div>

          {/* Invoices */}
          <div className="aspect-square rounded-lg bg-gray-dark border border-border cursor-pointer hover:bg-[#2a2a2a] transition-colors flex flex-col items-center justify-center text-center p-2">
            <Receipt className="w-6 h-6 sm:w-8 sm:h-8 mb-1 text-cyan-400" />
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalInvoices}</p>
            <p className="text-gray-400 text-[10px] sm:text-xs leading-tight truncate w-full">Invoices</p>
          </div>

          {/* Blog Posts */}
          <div className="aspect-square rounded-lg bg-gray-dark border border-border cursor-pointer hover:bg-[#2a2a2a] transition-colors flex flex-col items-center justify-center text-center p-2">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 mb-1 text-emerald-400" />
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalBlogPosts}</p>
            <p className="text-gray-400 text-[10px] sm:text-xs leading-tight truncate w-full">Blog</p>
          </div>

          {/* Messages */}
          <div className="aspect-square rounded-lg bg-gray-dark border border-border cursor-pointer hover:bg-[#2a2a2a] transition-colors flex flex-col items-center justify-center text-center p-2">
            <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 mb-1 text-red-400" />
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalContactMessages + stats.totalCareerApplications}</p>
            <p className="text-gray-400 text-[10px] sm:text-xs leading-tight truncate w-full">Messages</p>
          </div>
        </div>
      </div>

      {/* Popup Manager Section */}
      <div className="mt-8">
        <PopupManager />
      </div>

      {/* Hero Video Manager Section */}
      <div className="mt-8">
        <HeroVideoManager />
      </div>

      {/* Labs Editor Section */}
      <div className="mt-8">
        <LabsEditor />
      </div>
    </div>
  );
};

export default Dashboard;