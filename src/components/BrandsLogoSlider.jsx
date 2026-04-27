import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useEffect, useRef, useState } from 'react';
import './BrandsLogoSlider.css';

const BrandsLogoSlider = () => {
  const kushieLogos = [
    { url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/logos%20slider/bottom-logos-01-600x299.png', alt: 'Brand Brand 1' },
    { url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/logos%20slider/bottom-logos-02-600x298.png', alt: 'Brand Brand 2' },
    { url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/logos%20slider/bottom-logos-03-600x261.png', alt: 'Brand Brand 3' },
    { url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/logos%20slider/bottom-logos-04-600x232.png', alt: 'Brand Brand 4' },
    { url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/logos%20slider/bottom-logos-05-600x332.png', alt: 'Brand Brand 5' },
    { url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/logos%20slider/bottom-logos-07-600x178.png', alt: 'Brand Brand 6' },
    { url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/logos%20slider/kushie0logo0footrer-05-dsp-300x118.png', alt: 'Brand Footer Logo' },
    { url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/logos%20slider/logo%20disposable-06.png', alt: 'Brand Disposable' }
  ];

  // Triple the logos for seamless infinite scroll
  const logosForSlider = [...kushieLogos, ...kushieLogos, ...kushieLogos];

  // Refs and state for drag functionality
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [animationPaused, setAnimationPaused] = useState(false);

  // Handle drag start (mouse and touch)
  const handleDragStart = (e) => {
    setIsDragging(true);
    setAnimationPaused(true);

    const pageX = e.type === 'touchstart' ? e.touches[0].pageX : e.pageX;
    setStartX(pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);

    // Add classes for dragging state
    if (sliderRef.current) {
      sliderRef.current.classList.add('dragging');
    }
  };

  // Handle drag move (mouse and touch)
  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const pageX = e.type === 'touchmove' ? e.touches[0].pageX : e.pageX;
    const x = pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier

    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);

    // Resume animation after a short delay
    setTimeout(() => {
      setAnimationPaused(false);
      if (sliderRef.current) {
        sliderRef.current.classList.remove('dragging');
      }
    }, 1000);
  };

  // Prevent default drag behavior
  const preventDragDefault = (e) => {
    e.preventDefault();
  };

  // Add event listeners
  useEffect(() => {
    const container = containerRef.current;
    const slider = sliderRef.current;

    if (!container || !slider) return;

    // Mouse events
    container.addEventListener('mousedown', handleDragStart);
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);

    // Touch events
    container.addEventListener('touchstart', handleDragStart, { passive: false });
    container.addEventListener('touchmove', handleDragMove, { passive: false });
    container.addEventListener('touchend', handleDragEnd);

    // Prevent image drag
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      img.addEventListener('dragstart', preventDragDefault);
    });

    return () => {
      container.removeEventListener('mousedown', handleDragStart);
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      container.removeEventListener('touchstart', handleDragStart);
      container.removeEventListener('touchmove', handleDragMove);
      container.removeEventListener('touchend', handleDragEnd);
      images.forEach(img => {
        img.removeEventListener('dragstart', preventDragDefault);
      });
    };
  }, [isDragging, startX, scrollLeft]);

  return (
    <section
      className="relative bg-black py-6 md:py-8 overflow-hidden"
      style={{
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        width: '100vw'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Title and Subtitle */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 md:mb-3">
            Brand World of Trusted Brands
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/70">
            Products available in California, New York, New Jersey, New Mexico, and Nevada
          </p>
        </div>

        {/* Logo Slider */}
        <div
          className="logo-slider-container"
          ref={containerRef}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div
            className={`logo-slider ${animationPaused ? '' : 'logo-slider-rtl'}`}
            ref={sliderRef}
            style={{
              animationPlayState: animationPaused ? 'paused' : 'running',
              userSelect: 'none'
            }}
          >
            {logosForSlider.map((logo, index) => (
              <div key={`logo-${index}`} className="logo-slide">
                <div className="logo-card">
                  <MediaPlaceholder kind="image" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandsLogoSlider;