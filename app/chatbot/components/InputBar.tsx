import React, { useState } from "react";
import { Send, Mic, Square, X } from "lucide-react";

interface InputBarProps {
  onSend: (message: string) => void;
  onVoiceStart: () => void;
  onVoiceSend: () => void;
  onVoiceCancel: () => void;
  isRecording: boolean;
  voiceLoading: boolean;
  isConnectedToSTT: boolean;
  audioLevel: number;
}

const InputBar = ({
  onSend,
  onVoiceStart,
  onVoiceSend,
  onVoiceCancel,
  isRecording,
  voiceLoading,
  isConnectedToSTT,
  audioLevel,
}: InputBarProps) => {
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
    <div className="p-4 bg-transparent font-quicksand">
      <div className="relative w-full text-heading2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          disabled={isRecording || voiceLoading}
          className="w-full p-3 pr-24 rounded-full border border-normal bg-[#B2D5F1] text-heading placeholder:text-heading focus:outline-none focus:ring-2 focus:ring-heading transition-all font-quicksand disabled:bg-gray-200 disabled:cursor-not-allowed"
        />

        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex space-x-3 text-[#1E3CA7] font-bold">
          {!isRecording ? (
            <button
              onClick={onVoiceStart}
              disabled={!isConnectedToSTT || voiceLoading}
              title={isConnectedToSTT ? "Start voice recording" : "Voice not available"}
              className={`hover:opacity-70 transition-opacity bg-transparent border-none p-0 ${
                isConnectedToSTT && !voiceLoading
                  ? "text-heading2"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              <Mic size={22} strokeWidth={2.5} />
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={onVoiceSend}
                disabled={voiceLoading}
                title="Send voice message"
                className={`hover:opacity-70 transition-opacity bg-transparent border-none p-0 ${
                  voiceLoading ? "text-gray-400 cursor-not-allowed" : "text-green-600"
                }`}
              >
                <Square size={22} strokeWidth={2.5} />
              </button>

              <button
                onClick={onVoiceCancel}
                disabled={voiceLoading}
                title="Cancel voice message"
                className="hover:opacity-70 transition-opacity bg-transparent border-none p-0 text-red-600"
              >
                <X size={22} strokeWidth={2.5} />
              </button>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={!message.trim() || isRecording || voiceLoading}
            title="Send message"
            className={`hover:opacity-70 transition-opacity bg-transparent border-none p-0 ${
              message.trim() && !isRecording && !voiceLoading
                ? "text-[#1E3CA7]"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            <Send size={22} strokeWidth={2.5} />
          </button>
        </div>

        {isRecording && (
          <div className="absolute -top-8 left-0 right-0 flex justify-center">
            <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium">
                {voiceLoading ? "Sending..." : "Recording..."}
              </span>
              {!voiceLoading && (
                <div className="w-8 h-1 bg-red-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 transition-all duration-100"
                    style={{ width: `${Math.max(audioLevel * 100, 10)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputBar;
