import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect, useRef } from 'react';
import { useEnhancedProducts } from '../context/EnhancedProductsContext';
import { useCart } from '../context/ShopifyCartContext';

const FieryProductCards = ({ onCartClick }) => {
  const { shopifyProducts } = useEnhancedProducts();
  const { addToCart } = useCart();
  const [randomProducts, setRandomProducts] = useState([]);
  const containerRefs = useRef([]);
  const canvasRefs = useRef([]);
  const ringsRef = useRef([]);

  // Get specific products
  useEffect(() => {
    if (shopifyProducts && shopifyProducts.length > 0) {
      const specificProductNames = ['Lychee Dream (Hybrid)', 'Orange Jack (Sativa)', 'Strawberry Diesel (Sativa)'];
      const selectedProducts = specificProductNames.map(name => 
        shopifyProducts.find(product => 
          product.name === name || 
          product.title === name ||
          (product.name && product.name.includes(name.split(' (')[0])) ||
          (product.title && product.title.includes(name.split(' (')[0]))
        )
      ).filter(Boolean); // Remove any undefined products
      
      setRandomProducts(selectedProducts);
    }
  }, [shopifyProducts]);

  // Initialize fiery rings when products are loaded
  useEffect(() => {
    if (randomProducts.length > 0 && containerRefs.current.length === randomProducts.length) {
      // Add a small delay on mobile to ensure DOM is fully rendered
      const isMobile = window.innerWidth <= 768;
      const delay = isMobile ? 100 : 0;
      
      setTimeout(() => {
        initializeFieryRings();
      }, delay);
    }

    return () => {
      // Cleanup rings on unmount
      if (ringsRef.current) {
        ringsRef.current.forEach(ring => {
          if (ring && ring.renderer) {
            ring.renderer.dispose();
          }
        });
      }
    };
  }, [randomProducts]);

  const initializeFieryRings = async () => {
    try {
      // Dynamically import Three.js
      const THREE = await import('three');
      
      class FieryRing {
        constructor(containerId, canvasId, colorConfig) {
          this.containerId = containerId;
          this.canvasId = canvasId;
          this.colorConfig = colorConfig;
          this.scene = null;
          this.camera = null;
          this.renderer = null;
          this.fieryBandMesh = null;
          this.uniforms = null;
          this.material = null;
          this.THREE = null;
        }

        init() {
          this.initThree(THREE);
        }

        initThree(THREE) {
          this.THREE = THREE; // Store reference for animation
          this.scene = new THREE.Scene();
          this.camera = new THREE.OrthographicCamera(-1000, 1000, 1000, -1000, 0.1, 2000);
          this.camera.position.z = 100;

          const canvas = document.getElementById(this.canvasId);
          if (!canvas) return;

          try {
            this.renderer = new THREE.WebGLRenderer({ 
              canvas: canvas, 
              alpha: true, 
              antialias: true 
            });
            
            // Set initial size based on screen
            const isMobile = window.innerWidth <= 768;
            const isSmallMobile = window.innerWidth <= 480;
            const initialSize = isSmallMobile ? 180 : isMobile ? 250 : 800;
            this.renderer.setSize(initialSize, initialSize);
            
            this.uniforms = {
              time: { value: 0.0 },
              fireColorBase: { value: new THREE.Color(this.colorConfig.base) }, 
              fireColorHot: { value: new THREE.Color(this.colorConfig.hot) },  
              fireColorCool: { value: new THREE.Color(this.colorConfig.cool) }  
            };
            
            this.material = new THREE.ShaderMaterial({
              vertexShader: this.getVertexShader(),
              fragmentShader: this.getFragmentShader(),
              uniforms: this.uniforms,
              transparent: true,
              blending: THREE.AdditiveBlending, 
              depthWrite: false, 
              depthTest: false,  
              side: THREE.DoubleSide 
            });
            
            const placeHolderGeometry = new THREE.PlaneGeometry(50, 50);
            this.fieryBandMesh = new THREE.Mesh(placeHolderGeometry, this.material);
            this.scene.add(this.fieryBandMesh);
            
            this.createRingGeometry(THREE);
            this.animate();
          } catch (error) {
            console.warn("Error in Three.js initialization:", error);
          }
        }

        getVertexShader() {
          return `
            uniform float time;
            varying vec2 vUv;
            varying vec3 vPosition;
            
            float noise(vec2 p) {
              return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }
            
            void main() {
              vUv = uv;
              vPosition = position;
              
              vec3 newPosition = position;
              
              float distortionAmount = 0.02; 
              float distortion = noise(vec2(position.x * 0.05 + time * 0.1, position.y * 0.05 - time * 0.15)) * distortionAmount;
              
              vec2 normalizedPos = normalize(position.xy);
              newPosition.x += normalizedPos.x * distortion;
              newPosition.y += normalizedPos.y * distortion;
              
              gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
          `;
        }

        getFragmentShader() {
          return `
            uniform float time;
            uniform vec3 fireColorBase;
            uniform vec3 fireColorHot;
            uniform vec3 fireColorCool;
            varying vec2 vUv;
            varying vec3 vPosition;

            float random(vec2 st) {
              return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }
            
            float noise(vec2 st) {
              vec2 i = floor(st);
              vec2 f = fract(st);
              
              float a = random(i);
              float b = random(i + vec2(1.0, 0.0));
              float c = random(i + vec2(0.0, 1.0));
              float d = random(i + vec2(1.0, 1.0));
              
              vec2 u = f * f * (3.0 - 2.0 * f);
              
              return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
            
            float turbulence(vec2 st, float baseFreq, int octaves) {
              float value = 0.0;
              float amplitude = 1.0;
              float frequency = baseFreq;
              
              for (int i = 0; i < octaves; i++) {
                value += amplitude * abs(noise(st * frequency));
                st = st * 1.4 + vec2(3.2, 1.7); 
                frequency *= 2.0;
                amplitude *= 0.5;
              }
              
              return value;
            }

            void main() {
              float slowTime = time * 0.4;
              float mediumTime = time * 0.8;
              float fastTime = time * 1.6;
              
              vec2 centeredUv = vUv - vec2(0.5);
              float angle = atan(centeredUv.y, centeredUv.x);
              float normalizedAngle = (angle / (2.0 * 3.14159)) + 0.5;
              float radius = length(centeredUv) * 2.0;
              
              float flowSpeed = 2.0;
              float flowFrequency = 3.0;
              float baseFlow = sin(normalizedAngle * flowFrequency * 6.28318 + mediumTime * flowSpeed);
              baseFlow = baseFlow * 0.5 + 0.5; 
              
              vec2 noiseCoord1 = vec2(
                normalizedAngle * 8.0 + mediumTime * 0.3,
                vUv.y * 4.0 - mediumTime * 0.4
              );
              float fireDetail1 = turbulence(noiseCoord1, 1.0, 4);
              
              vec2 noiseCoord2 = vec2(
                normalizedAngle * 6.0 - mediumTime * 0.5,
                vUv.y * 3.0 + mediumTime * 0.3
              );
              float fireDetail2 = turbulence(noiseCoord2, 1.5, 3);
              
              vec2 emberCoord = vec2(
                normalizedAngle * 10.0,
                mod(vUv.y * 3.0 - fastTime * 0.5, 3.0)
              );
              float embers = noise(emberCoord * 8.0);
              embers = pow(embers, 3.0) * smoothstep(0.4, 0.6, vUv.y);
              
              float widthModulation = 1.0 - pow(abs(vUv.y - 0.5) * 1.8, 2.0);
              widthModulation = clamp(widthModulation, 0.3, 1.0);
              
              float mainFlicker = 0.92 + 0.08 * sin(fastTime * 7.7);
              float microFlicker = 0.95 + 0.05 * sin(fastTime * 30.0) * sin(fastTime * 17.3);
              float combinedFlicker = mainFlicker * microFlicker;
              
              float fireDetail = fireDetail1 * 0.6 + fireDetail2 * 0.4;
              fireDetail = pow(fireDetail, 1.2); 
              
              float baseIntensity = 0.7 + 0.3 * baseFlow;
              float turbulentIntensity = baseIntensity * fireDetail * widthModulation * combinedFlicker;
              
              float fineDetail = noise(noiseCoord1 * 3.0 + fastTime * 0.1) * 0.2;
              turbulentIntensity += fineDetail * widthModulation;
              
              turbulentIntensity += embers * 0.2;
              
              float finalIntensity = smoothstep(0.1, 0.9, turbulentIntensity);
              
              vec3 deepColor = fireColorCool * 0.7;    
              vec3 midColor = fireColorBase;          
              vec3 brightColor = mix(fireColorBase, fireColorHot, 0.7);   
              vec3 hotWhite = fireColorHot;    
              
              vec3 finalColor;
              
              if (finalIntensity < 0.3) {
                float t = finalIntensity / 0.3;
                finalColor = mix(deepColor, midColor, t);
              } 
              else if (finalIntensity < 0.7) {
                float t = (finalIntensity - 0.3) / 0.4;
                finalColor = mix(midColor, brightColor, t);
              }
              else {
                float t = (finalIntensity - 0.7) / 0.3;
                finalColor = mix(brightColor, hotWhite, t);
              }
              
              float blueHint = pow(finalIntensity, 5.0) * 0.1;
              finalColor = mix(finalColor, vec3(0.7, 0.8, 1.0), blueHint);
              
              float alpha = finalIntensity * 2.0; 
              alpha = clamp(alpha, 0.0, 1.0);
              
              gl_FragColor = vec4(finalColor, alpha);
            }
          `;
        }

        animate() {
          requestAnimationFrame(() => this.animate());
          
          if (this.uniforms) {
            this.uniforms.time.value += 0.016;
            
            const time = this.uniforms.time.value;
            const hueShift = Math.sin(time * 0.1) * 0.05;
            
            // Use the THREE instance that was already imported
            if (this.THREE) {
              const baseColor = new this.THREE.Color();
              baseColor.setHSL(this.colorConfig.hue + hueShift, 0.9, 0.55);
              this.uniforms.fireColorBase.value.copy(baseColor);
            }
          }
          
          try {
            if (this.renderer && this.scene && this.camera) {
              this.renderer.render(this.scene, this.camera);
            }
          } catch (error) {
            console.warn("Error during rendering:", error);
          }
        }

        createRingGeometry(THREE) {
          try {
            const cardContainer = document.getElementById(this.containerId);
            if (!cardContainer) return;
            
            const cardRect = cardContainer.getBoundingClientRect();
            const cardWidth = cardRect.width;
            const cardHeight = cardRect.height;

            if (cardWidth === 0 || cardHeight === 0) {
              return;
            }
            
            // Adjust dimensions based on screen size
            const isMobile = window.innerWidth <= 768;
            const isSmallMobile = window.innerWidth <= 480;
            
            const gap = isSmallMobile ? 3 : isMobile ? 4 : 10;
            const ringThickness = isSmallMobile ? 6 : isMobile ? 8 : 20;
            const cornerRadius = isSmallMobile ? 8 : isMobile ? 12 : 24;
            
            const outerWidth = cardWidth + 2 * (gap + ringThickness);
            const outerHeight = cardHeight + 2 * (gap + ringThickness);
            const outerRadius = cornerRadius + gap + ringThickness;
            
            const innerWidth = cardWidth + 2 * gap;
            const innerHeight = cardHeight + 2 * gap;
            const innerRadius = cornerRadius + gap;

            // Adjust canvas padding based on screen size
            const canvasPadding = isSmallMobile ? 10 : isMobile ? 15 : 40;
            const canvasWidth = outerWidth + canvasPadding;
            const canvasHeight = outerHeight + canvasPadding;
            
            if (this.renderer) {
              this.renderer.setSize(canvasWidth, canvasHeight);
            }

            if (this.camera) {
              this.camera.left = -canvasWidth / 2;
              this.camera.right = canvasWidth / 2;
              this.camera.top = canvasHeight / 2;
              this.camera.bottom = -canvasHeight / 2;
              this.camera.updateProjectionMatrix();
            }
            
            if (this.fieryBandMesh && this.fieryBandMesh.geometry) {
              this.fieryBandMesh.geometry.dispose();
            }
            
            const outerShape = new THREE.Shape();
            outerShape.moveTo(-outerWidth/2 + outerRadius, -outerHeight/2);
            outerShape.lineTo(outerWidth/2 - outerRadius, -outerHeight/2);
            outerShape.quadraticCurveTo(outerWidth/2, -outerHeight/2, outerWidth/2, -outerHeight/2 + outerRadius);
            outerShape.lineTo(outerWidth/2, outerHeight/2 - outerRadius);
            outerShape.quadraticCurveTo(outerWidth/2, outerHeight/2, outerWidth/2 - outerRadius, outerHeight/2);
            outerShape.lineTo(-outerWidth/2 + outerRadius, outerHeight/2);
            outerShape.quadraticCurveTo(-outerWidth/2, outerHeight/2, -outerWidth/2, outerHeight/2 - outerRadius);
            outerShape.lineTo(-outerWidth/2, -outerHeight/2 + outerRadius);
            outerShape.quadraticCurveTo(-outerWidth/2, -outerHeight/2, -outerWidth/2 + outerRadius, -outerHeight/2);
            
            const innerShapePath = new THREE.Path();
            innerShapePath.moveTo(-innerWidth/2 + innerRadius, -innerHeight/2);
            innerShapePath.lineTo(innerWidth/2 - innerRadius, -innerHeight/2);
            innerShapePath.quadraticCurveTo(innerWidth/2, -innerHeight/2, innerWidth/2, -innerHeight/2 + innerRadius);
            innerShapePath.lineTo(innerWidth/2, innerHeight/2 - innerRadius);
            innerShapePath.quadraticCurveTo(innerWidth/2, innerHeight/2, innerWidth/2 - innerRadius, innerHeight/2);
            innerShapePath.lineTo(-innerWidth/2 + innerRadius, innerHeight/2);
            innerShapePath.quadraticCurveTo(-innerWidth/2, innerHeight/2, -innerWidth/2, innerHeight/2 - innerRadius);
            innerShapePath.lineTo(-innerWidth/2, -innerHeight/2 + innerRadius);
            innerShapePath.quadraticCurveTo(-innerWidth/2, -innerHeight/2, -innerWidth/2 + innerRadius, -innerHeight/2);
            
            outerShape.holes.push(innerShapePath);
            
            const ringGeometry = new THREE.ShapeGeometry(outerShape, 48);
            
            if (this.fieryBandMesh) {
              this.fieryBandMesh.geometry = ringGeometry;
              this.fieryBandMesh.position.set(0, 0, 0);
            }
          } catch (error) {
            console.warn("Error creating ring geometry:", error);
          }
        }

        onResize() {
          if (this.THREE) {
            this.createRingGeometry(this.THREE);
          }
        }
      }

      // Color configuration
      const colorConfig = {
        base: 0xff6600,
        hot: 0xffffaa,
        cool: 0xcc2200,
        hue: 0.07
      };

      // Create ring instances based on number of products
      const rings = randomProducts.map((_, index) => 
        new FieryRing(`cardContainer${index + 1}`, `energy-canvas-${index + 1}`, colorConfig)
      );

      // Initialize rings
      rings.forEach(ring => ring.init());
      ringsRef.current = rings;
      
      // Trigger resize after initialization on mobile
      if (window.innerWidth <= 768) {
        setTimeout(() => {
          rings.forEach(ring => ring.onResize());
        }, 300);
        
        // Force another resize after a longer delay for mobile
        setTimeout(() => {
          rings.forEach(ring => {
            ring.createRingGeometry(ring.THREE || THREE);
          });
        }, 500);
      }

      // Handle resize
      const handleResize = () => {
        rings.forEach(ring => ring.onResize());
      };

      let resizeTimeout;
      const resizeHandler = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 150);
      };

      window.addEventListener('resize', resizeHandler);
      
      // Also handle orientation change for mobile
      window.addEventListener('orientationchange', resizeHandler);

      return () => {
        window.removeEventListener('resize', resizeHandler);
        window.removeEventListener('orientationchange', resizeHandler);
      };
    } catch (error) {
      console.error('Error initializing fiery rings:', error);
    }
  };

  const handleBuyNow = (product) => {
    // Add product to cart
    addToCart(product);
    
    // Open cart after a short delay to ensure the product is added
    setTimeout(() => {
      if (onCartClick) {
        onCartClick();
      }
    }, 300);
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    const integerPart = Math.floor(numPrice);
    const decimalPart = (numPrice % 1).toFixed(2).substring(1);
    
    return {
      integer: integerPart,
      decimal: decimalPart
    };
  };

  const truncateProductName = (name) => {
    if (!name) return '';
    const words = name.split(' ');
    if (words.length <= 7) return name;
    return words.slice(0, 7).join(' ') + '...';
  };

  if (randomProducts.length === 0) {
    return null;
  }

  return (
    <>
      <style>{`
        .fiery-cards-container {
          display: flex;
          gap: 80px;
          align-items: center;
          justify-content: center;
          flex-wrap: nowrap;
          max-width: 1600px;
          width: 100%;
          margin: 0 auto;
          padding: 60px 20px;
        }
        
        .card-container {
          position: relative;
          width: 360px;
          max-width: 90%;
          transform-style: preserve-3d;
          perspective: 1000px;
          flex-shrink: 0;
          overflow: visible;
        }
        
        .fiery-card {
          background-color: rgba(100, 50, 20, 0.70);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 28px;
          padding: 24px;
          color: #E5E7EB;
          box-shadow: 0 12px 35px rgba(0,0,0,0.55), 0 0 0 1px rgba(255, 190, 120, 0.20) inset;
          position: relative;
          z-index: 2;
          overflow: hidden;
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }
        
        .fiery-card:hover {
          transform: translateY(-5px);
        }
        
        .card-title {
          font-size: 1.375rem;
          font-weight: 700;
          color: #F9FAFB;
          margin-bottom: 20px;
          transform: translateZ(20px);
          line-height: 1.3;
          min-height: 3.6rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-align: center;
        }
        
        .card-price {
          font-size: 3.25rem;
          font-weight: 800;
          color: #FFFFFF;
          margin-bottom: 20px;
          transform: translateZ(20px);
          text-align: center;
        }
        
        .card-price .currency {
          font-size: 1.875rem;
          font-weight: 500;
          vertical-align: super;
          margin-right: 4px;
          color: #FDBA74;
        }
        
        .card-price .decimal {
          font-size: 1.875rem;
          font-weight: 500;
          color: #D1D5DB;
        }
        
        
        .product-image {
          width: 100%;
          height: 240px;
          object-fit: cover;
          border-radius: 16px;
          margin-bottom: 24px;
          transform: translateZ(20px);
        }
        
        .cta-button {
          background-color: rgba(255, 150, 80, 0.25);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #FFFFFF;
          font-weight: 600;
          font-size: 1rem;
          padding: 14px 0;
          width: 100%;
          border: 1px solid rgba(255, 190, 120, 0.3);
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 5px 15px rgba(255, 100, 0, 0.25);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transform: translateZ(20px);
        }
        
        .cta-button:hover {
          background-color: rgba(255, 160, 90, 0.40);
          border-color: rgba(255, 200, 140, 0.4);
          transform: translateY(-2px) scale(1.02) translateZ(20px);
          box-shadow: 0 7px 20px rgba(255, 100, 0, 0.35);
        }
        
        .cta-button:active {
          transform: translateY(-1px) scale(0.98) translateZ(20px);
          background-color: rgba(255, 140, 70, 0.45);
        }
        
        .energy-canvas {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: -1;
          pointer-events: none;
          width: auto;
          height: auto;
          opacity: 1;
          display: block !important;
        }
        
        @media (max-width: 1400px) {
          .fiery-cards-container {
            gap: 50px;
            padding: 50px 20px;
          }
        }
        
        @media (max-width: 1200px) {
          .fiery-cards-container {
            gap: 40px;
          }
          
          .card-container {
            width: 320px;
          }
          
          .fiery-card {
            padding: 20px;
          }
        }
        
        @media (max-width: 968px) {
          .fiery-cards-container {
            gap: 35px;
            padding: 40px 15px;
          }
          
          .card-container {
            width: 280px;
          }
          
          .product-image {
            height: 200px;
          }
          
          .card-title {
            font-size: 1.25rem;
          }
          
          .card-price {
            font-size: 2.75rem;
          }
        }
        
        @media (max-width: 768px) {
          .fiery-cards-container {
            gap: 40px;
            padding: 40px 15px;
            overflow-x: auto;
            overflow-y: visible;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          
          .fiery-cards-container::-webkit-scrollbar {
            display: none;
          }
          
          .card-container {
            width: 25vw;
            min-width: 90px;
            max-width: 120px;
            flex-shrink: 0;
            position: relative;
            overflow: visible !important;
            z-index: 1;
          }
          
          .fiery-card {
            padding: 10px;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
            z-index: 1;
            background-color: rgba(100, 50, 20, 0.70);
            border-radius: 16px;
          }
          
          .card-title {
            font-size: 0.7rem;
            margin-bottom: 8px;
            min-height: 2rem;
            line-height: 1.2;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          
          .product-image {
            width: 100%;
            height: auto;
            aspect-ratio: 1;
            object-fit: cover;
            margin-bottom: 8px;
            border-radius: 6px;
          }
          
          .card-price {
            font-size: 1rem;
            margin-bottom: 8px;
          }
          
          .card-price .currency {
            font-size: 0.75rem;
          }
          
          .card-price .decimal {
            font-size: 0.75rem;
          }
          
          .cta-button {
            padding: 6px 0;
            font-size: 0.65rem;
            border-radius: 10px;
            margin-top: auto;
          }
          
          .energy-canvas {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 160px;
            height: 160px;
            max-width: none;
            max-height: none;
            z-index: 0;
            opacity: 1;
          }
        }
        
        @media (max-width: 480px) {
          .fiery-cards-container {
            gap: 30px;
            padding: 30px 10px;
          }
          
          .card-container {
            width: 26vw;
            min-width: 80px;
            max-width: 100px;
          }
          
          .fiery-card {
            padding: 8px;
            border-radius: 12px;
          }
          
          .card-title {
            font-size: 0.6rem;
            margin-bottom: 6px;
            min-height: 1.8rem;
          }
          
          .product-image {
            width: 100%;
            height: auto;
            aspect-ratio: 1;
            object-fit: cover;
            margin-bottom: 6px;
            border-radius: 4px;
          }
          
          .card-price {
            font-size: 0.875rem;
            margin-bottom: 6px;
          }
          
          .card-price .currency {
            font-size: 0.65rem;
          }
          
          .card-price .decimal {
            font-size: 0.65rem;
          }
          
          .cta-button {
            padding: 5px 0;
            font-size: 0.6rem;
            border-radius: 8px;
          }
          
          .energy-canvas {
            width: 130px;
            height: 130px;
          }
        }
      `}</style>

      <div className="fiery-cards-container">
        {randomProducts.map((product, index) => {
          const price = formatPrice(product.price);
          
          return (
            <div 
              key={product.id}
              className="card-container" 
              id={`cardContainer${index + 1}`}
              ref={el => containerRefs.current[index] = el}
            >
              <canvas 
                id={`energy-canvas-${index + 1}`} 
                className="energy-canvas"
                ref={el => canvasRefs.current[index] = el}
              />
              <div className="fiery-card">
                <h2 className="card-title">{truncateProductName(product.title || product.name)}</h2>
                {product.imageUrl && (
                  <MediaPlaceholder kind="image" />
                )}
                <p className="card-price">
                  <span className="currency">$</span>
                  {price.integer}
                  <span className="decimal">{price.decimal}</span>
                </p>
                <button 
                  className="cta-button"
                  onClick={() => handleBuyNow(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FieryProductCards;