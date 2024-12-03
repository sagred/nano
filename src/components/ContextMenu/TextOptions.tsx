import React, { useState, useEffect, useRef } from "react";
import {
  Wand2,
  Check,
  Expand,
  Shrink,
  Sparkles,
  RefreshCw,
  PenTool,
  X,
  Loader2,
  Send,
  FileText,
  Copy,
  Plus,
  ArrowLeft,
  Pencil,
} from "lucide-react";
import { useTextModification } from "@/hooks/useTextModification";
import ReactMarkdown from "react-markdown";
import ActionButton from "./ActionButton";
import { LoadingAnimation } from "./LoadingAnimation";
import { useCustomInstructions } from "@/hooks/useCustomInstructions";
import { AddInstructionForm } from "./AddInstructionForm";
import { instructionsDb } from "@/services/storage/instructions";
import { CustomInstruction } from "@/types/instructions";
import { usePageContent } from '@/hooks/usePageContent';
import type { PageContent } from '@/types/pageContent';
import { getPageContent } from '@/utils/getPageContent';

interface TextOptionsProps {
  selectedText?: string;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const TextOptions = React.forwardRef<HTMLDivElement, TextOptionsProps>(
  ({ selectedText, onClose }, ref) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResponse, setShowResponse] = useState(false);
    const [showOptions, setShowOptions] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [chatMessage, setChatMessage] = useState("");
    const [currentOption, setCurrentOption] = useState<string>("improve");
    const { modifyText } = useTextModification();
    const [focusedOptionIndex, setFocusedOptionIndex] = useState<number>(-1);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const responseContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [pendingText, setPendingText] = useState("");
    const [pendingOption, setPendingOption] = useState<string | null>(null);
    const [stage, setStage] = useState<
      "options" | "input" | "response" | "add-instruction"
    >("options");

    const { customInstructions, refreshInstructions } = useCustomInstructions();

    const [editingInstruction, setEditingInstruction] = useState<
      CustomInstruction | undefined
    >(undefined);

    const [quickChatInput, setQuickChatInput] = useState("");

    const { getPageContent } = usePageContent();

    const [isChatMode, setIsChatMode] = useState(false);

    const allOptions = [
      ...(selectedText ? [] : [{
        id: "summarize-page",
        icon: (
          <FileText style={{ width: "14px", height: "14px", color: "#22c55e" }} />
        ),
        label: "Summarize This Page",
      }]),
      {
        id: "improve",
        icon: (
          <Wand2 style={{ width: "14px", height: "14px", color: "#22c55e" }} />
        ),
        label: "Improve Writing",
      },
      {
        id: "grammar",
        icon: (
          <Check style={{ width: "14px", height: "14px", color: "#22c55e" }} />
        ),
        label: "Fix Grammar & Spelling",
      },
      {
        id: "longer",
        icon: (
          <Expand style={{ width: "14px", height: "14px", color: "#22c55e" }} />
        ),
        label: "Make Longer",
      },
      {
        id: "shorter",
        icon: (
          <Shrink style={{ width: "14px", height: "14px", color: "#22c55e" }} />
        ),
        label: "Make Shorter",
      },
      {
        id: "simplify",
        icon: (
          <Sparkles
            style={{ width: "14px", height: "14px", color: "#22c55e" }}
          />
        ),
        label: "Simplify Language",
      },
      {
        id: "rephrase",
        icon: (
          <RefreshCw
            style={{ width: "14px", height: "14px", color: "#22c55e" }}
          />
        ),
        label: "Rephrase",
      },
      {
        id: "continue",
        icon: (
          <PenTool
            style={{ width: "14px", height: "14px", color: "#22c55e" }}
          />
        ),
        label: "Continue Writing",
      },
      {
        id: "summarize",
        icon: (
          <FileText
            style={{ width: "14px", height: "14px", color: "#22c55e" }}
          />
        ),
        label: "Summarize",
      },
      ...customInstructions.map((instruction) => ({
        id: instruction.id,
        icon: (
          <Sparkles
            style={{ width: "14px", height: "14px", color: "#22c55e" }}
          />
        ),
        label: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              gap: "8px",
            }}
          >
            <span>{instruction.name}</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  setStage("add-instruction");
                  // Pass the instruction data for editing
                  setEditingInstruction(instruction);
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: "#71717a",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f4f4f5")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
              >
                <Pencil style={{ width: "14px", height: "14px" }} />
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await instructionsDb.deleteInstruction(instruction.id);
                  refreshInstructions();
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: "#71717a",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f4f4f5")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
              >
                <X style={{ width: "14px", height: "14px" }} />
              </button>
            </div>
          </div>
        ),
        isCustom: true,
        instruction: instruction.instruction,
      })),
    ];

    useEffect(() => {
      refreshInstructions();
    }, []);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Skip if the event is from an input and being handled there
        const isFromInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
        if (isFromInput) return;

        if (e.key === "Escape") {
          e.preventDefault();
          
          // Always handle Escape for these cases
          if (stage === "add-instruction") {
            setStage("options");
            return;
          }
          
          if (stage === "options") {
            onClose();
            return;
          }

          // For other stages when not in input
          setStage("options");
          setShowOptions(true);
          setPendingText("");
          setPendingOption(null);
          setMessages([]);
          setIsLoading(false);
          setShowChat(false);
          setChatMessage("");
          setCurrentOption("improve");
          if (inputRef.current) {
            inputRef.current.value = "";
          }
          return;
        }

        // Handle navigation keys only in options stage
        if (stage === "options") {
          switch (e.key) {
            case "ArrowDown":
              e.preventDefault();
              setFocusedOptionIndex((prev) => 
                prev < allOptions.length - 1 ? prev + 1 : prev
              );
              break;
            case "ArrowUp":
              e.preventDefault();
              setFocusedOptionIndex((prev) => 
                prev > 0 ? prev - 1 : prev
              );
              break;
            case "Enter":
              e.preventDefault();
              if (focusedOptionIndex >= 0) {
                handleOptionSelect(allOptions[focusedOptionIndex].id);
              }
              break;
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [stage, allOptions, focusedOptionIndex, onClose]);

    useEffect(() => {
      const container = responseContainerRef.current;
      if (!container) return;

      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isAtBottom =
          Math.abs(scrollHeight - scrollTop - clientHeight) < 20;
        setShouldAutoScroll(isAtBottom);
      };

      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
      if (shouldAutoScroll && messagesEndRef.current) {
        const container = responseContainerRef.current;
        if (container) {
          // Add a small delay to ensure the DOM has updated
          setTimeout(() => {
            // Calculate the total height needed to show the input
            const chatInput = container.querySelector("[data-chat-input]");
            const inputHeight = chatInput
              ? chatInput.getBoundingClientRect().height
              : 0;

            container.scrollTo({
              top: container.scrollHeight + inputHeight,
              behavior: "smooth",
            });
          }, 100);
        }
      }
    }, [messages, shouldAutoScroll]);

    const handleOptionSelect = async (
      option: string,
      messageIndex?: number
    ) => {
      if (option === "summarize-page") {
        await handlePageSummarization();
        return;
      }

      const selectedOption = allOptions.find((opt) => opt.id === option);
      if (!selectedOption) return;

      if (!selectedText && !chatMessage.trim()) {
        setCurrentOption(option);
        setShowOptions(false);
        setStage("input");
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
        return;
      }

      const textToProcess = selectedText || chatMessage;
      setCurrentOption(option);
      setIsLoading(true);
      setShowOptions(false);
      setStage("response");

      try {
        let stream;
        if ("isCustom" in selectedOption && selectedOption.instruction) {
          // Handle custom instruction
          const customPrompt = selectedOption.instruction.replace(
            "{text}",
            textToProcess
          );
          stream = await modifyText("custom", customPrompt);
        } else {
          // Handle built-in options
          stream = await modifyText(option, textToProcess);
        }

        // Add the user's text as the first message
        setMessages([
          { role: "user", content: textToProcess },
          { role: "assistant", content: "" },
        ]);

        let fullResponse = "";
        for await (const chunk of stream) {
          fullResponse += chunk;
          setMessages((prev) =>
            prev.map((msg, idx) =>
              idx === prev.length - 1 ? { ...msg, content: fullResponse } : msg
            )
          );
        }

        setChatMessage(""); // Clear input after processing
        setShowChat(true);
      } catch (error) {
        setMessages([
          { role: "user", content: textToProcess },
          {
            role: "assistant",
            content: "Failed to process your request. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    const handleQuickChat = async () => {
      if (!quickChatInput.trim()) return;

      setIsLoading(true);
      setStage("response");
      setShowOptions(false);
      setIsChatMode(true);

      try {
        const stream = await modifyText("chat", quickChatInput);
        setMessages([
          { 
            role: "user", 
            content: quickChatInput 
          },
          { role: "assistant", content: "" },
        ]);

        let fullResponse = "";
        for await (const chunk of stream) {
          fullResponse += chunk;
          setMessages((prev) =>
            prev.map((msg, idx) =>
              idx === prev.length - 1 ? { ...msg, content: fullResponse } : msg
            )
          );
        }

        setQuickChatInput("");
        setShowChat(true);
      } catch (error) {
        console.error("Chat error:", error);
        setMessages([
          { role: "user", content: quickChatInput },
          { 
            role: "assistant", 
            content: "Sorry, I couldn't process your request. Please try again." 
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    const handleChat = async () => {
      if (!chatMessage.trim()) return;
      setIsLoading(true);
      setIsChatMode(true);

      try {
        const stream = await modifyText("chat", chatMessage);
        setMessages((prev) => [
          ...prev,
          { role: "user", content: chatMessage },
        ]);
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        let fullResponse = "";
        for await (const chunk of stream) {
          fullResponse += chunk;
          setMessages((prev) =>
            prev.map((msg, idx) =>
              idx === prev.length - 1 ? { ...msg, content: fullResponse } : msg
            )
          );
        }
        setChatMessage("");
      } catch (error) {
        console.error("Chat error:", error);
      } finally {
        setIsLoading(false);
        // Focus input after response is complete
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    };

    const handlePageSummarization = async () => {
      setCurrentOption("summarize-page");
      setIsLoading(true);
      setShowOptions(false);
      setStage("response");

      try {
        // Get page content directly
        const { content, title, url } = getPageContent();

        console.log('Page content:', content);
        
        if (!content) {
          throw new Error("No content found on page");
        }

        console.log('Content length:', content.length);

        const stream = await modifyText("summarize-page", content);
        
        setMessages([
          { 
            role: "user", 
            content: `Summarizing: ${title || 'Current page'}\nURL: ${url}`
          },
          { role: "assistant", content: "" },
        ]);

        let fullResponse = "";
        for await (const chunk of stream) {
          fullResponse += chunk;
          setMessages((prev) =>
            prev.map((msg, idx) =>
              idx === prev.length - 1 ? { ...msg, content: fullResponse } : msg
            )
          );
        }

        setShowChat(true);
      } catch (error) {
        console.error("Summarization error:", error);
        setMessages([
          { role: "user", content: "Failed to summarize the page" },
          {
            role: "assistant",
            content: `Sorry, I couldn't summarize this page. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    const MessageBlock = ({
      isUser,
      content,
      isLoading,
      onRegenerate,
      onCopy,
    }: {
      isUser: boolean;
      content: string;
      isLoading?: boolean;
      onRegenerate?: () => void;
      onCopy?: () => void;
    }) => {
      return (
        <div
          style={{
            background: isUser ? "transparent" : "rgba(255, 255, 255, 0.05)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            paddingLeft: "32px",
            paddingRight: "32px",
            paddingTop: "8px",
            paddingBottom: "8px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: "#f4f4f5",
                lineHeight: "1.5",
                fontSize: "14px",
              }}
            >
              <ReactMarkdown>{content}</ReactMarkdown>
              {isLoading && <LoadingAnimation />}
            </div>

            {!isUser && !isLoading && onRegenerate && onCopy && (
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  marginTop: "12px",
                }}
              >
                <ActionButton
                  icon={<RefreshCw style={{ width: "14px", height: "14px" }} />}
                  activeIcon={
                    <Loader2 style={{ width: "14px", height: "14px" }} />
                  }
                  onClick={onRegenerate}
                  tooltip="Regenerate"
                />
                <ActionButton
                  icon={<Copy style={{ width: "14px", height: "14px" }} />}
                  activeIcon={
                    <Check style={{ width: "14px", height: "14px" }} />
                  }
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
      position: "absolute" as const,
      top: "16px",
      right: "16px",
      padding: "8px",
      background: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "6px",
      color: "#f4f4f5",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s ease",
      backdropFilter: "blur(8px)",
      zIndex: 10,
      width: "32px",
      height: "32px",
    };

    useEffect(() => {
      return () => {
        // Cleanup any pending message listeners
        chrome.runtime.onMessage.removeListener(() => {});
      };
    }, []);

    // Add this helper function to get the header text
    const getHeaderText = () => {
      if (stage === "add-instruction") {
        return editingInstruction ? "Edit Custom Instruction" : "Create Custom Instruction";
      }

      if (stage === "input") {
        const option = allOptions.find(opt => opt.id === currentOption);
        return option?.label || '';
      }

      if (stage === "response") {
        // Always show "Chat" if in chat mode
        if (isChatMode) {
          return "Chat";
        }
        
        // For summarize page
        if (messages[0]?.content.startsWith("Summarizing:")) {
          return "Summarize This Page";
        }

        // For other responses, show the current option
        const option = allOptions.find(opt => opt.id === currentOption);
        return option?.label || '';
      }

      return selectedText
        ? "What do you want to do with the selected text?"
        : "What would you like to do?";
    };

    // Add this helper function to get the subheader text
    const getSubheaderText = () => {
      if (stage === "options" && selectedText) {
        return selectedText.substring(0, 100) + "...";
      }
      
      if (stage === "response" && messages[0]) {
        return messages[0].content;
      }

      return null;
    };

    // Reset chat mode when going back to options
    const handleBackToOptions = () => {
      setStage("options");
      setShowOptions(true);
      setChatMessage("");
      setPendingText("");
      setPendingOption(null);
      setIsChatMode(false);
    };

    return (
      <div className="modal-container">
        <div 
          className="modal-backdrop" 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClose();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        />

        <div
          ref={ref}
          className="modal-content"
          style={{
            background: "#000000",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={closeButtonStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.borderColor = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.color = "#f4f4f5";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            }}
          >
            <X
              style={{
                width: "16px",
                height: "16px",
                strokeWidth: 2.5,
              }}
            />
          </button>

          {/* Scrollable container for all content */}
          <div
            ref={responseContainerRef}
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header - stays at top */}
            {stage !== "add-instruction" && (
              <div
                style={{
                  paddingRight: "24px",
                  paddingLeft: "24px",
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(255, 255, 255, 0.03)",
                  position: "relative",
                }}
              >
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "12px",
                  minHeight: "28px"
                }}>
                  {stage !== "options" && (
                    <button
                      onClick={handleBackToOptions}
                      style={{
                        background: "none",
                        border: "none",
                        padding: "4px",
                        cursor: "pointer",
                        color: "#71717a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "4px",
                        transition: "all 0.2s ease",
                        flexShrink: 0,
                        width: "24px",
                        height: "24px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                        e.currentTarget.style.color = "#f4f4f5";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "none";
                        e.currentTarget.style.color = "#71717a";
                      }}
                    >
                      <ArrowLeft size={16} />
                    </button>
                  )}
                  <h2
                    style={{
                      color: "#f4f4f5",
                      fontSize: "18px",
                      fontWeight: 500,
                      margin: 0,
                      lineHeight: "28px",
                      flex: 1,
                    }}
                  >
                    {getHeaderText()}
                  </h2>
                </div>
                {getSubheaderText() && (
                  <p
                    style={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      maxWidth: "90%",
                      fontWeight: 400,
                      marginTop: "8px",
                      marginBottom: 0,
                      paddingLeft: stage !== "options" ? "36px" : "0",
                    }}
                  >
                    {getSubheaderText()}
                  </p>
                )}
              </div>
            )}

            {/* Options and Response content */}
            <div style={{ flex: 1 }}>
              {stage === "options" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  {/* Existing options list */}
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "12px",
                      }}
                    >
                      {allOptions.map((option, index) => (
                        <button
                          key={option.id}
                          onClick={() => handleOptionSelect(option.id)}
                          onMouseEnter={(e) => {
                            setFocusedOptionIndex(index);
                            const button = e.currentTarget;
                            button.style.background = "rgba(255, 255, 255, 0.1)";
                            button.style.transform = "translateX(6px)";
                            button.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                            const icon = button.querySelector("svg");
                            if (icon instanceof SVGElement) {
                              icon.style.color = "#4ade80";
                              icon.style.transform = "scale(1.1) rotate(3deg)";
                            }
                            const label = button.querySelector(".option-label");
                            if (label instanceof HTMLElement) {
                              label.style.color = "#ffffff";
                              label.style.fontWeight = "500";
                            }
                          }}
                          onMouseLeave={(e) => {
                            const button = e.currentTarget;
                            button.style.background = "transparent";
                            button.style.transform = "translateX(0)";
                            button.style.boxShadow = "none";
                            const icon = button.querySelector("svg");
                            if (icon instanceof SVGElement) {
                              icon.style.color = "#22c55e";
                              icon.style.transform = "scale(1) rotate(0deg)";
                            }
                            const label = button.querySelector(".option-label");
                            if (label instanceof HTMLElement) {
                              label.style.color = "#d4d4d8";
                              label.style.fontWeight = "400";
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: "12px 24px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            background: focusedOptionIndex === index ? "rgba(255, 255, 255, 0.1)" : "transparent",
                            border: "none",
                            borderRadius: "8px",
                            color: focusedOptionIndex === index ? "#ffffff" : "#d4d4d8",
                            cursor: "pointer",
                            fontSize: "14px",
                            textAlign: "left",
                            outline: "none",
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            position: "relative",
                            transform: focusedOptionIndex === index ? "translateX(6px)" : "translateX(0)",
                            boxShadow: focusedOptionIndex === index ? 
                              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" : "none",
                          }}
                        >
                          <div style={{ 
                            display: "flex", 
                            alignItems: "center",
                            transition: "all 0.2s ease"
                          }}>
                            {option.icon}
                          </div>
                          <span 
                            className="option-label"
                            style={{ 
                              transition: "all 0.2s ease",
                              flex: 1,
                              color: focusedOptionIndex === index ? "#f4f4f5" : "#d4d4d8",
                            }}
                          >
                            {option.label}
                          </span>
                        </button>
                      ))}
                      <button
                        onClick={() => setStage("add-instruction")}
                        style={{
                          width: "100%",
                          padding: "12px 24px",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          background: "transparent",
                          border: "none",
                          borderRadius: "6px",
                          color: "#71717a",
                          cursor: "pointer",
                          fontSize: "13px",
                          textAlign: "left",
                          outline: "none",
                          transition: "all 0.2s ease",
                          marginTop: "8px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                          e.currentTarget.style.transform = "translateX(4px)";
                          const icon = e.currentTarget.querySelector("svg");
                          if (icon) {
                            icon.style.color = "#f4f4f5";
                            icon.style.transform = "scale(1.1)";
                          }
                          const label = e.currentTarget.querySelector("span");
                          if (label) {
                            label.style.color = "#f4f4f5";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.transform = "translateX(0)";
                          const icon = e.currentTarget.querySelector("svg");
                          if (icon) {
                            icon.style.color = "#71717a";
                            icon.style.transform = "scale(1)";
                          }
                          const label = e.currentTarget.querySelector("span");
                          if (label) {
                            label.style.color = "#71717a";
                          }
                        }}
                      >
                        <Plus
                          style={{
                            width: "14px",
                            height: "14px",
                            transition: "all 0.2s ease",
                          }}
                        />
                        <span style={{ transition: "all 0.2s ease" }}>
                          Create Custom Instruction
                        </span>
                      </button>
                    </div>
                    <div
                      style={{
                        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                        padding: "16px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "8px", position: "relative" }}>
                        <input
                          type="text"
                          value={quickChatInput}
                          onChange={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setQuickChatInput(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Escape") {
                              e.preventDefault();
                              setQuickChatInput("");
                              return;
                            }
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleQuickChat();
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder={
                            selectedText
                              ? "Ask about the selected text..."
                              : "Ask anything..."
                          }
                          style={{
                            width: "100%",
                            padding: "12px",
                            background: "#000000",
                            border: "none",
                            borderRadius: "6px",
                            color: "#f4f4f5",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                        {quickChatInput.trim() && (
                          <button
                            onClick={handleQuickChat}
                            disabled={isLoading}
                            style={{
                              position: "absolute",
                              right: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              padding: "4px",
                              background: "transparent",
                              border: "none",
                              borderRadius: "4px",
                              color: "#f4f4f5",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: isLoading ? 0.5 : 1,
                            }}
                          >
                            <Send style={{ width: "14px", height: "14px" }} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stage === "add-instruction" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      padding: "24px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <button
                      onClick={() => setStage("options")}
                      style={{
                        background: "none",
                        border: "none",
                        padding: "4px",
                        cursor: "pointer",
                        color: "#71717a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "4px",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#f4f4f5")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#71717a")
                      }
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        fontWeight: 500,
                        color: "#f4f4f5",
                      }}
                    >
                      Create Custom Instruction
                    </h3>
                  </div>
                  <AddInstructionForm
                    onClose={() => {
                      setStage("options");
                      setEditingInstruction(undefined);
                    }}
                    onAdd={() => {
                      refreshInstructions();
                      setStage("options");
                      setEditingInstruction(undefined);
                    }}
                    editingInstruction={editingInstruction}
                  />
                </div>
              )}

              {pendingOption && !selectedText && (
                <div style={{ padding: "16px 24px" }}>
                  <h3 style={{ margin: "0 0 12px 0" }}>Enter your text:</h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={pendingText}
                      onChange={(e) => setPendingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && pendingText.trim()) {
                          handleOptionSelect(pendingOption);
                        }
                      }}
                      placeholder="Type or paste your text here..."
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        background: "var(--primary)",
                        border: "none",
                        borderRadius: "6px",
                        color: "var(--primary-foreground)",
                        fontSize: "14px",
                        outline: "none",
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleOptionSelect(pendingOption)}
                      disabled={!pendingText.trim()}
                      style={{
                        padding: "8px 12px",
                        background: "var(--primary)",
                        border: "none",
                        borderRadius: "6px",
                        color: "var(--primary-foreground)",
                        cursor: "pointer",
                      }}
                    >
                      Process
                    </button>
                  </div>
                </div>
              )}

              {stage === "input" && (
                <div style={{ padding: "16px 24px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    {allOptions.find((opt) => opt.id === currentOption)?.icon}
                    <h3 style={{ margin: 0 }}>
                      {
                        allOptions.find((opt) => opt.id === currentOption)
                          ?.label
                      }
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={chatMessage}
                      onChange={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setChatMessage(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Escape") {
                          e.preventDefault();
                          setStage("options");
                          setShowOptions(true);
                          setChatMessage("");
                          setPendingText("");
                          setPendingOption(null);
                          return;
                        }
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleOptionSelect(currentOption);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Type or paste your text here..."
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        background: "var(--primary)",
                        border: "none",
                        borderRadius: "6px",
                        color: "var(--primary-foreground)",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={() => handleOptionSelect(currentOption)}
                      disabled={!chatMessage.trim()}
                      style={{
                        padding: "8px",
                        background: "var(--primary)",
                        border: "none",
                        borderRadius: "6px",
                        color: "var(--primary-foreground)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Send style={{ width: "16px", height: "16px" }} />
                    </button>
                  </div>
                </div>
              )}

              {stage === "response" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {messages.map((message, index) => (
                    <MessageBlock
                      key={index}
                      isUser={message.role === "user"}
                      content={message.content}
                      isLoading={
                        isLoading &&
                        index === messages.length - 1 &&
                        message.role === "assistant"
                      }
                      onRegenerate={
                        message.role === "assistant"
                          ? () => handleOptionSelect(currentOption, index)
                          : undefined
                      }
                      onCopy={
                        message.role === "assistant"
                          ? () => navigator.clipboard.writeText(message.content)
                          : undefined
                      }
                    />
                  ))}

                  {showChat && !isLoading && (
                    <div
                      data-chat-input
                      style={{
                        padding: "16px 32px",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        background: "transparent",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                        }}
                      >
                        <input
                          ref={inputRef}
                          type="text"
                          value={chatMessage}
                          onChange={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setChatMessage(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleChat();
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Ask a follow-up question..."
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            background: "var(--primary)",
                            border: "none",
                            borderRadius: "6px",
                            color: "var(--primary-foreground)",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                        <button
                          onClick={handleChat}
                          disabled={isLoading}
                          style={{
                            padding: "8px",
                            background: "var(--primary)",
                            border: "none",
                            borderRadius: "6px",
                            color: "var(--primary-foreground)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Send style={{ width: "16px", height: "16px" }} />
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
  }
);

TextOptions.displayName = "TextOptions";
