import React from 'react';
import clsx from 'clsx';

interface ButtonProps {
  text: string;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ text, variant = 'primary' }) => {
  const baseClasses = 'px-6 py-2 rounded-full font-medium shadow-md transition-all';
  const variants = {
    primary: 'bg-[#DBE3FF] font-semibold text-[#1E3CA7] hover:bg-blue-700 hover:text-white',
    secondary: 'bg-white font-semibold text-[#1E3CA7] border border-blue-300 hover:bg-blue-100',
  };

  return (
    <button className={clsx(baseClasses, variants[variant])}>
      {text}
    </button>
  );
};

export default Button;
