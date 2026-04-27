import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  // Disable browser scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const scrollToTop = () => {
      // Scroll window
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Find and scroll any scrollable containers
      const scrollableElements = document.querySelectorAll('[class*="overflow-y-auto"], [class*="overflow-auto"], main');
      scrollableElements.forEach(element => {
        if (element.scrollTop !== undefined) {
          element.scrollTop = 0;
        }
      });

      // Specifically target the main content area and other common scroll containers
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.scrollTop = 0;
      }

      // Target any Spotify layout containers
      const spotifyMain = document.querySelector('.flex-1.overflow-y-auto');
      if (spotifyMain) {
        spotifyMain.scrollTop = 0;
      }

      // Target by class combinations used in SpotifyLayout
      const layoutMain = document.querySelector('main.flex-1.overflow-y-auto.bg-black');
      if (layoutMain) {
        layoutMain.scrollTop = 0;
      }
    };

    // Immediately scroll to top
    scrollToTop();

    // Use requestAnimationFrame for more reliable scrolling
    requestAnimationFrame(() => {
      scrollToTop();
    });

    // Additional timeout as fallback (increased time)
    const timer1 = setTimeout(() => {
      scrollToTop();
    }, 50);

    const timer2 = setTimeout(() => {
      scrollToTop();
    }, 200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;