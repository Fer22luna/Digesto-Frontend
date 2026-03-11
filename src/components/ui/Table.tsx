import React from 'react';

interface TableProps {
  children: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ children }) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      {children}
    </table>
  );
};

export default Table;
