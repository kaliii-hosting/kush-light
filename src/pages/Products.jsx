import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useMemo } from 'react';
import ProductModal from '../components/ProductModal';
import { useEnhancedProducts } from '../context/EnhancedProductsContext';

const Products = () => {
  const { firebaseProducts, shopifyProducts, loading } = useEnhancedProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Combine all products
  const allProducts = useMemo(() => {
    return [...firebaseProducts, ...shopifyProducts];
  }, [firebaseProducts, shopifyProducts]);

  // Define all categories with their display names and descriptions
  const categoryDefinitions = [
    {
      value: 'flower',
      label: 'Flower',
      order: 1,
      description: 'Premium indoor and outdoor flower strains. Hand-selected for quality and potency.'
    },
    {
      value: 'edible',
      label: 'Edibles',
      order: 2,
      description: 'Delicious and precisely dosed edibles. From gummies to chocolates, we have it all.'
    },
    {
      value: 'concentrate',
      label: 'Concentrates',
      order: 3,
      description: 'High-quality concentrates and extracts. Pure, potent, and professionally processed.'
    },
    {
      value: 'cartridge',
      label: 'Cartridges',
      order: 4,
      description: 'Premium Sample Items with pure distillate. Compatible with standard batteries.'
    },
    {
      value: 'disposable',
      label: 'Disposables',
      order: 5,
      description: 'Convenient disposable vapes ready to use. No charging or refilling required.'
    },
    {
      value: 'pod',
      label: 'Pods',
      order: 6,
      description: 'Innovative pod systems for the modern consumer. Easy to use and maintain.'
    },
    {
      value: 'battery',
      label: 'Batteries',
      order: 7,
      description: 'Reliable batteries and hardware. Quality devices for your vaping needs.'
    },
    {
      value: 'infused-preroll',
      label: 'Infused Prerolls',
      order: 8,
      description: 'Expertly crafted infused Sample Items. Enhanced with concentrates for extra potency.'
    },
    {
      value: 'preroll',
      label: 'Prerolls',
      order: 9,
      description: 'Classic Sample Items made with premium flower. Perfectly rolled and ready to enjoy.'
    },
    {
      value: 'hemp-preroll',
      label: 'Hemp Prerolls',
      order: 10,
      description: 'High-CBD hemp Sample Items. Legal nationwide with therapeutic benefits.'
    },
    {
      value: 'distillate',
      label: 'Distillate',
      order: 11,
      description: 'Pure distillate for various applications. Lab-tested for purity and potency.'
    },
    {
      value: 'liquid-diamonds',
      label: 'Liquid Diamonds',
      order: 12,
      description: 'Premium liquid diamonds extract. The pinnacle of Sample refinement.'
    },
    {
      value: 'live-resin-diamonds',
      label: 'Sample Material Diamonds',
      order: 13,
      description: 'Sample Material diamonds preserving natural terpenes. Ultimate flavor and effects.'
    },
    {
      value: 'hash-infused-preroll',
      label: 'Hash Infused Prerolls',
      order: 14,
      description: 'Premium Sample Items infused with hash. Traditional craftsmanship meets modern quality.'
    },
    {
      value: 'infused-preroll-5pack',
      label: 'Infused Prerolls - 5 Pack',
      order: 15,
      description: 'Convenient 5-packs of infused Sample Items. Perfect for retail display.'
    },
    {
      value: 'merch',
      label: 'Merchandise',
      order: 16,
      description: 'Branded merchandise and accessories. Support your favorite Sample brand.'
    }
  ];

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped = {};

    allProducts.forEach(product => {
      const category = product.category;
      if (category) {
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(product);
      }
    });

    console.log('Products grouped by category:', grouped);
    return grouped;
  }, [allProducts]);

  // Get sorted categories that have products
  const categoriesWithProducts = useMemo(() => {
    return categoryDefinitions
      .filter(cat => productsByCategory[cat.value] && productsByCategory[cat.value].length > 0)
      .sort((a, b) => a.order - b.order);
  }, [productsByCategory]);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  // Get product image URL
  const getProductImage = (product) => {
    if (product.mainImage) return product.mainImage;
    if (product.imageUrl) return product.imageUrl;
    if (product.image) return product.image;
    if (product.images && product.images.length > 0) {
      return typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url;
    }
    if (product.featuredImage) return product.featuredImage;
    return 'https://via.placeholder.com/300x300/1a1a1a/666666?text=No+Image';
  };

  // Get product name
  const getProductName = (product) => {
    return product.name || product.title || 'Unnamed Product';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Products by Category - Same design as homepage wholesale sections */}
      <div className="wholesale-sections-container">
        {categoriesWithProducts.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-white text-xl mb-4">No products found</p>
            <p className="text-gray-400">Please add products in the admin panel</p>
          </div>
        )}

        {categoriesWithProducts.map((category, index) => {
          const products = productsByCategory[category.value];
          // Alternate gradient directions for visual variety
          const gradientClass = index % 2 === 0
            ? "bg-gradient-to-r from-primary/20 to-primary/10"
            : "bg-gradient-to-r from-orange-600/20 to-primary/10";

          return (
            <section key={category.value} className="bg-black py-6 md:py-8">
              {/* Category Banner - Same style as homepage */}
              <div className={`${gradientClass} py-8 md:py-12 mb-6`}>
                <div className="max-w-4xl mx-auto px-4 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Premium {category.label} Collection
                  </h2>
                  <p className="text-gray-300 mb-6">
                    {category.description}
                  </p>
                  <button
                    onClick={() => {
                      // Scroll to the category section
                      const element = document.getElementById(`category-${category.value}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                  >
                    View All {category.label}
                  </button>
                </div>
              </div>

              {/* Products Grid - 4 per row on desktop, matching homepage */}
              <div id={`category-${category.value}`} className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="group cursor-pointer"
                      onClick={() => handleViewProduct(product)}
                    >
                      <div className="relative overflow-hidden rounded-lg bg-gray-900 transition-all duration-300 hover:bg-gray-800">
                        {/* Product Image */}
                        <div className="aspect-square w-full overflow-hidden bg-gray-800">
                          <MediaPlaceholder kind="image" />
                        </div>

                        {/* Product Info - No prices or add to cart */}
                        <div className="p-4">
                          <h3 className="text-sm md:text-base font-medium text-white line-clamp-2 group-hover:text-primary transition-colors">
                            {getProductName(product)}
                          </h3>

                          {/* Optional: Show product type or strain if available */}
                          {product.strain && (
                            <p className="mt-1 text-xs text-gray-500">
                              {product.strain}
                            </p>
                          )}

                          {/* THC/CBD Info */}
                          {(product.thc || product.cbd) && (
                            <div className="flex gap-2 mt-2">
                              {product.thc && (
                                <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                                  THC: {product.thc}%
                                </span>
                              )}
                              {product.cbd && (
                                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                                  CBD: {product.cbd}%
                                </span>
                              )}
                            </div>
                          )}

                          {/* View Details text on hover */}
                          <p className="mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            View Product Details →
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Product Modal - View Only Mode (no prices, no cart) */}
      <ProductModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={handleCloseModal}
        viewOnly={true}
      />
    </div>
  );
};

export default Products;
