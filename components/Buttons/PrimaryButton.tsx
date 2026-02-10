import React from "react";

interface PrimaryButtonProps {
  text?: string;                 
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;     
}

export default function PrimaryButton({
  text,
  onClick,
  className = "",
  disabled = false,
  children,
}: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`text-white primaryButton font-bold flex items-center justify-center gap-2 ${className}`}
      disabled={disabled}
    >
      {children}
      {text}
    </button>
  );
}
