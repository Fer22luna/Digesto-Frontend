import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select: React.FC<SelectProps> = ({ children, ...props }) => {
  return (
    <select className="p-2 border rounded" {...props}>
      {children}
    </select>
  );
};

export default Select;
