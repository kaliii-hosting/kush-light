import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { Edit2, Trash2, Package, DollarSign, Beaker, Eye } from 'lucide-react';

const ProductList = ({ products, onEdit, onDelete }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No products found</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-2">
        {products.map((product) => (
          <div key={product.id} className="bg-card rounded-lg p-3 border border-gray-700">
            <div className="flex items-start gap-3 mb-3">
              {product.imageUrl ? (
                <MediaPlaceholder kind="image" />
              ) : (
                <div className="w-16 h-16 bg-gray-dark rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-8 w-8 text-gray-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{product.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {product.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div>
                <span className="text-gray-400">Category:</span>
                <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                  product.category === 'flower'
                    ? 'bg-green-500/20 text-green-400'
                    : product.category === 'edible'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {product.category}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Price:</span>
                <span className="ml-2 text-primary font-bold">${product.price}</span>
              </div>
              <div>
                <span className="text-gray-400">Min Order:</span>
                <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                  product.minimumOrder && product.minimumOrder > 1
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {product.minimumOrder || 1} units
                </span>
              </div>
              <div>
                <span className="text-gray-400">THC:</span>
                <span className="ml-2 text-white">{product.thc || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">Status:</span>
                <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                  product.inStock
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => onEdit(product)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-dark rounded-lg transition-colors"
                title="Edit Product"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete Product"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View - Matching Invoice Table Style */}
      <div className="hidden sm:block bg-card rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Min Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  THC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-dark/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <MediaPlaceholder kind="image" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-dark rounded flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {product.description?.substring(0, 50)}{product.description?.length > 50 ? '...' : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Package className="h-4 w-4" />
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.category === 'flower'
                          ? 'bg-green-500/20 text-green-400'
                          : product.category === 'edible'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : product.category === 'concentrate'
                          ? 'bg-purple-500/20 text-purple-400'
                          : product.category === 'cartridge'
                          ? 'bg-blue-500/20 text-blue-400'
                          : product.category === 'disposable'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : product.category === 'preroll'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {product.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.minimumOrder && product.minimumOrder > 1
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {product.minimumOrder || 1} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-primary">
                      ${product.price}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Beaker className="h-4 w-4" />
                      {product.thc || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.inStock
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(product)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-dark rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ProductList;
