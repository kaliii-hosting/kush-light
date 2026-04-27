import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState } from 'react';
import { X, Package, Save } from 'lucide-react';

const ProductForm = ({ product, onSubmit, onCancel, isDropdown = false, isCompact = false }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || product?.type || 'flower',
    strain: product?.strain || '',
    strainInformation: product?.strainInformation || '',
    flavor: product?.flavor || '',
    thc: product?.thc || '',
    cbd: product?.cbd || '',
    price: product?.price || '',
    packageSize: product?.packageSize || '',
    imageUrl: product?.imageUrl || '',
    inStock: product?.inStock !== false,
    minimumOrder: product?.minimumOrder || 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      minimumOrder: parseInt(formData.minimumOrder) || 1,
      inStock: formData.inStock
    };

    console.log('ProductForm: Submitting product data:', productData);
    onSubmit(productData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const inputClass = "w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary";
  const selectClass = "w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white focus:outline-none focus:border-primary";
  const labelClass = "px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider";

  const formContent = (
    <div className="bg-card rounded-lg overflow-hidden border border-gray-700">
      {/* Table Header */}
      <div className="bg-gray-dark">
        <div className="grid grid-cols-12 gap-4 px-4 py-3">
          <div className="col-span-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Product Info</div>
          <div className="col-span-2 text-xs font-medium text-gray-300 uppercase tracking-wider">Category</div>
          <div className="col-span-1 text-xs font-medium text-gray-300 uppercase tracking-wider">Price</div>
          <div className="col-span-2 text-xs font-medium text-gray-300 uppercase tracking-wider">THC / CBD</div>
          <div className="col-span-2 text-xs font-medium text-gray-300 uppercase tracking-wider">Min Order</div>
          <div className="col-span-2 text-xs font-medium text-gray-300 uppercase tracking-wider">Status</div>
        </div>
      </div>

      {/* Table Row - Main Fields */}
      <div className="divide-y divide-border">
        <div className="grid grid-cols-12 gap-4 px-4 py-4 items-center">
          {/* Product Name & Image */}
          <div className="col-span-3">
            <div className="flex items-center gap-3">
              {formData.imageUrl ? (
                <MediaPlaceholder kind="image" />
              ) : (
                <div className="w-12 h-12 bg-gray-dark rounded flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-600" />
                </div>
              )}
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Product name *"
              />
            </div>
          </div>

          {/* Category */}
          <div className="col-span-2">
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={selectClass}
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
              <option value="hemp-preroll">Hemp Prerolls</option>
              <option value="merch">Merch</option>
              <option value="distillate">Distillate</option>
              <option value="liquid-diamonds">Liquid Diamonds</option>
              <option value="live-resin-diamonds">Sample Material Diamonds</option>
              <option value="hash-infused-preroll">Hash Infused Prerolls</option>
              <option value="infused-preroll-5pack">Infused Prerolls - 5 Pack</option>
            </select>
          </div>

          {/* Price */}
          <div className="col-span-1">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className={inputClass}
              placeholder="$0.00"
            />
          </div>

          {/* THC / CBD */}
          <div className="col-span-2">
            <div className="flex gap-2">
              <input
                type="text"
                name="thc"
                value={formData.thc}
                onChange={handleChange}
                placeholder="THC %"
                className={inputClass}
              />
              <input
                type="text"
                name="cbd"
                value={formData.cbd}
                onChange={handleChange}
                placeholder="CBD %"
                className={inputClass}
              />
            </div>
          </div>

          {/* Min Order */}
          <div className="col-span-2">
            <input
              type="number"
              name="minimumOrder"
              value={formData.minimumOrder}
              onChange={handleChange}
              min="1"
              className={inputClass}
              placeholder="Min units"
            />
          </div>

          {/* Status */}
          <div className="col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 bg-gray-dark border-gray-600 rounded focus:ring-green-500"
              />
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${formData.inStock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {formData.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </label>
          </div>
        </div>

        {/* Second Row - Additional Details */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-12 gap-4">
            {/* Strain */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Strain</label>
              <input
                type="text"
                name="strain"
                value={formData.strain}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g., OG Brand"
              />
            </div>

            {/* Flavor */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Flavor</label>
              <input
                type="text"
                name="flavor"
                value={formData.flavor}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g., Citrus, Pine"
              />
            </div>

            {/* Package Size */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Package Size</label>
              <input
                type="text"
                name="packageSize"
                value={formData.packageSize}
                onChange={handleChange}
                placeholder="e.g., 3.5g"
                className={inputClass}
              />
            </div>

            {/* Image URL */}
            <div className="col-span-6">
              <label className="block text-xs font-medium text-gray-400 mb-1">Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/product.png"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Third Row - Description */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className={`${inputClass} resize-none`}
                placeholder="Enter product description"
              />
            </div>
            <div className="col-span-6">
              <label className="block text-xs font-medium text-gray-400 mb-1">Strain Information</label>
              <textarea
                name="strainInformation"
                value={formData.strainInformation}
                onChange={handleChange}
                rows="2"
                className={`${inputClass} resize-none`}
                placeholder="Details about the strain (effects, lineage, etc.)"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="px-4 py-4 bg-gray-dark/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 bg-gray-dark border border-border rounded-lg text-white hover:bg-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Save className="h-4 w-4" />
            {product ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );

  return isDropdown ? (
    <form onSubmit={handleSubmit}>
      {formContent}
    </form>
  ) : (
    <form onSubmit={handleSubmit} className="w-full">
      {formContent}
    </form>
  );
};

export default ProductForm;
