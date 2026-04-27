import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState } from 'react';
import { useWishlist } from '../context/WishlistContextNew';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/ShopifyCartContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import ProductModal from '../components/ProductModal';
import ProductHoverActions from '../components/ProductHoverActions';

const Wishlist = ({ onCartClick }) => {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  // Get wishlist products
  const wishlistProducts = products.filter(product => 
    wishlistItems.includes(product.id)
  );

  const handleAddToCart = (product) => {
    addToCart(product);
    // Optionally remove from wishlist after adding to cart
    // removeFromWishlist(product.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading wishlist...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative h-48 md:h-64 bg-gradient-to-b from-primary/20 to-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Heart className="h-8 w-8 md:h-10 md:w-10 fill-primary text-primary" />
              My Wishlist
            </h1>
            <p className="text-spotify-text-subdued text-lg">
              {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>
      </div>

      {/* Wishlist Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-spotify-text-subdued text-lg mb-4">
              Your wishlist is empty
            </p>
            <a href="/shop" className="text-primary hover:underline">
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="bg-spotify-light-gray rounded-lg overflow-hidden hover:bg-spotify-card-hover transition-all group"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Product Image */}
                <div 
                  className="relative aspect-square overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <MediaPlaceholder kind="image" />
                  
                  {/* Hover Actions with Feedback */}
                  <ProductHoverActions 
                    product={product}
                    isHovered={hoveredProduct === product.id}
                    onProductClick={() => setSelectedProduct(product)}
                  />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-primary font-bold">
                    ${product.price}
                  </p>
                  
                  {/* Quick Actions */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="mt-3 w-full bg-primary text-white py-2 rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onCartClick={onCartClick}
        />
      )}
    </div>
  );
};

export default Wishlist;