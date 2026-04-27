// Utility functions for image optimization

export const getOptimizedImageUrl = (url, options = {}) => {
  const {
    width = null,
    height = null,
    quality = 80,
    format = 'webp'
  } = options;

  // If it's a Supabase URL, we can use their image transformation
  if (url && url.includes('supabase.co')) {
    const transformParams = [];
    
    if (width) transformParams.push(`width=${width}`);
    if (height) transformParams.push(`height=${height}`);
    if (quality) transformParams.push(`quality=${quality}`);
    if (format) transformParams.push(`format=${format}`);
    
    if (transformParams.length > 0) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}${transformParams.join('&')}`;
    }
  }
  
  return url;
};

export const generateSrcSet = (url, sizes = [320, 640, 1024, 1920]) => {
  return sizes
    .map(size => `${getOptimizedImageUrl(url, { width: size })} ${size}w`)
    .join(', ');
};

export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = async (sources) => {
  const promises = sources.map(src => preloadImage(src));
  return Promise.allSettled(promises);
};