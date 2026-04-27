import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useEffect, useRef, useState, useMemo } from 'react';
import { MapPin, Store, Truck, Play, Building2, Package, Users, ChevronRight, Eye, ShoppingCart } from 'lucide-react';
import { useEnhancedProducts } from '../context/EnhancedProductsContext';
import { useWholesaleCart } from '../context/WholesaleCartContext';
import { usePageContent } from '../context/PageContentContext';
import ProductModal from '../components/ProductModal';
import DynamicSection from '../components/DynamicSection';
import './WholesaleStyles.css';

// States where we operate
const operatingStates = [
  { code: 'CA', name: 'California', link: '/wholesale/california' },
  { code: 'NM', name: 'New Mexico', link: '/wholesale/new-mexico' },
  { code: 'NY', name: 'New York', link: '/wholesale/new-york' },
  { code: 'NV', name: 'Nevada', link: '/wholesale/nevada' },
  { code: 'NJ', name: 'New Jersey', link: '/wholesale/new-jersey' },
  { code: 'FL', name: 'Florida', link: '/wholesale/florida' }
];

const WholesaleDynamic = ({ onCartClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const stateLayersRef = useRef([]);
  
  // Products state
  const { firebaseProducts, loading } = useEnhancedProducts();
  const { addToCart, showToast, toastMessage } = useWholesaleCart();
  const { pageContent } = usePageContent();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Filter wholesale products
  const wholesaleProductsFiltered = firebaseProducts.filter(product => 
    product.tags?.includes('wholesale') || product.category?.toLowerCase().includes('wholesale')
  );
  
  // Use all products if no wholesale-specific products exist
  const wholesaleProducts = wholesaleProductsFiltered.length > 0 
    ? wholesaleProductsFiltered.slice(0, 10)
    : firebaseProducts.slice(0, 10); // Limit to 10 products for the slider

  // Get wholesale sections
  const sections = pageContent?.wholesale?.sections || [];
  
  // Get categories with counts
  const categoriesWithCounts = useMemo(() => {
    const categoryMap = new Map();
    
    firebaseProducts.forEach(product => {
      if (product.category) {
        const count = categoryMap.get(product.category) || 0;
        categoryMap.set(product.category, count + 1);
      }
    });
    
    // Convert to array and sort alphabetically
    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [firebaseProducts]);
  
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
        setTimeout(() => {
          if (map) {
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
            const operatingStateBounds = [];
            geoJsonLayer.eachLayer((layer) => {
              if (operatingStates.some(state => state.name === layer.feature.properties.name)) {
                operatingStateBounds.push(layer.getBounds());
              }
            });
            
            if (operatingStateBounds.length > 0) {
              const bounds = operatingStateBounds.reduce((acc, curr) => acc.extend(curr));
              map.fitBounds(bounds, { padding: [50, 50] });
            }
          })
          .catch(error => {
            console.error('Error loading states GeoJSON:', error);
          });

        setMapReady(true);

        // Handle resize
        const handleResize = () => {
          map.invalidateSize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
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
          // Clear all layers first
          if (stateLayersRef.current && stateLayersRef.current.length > 0) {
            stateLayersRef.current.forEach(layer => {
              try {
                if (mapInstanceRef.current && mapInstanceRef.current.hasLayer(layer)) {
                  mapInstanceRef.current.removeLayer(layer);
                }
              } catch (e) {
                console.error('Error removing layer:', e);
              }
            });
            stateLayersRef.current = [];
          }
          
          // Remove map instance
          if (mapInstanceRef.current._container) {
            mapInstanceRef.current.remove();
          }
          mapInstanceRef.current = null;
        } catch (e) {
          console.error('Error cleaning up map:', e);
          // Force cleanup even if there's an error
          mapInstanceRef.current = null;
          stateLayersRef.current = [];
        }
      }
    };
  }, []);

  return (
    <div className="bg-black min-h-screen">
      {/* Critical z-index override for Leaflet and smooth slider - scoped to this component */}
      <style>{`
        /* Override Leaflet's default z-index values (200-700) - only within wholesale map */
        .wholesale-map-section .leaflet-pane { z-index: 1 !important; }
        .wholesale-map-section .leaflet-tile-pane { z-index: 1 !important; }
        .wholesale-map-section .leaflet-overlay-pane { z-index: 2 !important; }
        .wholesale-map-section .leaflet-shadow-pane { z-index: 3 !important; }
        .wholesale-map-section .leaflet-marker-pane { z-index: 4 !important; }
        .wholesale-map-section .leaflet-tooltip-pane { z-index: 5 !important; }
        .wholesale-map-section .leaflet-popup-pane { z-index: 6 !important; }
        .wholesale-map-section .leaflet-control { z-index: 7 !important; }
        
        /* Override inline z-index styles - only within wholesale map container */
        .wholesale-map-container [style*="z-index: 200"],
        .wholesale-map-container [style*="z-index: 400"],
        .wholesale-map-container [style*="z-index: 500"],
        .wholesale-map-container [style*="z-index: 600"],
        .wholesale-map-container [style*="z-index: 650"],
        .wholesale-map-container [style*="z-index: 700"] {
          z-index: 1 !important;
        }
        
        /* Force map section to create new stacking context */
        .wholesale-map-section {
          position: relative !important;
          z-index: 1 !important;
          isolation: isolate !important;
        }
        
        /* Ensure map container stays contained */
        .wholesale-map-container {
          position: relative !important;
          z-index: 1 !important;
          isolation: isolate !important;
          contain: layout style !important;
        }
        
        /* Smooth slider transitions */
        .wholesale-slider {
          -webkit-transform: translateZ(0);
          -webkit-backface-visibility: hidden;
          -webkit-perspective: 1000px;
        }
        
        .wholesale-slider img {
          -webkit-transform: translateZ(0);
          will-change: transform;
        }
      `}</style>
      
      {/* Hero Section with Background Image and Product Slider */}
      <section className="relative overflow-hidden h-[600px] flex items-center">
        {/* Background image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Pictures/KUSHIE_chrome-01_5d13695b-cc7d-4746-a841-0e5c7f650e1f.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 py-8 sm:py-16 w-full">
          <div className="grid grid-cols-2 gap-4 sm:gap-8 items-center">
            {/* Left side - Title and text */}
            <div className="text-left">
              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-5xl font-bold tracking-tight text-white mb-2 sm:mb-4">
                Wholesale Partnership Program
              </h1>
              <p className="text-xs sm:text-sm md:text-base leading-5 sm:leading-7 text-gray-200 mb-3 sm:mb-6">
                Get premium Sample products at wholesale prices with flexible terms and dedicated support.
              </p>
              
              {/* CTA button */}
              <div className="flex">
                <button
                  onClick={() => {
                    const wholesaleSection = document.getElementById('wholesale-products');
                    if (wholesaleSection) {
                      wholesaleSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="rounded-full bg-primary px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors text-center"
                >
                  Shop Now
                </button>
              </div>
            </div>

            {/* Right side - Product Slider */}
            <div className="relative w-full max-w-[180px] sm:max-w-[250px] md:max-w-[320px] ml-auto">
              <div className="overflow-hidden rounded-xl bg-black/80 backdrop-blur-sm">
                <div 
                  className="flex transition-transform duration-700 ease-in-out will-change-transform wholesale-slider"
                  style={{ 
                    transform: `translateX(-${currentSlide * 100}%)`,
                    backfaceVisibility: 'hidden',
                    perspective: '1000px'
                  }}
                >
                  {wholesaleProducts.map((product, index) => (
                    <div key={product.id || index} className="w-full flex-shrink-0" style={{ minWidth: '100%' }}>
                      <div 
                        className="p-2 sm:p-3 cursor-pointer transition-opacity duration-300"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowProductModal(true);
                        }}
                      >
                        <div className="aspect-square mb-1 sm:mb-2 overflow-hidden rounded-lg bg-gray-900">
                          {product.imageUrl ? (
                            <MediaPlaceholder kind="image" />
                          ) : (
                            <div className="h-full w-full bg-gray-800" />
                          )}
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5 sm:mb-1 line-clamp-1">{product.name}</h3>
                        <p className="text-sm sm:text-base font-bold text-primary mb-0.5 sm:mb-1">${product.price}</p>
                        {product.minimumOrder && product.minimumOrder > 1 && (
                          <p className="text-[10px] sm:text-xs text-green-400 mb-0.5 line-clamp-1">
                            Min: {product.minimumOrder} units
                          </p>
                        )}
                        {product.category && (
                          <p className="text-[10px] sm:text-xs text-gray-400 mb-1 sm:mb-2 line-clamp-1">{product.category}</p>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                            if (onCartClick) {
                              onCartClick();
                            }
                          }}
                          className="w-full rounded-full bg-primary px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-white hover:bg-primary-hover transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Slider indicators */}
              <div className="mt-2 sm:mt-3 flex justify-center gap-1 sm:gap-1.5">
                {wholesaleProducts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full transition-all ${
                      currentSlide === index 
                        ? 'bg-primary w-3 sm:w-4' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
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
            <div 
              className="wholesale-map-container"
              ref={mapRef} 
              style={{ 
                height: '600px', 
                width: '100%', 
                background: '#121212', 
                borderRadius: '1rem',
                position: 'relative',
                zIndex: 1,
                isolation: 'isolate',
                contain: 'strict'
              }}
            ></div>
          </div>
        </section>
      </div>

      {/* Removed dynamic sections to exclude 'Why Partner With Us' and 'Benefits that set us apart' */}

      {/* Wholesale Products Section */}
      <section id="wholesale-products" className="py-20 bg-black border-t border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filter */}
            <aside className="lg:w-64 lg:flex-shrink-0">
              <div className="sticky top-4 bg-gray-dark/50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-6">Filter by Category</h3>
                <nav className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-4 py-3 rounded-md transition-colors flex justify-between items-center ${
                      selectedCategory === 'all'
                        ? 'bg-primary text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-dark'
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
                          ? 'bg-primary text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-dark'
                      }`}
                    >
                      <span>{name}</span>
                      <span className="text-sm">{count}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-2">
                  {selectedCategory === 'all' ? 'All Wholesale Products' : selectedCategory}
                </h2>
                <p className="text-gray-400">
                  {firebaseProducts.filter(product => selectedCategory === 'all' || product.category === selectedCategory).length} products available
                </p>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {firebaseProducts
                .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
                .map((product) => (
                <div 
                  key={product.id} 
                  className="group relative bg-card rounded-lg p-4 transition-all duration-300 hover:bg-card-hover"
                >
                  {/* Product Image */}
                  <div className="relative mb-4 aspect-square overflow-hidden rounded-md bg-gray-dark">
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
                    {product.minimumOrder && product.minimumOrder > 1 && (
                      <p className="text-xs text-green-400 mt-1">
                        Min order: {product.minimumOrder} units
                      </p>
                    )}
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
        </div>
      </section>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setTimeout(() => setSelectedProduct(null), 300);
        }}
        onCartClick={onCartClick}
        isWholesale={true}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WholesaleDynamic;