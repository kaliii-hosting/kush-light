import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import React, { useRef, useEffect, useState } from 'react';

const LazyImage = ({ 
  src, 
  alt = '', 
  className = '', 
  placeholderSrc = null,
  threshold = 0.1,
  rootMargin = '50px',
  onLoad = () => {},
  ...imgProps 
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || '');
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isInView) {
            setIsInView(true);
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [threshold, rootMargin, isInView]);

  useEffect(() => {
    if (isInView && src) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setCurrentSrc(src);
        setIsLoaded(true);
        onLoad();
      };
      img.onerror = () => {
        console.error('Failed to load image:', src);
      };
    }
  }, [isInView, src, onLoad]);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse rounded" />
      )}
      {(currentSrc || placeholderSrc) && (
        <MediaPlaceholder kind="image" />
      )}
    </div>
  );
};

export default LazyImage;