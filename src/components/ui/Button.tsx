import React from 'react';

type Variant = 'default' | 'outline' | 'secondary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700',
};

const Button: React.FC<ButtonProps> = ({ children, variant = 'default', className = '', ...props }) => {
  const vclass = variantClasses[variant] || variantClasses.default;
  return (
    <button className={`${vclass} px-4 py-2 rounded ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
