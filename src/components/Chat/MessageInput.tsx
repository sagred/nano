import React, { useState, KeyboardEvent } from 'react';
import { Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-[#27272a] bg-black">
      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1 bg-transparent border border-[#27272a] rounded-md px-3 py-2 text-[#f4f4f5] text-sm placeholder:text-[#71717a] focus:outline-none focus:ring-1 focus:ring-[#22c55e]"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !message.trim()}
          className="p-2 bg-[#22c55e] text-white rounded-md hover:bg-[#16a34a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};