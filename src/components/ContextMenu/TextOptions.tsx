import React, { useState } from 'react';
import { Wand2, Check, Expand, Shrink, Sparkles, RefreshCw, PenTool, X, Loader2, Send, FileText } from "lucide-react";
import { useTextModification } from '@/hooks/useTextModification';
import ReactMarkdown from 'react-markdown';

interface TextOptionsProps {
  selectedText: string;
  onClose: () => void;
}

export const TextOptions = React.forwardRef<HTMLDivElement, TextOptionsProps>(({
  selectedText,
  onClose
}, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [showResponse, setShowResponse] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const { modifyText } = useTextModification();

  const options = [
    { id: 'improve', icon: <Wand2 className="h-4 w-4" />, label: 'Improve Writing' },
    { id: 'grammar', icon: <Check className="h-4 w-4" />, label: 'Fix Grammar & Spelling' },
    { id: 'longer', icon: <Expand className="h-4 w-4" />, label: 'Make Longer' },
    { id: 'shorter', icon: <Shrink className="h-4 w-4" />, label: 'Make Shorter' },
    { id: 'simplify', icon: <Sparkles className="h-4 w-4" />, label: 'Simplify Language' },
    { id: 'rephrase', icon: <RefreshCw className="h-4 w-4" />, label: 'Rephrase' },
    { id: 'continue', icon: <PenTool className="h-4 w-4" />, label: 'Continue Writing' },
    { id: 'summarize', icon: <FileText className="h-4 w-4" />, label: 'Summarize' },
  ];

  const handleOptionSelect = async (option: string) => {
    setIsLoading(true);
    setShowResponse(true);
    setShowOptions(false);
    setShowChat(false);
    setResponse('');

    try {
      const stream = await modifyText(option, selectedText);
      for await (const chunk of stream) {
        setResponse(prev => prev + chunk);
      }
      setShowChat(true);
    } catch (error) {
      setResponse('Failed to process your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatMessage.trim()) return;
    setIsLoading(true);
    
    try {
      const stream = await modifyText('chat', chatMessage);
      let newResponse = response + '\n\n**You:** ' + chatMessage + '\n\n**Assistant:** ';
      setResponse(newResponse);
      
      for await (const chunk of stream) {
        setResponse(prev => prev + chunk);
      }
      setChatMessage('');
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-container">
      <div className="modal-backdrop" onClick={onClose} />
      <div ref={ref} className="modal-content" style={{ 
        width: '700px',
        height: '500px',
        background: '#18181B',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Scrollable container for all content */}
        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header - stays at top */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: '#18181B'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ color: '#f4f4f5', fontSize: '18px' }}>
                What do you want to do with the selected text?
              </h2>
              <button onClick={onClose} style={{
                background: 'transparent',
                border: 'none',
                color: '#71717a',
                cursor: 'pointer',
                padding: '4px'
              }}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
            <p style={{ color: '#71717a', fontSize: '14px', marginTop: '4px' }}>
              Selected text: {selectedText.substring(0, 100)}...
            </p>
          </div>

          {/* Options and Response content */}
          <div style={{ padding: '16px', flex: 1 }}>
            {showOptions && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#d4d4d8',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#27272a';
                      e.currentTarget.style.color = '#f4f4f5';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#d4d4d8';
                    }}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {showResponse && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  color: '#f4f4f5',
                  lineHeight: '1.5'
                }}>
                  <ReactMarkdown>{response}</ReactMarkdown>
                  {isLoading && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#71717a',
                      marginLeft: '4px'
                    }}>
                      <Loader2 style={{ 
                        width: '16px', 
                        height: '16px', 
                        animation: 'spin 1s linear infinite' 
                      }} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat input - only shown after response is complete */}
        {showChat && !isLoading && (
          <div style={{
            padding: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: '#18181B'
          }}>
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                placeholder="Ask a follow-up question..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: '#27272a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#f4f4f5',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={handleChat}
                disabled={isLoading}
                style={{
                  padding: '8px',
                  background: '#27272a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#f4f4f5',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Send style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

TextOptions.displayName = "TextOptions"; 