import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import './ApparelSlider.css';

const ApparelSlider = ({ products, onAddToCart }) => {
  // Start at 1 like original Swiper config on desktop, 0 on mobile
  const getInitialIndex = () => {
    if (!products || products.length === 0) return 0;
    // On mobile, start at 0 for better centering
    if (typeof window !== 'undefined' && window.innerWidth < 768) return 0;
    // On desktop, start at 1 if we have more than 1 product
    return products.length > 1 ? 1 : 0;
  };

  const [currentIndex, setCurrentIndex] = useState(getInitialIndex());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const sliderRef = useRef(null);
  const animationRef = useRef(null);

  // Prevent context menu on long press
  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      const preventDefault = (e) => e.preventDefault();
      slider.addEventListener('contextmenu', preventDefault);
      return () => slider.removeEventListener('contextmenu', preventDefault);
    }
  }, []);

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev === 0 ? products.length - 1 : prev - 1);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => (prev + 1) % products.length);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const goToSlide = (index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
  };

  // Touch and Mouse Events
  const getPositionX = (event) => {
    if (event.type.includes('mouse')) {
      return event.pageX;
    }
    return event.touches ? event.touches[0].clientX : event.changedTouches[0].clientX;
  };

  const handleStart = (e) => {
    // Don't start dragging if clicking on interactive elements - but only for mouse events
    // For touch, we want to allow swiping even when touching non-interactive areas
    if (e.type.includes('mouse') && (e.target.closest('button') || e.target.closest('a'))) {
      return;
    }

    // For touch events on buttons, prevent default but allow drag
    if (e.type.includes('touch') && e.target.closest('button')) {
      // We'll handle the click via onClick event
      e.preventDefault();
    }

    if (isTransitioning) return;

    setIsDragging(true);
    setStartPos(getPositionX(e));

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleMove = (e) => {
    if (!isDragging) return;

    const currentPosition = getPositionX(e);
    const diff = currentPosition - startPos;
    setCurrentTranslate(prevTranslate + diff);
  };

  const handleEnd = (e) => {
    if (!isDragging) return;

    const movedBy = currentTranslate - prevTranslate;

    // Only consider it a click if the movement was minimal
    const isClick = Math.abs(movedBy) < 5;

    // If it's a click on a button, don't change slides
    if (isClick && e && e.target.closest('button')) {
      setIsDragging(false);
      setCurrentTranslate(0);
      setPrevTranslate(0);
      return;
    }

    setIsDragging(false);

    // Threshold for changing slides (50px for more responsive feel)
    if (movedBy < -50) {
      handleNext();
    } else if (movedBy > 50) {
      handlePrevious();
    }

    setCurrentTranslate(0);
    setPrevTranslate(0);
  };

  if (!products || products.length === 0) {
    return null;
  }

  const getTransform = () => {
    const isMobile = window.innerWidth < 768;
    const slideWidth = isMobile ? window.innerWidth - 60 : 400;
    const gap = isMobile ? 20 : 40;

    // For mobile, we need to account for the padding and margins
    let containerWidth;
    if (isMobile) {
      // On mobile, the container is full width
      containerWidth = window.innerWidth;
    } else {
      // On desktop, use the actual slider width
      containerWidth = sliderRef.current?.offsetWidth || window.innerWidth;
    }

    // Calculate center position
    const centerOffset = (containerWidth - slideWidth) / 2;

    // Calculate transform based on current index
    const baseTransform = centerOffset - (currentIndex * (slideWidth + gap));

    if (isDragging) {
      return `translateX(${baseTransform + currentTranslate}px)`;
    }

    return `translateX(${baseTransform}px)`;
  };

  return (
    <div className={`apparel-slider ${isDragging ? 'dragging' : ''}`}>
      {/* Slider Navigation - Desktop Only */}
      <div className="slider-nav">
        <button
          onClick={handlePrevious}
          className="slider-nav__item slider-nav__item_prev"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="slider-nav__item slider-nav__item_next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Slider Content */}
      <div
        className="apparel-slider__slider"
        ref={sliderRef}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        <div
          className="apparel-slider__wrapper"
          style={{
            transform: getTransform(),
            transition: !isDragging && isTransitioning ? 'transform 0.6s ease' : 'none'
          }}
        >
          {products.map((product, index) => {
            const isActive = index === currentIndex;
            // Always show header/footer on all slides
            const showHeaderFooter = true;

            return (
              <div
                key={product.id || index}
                className={`apparel-slider__slide ${isActive ? 'active' : ''}`}
                data-index={index}
              >
                <div className="apparel-slider-item">
                  {/* Popular Badge for featured products */}
                  {product.featured && (
                    <div className="apparel-slider-item__badge">Popular Now</div>
                  )}

                  {/* Product Image */}
                  <div className="apparel-slider-item__image">
                    <MediaPlaceholder kind="image" />
                  </div>

                  {/* Product Content */}
                  <div className="apparel-slider-item__content">
                    <div className={`apparel-slider-item__header ${showHeaderFooter ? 'show' : ''}`}>
                      <div className="apparel-slider-item__header-inner">
                        <div className="apparel-slider-item__price">
                          ${product.price || '0.00'}
                        </div>
                        <div className="apparel-slider-item__author">
                          <div className="apparel-slider-item__author-name">
                            {product.vendor?.toLowerCase() === 'my store' ? 'BRAND MERCH' : (product.vendor?.toUpperCase() || 'BRAND')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="apparel-slider-item__info">
                      <h2 className="apparel-slider-item__title">
                        {product.title || product.name || 'Premium Apparel'}
                      </h2>
                      <div className="apparel-slider-item__text">
                        {product.description || 'Elevate your style with our exclusive streetwear collection'}
                      </div>
                    </div>

                    <div className={`apparel-slider-item__footer ${showHeaderFooter ? 'show' : ''}`}>
                      <button
                        className="apparel-slider-item__btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Only trigger if not dragging
                          if (!isDragging) {
                            onAddToCart(product, e);
                          }
                        }}
                      >
                        <span className="apparel-slider-item__btn-text">Add to Cart</span>
                        <span className="apparel-slider-item__btn-icon">
                          <ShoppingCart className="w-5 h-5" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slider Pagination */}
      <div className="slider-pagination">
        {products.map((_, index) => (
          <button
            key={index}
            className={`slider-pagination__item ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ApparelSlider;