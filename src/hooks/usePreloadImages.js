import { useEffect } from 'react';

const usePreloadImages = (imageUrls) => {
  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) return;

    const preloadImage = (url) => {
      if (!url) return;
      
      const img = new Image();
      img.src = url;
      // Force browser to download the image by accessing width
      img.onload = () => {
        // Image is now cached
        void img.width;
      };
    };

    // Preload all provided image URLs
    imageUrls.forEach(url => preloadImage(url));
  }, [imageUrls]);
};

export default usePreloadImages;