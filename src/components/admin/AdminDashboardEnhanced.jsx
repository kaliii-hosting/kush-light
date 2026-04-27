import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, get } from 'firebase/database';
import { realtimeDb } from '../../config/firebase';
import { createClient } from '@supabase/supabase-js';
import { useEnhancedProducts } from '../../context/EnhancedProductsContext';
import {
  LogOut, Package, Home, Settings, X,
  ShoppingBag, FileText, Users, MessageSquare, Music, Database,
  Bell, ChevronLeft, ChevronRight, Play, Library, Plus,
  Image, Columns, Key, Mail, BarChart3
} from 'lucide-react';
import DockNavigation from './DockNavigation';
import AdminHeader from './AdminHeader';
import ProductsPage from './ProductsPage';
import WholesaleManagement from './WholesaleManagement';
import MusicManagement from './MusicManagement';
import BlogManagement from './BlogManagement';
import UsersManagement from './UsersManagement';
import StorageManagement from './StorageManagement';
import Dashboard from './Dashboard';
import LogosManagement from './LogosManagement';
import FooterManagement from './FooterManagement';
import PasswordsManagement from './PasswordsManagement';
import MessagesPage from './MessagesPage';
import PopupManager from './PopupManager';
import AnalyticsManagement from './AnalyticsManagement';
import { useLogos } from '../../context/LogosContext';
import './AdminDashboard.css';

const AdminDashboardEnhanced = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { logos } = useLogos();
  const { firebaseProducts } = useEnhancedProducts();
  
  // Stats state
  const [stats, setStats] = useState({
    users: 0,
    invoices: 0,
    music: 0,
    blog: 0,
    storage: '0 MB'
  });
  
  // Fetch stats for sidebar
  useEffect(() => {
    const fetchStats = async () => {
      let usersCount = 0;
      let invoicesCount = 0;
      let musicCount = 0;
      let blogCount = 0;
      
      // Fetch users count
      try {
        const usersRef = ref(realtimeDb, 'users');
        const usersSnapshot = await get(usersRef);
        usersCount = usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
      
      // Fetch invoices count
      try {
        const invoicesRef = ref(realtimeDb, 'wholesale_invoices');
        const invoicesSnapshot = await get(invoicesRef);
        invoicesCount = invoicesSnapshot.exists() ? Object.keys(invoicesSnapshot.val()).length : 0;
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
      
      // Fetch music tracks count
      try {
        const musicRef = ref(realtimeDb, 'musicTracks');
        const musicSnapshot = await get(musicRef);
        musicCount = musicSnapshot.exists() ? Object.keys(musicSnapshot.val()).length : 0;
      } catch (error) {
        console.error('Error fetching music tracks:', error);
      }
      
      // Fetch blog posts count from Firebase Realtime Database
      try {
        const blogRef = ref(realtimeDb, 'blogPosts');
        const blogSnapshot = await get(blogRef);
        blogCount = blogSnapshot.exists() ? Object.keys(blogSnapshot.val()).length : 0;
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      }
        
      // Fetch storage size
      let totalSize = 0;
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          // Helper function to recursively get all files
          const getAllFiles = async (bucketName, path = '') => {
            let size = 0;
            try {
              const { data: files, error } = await supabase.storage
                .from(bucketName)
                .list(path, { limit: 1000, offset: 0 });
              
              if (!error && files) {
                for (const file of files) {
                  // Check if it's a folder
                  if (!file.id && file.name) {
                    // Recursively get files from subdirectory
                    const subPath = path ? `${path}/${file.name}` : file.name;
                    size += await getAllFiles(bucketName, subPath);
                  } else if (file.metadata?.size) {
                    size += file.metadata.size;
                  }
                }
              }
            } catch (err) {
              console.error(`Error listing files in ${bucketName}/${path}:`, err);
            }
            return size;
          };
          
          const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
          
          if (!bucketsError && buckets) {
            for (const bucket of buckets) {
              const bucketSize = await getAllFiles(bucket.name);
              totalSize += bucketSize;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching storage size:', error);
      }
      
      // Format storage size
      const formatSize = (bytes) => {
        if (bytes === 0) return '0 MB';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
      };
      
      setStats({
        users: usersCount,
        invoices: invoicesCount,
        music: musicCount,
        blog: blogCount,
        storage: formatSize(totalSize)
      });
    };
    
    fetchStats();
  }, []);

  // Handle logout
  const handleLogout = () => {
    navigate('/admin/login');
  };

  // Main menu items (like Spotify's main navigation)
  const mainMenuItems = [
    { id: 'dashboard', label: 'Home', icon: Home, component: Dashboard },
    { id: 'products', label: 'Wholesale', icon: Package, component: ProductsPage },
    { id: 'wholesale', label: 'Invoices', icon: ShoppingBag, component: WholesaleManagement },
  ];

  // Library menu items (like Spotify's "Your Library" section)
  const libraryMenuItems = [
    { id: 'messages', label: 'Messages', icon: Mail, component: MessagesPage },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, component: AnalyticsManagement },
    { id: 'logos', label: 'Logo', icon: Image, component: LogosManagement },
    { id: 'footer', label: 'Footer', icon: Columns, component: FooterManagement },
    { id: 'passwords', label: 'Passwords', icon: Key, component: PasswordsManagement },
    { id: 'music', label: 'Music', icon: Music, component: MusicManagement },
    { id: 'blog', label: 'Blog', icon: FileText, component: BlogManagement },
    { id: 'users', label: 'Users', icon: Users, component: UsersManagement },
    { id: 'storage', label: 'Storage', icon: Database, component: StorageManagement },
  ];

  // Get current component
  const allMenuItems = [...mainMenuItems, ...libraryMenuItems];
  const CurrentComponent = allMenuItems.find(item => item.id === activeSection)?.component || Dashboard;

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <AdminHeader 
        onLogout={handleLogout}
      />

      {/* Main Container with padding for header */}
      <div className="pt-16 min-h-screen flex flex-col" style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#121212' }}>
        {/* Dock Navigation */}
        <DockNavigation 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col admin-main-content" style={{ backgroundColor: 'transparent', position: 'relative', zIndex: 1 }}>
          {/* Content Area */}
          <main className="flex-1 overflow-hidden h-full">
            <div className="h-full overflow-y-auto admin-scrollbar" style={{ backgroundColor: '#121212' }}>
              {activeSection === 'messages' ? (
                <div className="h-full lg:h-full min-h-screen">
                  <CurrentComponent />
                </div>
              ) : (
                <div className="p-8">
                  {/* Component Content */}
                  <CurrentComponent />
                </div>
              )}
            </div>
          </main>
        </div>
        
      </div>
    </div>
  );
};

export default AdminDashboardEnhanced;