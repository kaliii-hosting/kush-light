import { useEffect } from 'react';
import { useLogos } from '../context/LogosContext';

const ImagePreloader = () => {
  const { logos } = useLogos();

  useEffect(() => {
    // List of critical images to preload
    const imagesToPreload = [
      // Age verification logo
      logos?.ageVerification?.url || 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/logos/Logo%20Kushie%20(W-SVG).svg',
      // Desktop logo
      logos?.desktop?.url,
      // Mobile logo  
      logos?.mobile?.url,
      // Any other critical images
    ].filter(Boolean); // Remove null/undefined values

    // Preload images
    imagesToPreload.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      
      // For SVGs, add type
      if (url.includes('.svg')) {
        link.type = 'image/svg+xml';
      }
      
      document.head.appendChild(link);
      
      // Also create Image objects to force browser caching
      const img = new Image();
      img.src = url;
    });

    // Cleanup function
    return () => {
      // Remove preload links on unmount if needed
      const preloadLinks = document.querySelectorAll('link[rel="preload"][as="image"]');
      preloadLinks.forEach(link => {
        if (imagesToPreload.includes(link.href)) {
          link.remove();
        }
      });
    };
  }, [logos]);

  // This component doesn't render anything
  return null;
};

export default ImagePreloader;