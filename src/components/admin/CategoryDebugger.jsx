import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { realtimeDb } from '../../config/firebase';
import GradientLoader from './GradientLoader';

const CategoryDebugger = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  
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
        
        setTotalProducts(products.length);
        
        // Group products by category
        const categoryMap = new Map();
        
        products.forEach(product => {
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
          
          // Keep first 3 products as samples
          if (categoryInfo.sampleProducts.length < 3) {
            categoryInfo.sampleProducts.push({
              id: product.id,
              name: product.name,
              type: product.type || '(no type)'
            });
          }
        });
        
        // Convert map to sorted array
        const sortedData = Array.from(categoryMap.values()).sort((a, b) => {
          // Sort unexpected categories first, then by count
          if (a.isExpected !== b.isExpected) {
            return a.isExpected ? 1 : -1;
          }
          return b.count - a.count;
        });
        
        setCategoryData(sortedData);
        
        // Log analysis
        console.log('=== Category Analysis ===');
        console.log('Total products:', products.length);
        console.log('Unique categories:', categoryMap.size);
        console.log('Expected categories found:', sortedData.filter(c => c.isExpected).length);
        console.log('Unexpected categories:', sortedData.filter(c => !c.isExpected).length);
        
        setLoading(false);
      } catch (error) {
        console.error('Error processing category data:', error);
        setLoading(false);
      }
    }, (error) => {
      console.error('Error fetching category data:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <GradientLoader />;
  }

  return (
    <div className="bg-black min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">Category Debugger</h1>
        <p className="text-gray-400 mb-8">
          Total Products in Database: <span className="text-white font-bold">{totalProducts}</span>
        </p>
        
        <div className="bg-spotify-light-gray rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-spotify-dark-gray">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Category Value
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Sample Products
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {categoryData.map((category, index) => (
                <tr key={index} className={!category.isExpected ? 'bg-red-950/20' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className={`text-sm ${!category.isExpected ? 'text-red-400' : 'text-green-400'}`}>
                      "{category.value}"
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.isExpected ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Expected
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Unexpected
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {category.count}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {category.sampleProducts.map((product, i) => (
                        <div key={i} className="text-sm text-gray-400">
                          • {product.name}
                          {product.type !== '(no type)' && product.type !== category.value && (
                            <span className="text-xs text-yellow-400 ml-2">
                              (type: "{product.type}")
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-spotify-light-gray rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Expected Categories</h2>
            <div className="space-y-2">
              {expectedCategories.map(cat => {
                const found = categoryData.find(c => c.value === cat);
                return (
                  <div key={cat} className="flex justify-between text-sm">
                    <code className="text-gray-400">"{cat}"</code>
                    {found ? (
                      <span className="text-green-400">{found.count} products</span>
                    ) : (
                      <span className="text-red-400">Not found</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-spotify-light-gray rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Products:</span>
                <span className="text-white">{totalProducts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Unique Categories:</span>
                <span className="text-white">{categoryData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Expected Categories:</span>
                <span className="text-green-400">{categoryData.filter(c => c.isExpected).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Unexpected Categories:</span>
                <span className="text-red-400">{categoryData.filter(c => !c.isExpected).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Products without category:</span>
                <span className="text-yellow-400">
                  {categoryData.find(c => c.value === '(no category)')?.count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-yellow-900/20 border border-yellow-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-yellow-400 mb-2">Notes</h3>
          <ul className="space-y-1 text-sm text-gray-300">
            <li>• Unexpected categories are highlighted in red and shown at the top</li>
            <li>• If a product has a 'type' field different from its 'category', it's shown in yellow</li>
            <li>• Products without a category field are grouped as "(no category)"</li>
            <li>• This tool helps identify mismatched category values between Firebase and the UI</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategoryDebugger;