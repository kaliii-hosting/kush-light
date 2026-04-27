import { useState, useEffect } from 'react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { realtimeDb } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import AdminHeader from './AdminHeader';
import GradientLoader from './GradientLoader';
import { LogOut, Package, Plus, BarChart3, Database } from 'lucide-react';
import { seedFirebaseProducts } from '../../utils/seedFirebase';
import ParticleBackground from './ParticleBackground';

const AdminDashboard = () => {
  // Initialize with cached data if available
  const getCachedProducts = () => {
    try {
      const localProducts = localStorage.getItem('localProducts');
      if (localProducts) {
        return JSON.parse(localProducts);
      }
    } catch (e) {
      console.error('Error reading cached products:', e);
    }
    return [];
  };

  const [products, setProducts] = useState(getCachedProducts());
  const [loading, setLoading] = useState(false); // Start with false if we have cached data
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isUsingFirebase, setIsUsingFirebase] = useState(false);
  const navigate = useNavigate();

  // Check auth state
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin/login');
    } else {
      fetchProducts();
    }
  }, [navigate]);

  // Fetch products from Firebase Realtime Database or localStorage
  const fetchProducts = () => {
    // Only show loading if we don't have cached products
    if (products.length === 0) {
      setLoading(true);
    }
    
    // Delay Firebase connection to let UI render first
    setTimeout(() => {
      try {
        const productsRef = ref(realtimeDb, 'products');
      
      // Set up real-time listener
      const unsubscribe = onValue(productsRef, 
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Convert object to array with IDs
            const productsArray = Object.entries(data).map(([id, product]) => ({
              id,
              ...product
            }));
            setProducts(productsArray);
            setIsUsingFirebase(true);
            // Store in localStorage as backup
            localStorage.setItem('localProducts', JSON.stringify(productsArray));
          } else {
            // No data in Firebase, use local storage
            loadLocalProducts();
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching products from Firebase:', error);
          loadLocalProducts();
          setLoading(false);
        }
      );

        // Cleanup function
        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up Firebase listener:', error);
        loadLocalProducts();
        setLoading(false);
      }
    }, 100); // 100ms delay to let UI render first
  };

  // Load products from localStorage
  const loadLocalProducts = () => {
    const localProducts = localStorage.getItem('localProducts');
    if (localProducts) {
      setProducts(JSON.parse(localProducts));
    } else {
      // Use default products if no local data
      const defaultProducts = [
        {
          id: Date.now().toString(),
          name: "Sample Flower",
          type: "flower",
          price: 45,
          thc: "22%",
          description: "Sample product - Add your own products!",
          effects: ["Relaxed", "Happy"],
          imageUrl: "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f33f.svg",
          inStock: true
        }
      ];
      setProducts(defaultProducts);
      localStorage.setItem('localProducts', JSON.stringify(defaultProducts));
    }
  };

  // Add new product
  const handleAddProduct = async (productData) => {
    const newProduct = {
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      // Try to add to Firebase
      const productsRef = ref(realtimeDb, 'products');
      await push(productsRef, newProduct);
      setShowForm(false);
      setSuccessMessage('Product added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding product to Firebase:', error);
      
      // Fallback to localStorage
      const localProducts = localStorage.getItem('localProducts');
      const products = localProducts ? JSON.parse(localProducts) : [];
      const productWithId = { ...newProduct, id: Date.now().toString() };
      products.push(productWithId);
      localStorage.setItem('localProducts', JSON.stringify(products));
      setProducts(products);
      setShowForm(false);
      setSuccessMessage('Product added successfully (stored locally)!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Update product
  const handleUpdateProduct = async (productId, productData) => {
    const updatedData = {
      ...productData,
      updatedAt: new Date().toISOString()
    };

    try {
      // Try to update in Firebase
      const productRef = ref(realtimeDb, `products/${productId}`);
      await update(productRef, updatedData);
      setEditingProduct(null);
      setShowForm(false);
      setSuccessMessage('Product updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating product in Firebase:', error);
      
      // Fallback to localStorage
      const localProducts = localStorage.getItem('localProducts');
      const products = localProducts ? JSON.parse(localProducts) : [];
      const updatedProducts = products.map(p => 
        p.id === productId ? { ...p, ...updatedData } : p
      );
      localStorage.setItem('localProducts', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      setEditingProduct(null);
      setShowForm(false);
      setSuccessMessage('Product updated successfully (stored locally)!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Try to delete from Firebase
        const productRef = ref(realtimeDb, `products/${productId}`);
        await remove(productRef);
        setSuccessMessage('Product deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting product from Firebase:', error);
        
        // Fallback to localStorage
        const localProducts = localStorage.getItem('localProducts');
        const products = localProducts ? JSON.parse(localProducts) : [];
        const filteredProducts = products.filter(p => p.id !== productId);
        localStorage.setItem('localProducts', JSON.stringify(filteredProducts));
        setProducts(filteredProducts);
        setSuccessMessage('Product deleted successfully (stored locally)!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
  };

  // Seed database with sample products
  const handleSeedDatabase = async () => {
    if (window.confirm('This will add sample products to Firebase. Continue?')) {
      const success = await seedFirebaseProducts();
      if (success) {
        setSuccessMessage('Database seeded with sample products!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert('Failed to seed database. Check console for errors.');
      }
    }
  };

  // Calculate stats for all categories
  const stats = {
    total: products.length,
    flower: products.filter(p => p.type === 'flower').length,
    edible: products.filter(p => p.type === 'edible').length,
    concentrate: products.filter(p => p.type === 'concentrate').length,
    cartridge: products.filter(p => p.type === 'cartridge').length,
    disposable: products.filter(p => p.type === 'disposable').length,
    preroll: products.filter(p => p.type === 'preroll').length,
    infusedPreroll: products.filter(p => p.type === 'infused-preroll' || p.type === 'hash-infused-preroll' || p.type === 'infused-preroll-5pack').length,
    vaporizers: products.filter(p => p.type === 'cartridge' || p.type === 'disposable' || p.type === 'pod' || p.type === 'battery').length,
    other: products.filter(p => p.type === 'merch' || p.type === 'distillate' || p.type === 'liquid-diamonds' || p.type === 'live-resin-diamonds').length,
  };

  if (loading) {
    return <GradientLoader />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <AdminHeader 
        onLogout={handleLogout}
      />
      
      {/* Main Container with padding for header */}
      <div className="pt-16 min-h-screen" style={{ backgroundColor: '#121212' }}>
        {/* Page Header */}
        <header className="border-b" style={{ backgroundColor: '#181818', borderColor: '#282828' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-green-400" />
              <h1 className="text-xl font-bold text-white">Local Inventory Management</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}
        
        {/* Firebase Notice */}
        {!isUsingFirebase && (
          <div className="mb-4 bg-yellow-500/20 border border-yellow-500 text-yellow-400 px-4 py-3 rounded-lg">
            <p className="font-semibold">Notice: Using Local Storage</p>
            <p className="text-sm mt-1">
              Firebase connection not established. Products are being stored locally in your browser. 
              Check your Firebase Realtime Database configuration.
            </p>
          </div>
        )}
        
        {/* Stats with Animated Particle Backgrounds */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="relative rounded-lg p-4 overflow-hidden min-h-[100px]">
            <ParticleBackground hue={200} />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs font-medium">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <BarChart3 className="w-6 h-6 text-white/70" />
            </div>
          </div>
          <div className="relative rounded-lg p-4 overflow-hidden min-h-[100px]">
            <ParticleBackground hue={120} />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs font-medium">Flower</p>
                <p className="text-2xl font-bold text-green-300">{stats.flower}</p>
              </div>
              <Package className="w-6 h-6 text-green-300/70" />
            </div>
          </div>
          <div className="relative rounded-lg p-4 overflow-hidden min-h-[100px]">
            <ParticleBackground hue={30} />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs font-medium">Prerolls</p>
                <p className="text-2xl font-bold text-orange-300">{stats.preroll}</p>
              </div>
              <Package className="w-6 h-6 text-orange-300/70" />
            </div>
          </div>
          <div className="relative rounded-lg p-4 overflow-hidden min-h-[100px]">
            <ParticleBackground hue={280} />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs font-medium">Infused</p>
                <p className="text-2xl font-bold text-purple-300">{stats.infusedPreroll}</p>
              </div>
              <Package className="w-6 h-6 text-purple-300/70" />
            </div>
          </div>
          <div className="relative rounded-lg p-4 overflow-hidden min-h-[100px]">
            <ParticleBackground hue={220} />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs font-medium">Vaporizers</p>
                <p className="text-2xl font-bold text-blue-300">{stats.vaporizers}</p>
              </div>
              <Package className="w-6 h-6 text-blue-300/70" />
            </div>
          </div>
          <div className="relative rounded-lg p-4 overflow-hidden min-h-[100px]">
            <ParticleBackground hue={0} />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs font-medium">Other</p>
                <p className="text-2xl font-bold text-red-300">{stats.other}</p>
              </div>
              <Package className="w-6 h-6 text-red-300/70" />
            </div>
          </div>
        </div>

        {/* Info Notice */}
        <div className="mb-6 bg-blue-500/20 border border-blue-500 text-blue-400 px-4 py-3 rounded-lg">
          <p className="font-semibold">Local Inventory Products</p>
          <p className="text-sm mt-1">
            These products are displayed in the "Local Inventory" section at the bottom of the Wholesale page. 
            They are separate from your Shopify products which appear in the main Shop page.
          </p>
        </div>

        {/* Add Product Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Local Products Inventory</h2>
          <div className="flex gap-2">
            {products.length === 0 && (
              <button
                onClick={handleSeedDatabase}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Database size={20} />
                Seed Database
              </button>
            )}
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <ProductForm
            product={editingProduct}
            onSubmit={editingProduct 
              ? (data) => handleUpdateProduct(editingProduct.id, data)
              : handleAddProduct
            }
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        )}

        {/* Products List */}
        <ProductList
          products={products}
          onEdit={(product) => {
            setEditingProduct(product);
            setShowForm(true);
          }}
          onDelete={handleDeleteProduct}
        />
      </main>
      </div>
    </div>
  );
};

export default AdminDashboard;