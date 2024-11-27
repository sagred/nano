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

    const allOptions = [
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
        if (e.key === "Escape") {
          if (stage === "add-instruction") {
            setStage("options");
            return;
          }
          if (stage === "options") {
            onClose();
          } else {
            setStage("options");
            setShowOptions(true);
            setShowResponse(false);
            setMessages([]);
            setIsLoading(false);
            setShowChat(false);
            setChatMessage("");
            setCurrentOption("improve");
          }
          return;
        }

        if (!showOptions) return;

        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            e.stopPropagation();
            setFocusedOptionIndex((prev) =>
              prev < allOptions.length - 1 ? prev + 1 : prev
            );
            break;
          case "ArrowUp":
            e.preventDefault();
            e.stopPropagation();
            setFocusedOptionIndex((prev) => (prev > 0 ? prev - 1 : prev));
            break;
          case "Enter":
            e.preventDefault();
            e.stopPropagation();
            if (focusedOptionIndex >= 0) {
              handleOptionSelect(allOptions[focusedOptionIndex].id);
            }
            break;
        }
      };

      document.addEventListener("keydown", handleKeyDown, true);
      return () => document.removeEventListener("keydown", handleKeyDown, true);
    }, [stage, showOptions, focusedOptionIndex, allOptions, onClose]);

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

    const handleChat = async () => {
      if (!chatMessage.trim()) return;
      setIsLoading(true);

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

    const handleQuickChat = async () => {
      if (!quickChatInput.trim()) return;

      const textToProcess = selectedText
        ? `Context: "${selectedText}"\n\nQuestion: ${quickChatInput}`
        : quickChatInput;

      setIsLoading(true);
      setStage("response");
      setShowOptions(false);

      try {
        const stream = await modifyText("chat", textToProcess);
        setMessages([
          { role: "user", content: quickChatInput },
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
            background: isUser ? "transparent" : "rgba(39, 39, 42, 0.3)",
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
      background: "rgba(39, 39, 42, 0.5)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "6px",
      color: "#71717a",
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

    return (
      <div className="modal-container">
        <div className="modal-backdrop" onClick={onClose} />

        <div
          ref={ref}
          className="modal-content"
          style={{
            background: "#18181B",
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
              e.currentTarget.style.background = "rgba(39, 39, 42, 0.8)";
              e.currentTarget.style.color = "#f4f4f5";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(39, 39, 42, 0.5)";
              e.currentTarget.style.color = "#71717a";
              e.currentTarget.style.transform = "scale(1)";
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
                  paddingTop: "8px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "#18181B",
                  position: "relative",
                }}
              >
                <h2
                  style={{
                    color: "#f4f4f5",
                    fontSize: "18px",
                    fontWeight: 500,
                    marginBottom: "4px",
                  }}
                >
                  {selectedText
                    ? "What do you want to do with the selected text?"
                    : "What would you like to do?"}
                </h2>
                {selectedText && (
                  <p
                    style={{
                      color: "#71717a",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      maxWidth: "90%",
                    }}
                  >
                    {selectedText?.substring(0, 100)}...
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
                      {allOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleOptionSelect(option.id)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#27272a";
                            e.currentTarget.style.color = "#f4f4f5";
                            setFocusedOptionIndex(
                              allOptions.findIndex(
                                (opt) => opt.id === option.id
                              )
                            );
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#d4d4d8";
                          }}
                          style={{
                            width: "100%",
                            padding: "12px",
                            paddingLeft: "24px",
                            paddingRight: "24px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background:
                              focusedOptionIndex ===
                              allOptions.findIndex(
                                (opt) => opt.id === option.id
                              )
                                ? "#27272a"
                                : "transparent",
                            border: "none",
                            color:
                              focusedOptionIndex ===
                              allOptions.findIndex(
                                (opt) => opt.id === option.id
                              )
                                ? "#f4f4f5"
                                : "#d4d4d8",
                            cursor: "pointer",
                            fontSize: "14px",
                            textAlign: "left",
                            borderRadius: "6px",
                            outline: "none",
                          }}
                        >
                          {option.icon}
                          {option.label}
                        </button>
                      ))}
                      <button
                        onClick={() => setStage("add-instruction")}
                        style={{
                          width: "100%",
                          padding: "12px",
                          paddingLeft: "24px",
                          paddingRight: "24px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "transparent",
                          border: "none",
                          color: "#a1a1aa",
                          cursor: "pointer",
                          fontSize: "13px",
                          textAlign: "left",
                          outline: "none",
                          position: "relative",
                        }}
                        onMouseEnter={(e) => {
                          const span = e.currentTarget.querySelector("span");
                          if (span) {
                            span.style.textDecoration = "underline";
                            span.style.textUnderlineOffset = "4px";
                            span.style.textDecorationThickness = "1px";
                            span.style.color = "#d4d4d8";
                          }
                          const icon = e.currentTarget.querySelector("svg");
                          if (icon) {
                            icon.style.color = "#d4d4d8";
                          }
                        }}
                        onMouseLeave={(e) => {
                          const span = e.currentTarget.querySelector("span");
                          if (span) {
                            span.style.textDecoration = "none";
                            span.style.color = "#a1a1aa";
                          }
                          const icon = e.currentTarget.querySelector("svg");
                          if (icon) {
                            icon.style.color = "#a1a1aa";
                          }
                        }}
                      >
                        <Plus
                          style={{
                            width: "14px",
                            height: "14px",
                            color: "#a1a1aa",
                            transition: "color 0.2s ease",
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
                        background: "#18181b",
                      }}
                    >
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          value={quickChatInput}
                          onChange={(e) => setQuickChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleQuickChat();
                            }
                          }}
                          placeholder={
                            selectedText
                              ? "Ask about the selected text..."
                              : "Ask anything..."
                          }
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
                          onClick={handleQuickChat}
                          disabled={isLoading || !quickChatInput.trim()}
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
                            opacity:
                              isLoading || !quickChatInput.trim() ? 0.5 : 1,
                          }}
                        >
                          <Send style={{ width: "16px", height: "16px" }} />
                        </button>
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
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleOptionSelect(currentOption);
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
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleChat();
                            }
                          }}
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
