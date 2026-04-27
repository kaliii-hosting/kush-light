import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import React, { useEffect, useRef } from 'react';

const FastVideo = ({ src, className = '', poster, ...videoProps }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      // Force video to start loading immediately
      videoRef.current.load();
      
      // Try to play as soon as possible
      const playVideo = async () => {
        try {
          await videoRef.current.play();
        } catch (error) {
          // Autoplay might be blocked, but video is still loaded
          console.log('Autoplay prevented:', error);
        }
      };
      
      if (videoRef.current.readyState >= 3) {
        playVideo();
      } else {
        videoRef.current.addEventListener('canplay', playVideo, { once: true });
      }
    }
  }, [src]);

  return (
    <MediaPlaceholder kind="video" />
  );
};

export default FastVideo;