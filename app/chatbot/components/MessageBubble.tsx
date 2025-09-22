import React from 'react';

type Props = {
  text: string;
  isUser?: boolean;
  isVoiceMessage?: boolean;
};

const MessageBubble = ({ text, isUser = false, isVoiceMessage = false }: Props) => {
  return (
    <div className={`my-2 ${isUser ? 'text-right' : 'text-left'}`}>
      <div
        className={`inline-block max-w-[92%] sm:max-w-[80%] px-4 py-2 rounded-2xl font-quicksand ${isUser ? 'bg-[#B2D5F166] text-[#444444]' : 'bg-[#A6B6CC66] text-[#444444]'}`}
        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
      >
        <div className="flex items-center space-x-2">
          {isVoiceMessage && (
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          )}
          <span>{text}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
