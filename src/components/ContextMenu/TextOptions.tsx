import React, { useState } from 'react';
import { Wand2, Check, Expand, Shrink, Sparkles, RefreshCw, PenTool, X, Loader2, Send, FileText, Copy } from "lucide-react";
import { useTextModification } from '@/hooks/useTextModification';
import ReactMarkdown from 'react-markdown';
import ActionButton from './ActionButton';

interface TextOptionsProps {
  selectedText: string;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const TextOptions = React.forwardRef<HTMLDivElement, TextOptionsProps>(({
  selectedText,
  onClose
}, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [currentOption, setCurrentOption] = useState<string>('improve');
  const { modifyText } = useTextModification();

  const options = [
    { id: 'improve', icon: <Wand2 style={{ width: '14px', height: '14px', color: '#22c55e' }} />, label: 'Improve Writing' },
    { id: 'grammar', icon: <Check style={{ width: '14px', height: '14px', color: '#22c55e' }} />, label: 'Fix Grammar & Spelling' },
    { id: 'longer', icon: <Expand style={{ width: '14px', height: '14px', color: '#22c55e' }} />, label: 'Make Longer' },
    { id: 'shorter', icon: <Shrink style={{ width: '14px', height: '14px', color: '#22c55e' }} />, label: 'Make Shorter' },
    { id: 'simplify', icon: <Sparkles style={{ width: '14px', height: '14px', color: '#22c55e' }} />, label: 'Simplify Language' },
    { id: 'rephrase', icon: <RefreshCw style={{ width: '14px', height: '14px', color: '#22c55e' }} />, label: 'Rephrase' },
    { id: 'continue', icon: <PenTool style={{ width: '14px', height: '14px', color: '#22c55e' }} />, label: 'Continue Writing' },
    { id: 'summarize', icon: <FileText style={{ width: '14px', height: '14px', color: '#22c55e' }} />, label: 'Summarize' },
  ];

  const handleOptionSelect = async (option: string) => {
    setCurrentOption(option);
    setIsLoading(true);
    setShowResponse(true);
    setShowOptions(false);
    setShowChat(false);
    
   // setMessages([{ role: 'user', content: selectedText }]);

    try {
      const stream = await modifyText(option, selectedText);
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map((msg, idx) => 
          idx === prev.length - 1 ? { ...msg, content: fullResponse } : msg
        ));
      }
      setShowChat(true);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to process your request. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatMessage.trim()) return;
    setIsLoading(true);
    
    try {
      const stream = await modifyText('chat', chatMessage);
      setMessages(prev => [...prev, { role: 'user', content: chatMessage }]);
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map((msg, idx) => 
          idx === prev.length - 1 ? { ...msg, content: fullResponse } : msg
        ));
      }
      setChatMessage('');
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const MessageBlock = ({ 
    isUser, 
    content, 
    isLoading,
    onRegenerate,
    onCopy 
  }: { 
    isUser: boolean;
    content: string;
    isLoading?: boolean;
    onRegenerate?: () => void;
    onCopy?: () => void;
  }) => {
    return (
      <div style={{
        background: isUser ? 'transparent' : 'rgba(39, 39, 42, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingLeft: '32px',
        paddingRight: '32px',
        paddingTop: '8px',
        paddingBottom: '8px'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            color: '#f4f4f5',
            lineHeight: '1.5',
            fontSize: '14px',
          }}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          
          {!isUser && !isLoading && onRegenerate && onCopy && (
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '12px'
            }}>
              <ActionButton
                icon={<RefreshCw style={{ width: '14px', height: '14px' }} />}
                activeIcon={<Loader2 style={{ width: '14px', height: '14px' }} />}
                onClick={onRegenerate}
                tooltip="Regenerate"
              />
              <ActionButton
                icon={<Copy style={{ width: '14px', height: '14px' }} />}
                activeIcon={<Check style={{ width: '14px', height: '14px' }} />}
                onClick={onCopy}
                tooltip="Copy to clipboard"
              />
            </div>
          )}
        </div>
      </div>
    );
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
              {selectedText.substring(0, 100)}...
            </p>
          </div>

          {/* Options and Response content */}
          <div style={{ flex: 1 }}>
            {showOptions && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
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
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
              }}>
                {messages.map((message, index) => (
                  <MessageBlock
                    key={index}
                    isUser={message.role === 'user'}
                    content={message.content}
                    isLoading={isLoading && index === messages.length - 1 && message.role === 'assistant'}
                    onRegenerate={message.role === 'assistant' ? () => handleOptionSelect(currentOption) : undefined}
                    onCopy={message.role === 'assistant' ? () => navigator.clipboard.writeText(message.content) : undefined}
                  />
                ))}
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