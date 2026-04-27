import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ShoppingCart, TrendingUp, Sparkles, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useEnhancedProducts } from '../context/EnhancedProductsContext';
import { useCart } from '../context/ShopifyCartContext';
import { useWishlist } from '../context/WishlistContextNew';
import ProductModal from './ProductModal';
import ProductHoverActions from './ProductHoverActions';

const ProductSections = ({ productType }) => {
  const { shopifyProducts } = useEnhancedProducts();
  const { addToCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [hoveredQuickPick, setHoveredQuickPick] = useState(null);
  
  const isInCart = (productId) => {
    return cart.some(item => item.id === productId);
  };
  
  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleProductClick = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };
  
  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Organize products by type
  const getProductsByType = () => {
    switch (productType) {
      case 'quickPicks':
        return shopifyProducts.slice(0, 6);
      case 'popular':
        return shopifyProducts.slice(0, 10);
      case 'newArrivals':
        return shopifyProducts.slice(5, 15);
      case 'trending':
        return shopifyProducts.slice(0, 10);
      case 'recentlyViewed':
        return []; // Return empty array for recently viewed
      case 'madeForYou':
        return shopifyProducts.slice(3, 13);
      default:
        return [];
    }
  };

  const products = getProductsByType();

  // Quick Picks Section (Horizontal Scroll)
  if (productType === 'quickPicks') {
    const quickPicksRef = useRef(null);
    
    const scrollQuickPicks = (direction) => {
      if (quickPicksRef.current) {
        const scrollAmount = 300;
        quickPicksRef.current.scrollBy({ 
          left: direction === 'left' ? -scrollAmount : scrollAmount, 
          behavior: 'smooth' 
        });
      }
    };
    
    return (
      <>
        <div className="quick-picks-section">
          <div className="px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {getGreeting()}
            </h2>
          </div>
          <div className="relative group">
            {/* Left Arrow */}
            <button
              onClick={() => scrollQuickPicks('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/75 hover:bg-black/90 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            {/* Right Arrow */}
            <button
              onClick={() => scrollQuickPicks('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/75 hover:bg-black/90 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            
            <div 
              ref={quickPicksRef}
              className="overflow-x-auto scrollbar-hide px-6 lg:px-8"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              <div className="flex gap-4 min-w-max">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group/card relative bg-spotify-light-gray rounded-md overflow-hidden cursor-pointer transition-all hover:bg-spotify-card-hover flex-none"
                    onClick={() => handleProductClick(product)}
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className="flex items-center gap-3 p-4 pr-8">
                      <div className="relative w-14 h-14 flex-shrink-0">
                        {product.imageUrl && (
                          <MediaPlaceholder kind="image" />
                        )}
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <div className="bg-spotify-green rounded-full p-2 shadow-lg transform translate-y-2 group-hover/card:translate-y-0 transition-transform">
                            <Play className="h-4 w-4 text-black fill-current" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="font-medium text-white text-sm truncate">{product.name}</h3>
                        <p className="text-spotify-text-subdued text-xs">${product.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <ProductModal 
          product={selectedProduct}
          isOpen={showProductModal}
          onClose={handleCloseModal}
          onCartClick={() => {}}
        />
      </>
    );
  }

  // Trending Section (Animated Scroll)
  if (productType === 'trending') {
    const [hoveredTrending, setHoveredTrending] = useState(null);
    const trendingScrollRef = useRef(null);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);
    
    // Auto-scroll effect
    useEffect(() => {
      if (!isAutoScrolling || !trendingScrollRef.current) return;
      
      const scrollContainer = trendingScrollRef.current;
      let scrollPosition = 0;
      
      const scroll = () => {
        if (!isAutoScrolling) return;
        
        scrollPosition += 1;
        if (scrollPosition >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollPosition = 0;
        }
        scrollContainer.scrollLeft = scrollPosition;
      };
      
      const intervalId = setInterval(scroll, 30);
      
      return () => clearInterval(intervalId);
    }, [isAutoScrolling]);
    
    return (
      <>
        <div className="trending-section">
          <div className="px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-primary p-2 rounded">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Trending Now</h2>
                  <p className="text-spotify-text-subdued text-sm">Most popular products this week</p>
                </div>
              </div>
              <Link to="/shop" className="text-spotify-text-subdued hover:text-white text-sm transition-colors">
                See trending playlist
              </Link>
            </div>
          </div>
          
          <div 
            ref={trendingScrollRef}
            className="overflow-x-auto scrollbar-hide"
            onMouseEnter={() => setIsAutoScrolling(false)}
            onMouseLeave={() => setIsAutoScrolling(true)}
          >
            <div className="flex gap-4 px-6 lg:px-8 min-w-max">
              {/* Duplicate products for seamless loop */}
              {[...products, ...products].map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="group relative cursor-pointer flex-none w-[180px]"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="bg-spotify-dark rounded-lg overflow-hidden transition-all duration-300 hover:bg-spotify-card-hover p-4">
                    <div className="relative aspect-square overflow-hidden rounded-md mb-4">
                      {product.imageUrl && (
                        <MediaPlaceholder kind="image" />
                      )}
                      {/* Trending badge */}
                      <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Trending
                      </div>
                      {/* Play button overlay */}
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <button 
                          className="bg-spotify-green rounded-full p-3 shadow-lg hover:scale-105 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product, e);
                          }}
                        >
                          <Play className="h-5 w-5 text-black fill-current" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-spotify-text-subdued text-sm">${product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ProductModal 
          product={selectedProduct}
          isOpen={showProductModal}
          onClose={handleCloseModal}
          onCartClick={() => {}}
        />
      </>
    );
  }

  // Regular Product Sections (Horizontal Scroll)
  const scrollRef = useRef(null);
  
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Skip rendering for recentlyViewed section
  if (productType === 'recentlyViewed') {
    return null;
  }

  const getSectionTitle = () => {
    switch (productType) {
      case 'popular':
        return { title: 'Popular right now', subtitle: 'The most popular products in your area' };
      case 'newArrivals':
        return { title: 'New arrivals', subtitle: 'Fresh products just added to our collection' };
      case 'recentlyViewed':
        return { title: 'Recently Viewed', subtitle: 'Continue where you left off' };
      case 'madeForYou':
        return { title: 'Made for you', subtitle: 'Based on your recent activity' };
      default:
        return { title: '', subtitle: '' };
    }
  };

  const { title, subtitle } = getSectionTitle();

  return (
    <>
      <div className="product-section">
        <div className="px-6 lg:px-8 flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {title}
            </h2>
            {subtitle && <p className="text-spotify-text-subdued text-sm mt-1">{subtitle}</p>}
          </div>
          <Link to="/shop" className="text-spotify-text-subdued hover:text-white text-sm transition-colors">
            Show all
          </Link>
        </div>
        
        {/* Horizontal scroll container */}
        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/75 hover:bg-black/90 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/75 hover:bg-black/90 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          <div 
            ref={scrollRef}
            className="overflow-x-auto scrollbar-hide px-6 lg:px-8"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            <div className="flex gap-4 min-w-max">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group/card relative cursor-pointer flex-none w-[180px]"
                  onClick={() => handleProductClick(product)}
                  onMouseEnter={() => setHoveredCard(product.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="bg-spotify-dark rounded-lg transition-all duration-300 hover:bg-spotify-card-hover p-4">
                    <div className="relative aspect-square mb-4 overflow-hidden rounded-md">
                      {product.imageUrl && (
                        <MediaPlaceholder kind="image" />
                      )}
                      {/* Play button overlay */}
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover/card:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/card:translate-y-0">
                        <button 
                          className="bg-spotify-green rounded-full p-3 shadow-lg hover:scale-105 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product, e);
                          }}
                        >
                          <Play className="h-5 w-5 text-black fill-current" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-spotify-text-subdued text-sm">${product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ProductModal 
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default ProductSections;