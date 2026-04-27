import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

const ProductFormInline = ({ product, onSubmit, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    type: product?.type || 'flower',
    price: product?.price || '',
    thc: product?.thc || '',
    description: product?.description || '',
    effects: product?.effects ? product.effects.join(', ') : '',
    imageUrl: product?.imageUrl || '',
    inStock: product?.inStock !== false,
    isWholesale: product?.isWholesale || false,
    wholesalePrice: product?.wholesalePrice || '',
    category: product?.category || product?.type || 'flower'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      effects: formData.effects.split(',').map(effect => effect.trim()).filter(effect => effect),
      inStock: formData.inStock,
      isWholesale: formData.isWholesale,
      wholesalePrice: formData.isWholesale && formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : null,
      category: formData.category || formData.type
    };

    console.log('ProductFormInline: Submitting product data:', productData);
    onSubmit(productData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="mb-6 animate-slideDown">
      <div className="bg-spotify-light-gray rounded-lg">
        <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="flower">Flower</option>
              <option value="edible">Edible</option>
              <option value="concentrate">Concentrate</option>
              <option value="cartridge">Cartridges</option>
              <option value="disposable">Disposables</option>
              <option value="pod">Pods</option>
              <option value="battery">Batteries</option>
              <option value="infused-preroll">Infused Prerolls</option>
              <option value="preroll">Prerolls</option>
              <option value="merch">Merch</option>
              <option value="distillate">Distillate</option>
              <option value="liquid-diamonds">Liquid Diamonds</option>
              <option value="live-resin-diamonds">Sample Material Diamonds</option>
              <option value="hash-infused-preroll">Hash Infused Prerolls</option>
              <option value="infused-preroll-5pack">Infused Prerolls - 5 Pack</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
          </div>

          {/* THC */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              THC %
            </label>
            <input
              type="text"
              name="thc"
              value={formData.thc}
              onChange={handleChange}
              placeholder="e.g., 25%"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Effects */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Effects
            </label>
            <input
              type="text"
              name="effects"
              value={formData.effects}
              onChange={handleChange}
              placeholder="Relaxed, Happy, Euphoric"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
            <p className="text-xs text-gray-400 mt-1">Separate with commas</p>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Image URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/product.png"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Use transparent PNG images for best results in 3D display
            </p>
            {formData.imageUrl && (
              <div className="mt-2 p-2 bg-gray-800 rounded-lg">
                <MediaPlaceholder kind="image" />
              </div>
            )}
          </div>

          {/* Checkboxes Row */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Wholesale Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isWholesale"
                checked={formData.isWholesale}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
              />
              <label className="ml-2 text-sm text-gray-300">
                Available for Wholesale
              </label>
            </div>

            {/* In Stock Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
              />
              <label className="ml-2 text-sm text-gray-300">
                In Stock
              </label>
            </div>
          </div>

          {/* Wholesale Price (conditional) */}
          {formData.isWholesale && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Wholesale Price ($)
              </label>
              <input
                type="number"
                name="wholesalePrice"
                value={formData.wholesalePrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="md:col-span-2 flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors font-medium"
            >
              {product ? 'Update Product' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default ProductFormInline;