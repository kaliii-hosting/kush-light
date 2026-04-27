import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect, useRef } from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { realtimeDb } from '../../config/firebase';
import GradientLoader from './GradientLoader';
import { FileText, Search, Calendar, User, Package, Eye, Download, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const WholesaleManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef(null);

  // Fetch wholesale invoices from Firebase
  useEffect(() => {
    const fetchInvoices = () => {
      try {
        const invoicesRef = ref(realtimeDb, 'wholesale_invoices');
        const unsubscribe = onValue(invoicesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const invoicesArray = Object.entries(data).map(([id, invoice]) => ({
              id,
              ...invoice
            }));
            // Sort by date, newest first
            invoicesArray.sort((a, b) => new Date(b.date) - new Date(a.date));
            setInvoices(invoicesArray);
          } else {
            setInvoices([]);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching wholesale invoices:', error);
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Filter invoices based on search and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Delete invoice
  const deleteInvoice = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await remove(ref(realtimeDb, `wholesale_invoices/${invoiceId}`));
        console.log('Invoice deleted successfully');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Failed to delete invoice');
      }
    }
  };

  // Generate PDF for invoice preview/download - matching cart export design
  const generateInvoicePDF = async (invoice) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const invoiceDate = new Date(invoice.date);
    
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
    doc.text(invoice.invoiceNumber, pageWidth - margin, 25, { align: 'right' });
    
    // Add horizontal line under header
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);
    doc.line(margin, 35, pageWidth - margin, 35);
    
    // Due Date and Subject section
    let yPosition = 50;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    doc.text('Due Date', margin, yPosition);
    doc.text('Subject', pageWidth / 2, yPosition);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(invoiceDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), margin, yPosition + 5);
    doc.text('Wholesale order', pageWidth / 2, yPosition + 5);
    
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
    doc.text(invoice.customer.name, margin, yPosition + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(invoice.customer.email || '', margin, yPosition + 10);
    if (invoice.customer.phone) {
      doc.text(invoice.customer.phone, margin, yPosition + 15);
    }
    
    // Currency
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('USD - United State Dollar', pageWidth / 2, yPosition + 5);
    
    // Items table - modern design
    yPosition = 85;
    const tableColumns = ['ITEM', 'QTY', 'UNIT PRICE', 'AMOUNT'];
    const tableRows = [];
    const productImages = [];
    
    // Process invoice items
    for (let i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      
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
      
      // Add row data
      tableRows.push([
        item.name,
        item.quantity.toString(),
        `$${item.unitPrice.toFixed(2)}`,
        `$${item.total.toFixed(2)}`
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
    const subtotal = invoice.subtotal;
    const total = invoice.total; // No discount or tax
    
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
    
    // Save the PDF
    doc.save(`brand-wholesale-invoice-${invoice.invoiceNumber}.pdf`);
  };

  if (loading) {
    return <GradientLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-white">Wholesale Invoices</h2>
            <p className="text-gray-400">View and manage wholesale invoices</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-dark border border-border rounded-lg">
          <p className="text-gray-400 text-sm font-medium">Total Invoices</p>
          <p className="text-xl font-bold text-white">{invoices.length}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-card p-4 rounded-lg space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice number, customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-dark border border-border rounded-lg text-white focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-dark border border-border rounded-lg text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="generated">Generated</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-card rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total
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
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-dark/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-white">
                      #{invoice.invoiceNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="h-4 w-4" />
                      {formatDate(invoice.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {invoice.customer.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {invoice.customer.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Package className="h-4 w-4" />
                      {invoice.items.length} items
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-primary">
                      ${invoice.total.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      invoice.status === 'paid' 
                        ? 'bg-green-500/20 text-green-400'
                        : invoice.status === 'sent'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowPreview(true);
                          // Scroll to preview after a short delay to allow render
                          setTimeout(() => {
                            previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                        }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-dark rounded-lg transition-colors"
                        title="Preview Invoice"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => generateInvoicePDF(invoice)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-dark rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteInvoice(invoice.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Invoice"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No invoices found</p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Preview - Inline Table Design */}
      {showPreview && selectedInvoice && (
        <div ref={previewRef} className="mb-6 bg-card rounded-lg overflow-hidden border border-gray-700">
          {/* Header Row */}
          <div className="bg-gray-dark px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-white">Invoice Preview</h3>
              <span className="text-sm font-mono text-primary">#{selectedInvoice.invoiceNumber}</span>
              <span className="text-sm text-gray-400">{new Date(selectedInvoice.date).toLocaleDateString()}</span>
            </div>
            <button
              onClick={() => {
                setShowPreview(false);
                setSelectedInvoice(null);
              }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Customer Info Row */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-8">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Customer:</span>
              <span className="text-sm font-medium text-white">{selectedInvoice.customer.name}</span>
            </div>
            <div className="text-sm text-gray-400">{selectedInvoice.customer.email}</div>
            {selectedInvoice.customer.phone && (
              <div className="text-sm text-gray-400">{selectedInvoice.customer.phone}</div>
            )}
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-dark/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {selectedInvoice.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-dark/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <MediaPlaceholder kind="image" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-dark rounded flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-600" />
                          </div>
                        )}
                        <span className="text-sm text-white">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                        {item.quantity} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-primary">${item.unitPrice.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-white">${item.total.toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Row */}
          <div className="px-4 py-4 bg-gray-dark/50 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Subtotal:</span>
                <span className="text-sm text-white">${selectedInvoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Tax:</span>
                <span className="text-sm text-white">${selectedInvoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Total:</span>
                <span className="text-lg font-bold text-primary">${selectedInvoice.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedInvoice(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-dark border border-border rounded-lg text-white hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => generateInvoicePDF(selectedInvoice)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WholesaleManagement;