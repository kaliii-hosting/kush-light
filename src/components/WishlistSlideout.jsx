import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect } from 'react';
import { X, Heart, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContextNew';
import { useEnhancedProducts } from '../context/EnhancedProductsContext';
import { useCart } from '../context/ShopifyCartContext';
import { Link } from 'react-router-dom';
import { normalizeProductId, productIdsMatch } from '../utils/wishlistHelpers';

const WishlistSlideout = ({ isOpen, onClose }) => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { products: enhancedProducts, loading: productsLoading } = useEnhancedProducts();
  const { addToCart } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  
  // Use the combined products from EnhancedProductsContext
  // which already includes both Firebase and Shopify products
  const allProducts = enhancedProducts || [];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  // Get wishlist products - handle different ID formats
  const wishlistProducts = allProducts.filter(product => {
    // Check if product ID is in wishlist using the helper function
    const productNormalizedId = normalizeProductId(product.id);
    const isInWishlist = wishlistItems.some(wishlistId => {
      const matched = productIdsMatch(wishlistId, product.id) || 
                     productIdsMatch(wishlistId, productNormalizedId) ||
                     (product.shopifyId && productIdsMatch(wishlistId, product.shopifyId));
      
      return matched;
    });
    
    return isInWishlist;
  });

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  const itemCount = wishlistProducts.length;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[55] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Wishlist Slide-out */}
      <div 
        className={`fixed right-0 top-0 h-full sm:h-[calc(100vh-5rem)] w-full sm:w-96 bg-black border-l border-border z-[60] transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-red-500 fill-current" />
              <h2 className="text-xl font-bold text-white">Your Wishlist</h2>
              {itemCount > 0 && (
                <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
                  {itemCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-dark rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Wishlist Items */}
          <div className="flex-1 overflow-y-auto">
            {wishlistProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6">
                <Heart className="h-16 w-16 text-gray mb-4" />
                <p className="text-white text-lg font-bold mb-2">Your wishlist is empty</p>
                <p className="text-text-secondary text-sm text-center mb-6">
                  Add products you love to keep track of them
                </p>
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="bg-red-500 text-white font-bold px-6 py-3 rounded-full hover:bg-red-600 transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {wishlistProducts.map((product) => (
                  <div key={product.id} className="bg-card rounded-lg p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-dark rounded-md overflow-hidden flex-shrink-0">
                        {(product.imageUrl || product.image) && (
                          <MediaPlaceholder kind="image" />
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-primary font-bold mb-2">${product.price}</p>
                        
                        {/* Action Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 px-3 rounded-full transition-colors flex items-center justify-center gap-1"
                          >
                            <ShoppingCart className="h-3 w-3" />
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleRemoveFromWishlist(product.id)}
                            className="text-text-secondary hover:text-white text-sm transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Actions */}
          {wishlistProducts.length > 0 && (
            <div className="border-t border-border p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white text-lg font-bold">Total Items</span>
                <span className="text-red-500 text-2xl font-black">{itemCount}</span>
              </div>
              
              <Link
                to="/shop"
                onClick={onClose}
                className="block w-full text-center text-white font-bold py-4 rounded-full border-2 border-white hover:bg-white/10 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WishlistSlideout;