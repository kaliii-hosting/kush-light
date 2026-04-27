import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { realtimeDb } from '../../config/firebase';
import GradientLoader from './GradientLoader';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const CategoryDebuggerEnhanced = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    productsWithCategory: 0,
    productsWithType: 0,
    productsWithBoth: 0,
    productsWithNeither: 0,
    productsWithMismatch: 0
  });
  
  // Expected categories from ProductForm
  const expectedCategories = [
    'flower',
    'edible',
    'concentrate',
    'cartridge',
    'disposable',
    'pod',
    'battery',
    'infused-preroll',
    'preroll',
    'hemp-preroll',
    'merch',
    'distillate',
    'liquid-diamonds',
    'live-resin-diamonds',
    'hash-infused-preroll',
    'infused-preroll-5pack'
  ];

  useEffect(() => {
    setLoading(true);
    
    // Fetch all products from Firebase Realtime Database
    const productsRef = ref(realtimeDb, 'products');
    
    const unsubscribe = onValue(productsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const products = [];
        
        if (data) {
          // Convert object to array with IDs
          Object.entries(data).forEach(([id, product]) => {
            products.push({
              id,
              ...product
            });
          });
        }
        
        // Analyze data
        const categoryMap = new Map();
        const typeMap = new Map();
        const mismatchedProducts = [];
        
        let productsWithCategory = 0;
        let productsWithType = 0;
        let productsWithBoth = 0;
        let productsWithNeither = 0;
        
        products.forEach(product => {
          const hasCategory = !!product.category;
          const hasType = !!product.type;
          
          if (hasCategory) productsWithCategory++;
          if (hasType) productsWithType++;
          if (hasCategory && hasType) productsWithBoth++;
          if (!hasCategory && !hasType) productsWithNeither++;
          
          // Track mismatches
          if (hasCategory && hasType && product.category !== product.type) {
            mismatchedProducts.push({
              name: product.name,
              category: product.category,
              type: product.type
            });
          }
          
          // Track categories
          const category = product.category || '(no category)';
          if (!categoryMap.has(category)) {
            categoryMap.set(category, {
              value: category,
              count: 0,
              sampleProducts: [],
              isExpected: expectedCategories.includes(category)
            });
          }
          const categoryInfo = categoryMap.get(category);
          categoryInfo.count++;
          if (categoryInfo.sampleProducts.length < 3) {
            categoryInfo.sampleProducts.push({
              name: product.name,
              hasType: hasType,
              typeValue: product.type
            });
          }
          
          // Track types
          if (hasType) {
            if (!typeMap.has(product.type)) {
              typeMap.set(product.type, {
                value: product.type,
                count: 0,
                sampleProducts: [],
                isExpected: expectedCategories.includes(product.type)
              });
            }
            const typeInfo = typeMap.get(product.type);
            typeInfo.count++;
            if (typeInfo.sampleProducts.length < 3) {
              typeInfo.sampleProducts.push({
                name: product.name,
                hasCategory: hasCategory,
                categoryValue: product.category
              });
            }
          }
        });
        
        // Set state
        setStats({
          totalProducts: products.length,
          productsWithCategory,
          productsWithType,
          productsWithBoth,
          productsWithNeither,
          productsWithMismatch: mismatchedProducts.length
        });
        
        setCategoryData(Array.from(categoryMap.values()).sort((a, b) => {
          if (a.isExpected !== b.isExpected) return a.isExpected ? 1 : -1;
          return b.count - a.count;
        }));
        
        setTypeData(Array.from(typeMap.values()).sort((a, b) => {
          if (a.isExpected !== b.isExpected) return a.isExpected ? 1 : -1;
          return b.count - a.count;
        }));
        
        // Log detailed analysis
        console.log('=== ENHANCED CATEGORY/TYPE ANALYSIS ===');
        console.log('Total products:', products.length);
        console.log('\n--- Field Usage ---');
        console.log('Products with category field:', productsWithCategory);
        console.log('Products with type field:', productsWithType);
        console.log('Products with BOTH fields:', productsWithBoth);
        console.log('Products with NEITHER field:', productsWithNeither);
        console.log('Products with MISMATCHED values:', mismatchedProducts.length);
        
        if (mismatchedProducts.length > 0) {
          console.log('\n--- Mismatched Products ---');
          mismatchedProducts.forEach(p => {
            console.log(`${p.name}: category="${p.category}", type="${p.type}"`);
          });
        }
        
        console.log('\n--- Category Values ---');
        Array.from(categoryMap.entries()).forEach(([key, value]) => {
          console.log(`"${key}": ${value.count} products`);
        });
        
        console.log('\n--- Type Values ---');
        Array.from(typeMap.entries()).forEach(([key, value]) => {
          console.log(`"${key}": ${value.count} products`);
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error processing data:', error);
        setLoading(false);
      }
    }, (error) => {
      console.error('Error fetching data:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <GradientLoader />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-white mb-6">Enhanced Category/Type Debugger</h1>
      
      {/* Summary Stats */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Summary Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 p-4 rounded">
            <p className="text-gray-400 text-sm">Total Products</p>
            <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded">
            <p className="text-gray-400 text-sm">With Category</p>
            <p className="text-2xl font-bold text-green-400">{stats.productsWithCategory}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded">
            <p className="text-gray-400 text-sm">With Type</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.productsWithType}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded">
            <p className="text-gray-400 text-sm">With Both</p>
            <p className="text-2xl font-bold text-blue-400">{stats.productsWithBoth}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded">
            <p className="text-gray-400 text-sm">With Neither</p>
            <p className="text-2xl font-bold text-red-400">{stats.productsWithNeither}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded">
            <p className="text-gray-400 text-sm">Mismatched</p>
            <p className="text-2xl font-bold text-orange-400">{stats.productsWithMismatch}</p>
          </div>
        </div>
      </div>

      {/* Migration Recommendation */}
      {stats.productsWithType > stats.productsWithCategory && (
        <div className="bg-orange-900/50 border border-orange-600 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-400 mb-1">Migration Needed</h3>
              <p className="text-gray-300">
                {stats.productsWithType - stats.productsWithCategory} products are using the old 'type' field but not the new 'category' field.
                These products need to be migrated to use the 'category' field for proper categorization.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Analysis */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Category Field Analysis</h2>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-3 text-gray-300">Category Value</th>
                  <th className="text-center p-3 text-gray-300">Status</th>
                  <th className="text-center p-3 text-gray-300">Count</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((cat, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="p-3">
                      <span className={cat.isExpected ? 'text-green-400' : 'text-red-400'}>
                        {cat.value}
                      </span>
                      {cat.sampleProducts.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {cat.sampleProducts.map((p, i) => (
                            <div key={i}>
                              • {p.name} {p.hasType && <span className="text-yellow-500">(has type: {p.typeValue})</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="text-center p-3">
                      {cat.isExpected ? (
                        <CheckCircle className="h-5 w-5 text-green-400 inline" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 inline" />
                      )}
                    </td>
                    <td className="text-center p-3 text-white font-semibold">{cat.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Type Analysis */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Type Field Analysis (Legacy)</h2>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-3 text-gray-300">Type Value</th>
                  <th className="text-center p-3 text-gray-300">Valid?</th>
                  <th className="text-center p-3 text-gray-300">Count</th>
                </tr>
              </thead>
              <tbody>
                {typeData.map((type, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="p-3">
                      <span className={type.isExpected ? 'text-yellow-400' : 'text-orange-400'}>
                        {type.value}
                      </span>
                      {type.sampleProducts.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {type.sampleProducts.map((p, i) => (
                            <div key={i}>
                              • {p.name} {!p.hasCategory && <span className="text-red-500">(NO category)</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="text-center p-3">
                      {type.isExpected ? (
                        <CheckCircle className="h-5 w-5 text-yellow-400 inline" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-orange-400 inline" />
                      )}
                    </td>
                    <td className="text-center p-3 text-white font-semibold">{type.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Migration Button */}
      {stats.productsWithType > stats.productsWithCategory && (
        <div className="mt-8 text-center">
          <button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium">
            Migrate {stats.productsWithType - stats.productsWithCategory} Products from Type to Category
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryDebuggerEnhanced;