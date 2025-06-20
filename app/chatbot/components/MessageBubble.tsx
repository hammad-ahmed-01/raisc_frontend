import React from 'react';

type Props = {
  text: string;
  isUser?: boolean;
};

const MessageBubble = ({ text, isUser = false }: Props) => {
  return (
    <div className={`my-2 ${isUser ? 'text-right' : 'text-left'}`}>
      <div className={`inline-block px-4 py-2 rounded-2xl ${isUser ? 'bg-gray-200 text-heading' : 'bg-blue-100 text-gray-800'}`}>{text}</div>
    </div>
  );
};

export default MessageBubble;