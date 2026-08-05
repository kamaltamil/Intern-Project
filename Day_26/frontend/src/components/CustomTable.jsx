import React from 'react';
import { Card, Table, Skeleton } from 'antd';

const CustomTable = ({
  title,
  extraHeader,      
  isLoading = false,
  rowKey = "_id",   
  dataSource = [],  
  columns = [],   
  pagination = { pageSize: 5 },
  tableTitleRender, 
  scroll,
}) => {
  return (
    <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm">
      {/* Dynamic Header Block: Only renders if title or an extra layout item exists */}
      {(title || extraHeader) && (
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          {title && <span className="font-semibold text-[#2E2A27]">{title}</span>}
          {extraHeader && <div>{extraHeader}</div>}
        </div>
      )}

      {/* Skeleton Loading State Sync */}
      {isLoading && dataSource.length === 0 ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <div className="overflow-auto">
          <Table
            rowKey={rowKey}
            dataSource={dataSource}
            columns={columns}
            pagination={pagination}
            title={tableTitleRender}
            scroll={scroll}
          />
        </div>
      )}
    </Card>
  );
};

export default CustomTable;
