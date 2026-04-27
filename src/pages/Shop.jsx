import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect, useMemo } from 'react';
import { useEnhancedProducts } from '../context/EnhancedProductsContext';
import { useCart } from '../context/ShopifyCartContext';
import { useWishlist } from '../context/WishlistContextNew';
import { useShopify } from '../context/ShopifyContext';
import { ShoppingCart, Filter, X, Eye, Heart, Tag, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductModal from '../components/ProductModal';
import ProductHoverActions from '../components/ProductHoverActions';

const Shop = ({ onCartClick }) => {
  const { shopifyProducts, loading, categories: productCategories } = useEnhancedProducts();
  const { addToCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { syncStatus, error: shopifyError } = useShopify();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [sourceFilter, setSourceFilter] = useState('all'); // all, firebase, shopify

  // Helper function to check if a product is hemp-related
  const isHempProduct = (product) => {
    return (
      product.productType?.toLowerCase().includes('hemp') ||
      product.tags?.some(tag => typeof tag === 'string' && tag.toLowerCase().includes('hemp')) ||
      product.vendor?.toLowerCase().includes('hemp') ||
      product.title?.toLowerCase().includes('hemp') ||
      product.name?.toLowerCase().includes('hemp') ||
      product.category?.toLowerCase().includes('hemp') ||
      product.type?.toLowerCase().includes('hemp') ||
      product.collections?.some(collection => {
        if (typeof collection === 'string') {
          return collection.toLowerCase().includes('hemp');
        } else if (collection?.title) {
          return collection.title.toLowerCase().includes('hemp');
        } else if (collection?.name) {
          return collection.name.toLowerCase().includes('hemp');
        }
        return false;
      }) ||
      product.handle?.toLowerCase().includes('hemp')
    );
  };

  // Get search query, category, and product from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || '';
    const category = params.get('category') || 'all';
    const productParam = params.get('product');
    
    setSearchQuery(search);
    
    // Set selected category if it exists in the URL
    if (category && category !== 'all') {
      setSelectedCategory(category.toLowerCase());
    }
    
    // If product parameter exists, find and show that product
    if (productParam && shopifyProducts.length > 0) {
      const product = shopifyProducts.find(p => 
        p.handle === productParam || 
        p.id === productParam ||
        p.id === `gid://shopify/Product/${productParam}`
      );
      
      if (product) {
        setSelectedProduct(product);
        setShowProductModal(true);
      }
    }
  }, [location.search, shopifyProducts]);

  // Get dynamic categories from Shopify products only (excluding hemp)
  const dynamicCategories = useMemo(() => {
    const categorySet = new Set();
    shopifyProducts.forEach(product => {
      // Skip hemp products when building categories
      if (isHempProduct(product)) {
        return;
      }

      if (product.category) {
        categorySet.add(product.category);
      }
      if (product.type) {
        categorySet.add(product.type);
      }
    });

    // Convert to array, filter out hemp categories, and sort
    const categoriesArray = Array.from(categorySet)
      .filter(cat => !cat.toLowerCase().includes('hemp'))
      .sort();

    // Create category objects with proper formatting
    return [
      { id: 'all', name: 'All Products' },
      ...categoriesArray.map(cat => ({
        id: cat.toLowerCase().replace(/\s+/g, '-'),
        name: cat,
        originalValue: cat
      }))
    ];
  }, [shopifyProducts]);
  
  const categories = dynamicCategories;

  // Filter Shopify products by category and search query, excluding hemp products
  const filteredProducts = shopifyProducts.filter(product => {
    // Exclude hemp products
    if (isHempProduct(product)) {
      return false;
    }
    // Filter by category
    const selectedCat = categories.find(c => c.id === selectedCategory);
    let matchesCategory = selectedCategory === 'all' ||
      product.type === selectedCat?.originalValue ||
      product.category === selectedCat?.originalValue ||
      product.type?.toLowerCase() === selectedCategory ||
      product.category?.toLowerCase() === selectedCategory;
    
    // Filter by search query
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Update category counts based on search (Shopify products only)
  const getFilteredCount = (categoryId) => {
    return shopifyProducts.filter(p => {
      // Exclude hemp products from counts
      if (isHempProduct(p)) {
        return false;
      }

      const category = categories.find(c => c.id === categoryId);
      let matchesCategory = categoryId === 'all' ||
        p.type === category?.originalValue ||
        p.category === category?.originalValue ||
        p.type?.toLowerCase() === categoryId ||
        p.category?.toLowerCase() === categoryId;
      
      const matchesSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    }).length;
  };

  const isInCart = (productId) => {
    return cart.some(item => item.id === productId);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleToggleWishlist = (product, e) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setTimeout(() => setSelectedProduct(null), 300);
    
    // Remove product parameter from URL when closing modal
    const params = new URLSearchParams(location.search);
    if (params.has('product')) {
      params.delete('product');
      const newSearch = params.toString();
      navigate(`/shop${newSearch ? `?${newSearch}` : ''}`, { replace: true });
    }
  };

  return (
    <div className="flex h-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-black border-r border-border p-6 overflow-y-auto">
        <h2 className="text-lg font-bold text-white mb-6">Filter by Category</h2>
        <nav className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full text-left px-4 py-3 rounded-md transition-colors flex justify-between items-center ${
                selectedCategory === category.id
                  ? 'bg-gray-dark text-white'
                  : 'text-text-secondary hover:text-white hover:bg-gray-dark/50'
              }`}
            >
              <span>{category.name}</span>
              <span className="text-sm">{getFilteredCount(category.id)}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 bg-black">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl lg:text-5xl font-black text-white">
                  {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
                </h1>
                {searchQuery && (
                  <p className="text-primary mt-2">
                    Searching for: "{searchQuery}"
                  </p>
                )}
              </div>
              
              {/* Mobile filter button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 bg-gray-dark text-white px-4 py-2 rounded-full hover:bg-gray transition-colors"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>
            
            <p className="text-text-secondary">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              {searchQuery && ' found'}
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  onClick={() => handleProductClick(product)}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  className="group relative bg-card rounded-lg p-4 transition-all duration-300 hover:bg-card-hover cursor-pointer"
                >
                  {/* Product Image */}
                  <div className="relative mb-4 aspect-square overflow-hidden rounded-md bg-gray-dark">
                    {product.imageUrl && (
                      <MediaPlaceholder kind="image" />
                    )}
                    
                    {/* Hover Actions with Feedback */}
                    <ProductHoverActions 
                      product={product}
                      isHovered={hoveredProduct === product.id}
                      onProductClick={() => handleProductClick(product)}
                    />
                  </div>

                  {/* Product Info */}
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1 line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-primary font-bold">${product.price}</p>
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
          <div className="fixed right-0 top-0 h-full w-80 bg-black border-l border-border p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-white">Filter by Category</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-dark rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
            
            <nav className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setShowMobileFilters(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors flex justify-between items-center ${
                    selectedCategory === category.id
                      ? 'bg-gray-dark text-white'
                      : 'text-text-secondary hover:text-white hover:bg-gray-dark/50'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-sm">{getFilteredCount(category.id)}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal 
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={handleCloseModal}
        onCartClick={onCartClick}
      />
    </div>
  );
};

export default Shop;