import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import * as THREE from 'three';

const AdvertisingPopup = () => {
  const [popupData, setPopupData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const rendererRef = useRef(null);

  // Don't show popup on admin pages
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Don't load popup data on admin pages
    if (isAdminPage) {
      setIsVisible(false);
      return;
    }

    // Listen for popup data from Firebase
    const popupRef = ref(realtimeDb, 'advertising_popup');
    const unsubscribe = onValue(popupRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Show if active
        if (data.isActive) {
          setPopupData(data);
          // Add a slight delay before showing for better UX
          setTimeout(() => {
            setIsVisible(true);
          }, 2000); // Show after 2 seconds
        } else {
          // Hide popup if it becomes inactive
          setIsVisible(false);
          setPopupData(null);
        }
      }
    });

    return () => unsubscribe();
  }, [isAdminPage]);

  // Three.js background effect
  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const container = canvasRef.current;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, w / h, 1, 100);
    camera.position.z = 5;
    camera.position.y = -4;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create text texture
    function createTextTexture() {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 1024;
      canvas.height = 1024;
      context.imageSmoothingEnabled = true;

      context.fillStyle = 'black';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = 'white';
      context.font = 'bold 45px Arial, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      const text = 'BRAND';
      const textMetrics = context.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = 89;

      const horizontalSpacing = textWidth * 0.4;
      const verticalSpacing = textHeight * 2.3;

      for (let x = horizontalSpacing / 2; x < canvas.width; x += horizontalSpacing) {
        for (let y = verticalSpacing / 2; y < canvas.height; y += verticalSpacing) {
          context.save();
          context.translate(x, y);
          context.rotate(Math.PI / 2);
          context.fillText(text, 0, 0);
          context.restore();
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(3, 3);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;

      return texture;
    }

    // Create torus
    const torusGeo = new THREE.TorusGeometry(5, 3.8, 60, 100);
    const textTexture = createTextTexture();
    const torusMat = new THREE.MeshStandardMaterial({
      map: textTexture
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.rotation.x = Math.PI * 0.01;
    torus.position.set(0, 0, 0);
    scene.add(torus);

    // Lighting
    const spotLight = new THREE.SpotLight('#ffffff', 100);
    spotLight.angle = Math.PI / 4.3;
    spotLight.penumbra = 0.25;
    spotLight.position.set(0, -0.2, 9);
    scene.add(spotLight);

    // Animation
    let startTime = Date.now();
    function animate() {
      animationRef.current = requestAnimationFrame(animate);
      const t = Date.now() - startTime;

      torus.rotation.z = t * 0.0002;
      const speed = 0.00004;
      textTexture.offset.y = -(t * speed) % 1;

      renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    const handleResize = () => {
      const newW = window.innerWidth;
      const newH = window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
      torusGeo.dispose();
      torusMat.dispose();
      textTexture.dispose();
    };
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
  };

  // Don't render on admin pages or when not visible
  if (isAdminPage || !isVisible || !popupData) {
    return null;
  }

  return (
    <>
      {/* Three.js Animated Background */}
      <div
        ref={canvasRef}
        className="fixed inset-0 z-[9998]"
        onClick={handleClose}
        style={{ background: '#000' }}
      />

      {/* Popup Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative max-w-lg w-full bg-black rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-slide-up border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110"
            aria-label="Close popup"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Media Section */}
          {popupData.mediaUrl && (
            <div className="w-full h-64 md:h-80 bg-black">
              {popupData.mediaType === 'image' ? (
                <MediaPlaceholder kind="image" />
              ) : (
                <MediaPlaceholder kind="video" />
              )}
            </div>
          )}

          {/* Content Section - Centered Text, No Buttons */}
          <div className="p-6 md:p-8 text-center">
            {popupData.title && (
              <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight text-[#FF6B35]">
                {popupData.title}
              </h2>
            )}

            {popupData.subtitle && (
              <h3 className="text-lg md:text-xl mb-4 text-white opacity-90">
                {popupData.subtitle}
              </h3>
            )}

            {popupData.body && (
              <p className="text-sm md:text-base leading-relaxed text-gray-300 opacity-80">
                {popupData.body}
              </p>
            )}

            {/* Optional CTA Button */}
            {popupData.buttonEnabled && popupData.buttonText && (
              <div className="mt-6">
                <a
                  href={popupData.buttonLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#ff6b00] hover:bg-[#e55f00] text-white font-bold text-sm px-6 py-3 rounded-full hover:scale-105 transition-all shadow-lg shadow-orange-500/25"
                  onClick={(e) => {
                    if (!popupData.buttonLink) e.preventDefault();
                  }}
                >
                  {popupData.buttonText}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </>
  );
};

export default AdvertisingPopup;
