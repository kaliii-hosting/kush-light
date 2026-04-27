import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, ShoppingCart, Heart, ChevronDown, Leaf, Zap, Shirt } from 'lucide-react';
import { useEnhancedProducts } from '../context/EnhancedProductsContext';
import { useCart } from '../context/ShopifyCartContext';
import { useWishlist } from '../context/WishlistContextNew';
import { ref, onValue } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import ProductModal from './ProductModal';
import ProductHoverActions from './ProductHoverActions';
import InfiniteProductSlider from './InfiniteProductSlider';
import BrandsLogoSlider from './BrandsLogoSlider';
import ApparelSlider from './ApparelSlider';
import WholesaleProductSections from './WholesaleProductSections';
import TreePlantingBanner from './TreePlantingBanner';
import { removeFooterFAQ } from '../utils/removeFooterFAQ';

// Default hero video URL
const DEFAULT_HERO_VIDEO = 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Videos/Horizontal%20Videos/Hero%20Section.mp4';

const SpotifyHomeDynamic = ({ onCartClick }) => {
  const navigate = useNavigate();
  const { shopifyProducts, firebaseProducts } = useEnhancedProducts();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [heroVideoUrl, setHeroVideoUrl] = useState(DEFAULT_HERO_VIDEO);
  // Removed old scroll refs as we're using InfiniteProductSlider component

  // Run the FAQ removal on component mount
  useEffect(() => {
    removeFooterFAQ().then(result => {
      if (result) {
        console.log('Footer FAQs removed successfully');
      }
    });
  }, []);

  // Fetch hero video URL from Firebase
  useEffect(() => {
    const heroRef = ref(realtimeDb, 'homepage_hero_video');
    const unsubscribe = onValue(heroRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.isActive && data.videoUrl) {
          setHeroVideoUrl(data.videoUrl);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Time-based greeting like Spotify
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Helper function to check if a product is hemp-related
  const isHempProduct = (product) => {
    return (
      product.productType?.toLowerCase().includes('hemp') ||
      product.tags?.some(tag => typeof tag === 'string' && tag.toLowerCase().includes('hemp')) ||
      product.vendor?.toLowerCase().includes('hemp') ||
      product.title?.toLowerCase().includes('hemp') ||
      product.name?.toLowerCase().includes('hemp') ||
      product.category?.toLowerCase().includes('hemp') ||
      product.collections?.some(collection => {
        if (typeof collection === 'string') {
          return collection.toLowerCase().includes('hemp');
        } else if (collection?.title) {
          return collection.title.toLowerCase().includes('hemp');
        } else if (collection?.name) {
          return collection.name.toLowerCase().includes('hemp');
        }
        return false;
      }) ||
      product.handle?.toLowerCase().includes('hemp')
    );
  };

  // Filter OUT hemp products from display (for other sections)
  const nonHempProducts = shopifyProducts.filter(product => !isHempProduct(product));

  // Use wholesale/Firebase products for the first "Good evening" slider
  const productsToShow = firebaseProducts.slice(0, 10);

  // Empty array for hemp products (since we're removing them)
  const hempProducts = [];

  // Filter sale products from Shopify (excluding hemp products)
  const saleProducts = shopifyProducts.filter(product => {
    // Exclude hemp products
    if (isHempProduct(product)) return false;
    // Check various fields for sale indicators
    if (product.tags?.some(tag => 
      typeof tag === 'string' && (
        tag.toLowerCase().includes('sale') ||
        tag.toLowerCase().includes('discount') ||
        tag.toLowerCase().includes('clearance')
      )
    )) return true;
    
    // Check if product has compare_at_price (indicates it's on sale)
    if (product.compareAtPrice && product.price < product.compareAtPrice) return true;
    
    // Check collections for sale
    if (product.collections?.some(collection => {
      if (typeof collection === 'string') {
        return collection.toLowerCase().includes('sale');
      } else if (collection?.title) {
        return collection.title.toLowerCase().includes('sale');
      } else if (collection?.name) {
        return collection.name.toLowerCase().includes('sale');
      }
      return false;
    })) return true;
    
    return false;
  }).slice(0, 10); // Limit to 10 products

  // Fallback to all products if no sale products found
  const saleProductsToShow = saleProducts.length > 0 ? saleProducts : shopifyProducts.slice(10, 20);

  // State for featured product carousel
  const [featuredProductIndex, setFeaturedProductIndex] = useState(0);
  
  
  // Find clothing products from sale items for hero section
  const featuredClothingProducts = saleProducts.filter(product => {
    // Check if it's a clothing item
    const isClothing = 
      product.productType?.toLowerCase().includes('apparel') ||
      product.productType?.toLowerCase().includes('clothing') ||
      product.productType?.toLowerCase().includes('shirt') ||
      product.productType?.toLowerCase().includes('hoodie') ||
      product.productType?.toLowerCase().includes('gear') ||
      product.tags?.some(tag => 
        typeof tag === 'string' && (
          tag.toLowerCase().includes('apparel') ||
          tag.toLowerCase().includes('clothing') ||
          tag.toLowerCase().includes('shirt') ||
          tag.toLowerCase().includes('hoodie') ||
          tag.toLowerCase().includes('gear')
        )
      );
    return isClothing;
  });

  // Use all sale products if no clothing found
  const productsForHero = featuredClothingProducts.length > 0 ? featuredClothingProducts : saleProductsToShow;
  const featuredClothingProduct = productsForHero[featuredProductIndex] || productsForHero[0];

  // Navigate between products
  const nextProduct = () => {
    setFeaturedProductIndex((prev) => (prev + 1) % productsForHero.length);
  };

  const prevProduct = () => {
    setFeaturedProductIndex((prev) => (prev - 1 + productsForHero.length) % productsForHero.length);
  };

  // Handle product interactions
  const handleProductClick = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Navigate to shop page with product selected to open modal
    navigate(`/shop?product=${product.handle || product.id}`);
  };

  // Handle wholesale product clicks - show modal with viewOnly (no prices)
  const handleWholesaleProductClick = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Open product modal without prices for visitors to learn about products
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleToggleWishlist = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  // Removed old scroll functions as they're now handled by InfiniteProductSlider component

  return (
    <div className="space-y-0 -mt-4 md:mt-0">
      {/* Hero Section with Video Background */}
      <section className="relative h-[calc(100vh-3rem)] md:h-[78vh] w-full overflow-hidden hero-mobile-fix md:mt-0">
        <MediaPlaceholder kind="video" />
        
        {/* Cinematic gradient overlay - Spotify style */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        
        {/* Additional bottom fade for enhanced cinematic effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black to-transparent"></div>
      </section>

      {/* Spotify-themed Product Slider Section */}
      {productsToShow.length > 0 && (
        <section className="bg-gradient-to-b from-gray-900 to-black py-6 md:py-8">
          <div className="w-full px-4 md:px-8">
            {/* Greeting Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {getGreeting()}
              </h1>
              <p className="text-spotify-text-subdued text-lg">
                Premium wholesale products for your business
              </p>
            </div>

            {/* Products Slider - Infinite Scroll */}
            <InfiniteProductSlider
              products={productsToShow}
              onProductClick={handleWholesaleProductClick}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              isInWishlist={isInWishlist}
              isVerticalCard={false}
              sliderId="good-evening"
            />
          </div>
        </section>
      )}

      {/* Secondary Hero Section with Gold Cartridges Video */}
      <section className="relative h-[50vh] w-full overflow-hidden">
        <MediaPlaceholder kind="video" />
        
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Gold Standard Cartridges
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl mx-auto">
              Premium distillate with natural terpenes. Pure, potent, and perfectly crafted for the ultimate vaping experience.
            </p>
            <Link 
              to="/wholesale" 
              className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Brand World of Trusted Brands - Logo Slider Section */}
      <BrandsLogoSlider />

      {/* Find us on Weedmaps Section */}
      <section className="bg-gradient-to-b from-black to-gray-900 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Find Us on Weedmaps
          </h2>
          <p className="text-gray-400 mb-8">
            Click on the Weedmaps logo to visit our official brand page
          </p>
          <a
            href="https://weedmaps.com/brands/brand-brand"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white rounded-xl px-8 py-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/20"
          >
            <MediaPlaceholder kind="image" />
          </a>
        </div>
      </section>

      {/* Wholesale Products Sections - Organized by Category */}
      <WholesaleProductSections onProductClick={handleWholesaleProductClick} />

      {/* Shop Banner Full Width Image Section */}
      <section className="relative bg-black" style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', width: '100vw' }}>
        <MediaPlaceholder kind="image" />
      </section>

      {/* Sale Products Slider Section */}
      {saleProductsToShow.length > 0 && (
        <section className="bg-gradient-to-b from-black to-gray-900 py-6 md:py-8">
          <div className="w-full px-4 md:px-8">
            {/* Section Header */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                On Sale Now
              </h2>
              <p className="text-spotify-text-subdued text-lg">
                {saleProducts.length > 0 ? 'Limited time offers on premium products' : 'Check out these featured products'}
              </p>
            </div>

            {/* Products Slider - Infinite Scroll */}
            <InfiniteProductSlider
              products={saleProductsToShow}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              isInWishlist={isInWishlist}
              isVerticalCard={true}
              sliderId="sale-products"
            />
          </div>
        </section>
      )}

      {/* Premium Clothing Hero Section - Professional Animated Design */}
      {productsForHero.length > 0 && (
        <section className="relative min-h-[600px] md:min-h-[700px] w-full overflow-hidden bg-black py-6 md:py-8">
          {/* Background with specific image */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Pictures/KUSHIE_chrome-01_5d13695b-cc7d-4746-a841-0e5c7f650e1f.webp)`,
                filter: 'brightness(0.3)'
              }}
            />
          </div>

          {/* Animated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-primary/30" />

          {/* Content Container */}
          <div className="relative z-10 h-full">
            {/* Title Section */}
            <div className="text-center mb-8 md:mb-12 px-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 md:mb-4">
                <span className="animate-text-reveal-1">Premium</span>{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 animate-text-reveal-2">
                  Streetwear
                </span>{' '}
                <span className="animate-text-reveal-3">Collection</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto animate-fade-in opacity-0 animation-delay-500">
                Elevate your style with our exclusive apparel line
              </p>
            </div>

            {/* Apparel Slider - No wrapper to allow full width on mobile */}
            <ApparelSlider
              products={productsForHero}
              onAddToCart={handleAddToCart}
            />
          </div>
        </section>
      )}

      {/* Apple-Style Layout Section */}
      <section className="bg-gray-100 py-6 md:py-8">
        {/* Top Hero Banner - iPhone Style */}
        <div className="relative bg-gray-100 py-3 md:py-4 text-center overflow-hidden">
          {/* Animated Neon Orange Equalizer Background */}
          <div className="absolute inset-0 flex items-end justify-center opacity-20">
            <div className="flex gap-1 w-full h-full items-end">
              {[...Array(40)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-orange-500 via-orange-400 to-transparent animate-equalizer"
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    height: '100%'
                  }}
                />
              ))}
            </div>
          </div>
          
          <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-3">
              Experience the Sample Material Diamonds Disposables
            </h2>
            <p className="text-lg md:text-xl text-gray-800/90 mb-6 max-w-2xl mx-auto">
              Experience the Sample Material Diamonds Disposables
            </p>
            <div className="flex gap-4 justify-center mb-8">
              <Link to="/shop?category=hemp" className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                Shop THCa
              </Link>
            </div>
            <div className="relative h-[400px] overflow-hidden">
              <MediaPlaceholder kind="image" />
            </div>
          </div>
        </div>

      </section>

      {/* Premium Hemp Collection Slider Section */}
      {hempProducts.length > 0 && (
        <section className="bg-gradient-to-b from-gray-900 to-black py-6 md:py-8">
          <div className="w-full px-4 md:px-8">
            {/* Section Header */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Premium Hemp Collection
              </h2>
              <p className="text-spotify-text-subdued text-lg">
                Discover our curated selection of high-quality hemp products
              </p>
            </div>

            {/* Products Slider - Infinite Scroll */}
            <InfiniteProductSlider
              products={hempProducts}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              isInWishlist={isInWishlist}
              isVerticalCard={true}
              sliderId="hemp-collection"
            />
          </div>
        </section>
      )}

      {/* Tree Planting Banner - Above Newsletter/Footer */}
      <TreePlantingBanner />

      {/* Product Modal - viewOnly hides prices for non-wholesale visitors */}
      <ProductModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={handleCloseModal}
        onCartClick={onCartClick}
        viewOnly={true}
      />
    </div>
  );
};

export default SpotifyHomeDynamic;