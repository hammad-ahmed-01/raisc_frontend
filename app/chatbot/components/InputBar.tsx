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
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-blue-100">
      <div className="relative w-full">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className="w-full p-3 pr-20 rounded-full border border-normal bg-[#B2D5F1] text-heading placeholder:text-heading focus:outline-none focus:ring-2 focus:ring-heading transition-all"
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-2 text-heading">
          <button title="Voice Input">
            <Mic size={18} />
          </button>
          <button onClick={handleSend} title="Send">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputBar;
