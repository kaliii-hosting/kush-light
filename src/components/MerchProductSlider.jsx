import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useEnhancedProducts } from '../context/EnhancedProductsContext';
import { useCart } from '../context/ShopifyCartContext';
import { useWishlist } from '../context/WishlistContextNew';
import './MerchProductSlider.css';

const MerchProductSlider = ({ onCartClick }) => {
  const { shopifyProducts } = useEnhancedProducts();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);

  // Filter products from "Brand Merch" category
  const merchProducts = shopifyProducts.filter(product => {
    // Check product type
    if (product.productType?.toLowerCase() === 'brand merch' ||
        product.productType?.toLowerCase() === 'merch' ||
        product.productType?.toLowerCase() === 'merchandise') return true;

    // Check tags array
    if (product.tags?.some(tag =>
      typeof tag === 'string' && (
        tag.toLowerCase() === 'brand merch' ||
        tag.toLowerCase() === 'merch' ||
        tag.toLowerCase() === 'merchandise'
      )
    )) return true;

    // Check collections
    if (product.collections?.some(collection =>
      collection.title?.toLowerCase() === 'brand merch' ||
      collection.handle?.toLowerCase() === 'brand-merch' ||
      collection.title?.toLowerCase() === 'merch' ||
      collection.handle?.toLowerCase() === 'merch' ||
      collection.title?.toLowerCase() === 'merchandise' ||
      collection.handle?.toLowerCase() === 'merchandise'
    )) return true;

    // Check vendor
    if (product.vendor?.toLowerCase() === 'brand merch' ||
        product.vendor?.toLowerCase() === 'merch') return true;
    
    return false;
  });

  // If no products found, show all products as fallback for testing
  const displayProducts = merchProducts.length > 0 ? merchProducts : shopifyProducts.slice(0, 10);
  
  // Log for debugging
  console.log('Merch products found:', merchProducts.length);
  console.log('Total products:', shopifyProducts.length);
  if (displayProducts.length > 0) {
    console.log('Sample product:', displayProducts[0]);
  }

  // Helper function to get product image URL
  const getProductImageUrl = (product) => {
    // Try different image properties
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      return firstImage.originalSrc || firstImage.src || firstImage.url;
    }
    if (product.featuredImage) {
      return product.featuredImage.originalSrc || product.featuredImage.url || product.featuredImage.src;
    }
    if (product.image) {
      return product.image.originalSrc || product.image.url || product.image.src;
    }
    // Try variants
    if (product.variants && product.variants.length > 0 && product.variants[0].image) {
      const variantImage = product.variants[0].image;
      return variantImage.originalSrc || variantImage.src || variantImage.url;
    }
    return '/placeholder.png';
  };

  // Return null if no products
  if (displayProducts.length === 0) return null;

  // Calculate visible indices
  const getVisibleIndices = (center) => {
    const totalProducts = displayProducts.length;
    const indices = [];
    
    // Show 5 products on desktop, 3 on mobile
    const visibleCount = window.innerWidth >= 768 ? 5 : 3;
    const halfVisible = Math.floor(visibleCount / 2);
    
    for (let i = -halfVisible; i <= halfVisible; i++) {
      let index = center + i;
      // Handle circular wrapping
      if (index < 0) index = totalProducts + index;
      if (index >= totalProducts) index = index - totalProducts;
      indices.push(index);
    }
    
    return indices;
  };

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && displayProducts.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % displayProducts.length);
      }, 3000); // Change slide every 3 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, displayProducts.length]);

  // Handle manual navigation
  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => 
      prev === 0 ? displayProducts.length - 1 : prev - 1
    );
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % displayProducts.length);
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const variant = product.variants?.[0];
    if (!variant) return;
    
    try {
      await addToCart({
        id: variant.id,
        quantity: 1,
        product: {
          ...product,
          selectedVariant: variant
        }
      });
      
      if (onCartClick) {
        onCartClick();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleWishlistToggle = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const visibleIndices = getVisibleIndices(currentIndex);

  return (
    <section className="merch-slider-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {merchProducts.length > 0 ? 'Exclusive Merch Collection' : 'Featured Products'}
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {merchProducts.length > 0 ? 'Represent the culture with our premium merchandise' : 'Discover our premium selection'}
          </p>
        </div>

        <div className="merch-slider-container" ref={sliderRef}>
          <button 
            onClick={handlePrevious}
            className="slider-nav-button slider-nav-prev"
            aria-label="Previous product"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div className="merch-slider-track">
            {visibleIndices.map((productIndex, displayIndex) => {
              const product = displayProducts[productIndex];
              const isCenter = displayIndex === Math.floor(visibleIndices.length / 2);
              const offset = displayIndex - Math.floor(visibleIndices.length / 2);
              
              return (
                <div
                  key={`${product.id}-${displayIndex}`}
                  className={`merch-slide ${isCenter ? 'merch-slide-center' : ''}`}
                  style={{
                    '--offset': offset,
                    '--scale': isCenter ? 1 : 0.8,
                    '--opacity': isCenter ? 1 : 0.6,
                  }}
                >
                  <Link 
                    to={`/product/${product.handle}`}
                    className="merch-slide-inner"
                  >
                    <div className="merch-slide-image-container">
                      <MediaPlaceholder kind="image" />
                      
                      {/* Quick actions overlay */}
                      <div className="merch-slide-overlay">
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className="merch-action-button"
                          aria-label="Add to cart"
                        >
                          <ShoppingCart size={20} />
                        </button>
                        <button
                          onClick={(e) => handleWishlistToggle(e, product)}
                          className={`merch-action-button ${isInWishlist(product.id) ? 'active' : ''}`}
                          aria-label="Toggle wishlist"
                        >
                          <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="merch-slide-content">
                      <h3 className="merch-slide-title">{product.title}</h3>
                      <p className="merch-slide-price">
                        ${product.variants?.[0]?.price || product.priceRange?.minVariantPrice?.amount || '0.00'}
                      </p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          <button 
            onClick={handleNext}
            className="slider-nav-button slider-nav-next"
            aria-label="Next product"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        {/* Slide indicators */}
        <div className="merch-slider-indicators">
          {displayProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
                setTimeout(() => setIsAutoPlaying(true), 5000);
              }}
              className={`slider-indicator ${index === currentIndex ? 'active' : ''}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MerchProductSlider;