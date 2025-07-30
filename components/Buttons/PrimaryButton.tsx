import React from "react";

interface PrimaryButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function PrimaryButton({
  text,
  onClick,
  className = "",
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`text-white primaryButton font-bold ${className}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
}