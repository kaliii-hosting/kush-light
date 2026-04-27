import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedProducts } from '../context/EnhancedProductsContext';

const WholesaleProductSections = ({ onProductClick: externalProductClick }) => {
  const navigate = useNavigate();
  const { firebaseProducts, shopifyProducts } = useEnhancedProducts();

  // Combine all products
  const allProducts = useMemo(() => {
    return [...firebaseProducts, ...shopifyProducts];
  }, [firebaseProducts, shopifyProducts]);

  // Define all categories with their display names
  const categoryDefinitions = [
    { value: 'flower', label: 'Flower', order: 1 },
    { value: 'edible', label: 'Edibles', order: 2 },
    { value: 'concentrate', label: 'Concentrates', order: 3 },
    { value: 'cartridge', label: 'Cartridges', order: 4 },
    { value: 'disposable', label: 'Disposables', order: 5 },
    { value: 'pod', label: 'Pods', order: 6 },
    { value: 'battery', label: 'Batteries', order: 7 },
    { value: 'infused-preroll', label: 'Infused Prerolls', order: 8 },
    { value: 'preroll', label: 'Prerolls', order: 9 },
    { value: 'hemp-preroll', label: 'Hemp Prerolls', order: 10 },
    { value: 'distillate', label: 'Distillate', order: 11 },
    { value: 'liquid-diamonds', label: 'Liquid Diamonds', order: 12 },
    { value: 'live-resin-diamonds', label: 'Sample Material Diamonds', order: 13 },
    { value: 'hash-infused-preroll', label: 'Hash Infused Prerolls', order: 14 },
    { value: 'infused-preroll-5pack', label: 'Infused Prerolls - 5 Pack', order: 15 },
    { value: 'merch', label: 'Merchandise', order: 16 }
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

    return grouped;
  }, [allProducts]);

  // Get sorted categories that have products
  const categoriesWithProducts = useMemo(() => {
    return categoryDefinitions
      .filter(cat => productsByCategory[cat.value] && productsByCategory[cat.value].length > 0)
      .sort((a, b) => a.order - b.order);
  }, [productsByCategory]);

  const handleProductClick = (product) => {
    // Use external callback if provided, otherwise navigate to wholesale page
    if (externalProductClick) {
      externalProductClick(product);
    } else {
      navigate(`/wholesale?product=${product.handle || product.id}`);
    }
  };

  // Get product image URL
  const getProductImage = (product) => {
    // Check various possible image fields
    if (product.mainImage) return product.mainImage;
    if (product.imageUrl) return product.imageUrl;
    if (product.image) return product.image;
    if (product.images && product.images.length > 0) {
      return typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url;
    }
    if (product.featuredImage) return product.featuredImage;
    // Fallback placeholder
    return 'https://via.placeholder.com/300x300/1a1a1a/666666?text=No+Image';
  };

  // Get product name
  const getProductName = (product) => {
    return product.name || product.title || 'Unnamed Product';
  };

  // Custom descriptions for each category
  const getCategoryDescription = (categoryValue, categoryLabel) => {
    const descriptions = {
      'flower': 'Premium indoor and outdoor flower strains. Hand-selected for quality and potency.',
      'edible': 'Delicious and precisely dosed edibles. From gummies to chocolates, we have it all.',
      'concentrate': 'High-quality concentrates and extracts. Pure, potent, and professionally processed.',
      'cartridge': 'Premium Sample Items with pure distillate. Compatible with standard batteries.',
      'disposable': 'Convenient disposable vapes ready to use. No charging or refilling required.',
      'pod': 'Innovative pod systems for the modern consumer. Easy to use and maintain.',
      'battery': 'Reliable batteries and hardware. Quality devices for your vaping needs.',
      'infused-preroll': 'Expertly crafted infused Sample Items. Enhanced with concentrates for extra potency.',
      'preroll': 'Classic Sample Items made with premium flower. Perfectly rolled and ready to enjoy.',
      'hemp-preroll': 'High-CBD hemp Sample Items. Legal nationwide with therapeutic benefits.',
      'distillate': 'Pure distillate for various applications. Lab-tested for purity and potency.',
      'liquid-diamonds': 'Premium liquid diamonds extract. The pinnacle of Sample refinement.',
      'live-resin-diamonds': 'Sample Material diamonds preserving natural terpenes. Ultimate flavor and effects.',
      'hash-infused-preroll': 'Premium Sample Items infused with hash. Traditional craftsmanship meets modern quality.',
      'infused-preroll-5pack': 'Convenient 5-packs of infused Sample Items. Perfect for retail display.',
      'merch': 'Branded merchandise and accessories. Support your favorite Sample brand.'
    };

    return descriptions[categoryValue] || `Explore our wholesale ${categoryLabel.toLowerCase()} selection. Quality products at competitive prices for your business.`;
  };

  if (categoriesWithProducts.length === 0) {
    return null; // Don't render if no products
  }

  return (
    <div className="wholesale-sections-container">
      {categoriesWithProducts.map((category, index) => {
        const products = productsByCategory[category.value];
        // Alternate gradient directions for visual variety
        const gradientClass = index % 2 === 0
          ? "bg-gradient-to-r from-primary/20 to-primary/10"
          : "bg-gradient-to-r from-orange-600/20 to-primary/10";

        return (
          <section key={category.value} className="bg-black py-6 md:py-8">
            {/* Category Banner - Same style as removed wholesale partner banner */}
            <div className={`${gradientClass} py-8 md:py-12 mb-6`}>
              <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Premium {category.label} Collection
                </h2>
                <p className="text-gray-300 mb-6">
                  {getCategoryDescription(category.value, category.label)}
                </p>
                <button
                  onClick={() => navigate(`/wholesale?category=${category.value}`)}
                  className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  View All {category.label}
                </button>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6">

              {/* Products Grid - 4 per row on desktop */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group cursor-pointer"
                    onClick={() => handleProductClick(product)}
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
  );
};

export default WholesaleProductSections;