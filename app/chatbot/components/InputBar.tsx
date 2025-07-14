import React, { useState } from "react";
import { Send, Mic } from "lucide-react";

const InputBar = ({ onSend }: { onSend: (message: string) => void }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed) {
      onSend(trimmed);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-blue-100 font-quicksand">
      <div className="relative w-full">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className="w-full p-3 pr-24 rounded-full border border-normal bg-[#B2D5F1] text-heading placeholder:text-heading focus:outline-none focus:ring-2 focus:ring-heading transition-all font-quicksand"
        />
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 flex space-x-3 text-[#1E3CA7] font-bold">
          <button title="Voice Input" type="button" className="hover:opacity-70 text-[#1E3CA7] transition-opacity bg-transparent border-none p-0">
            <Mic size={22} strokeWidth={2.5} />
          </button>
          <button onClick={handleSend} title="Send" type="button" className="hover:opacity-70 text-[#1E3CA7] transition-opacity bg-transparent border-none p-0">
            <Send size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputBar;
