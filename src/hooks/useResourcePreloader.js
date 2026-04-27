import { useEffect } from 'react';

const useResourcePreloader = () => {
  useEffect(() => {
    // Critical videos to preload
    const preloadVideos = [
      'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Vending_Machine_2g_-_Final_1752609373737_pcxiien.mp4',
      'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Dspsbls_2g_Clouds_1752609365908_u9ruqcu.mp4',
      'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Gashapon_Prerolls_1752609450843_t53l74h.mp4',
      'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/1g_8bit_1752609356871_v8m7poa.mp4'
    ];

    // Preload videos
    preloadVideos.forEach(src => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.src = src;
      video.load();
    });

    // Firebase warmup removed - causing 405 errors

    // Preconnect to external domains (already in HTML but adding for redundancy)
    const domains = [
      'https://fchtwxunzmkzbnibqbwl.supabase.co',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://brand-b69fb.firebaseapp.com',
      'https://brand-b69fb-default-rtdb.firebaseio.com'
    ];

    domains.forEach(domain => {
      const existing = document.querySelector(`link[rel="preconnect"][href="${domain}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        if (domain.includes('fonts.gstatic')) {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
      }
    });

    // Prefetch next likely navigation
    const prefetchPages = ['/shop', '/about'];
    prefetchPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });
  }, []);
};

export default useResourcePreloader;