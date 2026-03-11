import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea: React.FC<TextareaProps> = ({ ...props }) => {
  return <textarea className="p-2 border rounded" {...props} />;
};

export default Textarea;
