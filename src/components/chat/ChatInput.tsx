import React, { useRef, useEffect } from "react";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onFileUpload,
  loading,
  fileInputRef,
  placeholder = "Write a message...",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Auto-focus when user starts typing anywhere in the chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only focus if user is typing a printable character and textarea is not already focused
      if (
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        document.activeElement !== textareaRef.current
      ) {
        textareaRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
      // Keep focus on textarea after sending
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] p-4">
      <div className="flex items-end gap-3">
        <div className="relative flex-1 flex items-center bg-[var(--bg-secondary)] rounded-xl px-2 py-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-9 h-9 text-[var(--red-muted)] hover:text-[var(--red-primary)] rounded-lg transition-colors mr-2"
            title="Attach file"
            tabIndex={0}
            style={{ marginTop: 0, marginBottom: 0 }}
          >
            <span className="text-2xl font-bold leading-none">+</span>
          </button>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none resize-none text-[var(--red-light)] placeholder-[var(--red-muted)] py-3 pr-2"
            rows={1}
            style={{ minHeight: "44px", maxHeight: "120px" }}
            disabled={loading}
          />
          <input
            ref={fileInputRef}
            type="file"
            onChange={onFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
