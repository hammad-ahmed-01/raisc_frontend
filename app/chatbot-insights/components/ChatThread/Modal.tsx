import React from 'react';
import { X } from 'lucide-react';

const Modal = ({
  children,
  onClose
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-1 right-1 z-10 bg-transparent"
        >
          <X className="bg-heading2 text-white rounded-full border-2 font-bold w-8 h-8" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
