import { useState, useEffect, useRef } from 'react';
import { ref, onValue, push, update, remove, get } from 'firebase/database';
import { realtimeDb } from '../../config/firebase';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import GradientLoader from './GradientLoader';
import { Plus, Database, BarChart3, Package, Upload, FileSpreadsheet, X, Flower2, Cookie, Droplets, Battery, Zap, CircleDot, ShoppingBag, Sparkles, Cigarette, Leaf, Shirt, Beaker, Diamond, Gem, Hash, Layers, Search } from 'lucide-react';
import { seedFirebaseProducts } from '../../utils/seedFirebase';
import AdminToast from './AdminToast';
import * as XLSX from 'xlsx';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('dropdown'); // 'dropdown' or 'modal'
  const [editingProduct, setEditingProduct] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isUsingFirebase, setIsUsingFirebase] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const fileInputRef = useRef(null);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' ||
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.strain?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && editingProduct) {
        setEditingProduct(null);
        setShowForm(false);
      }
    };

    if (editingProduct) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [editingProduct]);

  // Fetch products from Firebase Realtime Database or localStorage
  const fetchProducts = () => {
    setLoading(true);
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
              ...product,
              // Ensure category field exists
              category: product.category || 'flower'
            }));
            setProducts(productsArray);
            setIsUsingFirebase(true);
            // Store in localStorage as backup
            localStorage.setItem('localProducts', JSON.stringify(productsArray));
            
            // Log for debugging
            console.log(`Loaded ${productsArray.length} products from Firebase`);
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
          category: "flower",
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
      setToast({ message: 'Product added successfully!', type: 'success' });
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
      setToast({ message: 'Product added successfully!', type: 'success' });
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
      setToast({ message: 'Product updated successfully!', type: 'success' });
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
      setToast({ message: 'Product updated successfully!', type: 'success' });
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Try to delete from Firebase
        const productRef = ref(realtimeDb, `products/${productId}`);
        await remove(productRef);
        setToast({ message: 'Product deleted successfully!', type: 'success' });
      } catch (error) {
        console.error('Error deleting product from Firebase:', error);

        // Fallback to localStorage
        const localProducts = localStorage.getItem('localProducts');
        const products = localProducts ? JSON.parse(localProducts) : [];
        const filteredProducts = products.filter(p => p.id !== productId);
        localStorage.setItem('localProducts', JSON.stringify(filteredProducts));
        setProducts(filteredProducts);
        setToast({ message: 'Product deleted successfully!', type: 'success' });
      }
    }
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

  // Migrate all products from 'type' to 'category'
  const migrateTypeToCategory = async () => {
    try {
      setSuccessMessage('Starting migration...');
      const productsRef = ref(realtimeDb, 'products');
      const snapshot = await get(productsRef);
      
      if (!snapshot.exists()) {
        setSuccessMessage('No products to migrate');
        return;
      }
      
      const updates = {};
      let migratedCount = 0;
      
      snapshot.forEach((childSnapshot) => {
        const productId = childSnapshot.key;
        const product = childSnapshot.val();
        
        // If product has 'type' field, migrate it to 'category'
        if (product.type) {
          updates[`products/${productId}/category`] = product.type;
          updates[`products/${productId}/type`] = null; // Remove type field
          migratedCount++;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        await update(ref(realtimeDb), updates);
        setSuccessMessage(`Successfully migrated ${migratedCount} products from 'type' to 'category'`);
        console.log(`Migrated ${migratedCount} products`);
      } else {
        setSuccessMessage('No products needed migration');
      }
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error migrating products:', error);
      alert('Failed to migrate products. Check console for errors.');
    }
  };

  // Process large Excel files in chunks
  const processLargeExcelFile = async (file) => {
    const CHUNK_SIZE = 100; // Smaller chunks for better performance
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB absolute max
    
    // Check absolute maximum file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum supported size is 10MB. Please split your file into smaller parts.`);
    }
    
    try {
      setImportStatus('Preparing to read large file...');
      setImportProgress(1);
      
      // Use slices for reading large files
      const SLICE_SIZE = 1024 * 1024; // 1MB slices
      const sliceCount = Math.ceil(file.size / SLICE_SIZE);
      const fileChunks = [];
      
      // Read file in slices to prevent memory issues
      for (let i = 0; i < sliceCount; i++) {
        setImportStatus(`Reading file... ${Math.round((i + 1) / sliceCount * 100)}%`);
        setImportProgress(Math.round((i + 1) / sliceCount * 5));
        
        const start = i * SLICE_SIZE;
        const end = Math.min(start + SLICE_SIZE, file.size);
        const slice = file.slice(start, end);
        const arrayBuffer = await slice.arrayBuffer();
        fileChunks.push(new Uint8Array(arrayBuffer));
        
        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Combine file chunks
      setImportStatus('Combining file data...');
      const totalLength = fileChunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const fileData = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of fileChunks) {
        fileData.set(chunk, offset);
        offset += chunk.length;
      }
      
      setImportStatus('Parsing Excel data (this may take a moment)...');
      setImportProgress(7);
      
      // Allow UI to update before heavy parsing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Parse Excel with minimal options and streaming
      let workbook;
      try {
        workbook = XLSX.read(fileData, { 
          type: 'array',
          cellDates: false,
          cellNF: false,
          cellHTML: false,
          cellFormula: false,
          cellStyles: false,
          sheetStubs: false,
          bookVBA: false,
          password: undefined,
          WTF: false
        });
      } catch (parseError) {
        console.error('Excel parsing error:', parseError);
        throw new Error('Failed to parse Excel file. The file may be corrupted or in an unsupported format.');
      }
      
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error('No sheets found in Excel file');
      }
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: ''
      });
      
      if (jsonData.length === 0) {
        throw new Error('No data found in Excel file');
      }
      
      // Calculate chunks
      const totalRows = jsonData.length;
      const chunks = Math.ceil(totalRows / CHUNK_SIZE);
      setTotalChunks(chunks);
      
      setImportStatus(`Found ${totalRows} products. Will process in ${chunks} chunks...`);
      setImportProgress(10);
      
      // Process each chunk
      let totalImported = 0;
      let totalFailed = 0;
      const allFailedProducts = [];
      
      for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
        setCurrentChunk(chunkIndex + 1);
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, totalRows);
        const chunkData = jsonData.slice(start, end);
        
        setImportStatus(`Processing chunk ${chunkIndex + 1} of ${chunks} (rows ${start + 1}-${end})...`);
        
        // Process chunk
        const result = await processChunk(chunkData, start, chunkIndex, chunks);
        totalImported += result.imported;
        totalFailed += result.failed;
        allFailedProducts.push(...result.failedProducts);
        
        // Update overall progress
        const overallProgress = 10 + ((chunkIndex + 1) / chunks) * 85;
        setImportProgress(Math.round(overallProgress));
        
        // Small delay between chunks
        if (chunkIndex < chunks - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      // Final status
      setImportProgress(100);
      setCurrentChunk(0);
      setTotalChunks(0);
      
      if (totalFailed > 0) {
        const failedList = allFailedProducts.slice(0, 5).join(', ');
        const moreText = allFailedProducts.length > 5 ? ` and ${allFailedProducts.length - 5} more` : '';
        setSuccessMessage(`Imported ${totalImported} products. Failed to import ${totalFailed} products: ${failedList}${moreText}`);
      } else {
        setSuccessMessage(`Successfully imported all ${totalImported} products from ${chunks} chunks!`);
      }
      
      setImportStatus('Import completed!');
      
    } catch (error) {
      throw error;
    }
  };
  
  // Process a single chunk of data
  const processChunk = async (chunkData, startIndex, chunkIndex, totalChunks) => {
    const processedProducts = [];
    const validationErrors = [];
    
    // Validate chunk data
    chunkData.forEach((row, index) => {
      try {
        const product = {
          name: row['Product Name'] || '',
          description: row['Description'] || '',
          category: row['Category'] || 'flower',
          strain: row['Strain'] || '',
          strainInformation: row['Strain Information'] || '',
          flavor: row['Flavor'] || '',
          thc: row['THC Content'] || '',
          cbd: row['CBD Content'] || '',
          price: parseFloat(row['Price']) || 0,
          packageSize: row['Package Size'] || '',
          imageUrl: row['Image Link'] || '',
          inStock: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (!product.name || product.name.trim() === '') {
          validationErrors.push(`Row ${startIndex + index + 2}: Product Name is required`);
          return;
        }
        if (!product.price || isNaN(product.price) || product.price <= 0) {
          validationErrors.push(`Row ${startIndex + index + 2}: Valid Price is required`);
          return;
        }

        processedProducts.push(product);
      } catch (error) {
        validationErrors.push(`Row ${startIndex + index + 2}: ${error.message}`);
      }
    });
    
    // Import valid products from this chunk
    let importedCount = 0;
    let failedCount = 0;
    const failedProducts = [];
    
    for (let i = 0; i < processedProducts.length; i++) {
      const product = processedProducts[i];
      const progressInChunk = (i + 1) / processedProducts.length;
      const chunkProgress = (chunkIndex + progressInChunk) / totalChunks;
      const overallProgress = 10 + (chunkProgress * 85);
      
      setImportProgress(Math.round(overallProgress));
      setImportStatus(`Chunk ${chunkIndex + 1}/${totalChunks}: Importing ${product.name}...`);
      
      try {
        const productsRef = ref(realtimeDb, 'products');
        await push(productsRef, product);
        importedCount++;
        
        // Small delay to prevent overwhelming Firebase
        await new Promise(resolve => setTimeout(resolve, 30));
      } catch (error) {
        console.error('Error importing product:', product.name, error);
        failedCount++;
        failedProducts.push(product.name);
      }
    }
    
    return {
      imported: importedCount,
      failed: failedCount + validationErrors.length,
      failedProducts: failedProducts
    };
  };

  // Handle Excel file import
  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // File size limits
    const maxDirectSize = 500 * 1024; // 500KB for direct processing
    const maxChunkSize = 2 * 1024 * 1024; // 2MB for chunked processing
    const fileSize = file.size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    
    // Check if file is too large even for chunking
    if (fileSize > maxChunkSize) {
      alert(`File size (${fileSizeMB}MB) is too large for browser-based import.\n\nRecommended solutions:\n\n1. Convert to CSV format (much smaller file size)\n2. Split your Excel file into multiple smaller files (max 2MB each)\n3. Remove unnecessary columns, formatting, or empty rows\n4. Use Excel's "Save As" > "CSV" option\n\nFor files over 2MB, we recommend using CSV format which is much more efficient.`);
      event.target.value = '';
      return;
    }
    
    const isLargeFile = fileSize > maxDirectSize;

    setImportLoading(true);
    setImportProgress(0);
    setImportStatus('Reading Excel file...');
    setSuccessMessage('');

    // For large files, use chunking process
    if (isLargeFile) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setImportStatus(`Processing large file (${sizeMB}MB) with automatic chunking...`);
      
      setTimeout(async () => {
        try {
          await processLargeExcelFile(file);
          
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          console.error('Error processing large Excel file:', error);
          setImportStatus('Import failed!');
          
          let errorMessage = 'Error importing large file:\n';
          if (error.message.includes('No data found')) {
            errorMessage += 'The Excel file appears to be empty or has no valid data.';
          } else {
            errorMessage += error.message || 'An unexpected error occurred. Please check the file format and try again.';
          }
          
          alert(errorMessage);
          
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } finally {
          setImportLoading(false);
          setTimeout(() => {
            setImportProgress(0);
            setImportStatus('');
            setSuccessMessage('');
          }, 5000);
        }
      }, 100);
      
      return; // Exit early for large files
    }

    // For smaller files, use the original process
    setTimeout(async () => {
      try {
        let jsonData = [];
        
        // Check if CSV file
        if (file.name.toLowerCase().endsWith('.csv')) {
          setImportStatus('Processing CSV file...');
          setImportProgress(5);
          
          // Read CSV as text
          const text = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
          });
          
          setImportProgress(10);
          setImportStatus('Parsing CSV data...');
          
          // Parse CSV using XLSX
          const workbook = XLSX.read(text, { type: 'string' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            defval: ''
          });
          
        } else {
          // Excel file processing
          setImportStatus('Processing Excel file...');
          setImportProgress(5);
          
          // Force UI update
          await new Promise(resolve => requestAnimationFrame(resolve));
          
          const reader = new FileReader();
          
          const fileData = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsArrayBuffer(file);
          });
          
          setImportProgress(10);
          setImportStatus('Parsing Excel data...');
          
          // Force another UI update before heavy parsing
          await new Promise(resolve => requestAnimationFrame(resolve));
          
          // Parse with options to reduce memory usage
          const workbook = XLSX.read(fileData, { 
            type: 'array',
            cellDates: false,
            cellNF: false,
            cellHTML: false,
            cellFormula: false,
            cellStyles: false,
            sheetStubs: false
          });
          
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            throw new Error('No sheets found in Excel file');
          }
          
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with raw values only
          jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            defval: ''
          });
        }

      if (jsonData.length === 0) {
        throw new Error('No data found in Excel file');
      }

      setImportStatus(`Found ${jsonData.length} products to import...`);
      setImportProgress(10);

      // Validate and process the data
      const processedProducts = [];
      const validationErrors = [];

      jsonData.forEach((row, index) => {
        try {
          // Map Excel columns to product fields
          const product = {
            name: row['Product Name'] || '',
            description: row['Description'] || '',
            category: row['Category'] || 'flower',
            type: row['Category'] || 'flower', // Map category to type for compatibility
            strain: row['Strain'] || '',
            strainInformation: row['Strain Information'] || '',
            flavor: row['Flavor'] || '',
            thc: row['THC Content'] || '',
            cbd: row['CBD Content'] || '',
            price: parseFloat(row['Price']) || 0,
            packageSize: row['Package Size'] || '',
            imageUrl: row['Image Link'] || '',
            inStock: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          // Validate required fields
          if (!product.name || product.name.trim() === '') {
            validationErrors.push(`Row ${index + 2}: Product Name is required`);
            return;
          }
          if (!product.price || isNaN(product.price) || product.price <= 0) {
            validationErrors.push(`Row ${index + 2}: Valid Price is required (must be greater than 0)`);
            return;
          }

          processedProducts.push(product);
        } catch (error) {
          validationErrors.push(`Row ${index + 2}: ${error.message}`);
        }
      });

      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.slice(0, 5).join('\n');
        const moreErrors = validationErrors.length > 5 ? `\n...and ${validationErrors.length - 5} more errors` : '';
        throw new Error(`Validation errors:\n${errorMessage}${moreErrors}`);
      }

      setImportProgress(20);
      setImportStatus(`Validated ${processedProducts.length} products. Starting import...`);

      // Import products to Firebase with progress tracking
      let importedCount = 0;
      let failedCount = 0;
      const failedProducts = [];
      
      // Process in batches to avoid overwhelming the UI
      const batchSize = 5;
      
      for (let i = 0; i < processedProducts.length; i += batchSize) {
        const batch = processedProducts.slice(i, Math.min(i + batchSize, processedProducts.length));
        const batchPromises = [];
        
        for (const product of batch) {
          const productIndex = i + batch.indexOf(product);
          const progress = 20 + ((productIndex + 1) / processedProducts.length) * 70;
          setImportProgress(Math.round(progress));
          setImportStatus(`Importing product ${productIndex + 1} of ${processedProducts.length}: ${product.name}`);
          
          batchPromises.push(
            (async () => {
              try {
                const productsRef = ref(realtimeDb, 'products');
                await push(productsRef, product);
                return { success: true, product };
              } catch (error) {
                console.error('Error importing product:', product.name, error);
                return { success: false, product, error };
              }
            })()
          );
        }
        
        // Wait for batch to complete
        const results = await Promise.all(batchPromises);
        
        // Process results
        for (const result of results) {
          if (result.success) {
            importedCount++;
          } else {
            failedCount++;
            failedProducts.push(result.product.name);
          }
        }
        
        // Add small delay between batches to keep UI responsive
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setImportProgress(100);
      
      if (failedCount > 0) {
        const failedList = failedProducts.slice(0, 3).join(', ');
        const moreText = failedProducts.length > 3 ? ` and ${failedProducts.length - 3} more` : '';
        setSuccessMessage(`Imported ${importedCount} products. Failed to import ${failedCount} products: ${failedList}${moreText}`);
      } else {
        setSuccessMessage(`Successfully imported all ${importedCount} products!`);
      }
      
      setImportStatus('Import completed!');
      setTimeout(() => {
        setSuccessMessage('');
        setImportStatus('');
      }, 5000);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error processing Excel file:', error);
      setImportStatus('Import failed!');
      
      // More user-friendly error messages
      let errorMessage = 'Error importing file:\n';
      if (error.message.includes('Validation errors')) {
        errorMessage += error.message;
      } else if (error.message.includes('No data found')) {
        errorMessage += 'The Excel file appears to be empty or has no valid data.';
      } else {
        errorMessage += error.message || 'An unexpected error occurred. Please check the file format and try again.';
      }
      
      alert(errorMessage);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      } finally {
        // Always clean up loading state
        setImportLoading(false);
        setTimeout(() => {
          setImportProgress(0);
          setImportStatus('');
        }, 3000);
      }
    }, 100); // End of setTimeout
  };

  // Trigger file input click
  const handleImportClick = () => {
    if (!importLoading) {
      fileInputRef.current?.click();
    }
  };

  // Download template Excel file
  const handleDownloadTemplate = () => {
    try {
      // Create template data
      const templateData = [{
        'Product Name': 'Example Product',
        'Description': 'Premium quality Sample product',
        'Category': 'flower',
        'Strain': 'OG Brand',
        'Strain Information': 'Classic indica-dominant hybrid with earthy pine aroma',
        'Flavor': 'Pine, Earthy, Woody',
        'THC Content': '22%',
        'CBD Content': '0.5%',
        'Price': '45.00',
        'Package Size': '3.5g',
        'Image Link': 'https://example.com/image.png'
      }];

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Products');

      // Set column widths
      const colWidths = [
        { wch: 20 }, // Product Name
        { wch: 40 }, // Description
        { wch: 15 }, // Category
        { wch: 15 }, // Strain
        { wch: 40 }, // Strain Information
        { wch: 20 }, // Flavor
        { wch: 12 }, // THC Content
        { wch: 12 }, // CBD Content
        { wch: 10 }, // Price
        { wch: 15 }, // Package Size
        { wch: 40 }  // Image Link
      ];
      ws['!cols'] = colWidths;

      // Download the file
      XLSX.writeFile(wb, 'Kushie_Products_Template.xlsx');
      
      setSuccessMessage('Template downloaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template. Please try again.');
    }
  };

  // Define all categories from the ProductForm dropdown
  const allCategories = [
    { value: 'flower', label: 'Flower', color: 'green', icon: Flower2 },
    { value: 'edible', label: 'Edible', color: 'purple', icon: Cookie },
    { value: 'concentrate', label: 'Concentrate', color: 'yellow', icon: Droplets },
    { value: 'cartridge', label: 'Cartridges', color: 'blue', icon: Zap },
    { value: 'disposable', label: 'Disposables', color: 'cyan', icon: Battery },
    { value: 'pod', label: 'Pods', color: 'indigo', icon: CircleDot },
    { value: 'battery', label: 'Batteries', color: 'gray', icon: Battery },
    { value: 'infused-preroll', label: 'Infused Prerolls', color: 'pink', icon: Sparkles },
    { value: 'preroll', label: 'Prerolls', color: 'orange', icon: Cigarette },
    { value: 'hemp-preroll', label: 'Hemp Prerolls', color: 'lime', icon: Leaf },
    { value: 'merch', label: 'Merch', color: 'red', icon: Shirt },
    { value: 'distillate', label: 'Distillate', color: 'amber', icon: Beaker },
    { value: 'liquid-diamonds', label: 'Liquid Diamonds', color: 'sky', icon: Diamond },
    { value: 'live-resin-diamonds', label: 'Sample Material Diamonds', color: 'violet', icon: Gem },
    { value: 'hash-infused-preroll', label: 'Hash Infused Prerolls', color: 'rose', icon: Hash },
    { value: 'infused-preroll-5pack', label: 'Infused Prerolls - 5 Pack', color: 'emerald', icon: Layers }
  ];

  // Calculate stats for all categories
  const getCategoryCount = (categoryValue) => {
    return products.filter(p => {
      // Only check category field
      const productCategory = p.category || '';
      
      // Handle exact match (case-insensitive)
      return productCategory.toLowerCase() === categoryValue.toLowerCase();
    }).length;
  };

  const stats = {
    total: products.length,
    categories: allCategories.map(cat => {
      const count = getCategoryCount(cat.value);
      
      // Debug logging for troubleshooting
      if (count > 0) {
        console.log(`Category ${cat.value} has ${count} products`);
      }
      
      return {
        ...cat,
        count
      };
    })
  };
  
  // Additional debug to see all unique categories in products
  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products.map(p => p.category))];
      console.log('Unique categories in products:', uniqueCategories);
      console.log('Total products:', products.length);
    }
  }, [products]);

  if (loading) {
    return <GradientLoader />;
  }

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <AdminToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div>
      {/* Header with Total Count */}
      <div className="mb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Products Inventory</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">For large datasets (over 2MB), use CSV format</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-dark border border-border rounded-lg self-start sm:self-auto">
            <p className="text-gray-400 text-sm font-medium">Total Products</p>
            <p className="text-xl font-bold text-white">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Category Stats - Compact Square Grid */}
      <div className="mb-4">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {stats.categories.map((category) => {
            const getColorClass = (color, count) => {
              const hasProducts = count > 0;
              const colors = {
                green: hasProducts ? 'text-green-400' : 'text-gray-500',
                purple: hasProducts ? 'text-purple-400' : 'text-gray-500',
                yellow: hasProducts ? 'text-yellow-400' : 'text-gray-500',
                blue: hasProducts ? 'text-blue-400' : 'text-gray-500',
                cyan: hasProducts ? 'text-cyan-400' : 'text-gray-500',
                indigo: hasProducts ? 'text-indigo-400' : 'text-gray-500',
                gray: hasProducts ? 'text-gray-300' : 'text-gray-500',
                pink: hasProducts ? 'text-pink-400' : 'text-gray-500',
                orange: hasProducts ? 'text-orange-400' : 'text-gray-500',
                lime: hasProducts ? 'text-lime-400' : 'text-gray-500',
                red: hasProducts ? 'text-red-400' : 'text-gray-500',
                amber: hasProducts ? 'text-amber-400' : 'text-gray-500',
                sky: hasProducts ? 'text-sky-400' : 'text-gray-500',
                violet: hasProducts ? 'text-violet-400' : 'text-gray-500',
                rose: hasProducts ? 'text-rose-400' : 'text-gray-500',
                emerald: hasProducts ? 'text-emerald-400' : 'text-gray-500',
              };
              return colors[color] || 'text-gray-500';
            };

            const colorClass = getColorClass(category.color, category.count);
            const IconComponent = category.icon || Package;

            return (
              <div
                key={category.value}
                className={`aspect-square bg-gray-800/50 rounded-lg p-3 flex flex-col items-center justify-center text-center hover:bg-gray-700/50 transition-colors cursor-pointer border border-gray-700/50 ${category.count === 0 ? 'opacity-50' : ''}`}
              >
                <IconComponent className={`w-8 h-8 ${colorClass} mb-2`} />
                <p className={`text-2xl font-bold ${colorClass}`}>{category.count}</p>
                <p className="text-gray-400 text-xs leading-tight truncate w-full">{category.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-2 bg-green-500/20 border border-green-500 text-green-400 px-2 py-1.5 rounded-lg text-sm">
          {successMessage}
        </div>
      )}
      
      {/* Firebase Notice */}
      {!isUsingFirebase && (
        <div className="mb-2 bg-yellow-500/20 border border-yellow-500 text-yellow-400 px-2 py-1.5 rounded-lg">
          <p className="font-semibold text-sm">Notice: Using Local Storage</p>
          <p className="text-xs mt-0.5">
            Firebase connection not established. Products are being stored locally in your browser.
            Check your Firebase Realtime Database configuration.
          </p>
        </div>
      )}

      {/* Search and Filter - Matching Invoice Table Style */}
      <div className="bg-card p-4 rounded-lg mb-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name, description or strain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-dark border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-gray-dark border border-border rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="all">All Categories</option>
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
          {/* Action Buttons */}
          <div className="flex items-center gap-2 justify-end">
            {products.length === 0 && (
              <button
                onClick={handleSeedDatabase}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                title="Seed database with sample products"
              >
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Seed</span>
              </button>
            )}
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-dark border border-border rounded-lg text-white hover:bg-gray-700 transition-colors"
              title="Download Excel template"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Template</span>
            </button>
            <button
              onClick={handleImportClick}
              disabled={importLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              title="Import Excel or CSV file (max 2MB)"
            >
              <Upload className={`h-4 w-4 ${importLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{importLoading ? 'Importing...' : 'Import'}</span>
            </button>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowForm(!showForm);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className={`h-4 w-4 transition-transform ${showForm ? 'rotate-45' : ''}`} />
              <span className="hidden sm:inline">{showForm ? 'Cancel' : 'Add Product'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Import Progress Overlay */}
      {importLoading && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-spotify-light-gray rounded-xl p-4 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-2">Importing Products</h3>
            
            {/* Chunk Info */}
            {totalChunks > 1 && (
              <div className="mb-2 text-center">
                <p className="text-spotify-green font-semibold">
                  Chunk {currentChunk} of {totalChunks}
                </p>
              </div>
            )}
            
            {/* Progress Bar */}
            <div className="mb-2">
              <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-spotify-green h-full transition-all duration-300 ease-out"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <p className="text-white text-center mt-2 font-semibold">{importProgress}%</p>
            </div>
            
            {/* Status Message */}
            <p className="text-gray-300 text-center text-sm mb-2">{importStatus}</p>
            
            {/* File Size Warning for Large Files */}
            {totalChunks > 1 && (
              <p className="text-yellow-400 text-xs text-center">
                Large file detected - processing in chunks for stability
              </p>
            )}
            
            {/* Cancel Button (disabled during import) */}
            <button
              className="mt-3 w-full bg-gray-600 text-gray-400 py-2 px-4 rounded-lg cursor-not-allowed opacity-50"
              disabled
            >
              Please wait...
            </button>
          </div>
        </div>
      )}
      

      {/* Hidden file input for Excel import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileImport}
        className="hidden"
      />

      {/* Add Product Form - Table Design */}
      {showForm && !editingProduct && (
        <div className="mb-4">
          <ProductForm
            product={null}
            onSubmit={handleAddProduct}
            onCancel={() => {
              setShowForm(false);
            }}
            isDropdown={true}
          />
        </div>
      )}

      {/* Edit Product Form - Table Design */}
      {editingProduct && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Edit Product: {editingProduct.name}</h3>
          </div>
          <ProductForm
            product={editingProduct}
            onSubmit={(data) => handleUpdateProduct(editingProduct.id, data)}
            onCancel={() => {
              setEditingProduct(null);
              setShowForm(false);
            }}
            isDropdown={false}
            isCompact={true}
          />
        </div>
      )}

      {/* Products List */}
      <ProductList
        products={filteredProducts}
        onEdit={(product) => {
          setEditingProduct(product);
          setShowForm(true);
        }}
        onDelete={handleDeleteProduct}
      />
      </div>
    </>
  );
};

export default ProductsPage;