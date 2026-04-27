import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductsContext';
import { Play, Shuffle } from 'lucide-react';

const SpotifyHero = () => {
  const { products } = useProducts();
  
  // Get featured products (first 6 for grid layout)
  const featuredProducts = products.slice(0, 6);

  return (
    <section className="relative bg-gradient-to-b from-spotify-light-gray to-spotify-gray pt-24 pb-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Content */}
        <div className="py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl md:text-8xl">
              Premium Sample,
              <span className="block text-spotify-green">
                Delivered.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-spotify-text-subdued">
              Experience the finest selection of Sample products. 
              Quality you can trust, convenience you'll love.
            </p>
            
            {/* Spotify-style CTA buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-3 rounded-full bg-spotify-green px-8 py-4 text-lg font-bold text-black transition-all hover:bg-spotify-green-hover hover:scale-105"
              >
                <Play className="h-6 w-6 fill-black" />
                Start Shopping
              </Link>
              <Link
                to="/wholesale"
                className="inline-flex items-center gap-3 rounded-full border-2 border-white px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105"
              >
                <Shuffle className="h-6 w-6" />
                Explore Wholesale
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Products Section - Spotify Style */}
        <div className="py-12">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Popular Products</h2>
            <Link
              to="/shop"
              className="text-sm font-bold uppercase text-spotify-text-subdued transition-colors hover:text-white"
            >
              Show All
            </Link>
          </div>

          {/* Spotify-style product grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to="/shop"
                className="group relative overflow-hidden rounded-lg bg-spotify-card p-4 transition-all duration-300 hover:bg-spotify-card-hover"
              >
                {/* Product Image */}
                {product.imageUrl && (
                  <div className="relative mb-4 aspect-square overflow-hidden rounded-md bg-spotify-light-gray">
                    <MediaPlaceholder kind="image" />
                    {/* Play button overlay on hover */}
                    <div className="absolute bottom-2 right-2 translate-y-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-spotify-green shadow-xl transition-all hover:scale-110">
                        <Play className="h-6 w-6 fill-black text-black" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Product Info */}
                <div>
                  <h3 className="truncate text-base font-bold text-white">
                    {product.name}
                  </h3>
                  <p className="mt-1 truncate text-sm text-spotify-text-subdued">
                    ${product.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Additional Categories Section */}
        <div className="py-12">
          <h2 className="mb-8 text-2xl font-bold text-white">Browse by Category</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Flowers', className: 'bg-gradient-to-br from-purple-600 to-purple-900', href: '/shop' },
              { name: 'Edible', className: 'bg-gradient-to-br from-orange-600 to-orange-900', href: '/shop' },
              { name: 'Concentrate', className: 'bg-gradient-to-br from-yellow-600 to-yellow-900', href: '/shop' },
              { name: 'Accessories', className: 'bg-gradient-to-br from-green-600 to-green-900', href: '/shop' },
            ].map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className={`group relative overflow-hidden rounded-lg p-8 transition-all hover:scale-105 ${category.className}`}
              >
                <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                <div className="absolute bottom-4 right-4 translate-x-10 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                    <Play className="h-6 w-6 fill-white text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpotifyHero;