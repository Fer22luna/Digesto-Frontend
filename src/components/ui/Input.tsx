import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, ...props }) => {
  return (
    <div className="flex flex-col">
      {label && <label className="mb-1 font-medium">{label}</label>}
      <input className="p-2 border rounded" {...props} />
    </div>
  );
};

export default Input;
