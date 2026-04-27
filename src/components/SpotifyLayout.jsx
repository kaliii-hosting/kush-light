import { useState, cloneElement } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SpotifyTopBar from './SpotifyTopBar';
import SpotifyPlayerBar from './SpotifyPlayerBar';
import CartSlideOut from './CartSlideOut';
import WishlistSlideout from './WishlistSlideout';
import GlobalFooter from './GlobalFooter';
import useVisitorTracking from '../hooks/useVisitorTracking';

const SpotifyLayout = ({ children }) => {
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Track visitor for analytics
  useVisitorTracking();
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  
  const handleCartOpen = () => setIsCartOpen(true);
  const handleCartClose = () => setIsCartOpen(false);
  const handleWishlistOpen = () => setIsWishlistOpen(true);
  const handleWishlistClose = () => setIsWishlistOpen(false);
  
  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden max-w-full relative">
      {/* Top bar */}
      <SpotifyTopBar onCartClick={handleCartOpen} onWishlistClick={handleWishlistOpen} />
      
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-black">
        <div className="pb-24 min-h-screen max-w-full overflow-x-hidden">
          {children ? 
            cloneElement(children, { onCartClick: handleCartOpen }) :
            <Outlet context={{ onCartClick: handleCartOpen }} />
          }
          <GlobalFooter />
        </div>
      </main>
      
      {/* Player bar */}
      <SpotifyPlayerBar />
      
      {/* Cart Slide-out */}
      <CartSlideOut isOpen={isCartOpen} onClose={handleCartClose} />
      
      {/* Wishlist Slide-out */}
      <WishlistSlideout isOpen={isWishlistOpen} onClose={handleWishlistClose} />
    </div>
  );
};

export default SpotifyLayout;