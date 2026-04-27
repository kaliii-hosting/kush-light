import React, { useRef, useEffect, useState, useCallback } from 'react';
import LazyImage from './LazyImage';
import ProductHoverActions from './ProductHoverActions';

const VirtualizedProductGrid = ({ 
  products, 
  onProductClick, 
  itemsPerRow = 4, 
  rowHeight = 300,
  buffer = 2,
  gap = 16 
}) => {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const [containerHeight, setContainerHeight] = useState(0);

  const totalRows = Math.ceil(products.length / itemsPerRow);
  const totalHeight = totalRows * (rowHeight + gap) - gap;

  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;

    const startRow = Math.max(0, Math.floor(scrollTop / (rowHeight + gap)) - buffer);
    const endRow = Math.min(
      totalRows - 1, 
      Math.ceil((scrollTop + viewportHeight) / (rowHeight + gap)) + buffer
    );

    const start = startRow * itemsPerRow;
    const end = Math.min((endRow + 1) * itemsPerRow, products.length);

    setVisibleRange({ start, end });
  }, [rowHeight, gap, buffer, itemsPerRow, totalRows, products.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      setContainerHeight(container.clientHeight);
      updateVisibleRange();
    });

    resizeObserver.observe(container);
    updateVisibleRange();

    return () => resizeObserver.disconnect();
  }, [updateVisibleRange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId;
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateVisibleRange);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [updateVisibleRange]);

  const visibleProducts = products.slice(visibleRange.start, visibleRange.end);
  const offsetY = Math.floor(visibleRange.start / itemsPerRow) * (rowHeight + gap);

  return (
    <div 
      ref={containerRef}
      className="relative overflow-auto h-full"
      style={{ maxHeight: '80vh' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{ 
            transform: `translateY(${offsetY}px)`,
            display: 'grid',
            gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`,
            gap: `${gap}px`,
          }}
        >
          {visibleProducts.map((product, index) => {
            const actualIndex = visibleRange.start + index;
            return (
              <div
                key={product.id || actualIndex}
                className="group relative bg-[#181818] rounded-lg overflow-hidden hover:bg-[#282828] transition-all cursor-pointer"
                style={{ height: rowHeight }}
                onClick={(e) => onProductClick(product, e)}
              >
                <div className="aspect-square relative overflow-hidden bg-[#282828]">
                  <ProductHoverActions 
                    product={product}
                    onProductClick={onProductClick}
                  />
                  {product.imageUrl && (
                    <LazyImage 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      threshold={0.1}
                      rootMargin="100px"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-400">{product.category}</p>
                  <p className="text-lg font-bold text-white mt-2">${product.price}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VirtualizedProductGrid;