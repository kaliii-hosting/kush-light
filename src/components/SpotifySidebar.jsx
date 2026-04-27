import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, Plus, Heart, Download, MoreHorizontal } from 'lucide-react';

const SpotifySidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();

  const mainNavItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
  ];

  const libraryItems = [
    { name: 'Liked Products', href: '/liked', type: 'playlist' },
    { name: 'Your Orders', href: '/orders', type: 'playlist' },
  ];

  return (
    <div className={`bg-black flex flex-col ${collapsed ? 'w-[72px]' : 'w-[240px]'} transition-all duration-300`}>
      {/* Logo and main nav */}
      <div className="bg-gray-darker p-6">
        <Link to="/" className="block mb-5">
          <MediaPlaceholder kind="image" />
        </Link>
        
        <nav className="space-y-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-4 px-3 py-2 rounded-md transition-all ${
                  isActive 
                    ? 'text-white' 
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'fill-white' : ''}`} />
                {!collapsed && <span className="font-bold text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Library section */}
      <div className="flex-1 bg-gray-darker mt-2 rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 px-6">
          <div className="flex items-center justify-between text-text-secondary mb-4">
            <button className="flex items-center gap-2 hover:text-white transition-colors">
              <Library className="h-6 w-6" />
              {!collapsed && <span className="font-bold text-sm">Your Library</span>}
            </button>
            {!collapsed && (
              <div className="flex items-center gap-2">
                <button className="hover:bg-gray rounded-full p-2 transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
                <button className="hover:bg-gray rounded-full p-2 transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Pills */}
          {!collapsed && (
            <div className="flex gap-2 mb-4">
              <button className="bg-gray text-white text-sm px-3 py-1 rounded-full hover:bg-gray-light transition-colors">
                Playlists
              </button>
              <button className="bg-gray text-white text-sm px-3 py-1 rounded-full hover:bg-gray-light transition-colors">
                Products
              </button>
            </div>
          )}
        </div>

        {/* Library items */}
        <div className="flex-1 overflow-y-auto px-2">
          {!collapsed && (
            <div className="space-y-2 pb-4">
              {/* Search in library */}
              <div className="px-4 mb-2">
                <button className="flex items-center gap-2 text-text-secondary hover:text-white text-sm">
                  <Search className="h-4 w-4" />
                  <span>Search in Your Library</span>
                </button>
              </div>

              {/* Library list */}
              {libraryItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray rounded-md transition-colors group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-md flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm truncate">{item.name}</div>
                    <div className="text-text-secondary text-xs">Playlist • Brand</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Create playlist prompt */}
        {!collapsed && (
          <div className="p-4 mx-2 mb-2">
            <div className="bg-gray rounded-lg p-4">
              <h3 className="text-white text-sm font-bold mb-2">Create your first playlist</h3>
              <p className="text-text-secondary text-xs mb-4">It's easy, we'll help you</p>
              <button className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-full hover:scale-105 transition-transform">
                Create playlist
              </button>
            </div>
          </div>
        )}

        {/* Legal links */}
        {!collapsed && (
          <div className="px-6 py-4 text-[11px] text-text-secondary space-y-2">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <a href="/legal" className="hover:text-white">Legal</a>
              <a href="/privacy" className="hover:text-white">Privacy Center</a>
              <a href="/privacy-policy" className="hover:text-white">Privacy Policy</a>
              <a href="/cookies" className="hover:text-white">Cookies</a>
              <a href="/about-ads" className="hover:text-white">About Ads</a>
            </div>
            <Link to="/accessibility" className="hover:text-white block">Accessibility</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifySidebar;