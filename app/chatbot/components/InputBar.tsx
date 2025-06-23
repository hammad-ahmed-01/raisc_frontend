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
    <div className="flex items-center p-4 bg-blue-100">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type your message..."
        className="flex-grow p-3 rounded-full border border-normal focus:outline-none focus:heading2 focus:ring-heading transition-all"
      />
      <button className="ml-3 text-white hover:text-white-300" title="Voice Input">
        <Mic size={20} />
      </button>
      <button
        className="ml-3 text-white hover:text-white-300"
        onClick={handleSend}
        title="Send"
      >
        <Send size={20} />
      </button>
    </div>
  );
};

export default InputBar;
