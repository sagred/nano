import React, { useState, KeyboardEvent } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  disabled 
}) => {
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
    <div className="p-4 bg-slate-800 border-t border-slate-700">
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="w-full resize-none rounded-lg border border-slate-600 bg-slate-700 text-slate-100 pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[52px] max-h-[200px] text-sm placeholder-slate-400"
          rows={1}
          disabled={disabled}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !message.trim()}
          className={`absolute right-2 bottom-2.5 p-1.5 rounded-lg ${
            disabled || !message.trim()
              ? 'text-slate-500 cursor-not-allowed'
              : 'text-indigo-400 hover:bg-slate-600'
          }`}
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};