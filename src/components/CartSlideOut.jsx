import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, FileText, Download, Send, Share2, Mail, Copy, MessageCircle } from 'lucide-react';
import { useCart } from '../context/ShopifyCartContext';
import { useWholesaleCart } from '../context/WholesaleCartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import ShopifyCheckoutButton from './ShopifyCheckoutButton';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { ref, push, serverTimestamp } from 'firebase/database';
import { realtimeDb, db } from '../config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const CartSlideOut = ({ isOpen, onClose, isWholesale = false }) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const { user, userData } = useAuth();
  
  // Determine which cart to use based on prop or current page
  const isWholesalePage = isWholesale || location.pathname.includes('/wholesale') || location.pathname.includes('/sales');
  
  // Get cart context based on page
  const shopifyCart = useCart();
  const wholesaleCart = useWholesaleCart();
  
  // Use appropriate cart
  const currentCart = isWholesalePage ? wholesaleCart : shopifyCart;
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount, customerForOrder } = currentCart;

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Add class to body to prevent scrolling on mobile
      document.body.classList.add('cart-open');
    } else {
      // Remove class from body
      document.body.classList.remove('cart-open');
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('cart-open');
    };
  }, [isOpen]);

  // Generate PDF invoice for wholesale checkout
  const generatePDFInvoice = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const today = new Date();
    const invoiceNumber = `INV ${today.getFullYear().toString().slice(-2)}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}-${today.getHours().toString().padStart(2, '0')}-${today.getMinutes().toString().padStart(2, '0')}`;
    
    // Modern color scheme
    const primaryColor = [0, 0, 0]; // Black for text
    const secondaryColor = [100, 100, 100]; // Gray for secondary text
    const accentColor = [203, 96, 21]; // Brand orange for accents
    const lightGray = [245, 245, 245];
    const borderColor = [230, 230, 230];
    
    // Add Brand logo with proper aspect ratio
    try {
      const logoUrl = 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/logos/Brand%20Invoice%20logo.png';
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        logoImg.onload = () => {
          try {
            // Calculate proper dimensions maintaining aspect ratio
            const imgWidth = logoImg.width;
            const imgHeight = logoImg.height;
            const maxWidth = 50;
            const maxHeight = 20;
            
            let width = maxWidth;
            let height = (imgHeight / imgWidth) * maxWidth;
            
            if (height > maxHeight) {
              height = maxHeight;
              width = (imgWidth / imgHeight) * maxHeight;
            }
            
            // Add logo with correct aspect ratio
            doc.addImage(logoImg, 'PNG', margin, 15, width, height);
            resolve();
          } catch (err) {
            console.error('Error adding logo to PDF:', err);
            // Fallback to text logo
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...accentColor);
            doc.text('BRAND+', margin, 25);
            resolve();
          }
        };
        logoImg.onerror = () => {
          // Fallback to text logo
          doc.setFontSize(24);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...accentColor);
          doc.text('BRAND+', margin, 25);
          resolve();
        };
        logoImg.src = logoUrl;
      });
    } catch (error) {
      // Fallback to text logo
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...accentColor);
      doc.text('BRAND+', margin, 25);
    }
    
    // Invoice header - right aligned
    doc.setTextColor(...primaryColor);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(invoiceNumber, pageWidth - margin, 25, { align: 'right' });
    
    // Add horizontal line under header
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);
    doc.line(margin, 35, pageWidth - margin, 35);
    
    // Due Date and Subject section
    let yPosition = 50;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    doc.text('Date', margin, yPosition);
    doc.text('Invoice Type', pageWidth / 2, yPosition);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), margin, yPosition + 5);
    doc.text('Wholesale Order', pageWidth / 2, yPosition + 5);
    
    // Billed To section
    yPosition = 65;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    doc.text('Billed To', margin, yPosition);
    doc.text('Currency', pageWidth / 2, yPosition);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    
    // Use selected customer if available (for sales page), otherwise use logged-in user
    const billingCustomer = customerForOrder || userData;
    const isSalesOrder = location.pathname.includes('/sales');
    
    let customerDetailsEndY = yPosition + 5;
    
    if (billingCustomer) {
      // Customer Name
      doc.text(billingCustomer.displayName || billingCustomer.email || 'Customer', margin, customerDetailsEndY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      customerDetailsEndY += 5;
      
      // Email
      if (billingCustomer.email) {
        doc.text(billingCustomer.email, margin, customerDetailsEndY);
        customerDetailsEndY += 5;
      }
      
      // Phone
      if (billingCustomer.phone || billingCustomer.phoneNumber) {
        doc.setFontSize(9);
        doc.text(`Phone: ${billingCustomer.phone || billingCustomer.phoneNumber}`, margin, customerDetailsEndY);
        customerDetailsEndY += 4;
      }
      
      // License Number - Make it more prominent
      if (billingCustomer.licenseNumber) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...accentColor); // Highlight license number
        doc.text(`License #: ${billingCustomer.licenseNumber}`, margin, customerDetailsEndY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...primaryColor); // Reset color
        customerDetailsEndY += 5;
      }
      
      // Address
      if (billingCustomer.address) {
        doc.setFontSize(9);
        doc.setTextColor(...secondaryColor);
        const addressLines = doc.splitTextToSize(billingCustomer.address, 80);
        addressLines.forEach((line, index) => {
          if (index < 3) { // Allow up to 3 lines for address
            doc.text(line, margin, customerDetailsEndY);
            customerDetailsEndY += 4;
          }
        });
        doc.setTextColor(...primaryColor); // Reset color
      }
    } else {
      doc.text('Guest Customer', margin, customerDetailsEndY);
      customerDetailsEndY += 5;
    }
    
    // Currency with flag emoji
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('USD - United State Dollar', pageWidth / 2, yPosition + 5);
    
    // Items table - modern design - adjust position based on customer details
    yPosition = Math.max(customerDetailsEndY + 10, 95); // Ensure minimum spacing
    const tableColumns = ['ITEM', 'QTY', 'UNIT PRICE', 'AMOUNT'];
    const tableRows = [];
    const productImages = [];
    
    // Process cart items
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      const unitPrice = parseFloat(item.price);
      const minOrder = item.minimumOrder || 1;
      const totalUnits = item.quantity * minOrder;
      const total = unitPrice * totalUnits;

      // Store image data for later use
      let imageData = null;
      if (item.imageUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = 40;
              canvas.height = 40;
              ctx.drawImage(img, 0, 0, 40, 40);
              imageData = canvas.toDataURL('image/jpeg', 0.8);
              resolve();
            };
            img.onerror = resolve;
            img.src = item.imageUrl;
          });
        } catch (error) {
          console.error('Error loading product image:', error);
        }
      }

      if (imageData) {
        productImages[i] = imageData;
      }

      // Add row data with pack information if applicable
      let qtyDisplay = item.quantity.toString();
      if (minOrder > 1) {
        qtyDisplay = `${item.quantity} packs (${totalUnits} units)`;
      }

      tableRows.push([
        item.title || item.name,
        qtyDisplay,
        `$${unitPrice.toFixed(2)}`,
        `$${total.toFixed(2)}`
      ]);
    }
    
    // Generate modern table
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: yPosition,
      theme: 'plain',
      headStyles: { 
        fillColor: [255, 255, 255],
        textColor: secondaryColor,
        fontStyle: 'normal',
        fontSize: 9,
        cellPadding: { top: 4, bottom: 4, left: 5, right: 5 }
      },
      columnStyles: {
        0: { cellWidth: 100 }, // Item name - increased width
        1: { cellWidth: 20, halign: 'center' }, // Quantity
        2: { cellWidth: 30, halign: 'right' }, // Unit price
        3: { cellWidth: 30, halign: 'right' } // Total
      },
      bodyStyles: {
        textColor: primaryColor,
        fontSize: 10,
        cellPadding: { top: 12, bottom: 12, left: 5, right: 5 },
        minCellHeight: 15
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255]
      },
      margin: { left: margin, right: margin },
      showHead: 'everyPage', // Show header on every page
      pageBreak: 'auto', // Automatic page breaks
      didDrawPage: function(data) {
        // Add header line on every page
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.5);
        const headerY = data.table.head[0].cells[0].y + data.table.head[0].height;
        doc.line(margin, headerY, pageWidth - margin, headerY);
        
        // Add page numbers if multiple pages
        if (doc.internal.getNumberOfPages() > 1) {
          doc.setFontSize(8);
          doc.setTextColor(...secondaryColor);
          doc.text(
            `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      },
      willDrawCell: function(data) {
        // For product name cells, prevent default text drawing
        if (data.column.index === 0 && data.cell.section === 'body') {
          data.cell.text = ''; // Clear text before drawing
        }
      },
      didDrawCell: function(data) {
        // Add product images and custom text in first column for body rows
        if (data.column.index === 0 && data.cell.section === 'body' && data.row.index >= 0) {
          const rowIndex = data.row.index;
          const imageData = productImages[rowIndex];
          const productName = tableRows[rowIndex][0];
          
          if (imageData) {
            const imgSize = 8;
            const x = data.cell.x + 2;
            const y = data.cell.y + (data.cell.height - imgSize) / 2;
            
            try {
              // Add small product image
              doc.addImage(imageData, 'JPEG', x, y, imgSize, imgSize);
            } catch (err) {
              console.error('Error adding image to PDF:', err);
            }
          }
          
          // Add product name text with proper positioning
          const textX = imageData ? data.cell.x + 12 : data.cell.x + 2;
          const textY = data.cell.y + data.cell.height / 2;
          const maxWidth = data.cell.width - (imageData ? 14 : 4);
          
          doc.setFontSize(9);
          doc.setTextColor(102, 102, 102); // #666 grey color
          
          // Split text if too long
          const lines = doc.splitTextToSize(productName, maxWidth);
          if (lines.length === 1) {
            doc.text(lines[0], textX, textY, { baseline: 'middle' });
          } else {
            // For multiple lines, adjust positioning
            const lineHeight = 4;
            const startY = textY - ((lines.length - 1) * lineHeight) / 2;
            lines.forEach((line, index) => {
              doc.text(line, textX, startY + (index * lineHeight), { baseline: 'middle' });
            });
          }
        }
      }
    });
    
    // Calculate totals
    const subtotal = parseFloat(cartTotal);
    const total = subtotal; // No discount or tax
    
    // Total section with modern layout - increased spacing
    let finalY = doc.lastAutoTable.finalY + 20;
    const totalsX = pageWidth - 80;
    
    // Check if we need a new page for totals section
    const remainingSpace = pageHeight - finalY;
    if (remainingSpace < 80) { // Need at least 80px for totals section
      doc.addPage();
      finalY = 20; // Start from top of new page
    }
    
    // Sub total
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    doc.text('Sub total', totalsX, finalY);
    doc.setTextColor(...primaryColor);
    doc.text(`$${subtotal.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
    
    // Add separator line
    doc.setDrawColor(...borderColor);
    doc.line(totalsX - 5, finalY + 5, pageWidth - margin, finalY + 5);
    
    // Total
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Total', totalsX, finalY + 12);
    doc.text(`$${total.toFixed(2)}`, pageWidth - margin, finalY + 12, { align: 'right' });
    
    // Amount due
    const amountDueY = finalY + 20;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Amount due', totalsX, amountDueY);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${total.toFixed(2)}`, pageWidth - margin, amountDueY, { align: 'right' });
    
    // Footer note with proper spacing
    let footerY = amountDueY + 25;
    
    // Check if footer fits on current page
    if (footerY > pageHeight - 60) {
      doc.addPage();
      footerY = 40;
    }
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...secondaryColor);
    const footerText = '*Notes / Products that you have purchased cannot be returned.';
    doc.text(footerText, margin, footerY);
    
    // Bottom branding with safe margin
    const brandingY = Math.min(footerY + 30, pageHeight - 30);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...accentColor);
    doc.text('Thank you for choosing Brand+', pageWidth / 2, brandingY, { align: 'center' });
    
    // Save invoice data to Firebase
    const invoiceData = {
      invoiceNumber: invoiceNumber,
      date: today.toISOString(),
      customer: {
        name: billingCustomer?.displayName || billingCustomer?.email || 'Guest Customer',
        email: billingCustomer?.email || '',
        phone: billingCustomer?.phone || billingCustomer?.phoneNumber || '',
        address: billingCustomer?.address || '',
        licenseNumber: billingCustomer?.licenseNumber || '',
        userId: billingCustomer?.id || billingCustomer?.uid || user?.uid || null
      },
      items: cart.map(item => ({
        id: item.id,
        name: item.title || item.name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.price),
        total: parseFloat(item.price) * item.quantity,
        imageUrl: item.imageUrl || ''
      })),
      subtotal: subtotal,
      discount: 0,
      discountPercentage: 0,
      tax: 0,
      total: total,
      status: 'generated',
      createdAt: serverTimestamp()
    };

    // Save to Firebase Realtime Database (legacy)
    try {
      const invoicesRef = ref(realtimeDb, 'wholesale_invoices');
      await push(invoicesRef, invoiceData);
      console.log('Invoice saved to Firebase Realtime Database');
    } catch (error) {
      console.error('Error saving invoice to Firebase Realtime Database:', error);
    }

    // Save to Firestore for the Sales page invoices list
    // Only save if user is authenticated
    if (user?.uid) {
      try {
        const firestoreInvoiceData = {
          invoiceNumber: invoiceNumber,
          createdAt: Timestamp.now(),
          createdBy: user.uid,
          customer: invoiceData.customer,
          items: invoiceData.items,
          subtotal: invoiceData.subtotal,
          tax: invoiceData.tax,
          total: invoiceData.total,
          status: 'completed',
          type: 'wholesale',
          // Store sales rep info if available
          salesRep: {
            uid: user.uid,
            email: user.email || '',
            displayName: userData?.displayName || ''
          }
        };

        const docRef = await addDoc(collection(db, 'invoices'), firestoreInvoiceData);
        console.log('Invoice saved to Firestore with ID:', docRef.id);
        console.log('User role:', userData?.role);
      } catch (error) {
        console.error('Error saving invoice to Firestore:', error);
        console.error('User details:', { uid: user?.uid, role: userData?.role });
      }
    } else {
      console.warn('Cannot save invoice to Firestore: User not authenticated');
    }

    // Save the PDF
    doc.save(`brand-wholesale-${invoiceNumber}.pdf`);
  };

  // Generate share message
  const generateShareMessage = () => {
    const orderDetails = cart.map(item => {
      const minOrder = item.minimumOrder || 1;
      const totalUnits = item.quantity * minOrder;
      const totalPrice = parseFloat(item.price) * totalUnits;

      if (minOrder > 1) {
        return `${item.title || item.name} - ${item.quantity} packs (${totalUnits} units) - $${totalPrice.toFixed(2)}`;
      } else {
        return `${item.title || item.name} x${item.quantity} - $${totalPrice.toFixed(2)}`;
      }
    }).join('\n');

    const message = `Brand+ Wholesale Order\n\n${orderDetails}\n\nTotal: $${cartTotal}\n\nContact: contact@kushiebrand.com`;
    return message;
  };

  // Handle share action
  const handleShare = async (method) => {
    const message = generateShareMessage();
    const invoiceNumber = `INV-${Date.now()}`;
    
    switch(method) {
      case 'email':
        const mailtoLink = `mailto:contact@kushiebrand.com?subject=Wholesale Order ${invoiceNumber}&body=${encodeURIComponent(message)}`;
        window.open(mailtoLink, '_blank');
        break;
        
      case 'whatsapp':
        const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappLink, '_blank');
        break;
        
      case 'copy':
        try {
          await navigator.clipboard.writeText(message);
          setShareMessage('Order details copied to clipboard!');
          setTimeout(() => setShareMessage(''), 3000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
        break;
        
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Brand+ Wholesale Order',
              text: message
            });
          } catch (err) {
            console.error('Error sharing:', err);
          }
        }
        break;
    }
    
    // Save order to Firebase after sharing
    if (method !== 'copy') {
      await saveOrderToFirebase();
    }
  };

  // Save order to Firebase
  const saveOrderToFirebase = async () => {
    try {
      const today = new Date();
      const invoiceNumber = `INV ${today.getFullYear().toString().slice(-2)}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}-${today.getHours().toString().padStart(2, '0')}-${today.getMinutes().toString().padStart(2, '0')}`;
      
      // Use selected customer if available (for sales page), otherwise use logged-in user
      const billingCustomer = customerForOrder || userData;
      
      const orderData = {
        invoiceNumber: invoiceNumber,
        date: today.toISOString(),
        customer: {
          name: billingCustomer?.displayName || billingCustomer?.email || 'Guest Customer',
          email: billingCustomer?.email || '',
          phone: billingCustomer?.phone || '',
          address: billingCustomer?.address || '',
          licenseNumber: billingCustomer?.licenseNumber || '',
          userId: billingCustomer?.id || billingCustomer?.uid || user?.uid || null
        },
        createdBy: {
          name: userData?.displayName || userData?.email || 'Unknown',
          email: userData?.email || '',
          userId: user?.uid || null,
          role: userData?.role || 'customer'
        },
        items: cart.map(item => {
          const minOrder = item.minimumOrder || 1;
          const totalUnits = item.quantity * minOrder;
          return {
            id: item.id,
            name: item.title || item.name,
            quantity: item.quantity,
            minimumOrder: minOrder,
            totalUnits: totalUnits,
            unitPrice: parseFloat(item.price),
            total: parseFloat(item.price) * totalUnits,
            imageUrl: item.imageUrl || ''
          };
        }),
        subtotal: parseFloat(cartTotal),
        discount: 0,
        discountPercentage: 0,
        tax: 0,
        total: parseFloat(cartTotal),
        status: 'shared',
        sharedAt: serverTimestamp()
      };

      const ordersRef = ref(realtimeDb, 'wholesale_orders');
      await push(ordersRef, orderData);
      
      // Generate PDF
      await generatePDFInvoice();
      
      setShowShareModal(false);
      setSubmitSuccess(true);
      
      // Clear cart after successful submission
      setTimeout(() => {
        cart.forEach(item => {
          removeFromCart(item.id);
        });
        // Clear selected customer if on sales page
        if (location.pathname.includes('/sales') && currentCart.setCustomerForOrder) {
          currentCart.setCustomerForOrder(null);
        }
        setSubmitSuccess(false);
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`cart-slideout-container ${isOpen ? 'cart-open' : ''}`}>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[55] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Cart Slide-out */}
      <div 
        data-cart-slideout
        className={`fixed right-0 top-0 h-full sm:h-[calc(100vh-5rem)] w-80 max-w-[85vw] sm:w-96 bg-black border-l border-border z-[60] transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold text-white">
                {isWholesalePage ? 'Wholesale Cart' : 'Your Cart'}
              </h2>
              {cartCount > 0 && (
                <span className="bg-primary text-white text-sm font-bold px-2 py-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-dark rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6">
                <ShoppingCart className="h-16 w-16 text-gray mb-4" />
                <p className="text-white text-lg font-bold mb-2">Your cart is empty</p>
                <p className="text-text-secondary text-sm text-center mb-6">
                  Add some products to get started
                </p>
                <Link
                  to={isWholesalePage ? "/wholesale" : "/shop"}
                  onClick={onClose}
                  className="bg-primary text-white font-bold px-6 py-3 rounded-full hover:bg-primary-hover transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="p-4 sm:p-6 space-y-4">
                {cart.map((item) => (
                  <div key={item.lineItemId || item.id} className="bg-card rounded-lg p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-dark rounded-md overflow-hidden flex-shrink-0">
                        {item.imageUrl && (
                          <MediaPlaceholder kind="image" />
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-sm mb-1">
                          {item.title || item.name}
                        </h3>
                        {item.variantTitle && item.variantTitle !== 'Default Title' && (
                          <p className="text-text-secondary text-xs mb-1">{item.variantTitle}</p>
                        )}
                        {/* Price display */}
                        <p className="text-primary font-bold mb-2">
                          ${item.price}
                          {isWholesalePage && item.minimumOrder > 1 && (
                            <span className="text-xs text-gray-400 ml-1">per unit</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Fullwidth Quantity Controls Banner for Wholesale with Min Order */}
                    {isWholesalePage && item.minimumOrder > 1 ? (
                      <div className="mt-3 bg-gray-900 rounded-lg p-3 border border-gray-700">
                        {/* Min Order Info - Compact Single Row */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                            <span>Min: {item.minimumOrder}/pack</span>
                            <span className="text-gray-400">•</span>
                            <span>Total: {item.quantity * item.minimumOrder} units</span>
                          </div>
                          <span className="text-white font-bold text-lg">
                            ${(parseFloat(item.price) * item.quantity * item.minimumOrder).toFixed(2)}
                          </span>
                        </div>

                        {/* Quantity Controls Row */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors border border-gray-600"
                          >
                            <Minus className="h-4 w-4 text-white" />
                          </button>

                          <div className="flex-1 bg-gray-800 rounded-lg px-3 py-1.5 text-center border border-gray-600">
                            <div className="text-white font-bold text-sm">
                              {item.quantity} {item.quantity === 1 ? 'Pack' : 'Packs'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {item.quantity * item.minimumOrder} units total
                            </div>
                          </div>

                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors border border-gray-600"
                          >
                            <Plus className="h-4 w-4 text-white" />
                          </button>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium border border-red-500/30"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Regular Quantity Controls for non-minimum order items */
                      <div className="mt-2 flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => {
                            if (isWholesalePage) {
                              updateQuantity(item.id, item.quantity - 1);
                            } else {
                              // For shop page (Shopify products), use the id as lineItemId
                              updateQuantity(
                                item.productId || item.id,
                                item.quantity - 1,
                                true, // isShopifyProduct
                                item.id // lineItemId
                              );
                            }
                          }}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-dark hover:bg-gray flex items-center justify-center transition-colors"
                        >
                          <Minus className="h-4 w-4 text-white" />
                        </button>
                        <span className="text-white font-bold text-sm sm:text-base px-3">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            if (isWholesalePage) {
                              updateQuantity(item.id, item.quantity + 1);
                            } else {
                              // For shop page (Shopify products), use the id as lineItemId
                              updateQuantity(
                                item.productId || item.id,
                                item.quantity + 1,
                                true, // isShopifyProduct
                                item.id // lineItemId
                              );
                            }
                          }}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-dark hover:bg-gray flex items-center justify-center transition-colors"
                        >
                          <Plus className="h-4 w-4 text-white" />
                        </button>
                        <button
                          onClick={() => {
                            if (isWholesalePage) {
                              removeFromCart(item.id);
                            } else {
                              // For shop page (Shopify products), use the id as lineItemId
                              removeFromCart(
                                item.productId || item.id,
                                true, // isShopifyProduct
                                item.id // lineItemId
                              );
                            }
                          }}
                          className="ml-auto text-text-secondary hover:text-white text-xs sm:text-sm transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Total and Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-border p-4 sm:p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white text-lg font-bold">Total</span>
                <span className="text-primary text-2xl font-black">${cartTotal}</span>
              </div>
              
              <div className="space-y-3">
                {isWholesalePage ? (
                  <>
                    {submitSuccess ? (
                      <div className="bg-green-500 text-white p-4 rounded-lg text-center">
                        <p className="font-bold mb-1">Order Submitted Successfully!</p>
                        <p className="text-sm">Invoice has been sent to contact@kushiebrand.com</p>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            // Check if on sales page and no customer selected
                            if (location.pathname.includes('/sales') && !customerForOrder) {
                              alert('Please select a customer before generating an invoice');
                              return;
                            }
                            setShowShareModal(true);
                          }}
                          className="w-full bg-green-600 text-white font-bold py-4 rounded-full hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Share2 className="h-5 w-5" />
                          Share Order
                        </button>
                        <button
                          onClick={() => {
                            // Check if on sales page and no customer selected
                            if (location.pathname.includes('/sales') && !customerForOrder) {
                              alert('Please select a customer before generating an invoice');
                              return;
                            }
                            generatePDFInvoice();
                          }}
                          className="w-full bg-primary text-white font-bold py-4 rounded-full hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                        >
                          <FileText className="h-5 w-5" />
                          Export Invoice (PDF)
                        </button>
                        <p className="text-xs text-gray-400 text-center">
                          Choose how to share your order
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <ShopifyCheckoutButton 
                      fullWidth
                      text="Proceed to Checkout"
                      className="text-lg"
                    />
                    <Link
                      to="/shop"
                      onClick={onClose}
                      className="block w-full text-center text-white font-bold py-4 rounded-full border-2 border-white hover:bg-white/10 transition-colors"
                    >
                      Continue Shopping
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Share Order</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {shareMessage && (
              <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded-lg text-sm text-center">
                {shareMessage}
              </div>
            )}

            <div className="space-y-3">
              {/* Email Option */}
              <button
                onClick={() => handleShare('email')}
                className="w-full flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Mail className="h-5 w-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-white font-medium">Email to Brand</p>
                  <p className="text-xs text-gray-400">Send to contact@kushiebrand.com</p>
                </div>
              </button>

              {/* WhatsApp Option */}
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <MessageCircle className="h-5 w-5 text-green-400" />
                <div className="text-left">
                  <p className="text-white font-medium">WhatsApp</p>
                  <p className="text-xs text-gray-400">Share via WhatsApp</p>
                </div>
              </button>

              {/* Copy Option */}
              <button
                onClick={() => handleShare('copy')}
                className="w-full flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Copy className="h-5 w-5 text-purple-400" />
                <div className="text-left">
                  <p className="text-white font-medium">Copy to Clipboard</p>
                  <p className="text-xs text-gray-400">Copy order details</p>
                </div>
              </button>

              {/* Native Share (if available) */}
              {navigator.share && (
                <button
                  onClick={() => handleShare('native')}
                  className="w-full flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Share2 className="h-5 w-5 text-orange-400" />
                  <div className="text-left">
                    <p className="text-white font-medium">More Options</p>
                    <p className="text-xs text-gray-400">Share using system apps</p>
                  </div>
                </button>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500 text-center">
                Order details and PDF will be shared
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSlideOut;