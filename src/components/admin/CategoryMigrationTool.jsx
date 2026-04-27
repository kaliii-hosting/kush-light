import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { realtimeDb } from '../../config/firebase';
import GradientLoader from './GradientLoader';
import { AlertCircle, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';

const CategoryMigrationTool = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [migrationResults, setMigrationResults] = useState(null);
  
  // Category mapping - from incorrect values to correct values
  const categoryMapping = {
    // Fix case issues
    'Cartridge': 'cartridge',
    'Disposable': 'disposable',
    'Hemp Prerolls': 'hemp-preroll',
    'Batteries': 'battery',
    
    // Already correct lowercase values (just for reference)
    'disposable': 'disposable',
    'cartridge': 'cartridge',
    
    // Any other mappings based on your data
    'Flower': 'flower',
    'Edible': 'edible',
    'Concentrate': 'concentrate',
    'Pod': 'pod',
    'Pods': 'pod',
    'Battery': 'battery',
    'Infused Preroll': 'infused-preroll',
    'Infused Prerolls': 'infused-preroll',
    'Preroll': 'preroll',
    'Prerolls': 'preroll',
    'Hemp Preroll': 'hemp-preroll',
    'Merch': 'merch',
    'Distillate': 'distillate',
    'Liquid Diamonds': 'liquid-diamonds',
    'Sample Material Diamonds': 'live-resin-diamonds',
    'Hash Infused Preroll': 'hash-infused-preroll',
    'Hash Infused Prerolls': 'hash-infused-preroll',
    'Infused Preroll 5 Pack': 'infused-preroll-5pack',
    'Infused Prerolls 5 Pack': 'infused-preroll-5pack',
    'Infused Prerolls - 5 Pack': 'infused-preroll-5pack'
  };

  useEffect(() => {
    const fetchProducts = () => {
      setLoading(true);
      const productsRef = ref(realtimeDb, 'products');
      
      const unsubscribe = onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        const productsArray = [];
        
        if (data) {
          Object.entries(data).forEach(([id, product]) => {
            productsArray.push({
              id,
              ...product,
              needsMigration: false,
              newCategory: null
            });
          });
        }
        
        // Analyze which products need migration
        const analyzedProducts = productsArray.map(product => {
          const currentCategory = product.category || product.type;
          let needsMigration = false;
          let newCategory = currentCategory;
          
          // Check if category needs mapping
          if (currentCategory && categoryMapping[currentCategory]) {
            needsMigration = true;
            newCategory = categoryMapping[currentCategory];
          } else if (!currentCategory) {
            // No category at all
            needsMigration = true;
            newCategory = 'flower'; // Default category
          }
          
          // Also check if product has 'type' but no 'category'
          if (product.type && !product.category) {
            needsMigration = true;
            newCategory = categoryMapping[product.type] || product.type.toLowerCase();
          }
          
          return {
            ...product,
            currentCategory,
            needsMigration,
            newCategory: needsMigration ? newCategory : null
          };
        });
        
        setProducts(analyzedProducts);
        setLoading(false);
      });
      
      return () => unsubscribe();
    };
    
    fetchProducts();
  }, []);

  const performMigration = async () => {
    setMigrating(true);
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    try {
      const updates = {};
      const productsToMigrate = products.filter(p => p.needsMigration);
      
      for (const product of productsToMigrate) {
        try {
          // Update the category field
          updates[`products/${product.id}/category`] = product.newCategory;
          
          // Remove type field if it exists (optional - uncomment if you want to remove it)
          // if (product.type) {
          //   updates[`products/${product.id}/type`] = null;
          // }
          
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            productId: product.id,
            productName: product.name,
            error: error.message
          });
        }
      }
      
      // Perform batch update
      if (Object.keys(updates).length > 0) {
        await update(ref(realtimeDb), updates);
      }
      
      setMigrationResults(results);
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationResults({
        success: 0,
        failed: products.filter(p => p.needsMigration).length,
        errors: [{ error: error.message }]
      });
    } finally {
      setMigrating(false);
    }
  };

  const productsNeedingMigration = products.filter(p => p.needsMigration);
  const categoryCounts = products.reduce((acc, product) => {
    const cat = product.currentCategory || '(no category)';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return <GradientLoader />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Category Migration Tool</h1>
        <p className="text-gray-400">Fix inconsistent category values in your products database</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Total Products</p>
          <p className="text-2xl font-bold text-white">{products.length}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Need Migration</p>
          <p className="text-2xl font-bold text-orange-400">{productsNeedingMigration.length}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Already Correct</p>
          <p className="text-2xl font-bold text-green-400">{products.length - productsNeedingMigration.length}</p>
        </div>
      </div>

      {/* Current Category Distribution */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Current Category Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(categoryCounts).map(([category, count]) => (
            <div key={category} className="bg-gray-700 p-3 rounded">
              <p className="text-sm text-gray-400">{category}</p>
              <p className="text-lg font-semibold text-white">{count} products</p>
            </div>
          ))}
        </div>
      </div>

      {/* Migration Preview */}
      {productsNeedingMigration.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Migration Preview</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-2 text-gray-400">Product Name</th>
                  <th className="text-left p-2 text-gray-400">Current Category</th>
                  <th className="text-center p-2 text-gray-400"></th>
                  <th className="text-left p-2 text-gray-400">New Category</th>
                </tr>
              </thead>
              <tbody>
                {productsNeedingMigration.slice(0, 10).map((product) => (
                  <tr key={product.id} className="border-b border-gray-700">
                    <td className="p-2 text-white">{product.name}</td>
                    <td className="p-2">
                      <span className="text-red-400">{product.currentCategory || '(no category)'}</span>
                    </td>
                    <td className="p-2 text-center">
                      <ArrowRight className="h-4 w-4 text-gray-500 inline" />
                    </td>
                    <td className="p-2">
                      <span className="text-green-400">{product.newCategory}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {productsNeedingMigration.length > 10 && (
              <p className="text-gray-400 text-sm mt-2 text-center">
                ...and {productsNeedingMigration.length - 10} more products
              </p>
            )}
          </div>
        </div>
      )}

      {/* Migration Results */}
      {migrationResults && (
        <div className={`${migrationResults.failed > 0 ? 'bg-red-900/20' : 'bg-green-900/20'} border ${migrationResults.failed > 0 ? 'border-red-600' : 'border-green-600'} rounded-lg p-4`}>
          <div className="flex items-start gap-3">
            {migrationResults.failed > 0 ? (
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">Migration Complete</h3>
              <p className="text-gray-300">
                Successfully migrated: {migrationResults.success} products
              </p>
              {migrationResults.failed > 0 && (
                <p className="text-red-400">
                  Failed: {migrationResults.failed} products
                </p>
              )}
              {migrationResults.errors.length > 0 && (
                <div className="mt-2 text-sm text-red-300">
                  {migrationResults.errors.map((err, idx) => (
                    <div key={idx}>
                      {err.productName ? `${err.productName}: ` : ''}{err.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        {productsNeedingMigration.length > 0 && !migrationResults && (
          <button
            onClick={performMigration}
            disabled={migrating}
            className="bg-primary hover:bg-primary-hover disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
          >
            {migrating ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Migrate {productsNeedingMigration.length} Products
              </>
            )}
          </button>
        )}
        
        {migrationResults && migrationResults.success > 0 && (
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Refresh Page
          </button>
        )}
      </div>

      {productsNeedingMigration.length === 0 && !migrationResults && (
        <div className="bg-green-900/20 border border-green-600 rounded-lg p-4 text-center">
          <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <p className="text-green-400 font-semibold">All categories are properly formatted!</p>
          <p className="text-gray-400 text-sm mt-1">No migration needed.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryMigrationTool;