import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Bell, User, ChevronDown, ShoppingCart, Menu, X, LogOut, Heart, Settings, User2, Package, Home, Users, Lightbulb, Phone, Calendar, HelpCircle, Gift, CreditCard, Shirt } from 'lucide-react';
import { useCart } from '../context/ShopifyCartContext';
import { useWholesaleCart } from '../context/WholesaleCartContext';
import { useAuth } from '../context/AuthContext';
import { useBlog } from '../context/BlogContext';
import { useLogos } from '../context/LogosContext';
import { useWishlist } from '../context/WishlistContextNew';
import AuthModal from './auth/AuthModal';

const SpotifyTopBar = ({ onCartClick, onWishlistClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine which cart to use based on current page
  const isWholesalePage = location.pathname.includes('/wholesale');
  const shopifyCart = useCart();
  const wholesaleCart = useWholesaleCart();
  const cartCount = isWholesalePage ? wholesaleCart.cartCount : shopifyCart.cartCount;
  
  const { user, userData, logout } = useAuth();
  const { posts } = useBlog();
  const { logos } = useLogos();
  const { wishlistItems } = useWishlist();
  
  const wishlistCount = Array.isArray(wishlistItems) ? wishlistItems.length : 0;
  
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState('signin');
  // cartCount is now available directly from useCart

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/wholesale', label: 'Wholesale' },
    { path: '/about', label: 'About' },
    { path: '/lab-results', label: 'Lab' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
    <header className="bg-black/95 backdrop-blur-md sticky top-0 z-50 border-b border-border">
      <div className="px-4 md:px-8 py-4">
        <div className="flex items-center justify-between relative">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              {/* Desktop Logo */}
              <MediaPlaceholder kind="image" />
              {/* Mobile Logo */}
              <MediaPlaceholder kind="image" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-bold transition-colors hover:text-white ${
                    isActive(link.path) ? 'text-white' : 'text-text-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">

            {/* Weedmaps button - Desktop only */}
            <a
              href="https://weedmaps.com/brands/brand-brand"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex bg-white text-black font-bold text-sm px-4 py-2 rounded-full hover:bg-gray-100 hover:scale-105 transition-transform items-center gap-2"
            >
              <MediaPlaceholder kind="image" />
              Weedmaps
            </a>

            {/* Merch button - Desktop only */}
            <Link to="/shop" className="hidden md:flex bg-primary text-white font-bold text-sm px-4 py-2 rounded-full hover:bg-primary-hover hover:scale-105 transition-transform items-center gap-2">
              Merch
            </Link>
            
            {/* Wishlist Button - Now visible on mobile and desktop */}
            <button
              onClick={onWishlistClick}
              className="flex lg:flex relative bg-black/70 rounded-full p-2 hover:bg-black transition-colors group"
            >
              <Heart className="h-5 w-5 text-white" fill={wishlistCount > 0 ? "currentColor" : "none"} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in group-hover:scale-110 transition-transform">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button - Now visible on mobile and desktop */}
            <button
              onClick={onCartClick}
              className="flex relative bg-black/70 rounded-full p-2 hover:bg-black transition-colors group"
            >
              <ShoppingCart className="h-5 w-5 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in group-hover:scale-110 transition-transform">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Blog/Notifications - Now visible on mobile and desktop */}
            <Link to="/blog" className="flex relative bg-black/70 rounded-full p-2 hover:bg-black transition-colors group">
              <Bell className="h-5 w-5 text-white" />
              {posts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in group-hover:scale-110 transition-transform">
                  {posts.length > 9 ? '9+' : posts.length}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="bg-gray-dark rounded-full p-1 hover:bg-gray transition-colors flex items-center gap-2"
              >
                <div className="bg-gray-light rounded-full p-1.5">
                  <User className="h-4 w-4 text-white" />
                </div>
                <ChevronDown className={`h-4 w-4 text-white transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-dark rounded-md shadow-xl py-1 border border-border">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-white font-semibold">{user.displayName || user.email}</p>
                        <p className="text-xs text-spotify-text-subdued">{userData?.role || 'Customer'}</p>
                      </div>
                      <a href="/account" className="block px-4 py-3 text-sm text-white hover:bg-gray flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Account
                      </a>
                      <a href="/orders" className="block px-4 py-3 text-sm text-white hover:bg-gray flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        My Orders
                      </a>
                      <div className="border-t border-border"></div>
                      <button 
                        onClick={async () => {
                          await logout();
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-white hover:bg-gray flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setAuthTab('signin');
                          setShowAuth(true);
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-white hover:bg-gray"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          setAuthTab('signup');
                          setShowAuth(true);
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-white hover:bg-gray"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden bg-gray-dark rounded-full p-2 hover:bg-gray transition-colors"
              style={{ position: 'relative', zIndex: 65 }}
            >
              {showMobileMenu ? (
                <X className="h-6 w-6 text-white drop-shadow-lg" strokeWidth={3} />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>

      </div>
    </header>

    {/* Mobile Navigation - 2 Column Grid with Rounded Banners - Outside header to avoid stacking context */}
    {showMobileMenu && (
      <>
        {/* Backdrop */}
        <div
          className="lg:hidden fixed inset-0 bg-black/90 z-[100]"
          style={{ top: '73px' }}
          onClick={() => setShowMobileMenu(false)}
        />

        {/* Mobile Menu */}
        <nav
          className="lg:hidden fixed left-0 right-0 bottom-0 z-[101] overflow-y-auto"
          style={{
            top: '73px',
            backgroundColor: '#000000',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            overscrollBehavior: 'contain'
          }}
        >
          <div className="px-4 py-6 pb-24">
            {/* 2-Column Grid Layout */}
            <div className="grid grid-cols-2 gap-3">
              {/* Home */}
              <Link
                to="/"
                onClick={() => setShowMobileMenu(false)}
                className="flex flex-col items-center justify-center bg-[#1a1a1a] hover:bg-[#252525] active:bg-[#333] rounded-2xl py-6 px-4 transition-all touch-manipulation"
              >
                <Home className="h-7 w-7 text-white mb-2" />
                <span className="text-white font-semibold text-sm">Home</span>
              </Link>

              {/* Products */}
              <Link
                to="/products"
                onClick={() => setShowMobileMenu(false)}
                className="flex flex-col items-center justify-center bg-[#1a1a1a] hover:bg-[#252525] active:bg-[#333] rounded-2xl py-6 px-4 transition-all touch-manipulation"
              >
                <Package className="h-7 w-7 text-white mb-2" />
                <span className="text-white font-semibold text-sm">Products</span>
              </Link>

              {/* Wholesale */}
              <Link
                to="/wholesale"
                onClick={() => setShowMobileMenu(false)}
                className="flex flex-col items-center justify-center bg-[#1a1a1a] hover:bg-[#252525] active:bg-[#333] rounded-2xl py-6 px-4 transition-all touch-manipulation"
              >
                <Users className="h-7 w-7 text-white mb-2" />
                <span className="text-white font-semibold text-sm">Wholesale</span>
              </Link>

              {/* Merch */}
              <Link
                to="/shop"
                onClick={() => setShowMobileMenu(false)}
                className="flex flex-col items-center justify-center bg-[#1a1a1a] hover:bg-[#252525] active:bg-[#333] rounded-2xl py-6 px-4 transition-all touch-manipulation"
              >
                <Shirt className="h-7 w-7 text-white mb-2" />
                <span className="text-white font-semibold text-sm">Merch</span>
              </Link>

              {/* About */}
              <Link
                to="/about"
                onClick={() => setShowMobileMenu(false)}
                className="flex flex-col items-center justify-center bg-[#1a1a1a] hover:bg-[#252525] active:bg-[#333] rounded-2xl py-6 px-4 transition-all touch-manipulation"
              >
                <Lightbulb className="h-7 w-7 text-white mb-2" />
                <span className="text-white font-semibold text-sm">About</span>
              </Link>

              {/* Lab Results */}
              <Link
                to="/lab-results"
                onClick={() => setShowMobileMenu(false)}
                className="flex flex-col items-center justify-center bg-[#1a1a1a] hover:bg-[#252525] active:bg-[#333] rounded-2xl py-6 px-4 transition-all touch-manipulation"
              >
                <HelpCircle className="h-7 w-7 text-white mb-2" />
                <span className="text-white font-semibold text-sm">Lab</span>
              </Link>

              {/* Contact */}
              <Link
                to="/contact"
                onClick={() => setShowMobileMenu(false)}
                className="flex flex-col items-center justify-center bg-[#1a1a1a] hover:bg-[#252525] active:bg-[#333] rounded-2xl py-6 px-4 transition-all touch-manipulation"
              >
                <Phone className="h-7 w-7 text-white mb-2" />
                <span className="text-white font-semibold text-sm">Contact</span>
              </Link>

              {/* Blog */}
              <Link
                to="/blog"
                onClick={() => setShowMobileMenu(false)}
                className="flex flex-col items-center justify-center bg-[#1a1a1a] hover:bg-[#252525] active:bg-[#333] rounded-2xl py-6 px-4 transition-all touch-manipulation"
              >
                <Bell className="h-7 w-7 text-white mb-2" />
                <span className="text-white font-semibold text-sm">Blog</span>
              </Link>
            </div>

            {/* Weedmaps Banner - Full Width */}
            <a
              href="https://weedmaps.com/brands/brand-brand"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center justify-center gap-3 bg-white hover:bg-gray-100 active:bg-gray-200 rounded-2xl py-4 px-6 mt-3 transition-all touch-manipulation"
            >
              <MediaPlaceholder kind="image" />
              <span className="text-black font-bold text-sm">Find Us on Weedmaps</span>
            </a>
          </div>
        </nav>
      </>
    )}

    {/* Authentication Modal */}
    <AuthModal
      isOpen={showAuth}
      onClose={() => setShowAuth(false)}
      defaultTab={authTab}
    />
    </>
  );
};

export default SpotifyTopBar;