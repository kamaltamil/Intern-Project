// import React, { useState, useEffect, useRef } from 'react';
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

  return (
    <Card loading={isLoading} className="rounded-2xl border overflow-hidden border-[#ECE6DF] shadow-sm">
      {(title || extraHeader) && (
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          {title && <span className="font-semibold text-[#2E2A27]">{title}</span>}
          {extraHeader && <div>{extraHeader}</div>}
        </div>
      )}

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (

      <div className="w-full overflow-hidden p-0 my-custom-table">
        <Table
          rowKey={rowKey}
          dataSource={dataSource}
          columns={columns}
          pagination={pagination}
          title={tableTitleRender}
          scroll={scroll || { y: 'max(100vh - 350px, 300px)', x: 'max-content' }}
        />
      </div>
      )}
    </Card>
  );
};

export default CustomTable;
