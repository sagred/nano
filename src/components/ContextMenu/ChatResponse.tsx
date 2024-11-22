import React from 'react';
import { Loader2 } from "lucide-react";

interface ChatResponseProps {
  response: string;
  isLoading: boolean;
  onClose: () => void;
}

export const ChatResponse = React.forwardRef<HTMLDivElement, ChatResponseProps>(({
  response,
  isLoading,
  onClose
}, ref) => {
  return (
    <div className="modal-container">
      <div className="modal-backdrop" onClick={onClose} />
      <div ref={ref} className="modal-content">
        <div style={{
          padding: '16px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <div style={{
            color: '#f4f4f5',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap'
          }}>
            {response}
            {isLoading && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#71717a',
                marginLeft: '4px'
              }}>
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ChatResponse.displayName = "ChatResponse"; 