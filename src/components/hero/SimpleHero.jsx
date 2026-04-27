import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductsContext';
import { ChevronRight, Star, ShoppingBag } from 'lucide-react';

const SimpleHero = () => {
  const { products } = useProducts();
  
  // Get featured products (first 3)
  const featuredProducts = products.slice(0, 3);

  return (
    <section className="relative min-h-screen bg-black pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-24 lg:py-32">
          {/* Hero content */}
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
              Premium Sample
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Delivered with Care
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
              Discover our curated selection of high-quality Sample products. 
              From flowers to edibles, we have everything you need.
            </p>
            
            {/* CTA buttons */}
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-gray-100"
              >
                <ShoppingBag className="h-5 w-5" />
                Shop Now
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/wholesale"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                Wholesale Inquiry
              </Link>
            </div>
          </div>

          {/* Featured products */}
          {featuredProducts.length > 0 && (
            <div className="mt-24">
              <h2 className="text-center text-2xl font-semibold text-white mb-12">
                Featured Products
              </h2>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20"
                  >
                    {/* Product image */}
                    {product.imageUrl && (
                      <div className="aspect-w-1 aspect-h-1 overflow-hidden bg-white/5">
                        <MediaPlaceholder kind="image" />
                      </div>
                    )}
                    
                    {/* Product info */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-white">
                        {product.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                        {product.description}
                      </p>
                      
                      {/* Price and rating */}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-2xl font-bold text-white">
                          ${product.price}
                        </span>
                        {product.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-400">
                              {product.rating}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* View product button */}
                      <Link
                        to="/shop"
                        className="mt-4 block w-full rounded-lg bg-white/10 py-2 text-center text-sm font-medium text-white transition-all hover:bg-white/20"
                      >
                        View Product
                      </Link>
                    </div>
                    
                    {/* Stock badge */}
                    {product.inStock === false && (
                      <div className="absolute top-4 right-4 rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400 backdrop-blur-sm">
                        Out of Stock
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* View all products link */}
              <div className="mt-12 text-center">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
                >
                  View all products
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
};

export default SimpleHero;