import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Check } from 'lucide-react';
import { useCart } from '../context/ShopifyCartContext';
import { useWishlist } from '../context/WishlistContextNew';

const ProductHoverActions = ({ product, isHovered, onProductClick }) => {
  const { addToCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [showCartFeedback, setShowCartFeedback] = useState(false);
  const [showWishlistFeedback, setShowWishlistFeedback] = useState(false);
  const [wishlistAction, setWishlistAction] = useState('');
  const [cartAction, setCartAction] = useState('');

  const isInCart = cart.some(item => item.id === product.id);
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setCartAction('added');
    setShowCartFeedback(true);
    setTimeout(() => setShowCartFeedback(false), 2000);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Store the action before toggling
    const wasInWishlist = inWishlist;
    setWishlistAction(wasInWishlist ? 'removed' : 'added');
    
    
    toggleWishlist(product.id);
    setShowWishlistFeedback(true);
    setTimeout(() => setShowWishlistFeedback(false), 2000);
  };

  return (
    <>
      {/* Hover Actions */}
      <div className={`absolute inset-0 bg-black/60 flex items-center justify-center gap-3 transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`p-3 rounded-full shadow-2xl transition-all hover:scale-110 ${
            isInCart
              ? 'bg-white text-black'
              : 'bg-primary text-white hover:bg-primary-hover'
          }`}
          title={isInCart ? 'In cart' : 'Add to cart'}
        >
          <ShoppingCart className="h-5 w-5" fill={isInCart ? 'currentColor' : 'none'} />
        </button>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`p-3 rounded-full shadow-2xl transition-all hover:scale-110 ${
            inWishlist
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white/90 text-black hover:bg-white'
          }`}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className="h-5 w-5" fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Cart Feedback */}
      <div className={`absolute top-4 left-4 right-4 px-4 py-2 rounded-full text-sm font-bold flex items-center justify-center gap-2 transform transition-all duration-300 ${
        showCartFeedback ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
      } ${cartAction === 'added' ? 'bg-green-400 text-black' : 'bg-red-500 text-white'}`}>
        <Check className="h-4 w-4" />
        {cartAction === 'added' ? 'Added to Cart' : 'Removed from Cart'}
      </div>

      {/* Wishlist Feedback */}
      <div className={`absolute top-16 left-4 right-4 px-4 py-2 rounded-full text-sm font-bold flex items-center justify-center gap-2 transform transition-all duration-300 ${
        showWishlistFeedback ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
      } ${wishlistAction === 'added' ? 'bg-green-400 text-black' : 'bg-red-500 text-white'}`}>
        <Heart className="h-4 w-4 fill-current" />
        {wishlistAction === 'added' ? 'Added to Wishlist' : 'Removed from Wishlist'}
      </div>
    </>
  );
};

export default ProductHoverActions;