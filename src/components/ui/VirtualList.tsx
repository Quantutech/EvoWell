
import React, { useRef, useState, useEffect } from 'react';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

const VirtualList = <T,>({ items, height, itemHeight, renderItem, className }: VirtualListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const visibleCount = Math.ceil(height / itemHeight) + 1; // Buffer
  const endIndex = Math.min(items.length, startIndex + visibleCount);
  
  const visibleItems = items.slice(startIndex, endIndex).map((item, index) => ({
    item,
    index: startIndex + index,
  }));

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div 
      ref={containerRef} 
      onScroll={onScroll} 
      className={`overflow-y-auto ${className}`}
      style={{ height }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div 
            key={index} 
            style={{ 
              position: 'absolute', 
              top: index * itemHeight, 
              width: '100%', 
              height: itemHeight 
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualList;
