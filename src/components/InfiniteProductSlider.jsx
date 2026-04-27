import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart } from 'lucide-react';
import './InfiniteProductSlider.css';

const InfiniteProductSlider = ({
  products,
  onProductClick,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  isVerticalCard = false,
  sliderId
}) => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  // Clone products for infinite scroll (triple the array)
  const infiniteProducts = [...products, ...products, ...products];

  // Get card width based on type
  const getCardWidth = () => {
    if (isVerticalCard) {
      const width = window.innerWidth;
      if (width < 640) return 160;
      if (width < 768) return 180;
      return 200;
    }
    const width = window.innerWidth;
    if (width < 640) return 280;
    if (width < 768) return 320;
    return 380;
  };

  // Initialize scroll position to middle set
  useEffect(() => {
    if (scrollRef.current && products.length > 0) {
      const cardWidth = getCardWidth();
      const gap = isVerticalCard ? 16 : 12;
      const totalWidth = products.length * (cardWidth + gap);
      scrollRef.current.scrollLeft = totalWidth;
    }
  }, [products.length, isVerticalCard]);

  // Handle infinite scroll
  const handleScroll = () => {
    if (!scrollRef.current || isScrolling) return;
    
    const container = scrollRef.current;
    const cardWidth = getCardWidth();
    const gap = isVerticalCard ? 16 : 12;
    const totalWidth = products.length * (cardWidth + gap);
    
    // Check if we need to loop
    if (container.scrollLeft <= 50) {
      // Near the beginning, jump to the end of the middle set
      setIsScrolling(true);
      container.scrollLeft = totalWidth + container.scrollLeft;
      setTimeout(() => setIsScrolling(false), 10);
    } else if (container.scrollLeft >= totalWidth * 2 - container.clientWidth - 50) {
      // Near the end, jump to the beginning of the middle set
      setIsScrolling(true);
      container.scrollLeft = container.scrollLeft - totalWidth;
      setTimeout(() => setIsScrolling(false), 10);
    }
  };

  // Smooth scroll function - scroll exactly 1 card
  const smoothScroll = (direction) => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const cardWidth = getCardWidth();
    const gap = isVerticalCard ? 16 : 12;
    const scrollAmount = cardWidth + gap;
    const startScrollLeft = container.scrollLeft;
    const targetScrollLeft = startScrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

    // Custom smooth scroll animation
    const duration = 300;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeInOutCubic = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      container.scrollLeft = startScrollLeft + (targetScrollLeft - startScrollLeft) * easeInOutCubic;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  // Mouse/Touch handlers
  const [dragStartX, setDragStartX] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const handleMouseDown = (e) => {
    setDragStartX(e.pageX);
    setHasMoved(false);
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = 'grabbing';
  };

  const handleTouchStart = (e) => {
    setDragStartX(e.touches[0].pageX);
    setHasMoved(false);
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseUp = (e) => {
    const dragDistance = Math.abs(e.pageX - dragStartX);
    if (dragDistance < 5) {
      setHasMoved(false);
    }
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    setHasMoved(true);
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Adjusted sensitivity to match logo slider
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollLeft - walk;
      }
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    setHasMoved(true);
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Adjusted sensitivity to match logo slider
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollLeft - walk;
      }
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="infinite-slider-container">
      {/* Scroll buttons */}
      <button 
        onClick={() => smoothScroll('left')}
        className="scroll-button scroll-button-left"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5 text-white" />
      </button>
      <button 
        onClick={() => smoothScroll('right')}
        className="scroll-button scroll-button-right"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5 text-white" />
      </button>
      
      {/* Products container */}
      <div
        ref={scrollRef}
        className={`infinite-slider-track ${isVerticalCard ? 'vertical-cards' : 'horizontal-cards'}`}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {infiniteProducts.map((product, index) => {
          const uniqueKey = `${product.id}-${index}`;
          const isHovered = hoveredCard === uniqueKey;
          
          return (
            <div
              key={uniqueKey}
              className={`slider-card ${isVerticalCard ? 'vertical' : 'horizontal'}`}
              onClick={(e) => {
                if (!e.target.closest('button') && !hasMoved) {
                  onProductClick(product, e);
                }
              }}
              onMouseEnter={() => setHoveredCard(uniqueKey)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {isVerticalCard ? (
                // Vertical card layout
                <div className="card-content vertical-layout">
                  <div className="card-image-wrapper">
                    {product.imageUrl ? (
                      <MediaPlaceholder kind="image" />
                    ) : (
                      <div className="card-image-placeholder">
                        <span>🌿</span>
                      </div>
                    )}
                    
                    {/* Sale Badge */}
                    {product.compareAtPrice && product.price < product.compareAtPrice && (
                      <div className="sale-badge">SALE</div>
                    )}
                  </div>
                  
                  <div className="card-info">
                    <h3 className="card-title">{product.name}</h3>
                    <div className="card-pricing">
                      {product.compareAtPrice && product.price < product.compareAtPrice ? (
                        <>
                          <div className="price-group">
                            <span className="card-price sale-price">${product.price}</span>
                            <span className="original-price">${product.compareAtPrice}</span>
                          </div>
                          <span className="discount-badge">
                            {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                          </span>
                        </>
                      ) : (
                        <p className="card-price">${product.price}</p>
                      )}
                    </div>
                  </div>

                  {isHovered && (
                    <div className="card-hover-actions">
                      <button
                        onClick={(e) => onToggleWishlist(product, e)}
                        className="action-button"
                        title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-white' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => onAddToCart(product, e)}
                        className="action-button"
                        title="Add to cart"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Horizontal card layout
                <div className="card-content horizontal-layout">
                  <div className="card-image-wrapper small">
                    {product.imageUrl ? (
                      <MediaPlaceholder kind="image" />
                    ) : (
                      <div className="card-image-placeholder">
                        <span>🌿</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-info">
                    <h3 className="card-title">{product.name}</h3>
                    {product.productType && (
                      <div className="card-meta">
                        <span className="card-type">{product.productType}</span>
                      </div>
                    )}
                  </div>

                  {isHovered && (
                    <div className="card-hover-actions horizontal">
                      <button
                        onClick={(e) => onToggleWishlist(product, e)}
                        className="action-button"
                        title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-white' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => onAddToCart(product, e)}
                        className="action-button"
                        title="Add to cart"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InfiniteProductSlider;