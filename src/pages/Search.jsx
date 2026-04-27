import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState } from 'react';
import { useProducts } from '../context/ProductsContext';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const Search = () => {
  const { products } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');

  // Browse categories
  const categories = [
    { name: 'Flowers', color: 'from-primary to-primary-dark' },
    { name: 'Edible', color: 'from-primary/90 to-primary-dark/90' },
    { name: 'Concentrate', color: 'from-primary/80 to-primary-dark/80' },
    { name: 'Vapes', color: 'from-primary/70 to-primary-dark/70' },
    { name: 'Sample Items', color: 'from-primary/60 to-primary-dark/60' },
    { name: 'Accessories', color: 'from-primary/50 to-primary-dark/50' },
  ];

  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Browse all section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Browse all</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to="/shop"
              className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${category.color} p-6 h-48 flex items-end hover:scale-105 transition-transform cursor-pointer`}
            >
              <h3 className="text-2xl font-bold text-white">{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Search results */}
      {searchQuery && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {filteredProducts.length > 0 
              ? `Results for "${searchQuery}"` 
              : `No results found for "${searchQuery}"`
            }
          </h2>
          
          {filteredProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to="/shop"
                  className="bg-card p-4 rounded-md hover:bg-card-hover transition-all group cursor-pointer"
                >
                  <div className="relative mb-4">
                    <div className="aspect-square bg-gray-dark rounded-md overflow-hidden">
                      {product.imageUrl && (
                        <MediaPlaceholder kind="image" />
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <button className="bg-primary rounded-full p-3 shadow-xl hover:bg-primary-hover hover:scale-105 transition-all">
                        <Play className="h-5 w-5 text-white fill-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-white text-sm truncate mb-1">{product.name}</h3>
                    <p className="text-sm text-text-secondary truncate">${product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;