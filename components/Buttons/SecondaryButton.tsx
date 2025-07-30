import React from "react";

interface SecondaryButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function SecondaryButton({
  text,
  onClick,
  className = "",
  disabled = false,
}: SecondaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`text-[#1E3CA7] secondaryButton font-bold ${className}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
}