import React, { useState, useEffect, useRef } from 'react';
import { Card, Table, Skeleton } from 'antd';

const CustomTable = ({
  title,
  extraHeader,      
  isLoading = false,
  isError = false,
  rowKey = "_id",   
  dataSource = [],  
  columns = [],   
  pagination = { pageSize: 5 },
  tableTitleRender, 
  scroll,
}) => {
  const tableWrapperRef = useRef(null);
  const [internalScrollY, setInternalScrollY] = useState(300); // fallback height

  useEffect(() => {
    if (!tableWrapperRef.current) return;

    const calculateAvailableTableHeight = () => {
      if (tableWrapperRef.current) {
        // Find where the table body starts relative to the top of the viewport
        const rect = tableWrapperRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
      
        const paddingOffset = 160;
        const availableHeight = windowHeight - rect.top - paddingOffset;

        // Keep a sensible minimum height so the layout never squishes to 0 on small screens
        setInternalScrollY(Math.max(availableHeight, 150));
      }
    };

    // Listen to container/screen size updates dynamically
    const observer = new ResizeObserver(() => calculateAvailableTableHeight());
    observer.observe(tableWrapperRef.current);
    
    // Initial calculation on mount
    calculateAvailableTableHeight();

    return () => observer.disconnect();
  }, [dataSource]); // Recalculate if dataset updates or filters change

  return (
    <Card className="rounded-2xl border overflow-hidden border-[#ECE6DF] shadow-sm">
      {(title || extraHeader) && (
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          {title && <span className="font-semibold text-[#2E2A27]">{title}</span>}
          {extraHeader && <div>{extraHeader}</div>}
        </div>
      )}

      {/* Skeleton Loading State Sync */}
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <div ref={tableWrapperRef} className="w-full overflow-hidden pr-1">
          <Table
            className="custom-scroll-table"
            rowKey={rowKey}
            dataSource={dataSource}
            columns={columns}
            pagination={pagination}
            title={tableTitleRender}
            scroll={scroll || { y: internalScrollY, x: 'max-content' }}
          />
        </div>
      )}
    </Card>
  );
};

export default CustomTable;
