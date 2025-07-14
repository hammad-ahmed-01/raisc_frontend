import React from 'react';

type Props = {
  text: string;
  isUser?: boolean;
};

const MessageBubble = ({ text, isUser = false }: Props) => {
  return (
    <div className={`my-2 ${isUser ? 'text-right' : 'text-left'}`}>
      <div 
        className={`inline-block px-4 py-2 rounded-2xl font-quicksand ${isUser ? 'bg-[#B2D5F166] text-[#444444]' : 'bg-white text-[#444444]'}`}
        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
      >
        {text}
      </div>
    </div>
  );
};

export default MessageBubble;