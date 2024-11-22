import React, { useState, useEffect, useRef } from 'react';
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
  const [focusedOptionIndex, setFocusedOptionIndex] = useState<number>(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const responseContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showOptions) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          setFocusedOptionIndex(prev => 
            prev < options.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          setFocusedOptionIndex(prev => 
            prev > 0 ? prev - 1 : prev
          );
          break;
        case 'Enter':
          e.preventDefault();
          e.stopPropagation();
          if (focusedOptionIndex >= 0) {
            handleOptionSelect(options[focusedOptionIndex].id);
          }
          break;
      }
    };

    // Listen on the document level but check if modal is open
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [showOptions, focusedOptionIndex, options]);

  useEffect(() => {
    const container = responseContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
      setShouldAutoScroll(isAtBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      const container = responseContainerRef.current;
      if (container) {
        // Add a small delay to ensure the DOM has updated
        setTimeout(() => {
          // Calculate the total height needed to show the input
          const chatInput = container.querySelector('[data-chat-input]');
          const inputHeight = chatInput ? chatInput.getBoundingClientRect().height : 0;
          
          container.scrollTo({
            top: container.scrollHeight + inputHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [messages, shouldAutoScroll]);

  const handleOptionSelect = async (option: string, messageIndex?: number) => {
    setCurrentOption(option);
    setIsLoading(true);
    setShowResponse(true);
    setShowOptions(false);
    setShowChat(false);

    try {
      // If messageIndex is provided, we're regenerating a specific message
      if (messageIndex !== undefined) {
        // Keep messages up to the one being regenerated
        setMessages(prev => prev.slice(0, messageIndex));
        const stream = await modifyText(option, selectedText);
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        
        let fullResponse = '';
        for await (const chunk of stream) {
          fullResponse += chunk;
          setMessages(prev => prev.map((msg, idx) => 
            idx === prev.length - 1 ? { ...msg, content: fullResponse } : msg
          ));
        }
      } else {
        // Initial generation
        const stream = await modifyText(option, selectedText);
        setMessages([{ role: 'assistant', content: '' }]);
        
        let fullResponse = '';
        for await (const chunk of stream) {
          fullResponse += chunk;
          setMessages(prev => prev.map((msg, idx) => 
            idx === prev.length - 1 ? { ...msg, content: fullResponse } : msg
          ));
        }
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
              gap: '4px',
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

  const closeButtonStyles = {
    position: 'absolute' as const,
    top: '16px',
    right: '16px',
    padding: '8px',
    background: 'rgba(39, 39, 42, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#71717a',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(8px)',
    zIndex: 10,
    width: '32px',
    height: '32px'
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
        flexDirection: 'column',
        position: 'relative'
      }}>
        <button 
          onClick={onClose} 
          style={closeButtonStyles}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(39, 39, 42, 0.8)';
            e.currentTarget.style.color = '#f4f4f5';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(39, 39, 42, 0.5)';
            e.currentTarget.style.color = '#71717a';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <X style={{ 
            width: '16px', 
            height: '16px',
            strokeWidth: 2.5 
          }} />
        </button>

        {/* Scrollable container for all content */}
        <div 
          ref={responseContainerRef}
          style={{ 
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header - stays at top */}
          <div style={{
            padding: '12px',
            paddingLeft: '24px',
            paddingRight: '24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: '#18181B',
            position: 'relative'
          }}>
            <h2 style={{ 
              color: '#f4f4f5', 
              fontSize: '18px',
              fontWeight: 500,
              marginBottom: '12px'
            }}>
              What do you want to do with the selected text?
            </h2>
            <p style={{ 
              color: '#71717a', 
              fontSize: '14px',
              lineHeight: '1.5',
              maxWidth: '90%'
            }}>
              {selectedText.substring(0, 100)}...
            </p>
          </div>

          {/* Options and Response content */}
          <div style={{ flex: 1  }}>
            {showOptions && (
              <div style={{ display: 'flex', flexDirection: 'column', padding: '12px' }}>
                {options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#27272a';
                      e.currentTarget.style.color = '#f4f4f5';
                      setFocusedOptionIndex(options.findIndex(opt => opt.id === option.id));
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#d4d4d8';
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: focusedOptionIndex === options.findIndex(opt => opt.id === option.id) 
                        ? '#27272a' 
                        : 'transparent',
                      border: 'none',
                      color: focusedOptionIndex === options.findIndex(opt => opt.id === option.id)
                        ? '#f4f4f5'
                        : '#d4d4d8',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textAlign: 'left',
                      borderRadius: '6px',
                      outline: 'none'
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
                    onRegenerate={message.role === 'assistant' ? () => handleOptionSelect(currentOption, index) : undefined}
                    onCopy={message.role === 'assistant' ? () => navigator.clipboard.writeText(message.content) : undefined}
                  />
                ))}

                {showChat && !isLoading && (
                  <div 
                    data-chat-input
                    style={{
                      padding: '16px 32px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'transparent'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleChat();
                          }
                        }}
                        placeholder="Ask a follow-up question..."
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: 'var(--primary)',
                          border: 'none',
                          borderRadius: '6px',
                          color: 'var(--primary-foreground)',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                      <button
                        onClick={handleChat}
                        disabled={isLoading}
                        style={{
                          padding: '8px',
                          background: 'var(--primary)',
                          border: 'none',
                          borderRadius: '6px',
                          color: 'var(--primary-foreground)',
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
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

TextOptions.displayName = "TextOptions"; 