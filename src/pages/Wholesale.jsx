import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useEffect, useRef, useState, useMemo } from 'react';
import ReactDOMServer from 'react-dom/server';
import { MapPin, Store, Truck, Play, Building2, Package, Users, ChevronRight, Eye, ShoppingCart, Filter, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedProducts } from '../context/EnhancedProductsContext';
import { useWholesaleCart } from '../context/WholesaleCartContext';
import ProductModal from '../components/ProductModal';
import CartSlideOut from '../components/CartSlideOut';
import './Wholesale.css';

// States where we operate
const operatingStates = [
  { code: 'CA', name: 'California', link: '/wholesale/california' },
  { code: 'NM', name: 'New Mexico', link: '/wholesale/new-mexico' },
  { code: 'NY', name: 'New York', link: '/wholesale/new-york' },
  { code: 'NV', name: 'Nevada', link: '/wholesale/nevada' },
  { code: 'NJ', name: 'New Jersey', link: '/wholesale/new-jersey' },
  { code: 'FL', name: 'Florida', link: '/wholesale/florida' }
];

const Wholesale = ({ onCartClick }) => {
  const [showShop, setShowShop] = useState(false);
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const stateLayersRef = useRef([]);
  
  // Products state
  const { firebaseProducts, loading } = useEnhancedProducts();
  const { cart, addToCart } = useWholesaleCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showCart, setShowCart] = useState(false);
  
  // Define all available categories (matching ProductForm dropdown values)
  const allCategories = [
    { value: 'flower', label: 'Flower' },
    { value: 'edible', label: 'Edible' },
    { value: 'concentrate', label: 'Concentrate' },
    { value: 'cartridge', label: 'Cartridges' },
    { value: 'disposable', label: 'Disposables' },
    { value: 'pod', label: 'Pods' },
    { value: 'battery', label: 'Batteries' },
    { value: 'infused-preroll', label: 'Infused Prerolls' },
    { value: 'preroll', label: 'Prerolls' },
    { value: 'hemp-preroll', label: 'Hemp Prerolls' },
    { value: 'merch', label: 'Merch' },
    { value: 'distillate', label: 'Distillate' },
    { value: 'liquid-diamonds', label: 'Liquid Diamonds' },
    { value: 'live-resin-diamonds', label: 'Sample Material Diamonds' },
    { value: 'hash-infused-preroll', label: 'Hash Infused Prerolls' },
    { value: 'infused-preroll-5pack', label: 'Infused Prerolls - 5 Pack' }
  ];
  
  // Get categories with counts - matching Sales page logic
  const categoriesWithCounts = useMemo(() => {
    console.log('=== DEBUG: Starting category count calculation ===');
    console.log('Total products:', firebaseProducts.length);
    console.log('All categories:', allCategories);
    
    const categoryMap = new Map();
    
    // Initialize all categories with 0 count
    allCategories.forEach(cat => {
      categoryMap.set(cat.label, 0);
      console.log(`Initialized category: ${cat.label} (value: ${cat.value})`);
    });
    
    // Count products by category (using category field)
    firebaseProducts.forEach((product, index) => {
      const category = product.category;
      console.log(`Product ${index + 1}:`, {
        name: product.name,
        category: category,
        categoryType: typeof category,
        categoryExists: !!category
      });
      
      if (category) {
        // Find matching category from allCategories
        const matchingCategory = allCategories.find(cat => cat.value === category);
        console.log(`  Looking for category value "${category}" in allCategories...`);
        
        if (matchingCategory) {
          console.log(`  ✓ Found matching category: ${matchingCategory.label}`);
          const currentCount = categoryMap.get(matchingCategory.label) || 0;
          categoryMap.set(matchingCategory.label, currentCount + 1);
          console.log(`  Updated count for ${matchingCategory.label}: ${currentCount + 1}`);
        } else {
          console.log(`  ✗ No matching category found for value: "${category}"`);
          console.log(`  Available category values:`, allCategories.map(c => c.value));
        }
      } else {
        console.log(`  - Product has no category`);
      }
    });
    
    console.log('\n=== Final category counts ===');
    let totalCounted = 0;
    categoryMap.forEach((count, label) => {
      console.log(`${label}: ${count}`);
      totalCounted += count;
    });
    
    console.log(`\nTotal products counted in categories: ${totalCounted}`);
    console.log(`Total products in firebaseProducts: ${firebaseProducts.length}`);
    console.log(`Products without categories: ${firebaseProducts.length - totalCounted}`);
    
    // Additional debug: Find unique category values in products
    const uniqueProductCategories = [...new Set(firebaseProducts
      .map(p => p.category)
      .filter(Boolean))];
    console.log('\n=== Unique category values in products ===');
    console.log(uniqueProductCategories);
    
    // Check for categories in products but not in allCategories
    const unmatchedCategories = uniqueProductCategories.filter(cat => 
      !allCategories.some(ac => ac.value === cat)
    );
    if (unmatchedCategories.length > 0) {
      console.log('\n⚠️  Categories in products but NOT in allCategories:');
      console.log(unmatchedCategories);
    }
    
    // Show products without categories
    const productsWithoutCategories = firebaseProducts.filter(p => !p.category);
    if (productsWithoutCategories.length > 0) {
      console.log(`\n⚠️  ${productsWithoutCategories.length} products have no category:`);
      productsWithoutCategories.forEach(p => console.log(`  - ${p.name}`));
    }
    
    console.log('=== End of category count debug ===\n');
    
    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [firebaseProducts]);
  
  // Filter wholesale products
  const wholesaleProductsFiltered = firebaseProducts.filter(product => 
    product.tags?.includes('wholesale') || product.category?.toLowerCase().includes('wholesale')
  );
  
  // Use all products if no wholesale-specific products exist
  const wholesaleProducts = wholesaleProductsFiltered.length > 0 
    ? wholesaleProductsFiltered.slice(0, 10)
    : firebaseProducts.slice(0, 10); // Limit to 10 products for the slider
  
  // Remove authentication check - will be handled by wrapper component

  // Auto-play slider
  useEffect(() => {
    if (wholesaleProducts.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % wholesaleProducts.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [wholesaleProducts.length]);

  // Initialize map
  useEffect(() => {
    let map;
    const loadLeafletAssets = async () => {
      // Load Leaflet CSS if not already loaded
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCSS);
      }

      // Load Leaflet JS if not already loaded
      if (!window.L) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
    };

    const initializeMap = async () => {
      try {
        await loadLeafletAssets();

        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize the map to show all operating states
        map = window.L.map(mapRef.current, {
          center: [35.5, -96], // Adjusted center to better show all operating states
          zoom: 4.2, // Zoom level to show all operating states
          zoomControl: true, // Enable zoom buttons
          attributionControl: false,
          scrollWheelZoom: false, // Disable scroll zoom
          maxBounds: [[15, -140], [60, -55]], // Wider bounds for full width view
          minZoom: 3,
          maxZoom: 7,
          // Disable touch zoom for mobile
          touchZoom: false,
          dragging: true
        });

        mapInstanceRef.current = map;

        // Override Leaflet's default pane z-indexes
        // Leaflet uses z-index 200-700 by default, we need to override these
        setTimeout(() => {
          if (map) {
            // Get all default panes and set low z-index
            const panes = ['tilePane', 'overlayPane', 'shadowPane', 'markerPane', 'tooltipPane', 'popupPane'];
            panes.forEach(paneName => {
              try {
                const pane = map.getPane(paneName);
                if (pane) {
                  pane.style.zIndex = '1';
                }
              } catch (e) {
                console.log(`Pane ${paneName} not found`);
              }
            });
            
            // Also set the map container itself
            const container = map.getContainer();
            if (container) {
              container.style.zIndex = '1';
              container.style.position = 'relative';
            }
          }
        }, 100);

        // Add dark tile layer
        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          subdomains: 'abcd',
          maxZoom: 20,
        }).addTo(map);

        // Load US states GeoJSON and highlight operating states
        fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
          .then(response => response.json())
          .then(data => {
            // Add GeoJSON layer with custom styling
            const geoJsonLayer = window.L.geoJSON(data, {
              style: (feature) => {
                const isOperatingState = operatingStates.some(
                  state => state.name === feature.properties.name
                );
                
                return {
                  fillColor: isOperatingState ? '#CB6015' : 'transparent',
                  weight: isOperatingState ? 3 : 1,
                  opacity: 1,
                  color: isOperatingState ? '#CB6015' : '#404040',
                  fillOpacity: isOperatingState ? 0.3 : 0,
                  className: isOperatingState ? 'animated-state-border' : '',
                  // Make non-operating states non-interactive
                  interactive: isOperatingState
                };
              },
              onEachFeature: (feature, layer) => {
                const operatingState = operatingStates.find(
                  state => state.name === feature.properties.name
                );
                
                if (operatingState) {
                  // Set cursor style for clickable states
                  layer.options.className = 'animated-state-border cursor-pointer';
                  
                  // Add hover effects
                  layer.on({
                    mouseover: (e) => {
                      const layer = e.target;
                      layer.setStyle({
                        fillOpacity: 0.5,
                        weight: 4
                      });
                      layer.bringToFront();
                    },
                    mouseout: (e) => {
                      geoJsonLayer.resetStyle(e.target);
                    },
                    click: () => {
                      // Navigate to state-specific page
                      window.location.href = operatingState.link;
                    }
                  });

                  // Add tooltip  
                  layer.bindTooltip(operatingState.name, {
                    permanent: false,
                    direction: 'center',
                    className: 'state-tooltip'
                  });
                } else {
                  // Non-operating states - disable interaction
                  layer.options.interactive = false;
                  layer.options.className = 'non-interactive-state';
                }
              }
            });

            geoJsonLayer.addTo(map);
            stateLayersRef.current.push(geoJsonLayer);
            
            // Fit map bounds to show all operating states
            try {
              const operatingStateBounds = [];
              geoJsonLayer.eachLayer((layer) => {
                if (operatingStates.some(state => state.name === layer.feature.properties.name)) {
                  const layerBounds = layer.getBounds();
                  if (layerBounds.isValid()) {
                    operatingStateBounds.push(layerBounds);
                  }
                }
              });
              
              if (operatingStateBounds.length > 0) {
                let bounds = operatingStateBounds[0];
                for (let i = 1; i < operatingStateBounds.length; i++) {
                  bounds = bounds.extend(operatingStateBounds[i]);
                }
                // Adjust padding to zoom in more on the states
                const isMobile = window.innerWidth <= 768;
                if (bounds.isValid()) {
                  map.fitBounds(bounds, { 
                    padding: isMobile ? [20, 20] : [30, 30],
                    maxZoom: 5 // Prevent zooming in too much
                  });
                }
              }
            } catch (boundsError) {
              console.log('Could not fit bounds, using default view');
              // Keep default center and zoom if bounds calculation fails
            }
          })
          .catch(error => {
            console.error('Error loading states GeoJSON:', error);
          });

        setMapReady(true);

        // Wait for map to fully load then enforce z-index
        setTimeout(() => {
          if (mapRef.current) {
            // Force z-index on all Leaflet elements
            const allLeafletElements = mapRef.current.querySelectorAll('*');
            allLeafletElements.forEach(el => {
              if (el.style.zIndex && parseInt(el.style.zIndex) > 10) {
                el.style.zIndex = '1';
              }
            });
          }
        }, 1000);

        // Continuously enforce z-index with MutationObserver
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
              const element = mutation.target;
              if (element.style.zIndex) {
                const zIndex = parseInt(element.style.zIndex);
                // Override Leaflet's default z-index values (200-700)
                if (zIndex >= 200 && zIndex <= 700) {
                  element.style.zIndex = '1';
                }
              }
            }
          });
          
          // Also check all panes periodically
          if (map) {
            const panes = ['tilePane', 'overlayPane', 'shadowPane', 'markerPane', 'tooltipPane', 'popupPane'];
            panes.forEach(paneName => {
              try {
                const pane = map.getPane(paneName);
                if (pane && pane.style.zIndex && parseInt(pane.style.zIndex) > 10) {
                  pane.style.zIndex = '1';
                }
              } catch (e) {
                // Pane not found
              }
            });
          }
        });

        if (mapRef.current) {
          observer.observe(mapRef.current, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
          });
        }

        // Handle resize
        const handleResize = () => {
          map.invalidateSize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          observer.disconnect();
        };

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (e) {
          console.error('Error removing map:', e);
        }
      }
    };
  }, []);

  return (
    <div className="bg-black min-h-screen">
      {!showShop && (
        <>
      {/* Critical z-index override for Leaflet */}
      <style>{`
        /* Override Leaflet's default z-index values (200-700) */
        .leaflet-pane { z-index: 1 !important; }
        .leaflet-tile-pane { z-index: 1 !important; }
        .leaflet-overlay-pane { z-index: 2 !important; }
        .leaflet-shadow-pane { z-index: 3 !important; }
        .leaflet-marker-pane { z-index: 4 !important; }
        .leaflet-tooltip-pane { z-index: 5 !important; }
        .leaflet-popup-pane { z-index: 6 !important; }
        .leaflet-control { z-index: 7 !important; }
        
        /* Override any inline z-index styles */
        [style*="z-index: 200"],
        [style*="z-index: 400"],
        [style*="z-index: 500"],
        [style*="z-index: 600"],
        [style*="z-index: 650"],
        [style*="z-index: 700"] {
          z-index: 1 !important;
        }
        
        /* Force all map elements to stay low */
        .wholesale-map-wrapper,
        .wholesale-map-wrapper *,
        .wholesale-map-container,
        .wholesale-map-container *,
        .leaflet-container,
        .leaflet-container * {
          z-index: auto !important;
          max-z-index: 10 !important;
        }
        
        /* Specific overrides for elements with high z-index */
        .leaflet-pane[style*="z-index"] {
          z-index: 1 !important;
        }
        
        /* Ensure map wrapper is contained */
        .wholesale-map-wrapper {
          position: relative !important;
          z-index: 1 !important;
          isolation: isolate !important;
          contain: strict !important;
          overflow: hidden !important;
        }
        
        /* Force map container to stay contained */
        .wholesale-map-container {
          position: relative !important;
          z-index: 1 !important;
          max-height: 600px !important;
          overflow: hidden !important;
        }
        
        /* Create stacking context for map section */
        .wholesale-map-section,
        div:has(> .wholesale-map-section) {
          position: relative !important;
          z-index: 1 !important;
          isolation: isolate !important;
        }
      `}</style>
      
      {/* Hero Section with Background Image and Product Slider */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
        {/* Background image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Pictures/Screenshot_5_1752608083133_6u2c3km.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl mb-6">
              Wholesale Partnership Program
            </h1>
            <p className="text-xl leading-8 text-gray-200">
              Get premium Sample products at wholesale prices with flexible terms and dedicated support.
            </p>
            
            {/* CTA buttons */}
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/contact"
                className="rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
              >
                Apply Now
              </a>
              <button
                onClick={() => setShowShop(true)}
                className="text-lg font-semibold leading-6 text-white hover:text-gray-300 transition-colors"
              >
                Shop Now <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          {/* Wholesale Product Slider */}
          <div className="relative mx-auto max-w-md">
            <div className="overflow-hidden rounded-xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {wholesaleProducts.map((product, index) => (
                  <div key={product.id} className="w-full flex-shrink-0 px-4">
                    <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
                      <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-900">
                        {product.imageUrl && (
                          <MediaPlaceholder kind="image" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                      <p className="text-2xl font-bold text-primary mb-2">${product.price}</p>
                      {product.category && (
                        <p className="text-sm text-gray-400">{product.category}</p>
                      )}
                      <button
                        onClick={() => addToCart(product)}
                        className="mt-4 w-full rounded-full bg-primary px-6 py-3 text-base font-semibold text-white hover:bg-primary-hover transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Slider indicators */}
            <div className="mt-6 flex justify-center gap-2">
              {wholesaleProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    currentSlide === index 
                      ? 'bg-primary w-8' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Clean Map Section - Full Width */}
      <div style={{ position: 'relative', zIndex: 1, isolation: 'isolate' }}>
        <section className="wholesale-map-section relative bg-black py-16">
          <div className="mx-auto max-w-2xl text-center mb-12 px-6">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Available Nationwide</h2>
            <p className="mt-4 text-lg leading-8 text-gray-400">
              We operate in 6 states with plans to expand. Click on a state to view local opportunities.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Use zoom buttons • Drag to pan • Click highlighted states for details
            </p>
          </div>
          <div className="relative overflow-hidden shadow-2xl rounded-2xl">
            <div className="wholesale-map-wrapper" style={{ 
              position: 'relative', 
              zIndex: 1, 
              isolation: 'isolate', 
              contain: 'layout style paint',
              transform: 'translateZ(0)', // Force new stacking context
              willChange: 'transform'
            }}>
              <div className="wholesale-map-container" ref={mapRef} style={{ 
                height: '600px', 
                position: 'relative', 
                zIndex: 1,
                transform: 'translateZ(0)' // Force new stacking context
              }}></div>
            </div>
          </div>
        </section>
      </div>

      {/* Clean Content Section */}
      <section id="wholesale-info" className="bg-black py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Benefits Section */}
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-primary">Benefits</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to grow your business
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              Partner with us for premium products, competitive pricing, and dedicated support.
            </p>
          </div>

          {/* Clean Benefits Grid */}
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              {[
                {
                  name: 'Premium Products',
                  description: 'Access our catalog of over 1,000 high-quality Sample products from trusted brands.',
                  icon: Package,
                },
                {
                  name: 'Fast Delivery',
                  description: 'Get your orders delivered quickly with same-day service in select areas.',
                  icon: Truck,
                },
                {
                  name: 'Dedicated Support',
                  description: 'Work with a personal account manager who understands your business needs.',
                  icon: Users,
                },
                {
                  name: 'Flexible Terms',
                  description: 'Enjoy competitive pricing, volume discounts, and NET 30 payment terms.',
                  icon: Store,
                },
              ].map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="text-base font-semibold leading-7 text-white">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-400">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Requirements and Process Grid */}
          <div className="mt-32 grid gap-8 lg:grid-cols-2">
            {/* Requirements Card */}
            <div className="rounded-2xl bg-spotify-light-gray p-8">
              <h3 className="text-xl font-semibold leading-7 text-white mb-4">Requirements</h3>
              <ul className="space-y-3 text-gray-400">
                {[
                  'Valid business license and permits',
                  'Minimum initial order of $500',
                  'Physical retail or Shop location',
                  'Commitment to quality standards',
                  'Compliance with state regulations'
                ].map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Process Card */}
            <div className="rounded-2xl bg-spotify-light-gray p-8">
              <h3 className="text-xl font-semibold leading-7 text-white mb-4">How It Works</h3>
              <ol className="space-y-3 text-gray-400">
                {[
                  'Submit your application online',
                  'Business verification (1-2 days)',
                  'Account setup and onboarding',
                  'Place your first order',
                  'Ongoing support and growth'
                ].map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Clean CTA Section */}
          <div className="mt-32">
            <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ready to get started?
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
                  Join hundreds of successful retailers. Apply today and start growing your business with Brand.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <a
                    href="/contact"
                    className="rounded-full bg-white px-6 py-3 text-base font-semibold text-black shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
                  >
                    Start Application
                  </a>
                  <button
                    onClick={() => setShowShop(true)}
                    className="text-base font-semibold leading-6 text-white hover:text-gray-300 transition-colors"
                  >
                    View Products <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </>
      )}

      {/* Shop Section - Hidden by default, shown when user clicks shop */}
      {showShop && (
        <div className="fixed inset-0 z-50 bg-black overflow-hidden">
          <div className="flex h-full bg-black">
          {/* Desktop Sidebar - Match Sales Page Style */}
          <aside className="hidden lg:block w-64 bg-black border-r border-gray-800 p-6 overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-6">Filter by Category</h2>
            <nav className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors flex justify-between items-center ${
                  selectedCategory === 'all'
                    ? 'bg-spotify-dark-gray text-white'
                    : 'text-gray-400 hover:text-white hover:bg-spotify-dark-gray/50'
                }`}
              >
                <span>All Products</span>
                <span className="text-sm">{firebaseProducts.length}</span>
              </button>
              {categoriesWithCounts.map(({ name, count }) => (
                <button
                  key={name}
                  onClick={() => setSelectedCategory(name)}
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors flex justify-between items-center ${
                    selectedCategory === name
                      ? 'bg-spotify-dark-gray text-white'
                      : 'text-gray-400 hover:text-white hover:bg-spotify-dark-gray/50'
                  }`}
                >
                  <span>{name}</span>
                  <span className="text-sm">{count}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 bg-black overflow-y-auto">
            <div className="p-6 lg:p-8">
              {/* Header */}
              <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                  <div>
                    <h1 className="text-3xl lg:text-5xl font-black text-white">
                      {selectedCategory === 'all' ? 'All Wholesale Products' : selectedCategory}
                    </h1>
                  </div>
                </div>
                
                {/* Mobile filter button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 bg-spotify-dark-gray text-white px-4 py-2 rounded-full hover:bg-spotify-card-hover transition-colors mb-4"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                
                <p className="text-gray-400">
                  {firebaseProducts.filter(product => {
                    if (selectedCategory === 'all') return true;
                    
                    const productCategory = product.category || product.type;
                    if (!productCategory) return false;
                    
                    const displayCategory = productCategory
                      .split('-')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')
                      .replace('Infused Preroll', 'Infused Prerolls')
                      .replace('Preroll', 'Prerolls')
                      .replace('Cartridge', 'Cartridges')
                      .replace('Disposable', 'Disposables')
                      .replace('Pod', 'Pods')
                      .replace('Battery', 'Batteries');
                    
                    return displayCategory === selectedCategory;
                  }).length} {firebaseProducts.filter(product => {
                    if (selectedCategory === 'all') return true;
                    
                    const productCategory = product.category || product.type;
                    if (!productCategory) return false;
                    
                    const displayCategory = productCategory
                      .split('-')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')
                      .replace('Infused Preroll', 'Infused Prerolls')
                      .replace('Preroll', 'Prerolls')
                      .replace('Cartridge', 'Cartridges')
                      .replace('Disposable', 'Disposables')
                      .replace('Pod', 'Pods')
                      .replace('Battery', 'Batteries');
                    
                    return displayCategory === selectedCategory;
                  }).length === 1 ? 'product' : 'products'}
                </p>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {firebaseProducts
                    .filter(product => {
                      if (selectedCategory === 'all') return true;
                      
                      const productCategory = product.category || product.type;
                      if (!productCategory) return false;
                      
                      const displayCategory = productCategory
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                        .replace('Infused Preroll', 'Infused Prerolls')
                        .replace('Preroll', 'Prerolls')
                        .replace('Cartridge', 'Cartridges')
                        .replace('Disposable', 'Disposables')
                        .replace('Pod', 'Pods')
                        .replace('Battery', 'Batteries');
                      
                      return displayCategory === selectedCategory;
                    })
                    .map((product) => (
                      <div 
                        key={product.id} 
                        className="group relative bg-spotify-light-gray rounded-lg p-4 transition-all duration-300 hover:bg-spotify-dark-gray cursor-pointer"
                      >
                        {/* Product Image */}
                        <div className="relative mb-4 aspect-square overflow-hidden rounded-md bg-gray-900">
                          {product.imageUrl && (
                            <MediaPlaceholder kind="image" />
                          )}
                          
                          {/* Hover Actions */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(product);
                                setShowProductModal(true);
                              }}
                              className="p-3 bg-white rounded-full text-black hover:bg-gray-200 transition-colors"
                              title="Quick View"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                              className="p-3 bg-primary rounded-full text-white hover:bg-primary-hover transition-colors"
                              title="Add to Cart"
                            >
                              <ShoppingCart className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div>
                          <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">{product.name}</h3>
                          <p className="text-primary font-bold">${product.price}</p>
                          {product.category && (
                            <p className="text-xs text-gray-400 mt-1">{product.category}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Filters Modal */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-black/80" onClick={() => setShowMobileFilters(false)} />
              <div className="fixed right-0 top-0 h-full w-80 bg-black border-l border-gray-800 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-bold text-white">Filter by Category</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-spotify-dark-gray rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
                
                <nav className="space-y-1">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setShowMobileFilters(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-md transition-colors flex justify-between items-center ${
                      selectedCategory === 'all'
                        ? 'bg-spotify-dark-gray text-white'
                        : 'text-gray-400 hover:text-white hover:bg-spotify-dark-gray/50'
                    }`}
                  >
                    <span>All Products</span>
                    <span className="text-sm">{firebaseProducts.length}</span>
                  </button>
                  {categoriesWithCounts.map(({ name, count }) => (
                    <button
                      key={name}
                      onClick={() => {
                        setSelectedCategory(name);
                        setShowMobileFilters(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-md transition-colors flex justify-between items-center ${
                        selectedCategory === name
                          ? 'bg-spotify-dark-gray text-white'
                          : 'text-gray-400 hover:text-white hover:bg-spotify-dark-gray/50'
                      }`}
                    >
                      <span>{name}</span>
                      <span className="text-sm">{count}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Modal */}
      <ProductModal 
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setTimeout(() => setSelectedProduct(null), 300);
        }}
        onCartClick={() => setShowCart(true)}
        isWholesale={true}
      />
      
      {/* Cart Slide Out */}
      <CartSlideOut 
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        isWholesale={true}
      />
      
      {/* Floating Cart Button */}
      {showShop && cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-primary hover:bg-primary-hover text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        >
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </div>
        </button>
      )}
    </div>
  );
};

export default Wholesale;