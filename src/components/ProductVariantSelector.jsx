import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

const ProductVariantSelector = ({ product, onVariantSelect, selectedVariant }) => {
  const [selectedOptions, setSelectedOptions] = useState({});

  // Initialize selected options based on selected variant
  useEffect(() => {
    if (selectedVariant && selectedVariant.selectedOptions) {
      const options = {};
      selectedVariant.selectedOptions.forEach(option => {
        options[option.name] = option.value.value || option.value;
      });
      setSelectedOptions(options);
    } else if (product.variants && product.variants.length > 0) {
      // Select first variant by default
      const firstVariant = product.variants[0];
      const options = {};
      firstVariant.selectedOptions?.forEach(option => {
        options[option.name] = option.value.value || option.value;
      });
      setSelectedOptions(options);
      onVariantSelect(firstVariant);
    }
  }, [product, selectedVariant]);

  const handleOptionChange = (optionName, optionValue) => {
    const newSelectedOptions = {
      ...selectedOptions,
      [optionName]: optionValue
    };
    setSelectedOptions(newSelectedOptions);

    // Find matching variant
    const matchingVariant = product.variants.find(variant => {
      return variant.selectedOptions.every(option => {
        const value = option.value.value || option.value;
        return newSelectedOptions[option.name] === value;
      });
    });

    if (matchingVariant) {
      onVariantSelect(matchingVariant);
    }
  };

  // Don't show selector if only one variant with title "Default Title"
  if (product.variants.length === 1 && product.variants[0].title === 'Default Title') {
    return null;
  }

  return (
    <div className="space-y-4">
      {product.options.map(option => (
        <div key={option.id} className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            {option.name}
          </label>
          
          {/* Style selector for Size/Color */}
          {option.name.toLowerCase() === 'size' ? (
            <div className="flex flex-wrap gap-2">
              {option.values.map(value => {
                const isSelected = selectedOptions[option.name] === value;
                const variant = product.variants.find(v => 
                  v.selectedOptions.some(opt => 
                    opt.name === option.name && (opt.value.value || opt.value) === value
                  )
                );
                const isAvailable = variant?.available;

                return (
                  <button
                    key={value}
                    onClick={() => handleOptionChange(option.name, value)}
                    disabled={!isAvailable}
                    className={`
                      px-4 py-2 rounded-lg border-2 font-medium transition-all
                      ${isSelected 
                        ? 'border-primary bg-primary text-white' 
                        : 'border-gray-600 text-gray-300 hover:border-gray-400'
                      }
                      ${!isAvailable ? 'opacity-50 cursor-not-allowed line-through' : ''}
                    `}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          ) : option.name.toLowerCase() === 'color' ? (
            <div className="flex flex-wrap gap-3">
              {option.values.map(value => {
                const isSelected = selectedOptions[option.name] === value;
                const variant = product.variants.find(v => 
                  v.selectedOptions.some(opt => 
                    opt.name === option.name && (opt.value.value || opt.value) === value
                  )
                );
                const isAvailable = variant?.available;

                return (
                  <button
                    key={value}
                    onClick={() => handleOptionChange(option.name, value)}
                    disabled={!isAvailable}
                    className={`
                      relative w-12 h-12 rounded-full border-2 transition-all
                      ${isSelected ? 'border-primary scale-110' : 'border-gray-600'}
                      ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    title={value}
                  >
                    <span className="sr-only">{value}</span>
                    {/* You can add color swatches here based on value */}
                    <div 
                      className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center text-xs"
                      style={{
                        backgroundColor: value.toLowerCase() === 'black' ? '#000' :
                                       value.toLowerCase() === 'white' ? '#fff' :
                                       value.toLowerCase() === 'gold' ? '#FFD700' :
                                       value.toLowerCase() === 'silver' ? '#C0C0C0' :
                                       '#666'
                      }}
                    >
                      {isSelected && (
                        <Check className="h-6 w-6 text-white drop-shadow-lg" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            // Default dropdown for other options
            <select
              value={selectedOptions[option.name] || ''}
              onChange={(e) => handleOptionChange(option.name, e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-primary focus:outline-none"
            >
              <option value="">Select {option.name}</option>
              {option.values.map(value => {
                const variant = product.variants.find(v => 
                  v.selectedOptions.some(opt => 
                    opt.name === option.name && (opt.value.value || opt.value) === value
                  )
                );
                const isAvailable = variant?.available;

                return (
                  <option 
                    key={value} 
                    value={value}
                    disabled={!isAvailable}
                  >
                    {value} {!isAvailable && '(Out of Stock)'}
                  </option>
                );
              })}
            </select>
          )}
        </div>
      ))}

      {/* Show selected variant info */}
      {selectedVariant && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Selected:</span>
            <span className="text-sm font-medium text-white">
              {selectedVariant.title !== 'Default Title' && selectedVariant.title}
            </span>
          </div>
          {selectedVariant.sku && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-gray-400">SKU:</span>
              <span className="text-sm text-gray-300">{selectedVariant.sku}</span>
            </div>
          )}
          {!selectedVariant.available && (
            <p className="text-red-400 text-sm mt-2">This variant is out of stock</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;