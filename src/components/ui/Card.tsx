import React from 'react';

interface CardProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="p-4 border rounded shadow-sm bg-white">{children}</div>
  );
};

export default Card;
