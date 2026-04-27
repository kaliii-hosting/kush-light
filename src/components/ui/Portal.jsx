import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children, containerId = 'portal-root' }) => {
  const elRef = useRef(null);

  useEffect(() => {
    // Create or get the portal container
    let container = document.getElementById(containerId);
    
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }

    // Create a div element for this portal instance
    const el = document.createElement('div');
    elRef.current = el;
    container.appendChild(el);

    return () => {
      // Clean up on unmount
      container.removeChild(el);
      
      // Remove container if it's empty
      if (container.childNodes.length === 0) {
        document.body.removeChild(container);
      }
    };
  }, [containerId]);

  // Render children into the portal element
  return elRef.current ? createPortal(children, elRef.current) : null;
};

export default Portal;