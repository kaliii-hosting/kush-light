import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import React, { useEffect, useRef, useState } from 'react';

const OptimizedVideo = ({ 
  src, 
  mobileSrc, 
  poster,
  className = '', 
  ...videoProps 
}) => {
  const videoRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState(src);
  
  useEffect(() => {
    // Detect if mobile or slow connection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const slowConnection = connection && (
      connection.saveData || 
      connection.effectiveType === 'slow-2g' || 
      connection.effectiveType === '2g' ||
      connection.effectiveType === '3g'
    );
    
    // Use mobile source if available and conditions met
    if ((isMobile || slowConnection) && mobileSrc) {
      setVideoSrc(mobileSrc);
    }
    
    // Aggressive loading
    if (videoRef.current) {
      videoRef.current.load();
      
      // Try to play immediately
      const playVideo = () => {
        videoRef.current.play().catch(() => {
          // Silently handle autoplay prevention
        });
      };
      
      if (videoRef.current.readyState >= 3) {
        playVideo();
      } else {
        videoRef.current.addEventListener('canplay', playVideo, { once: true });
      }
    }
  }, [src, mobileSrc]);

  return (
    <MediaPlaceholder kind="video" />
  );
};

export default OptimizedVideo;