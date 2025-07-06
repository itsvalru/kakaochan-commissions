import React from "react";
import ChatMessage from "./ChatMessage";
import type { CommissionMessage } from "@/lib/types/types";

interface ChatMessagesProps {
  messages: CommissionMessage[];
  currentUserId: string | null;
  getDisplayName: (msg: CommissionMessage) => string;
  getAvatarUrl: (msg: CommissionMessage) => string | null;
  formatMessageTime: (date: string) => string;
  getMessageGroupInfo: (messageIndex: number) => {
    showAvatar: boolean;
    groupStartTime: string;
  };
  onAvatarClick: (msg: CommissionMessage, e: React.MouseEvent) => void;
  onSenderClick: (msg: CommissionMessage, e: React.MouseEvent) => void;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  loading: boolean;
  error: string | null;
  loadingMore: boolean;
  showJumpToPresent: boolean;
  onJumpToPresent: () => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  currentUserId,
  getDisplayName,
  getAvatarUrl,
  formatMessageTime,
  getMessageGroupInfo,
  onAvatarClick,
  onSenderClick,
  messagesContainerRef,
  loading,
  error,
  loadingMore,
  showJumpToPresent,
  onJumpToPresent,
}) => (
  <div
    ref={messagesContainerRef}
    className="flex-1 overflow-y-auto pr-4 min-h-0 discord-scrollbar"
  >
    <div className="flex flex-col justify-end min-h-full">
      {loading ? (
        <div className="py-8 text-center text-[var(--red-light)]">
          Loading messages...
        </div>
      ) : error ? (
        <div className="py-8 text-center text-[var(--red-primary)]">
          {error}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center text-[var(--red-muted)] py-8">
          <div className="text-lg font-semibold mb-2">No messages yet</div>
          <div className="text-sm">Start the conversation!</div>
        </div>
      ) : (
        <>
          {loadingMore && (
            <div className="flex justify-center py-2 text-[var(--red-light)]">
              Loading older messages...
            </div>
          )}
          {messages.map((message, idx) => {
            const { showAvatar } = getMessageGroupInfo(idx);
            const isGrouped = !showAvatar;
            const isCurrentUser = message.user_id === currentUserId;
            const senderName = getDisplayName(message);
            const senderInitial = senderName.charAt(0) || "U";
            const avatarUrl = getAvatarUrl(message);
            return (
              <ChatMessage
                key={message.id}
                message={message}
                isGrouped={isGrouped}
                isCurrentUser={isCurrentUser}
                senderName={senderName}
                senderInitial={senderInitial}
                avatarUrl={avatarUrl}
                onAvatarClick={(e) => onAvatarClick(message, e)}
                onSenderClick={(e) => onSenderClick(message, e)}
                time={formatMessageTime(message.created_at)}
              />
            );
          })}
        </>
      )}
      {showJumpToPresent && (
        <button
          className="fixed bottom-24 right-8 z-20 bg-[var(--red-primary)] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[var(--red-secondary)] transition-all info-card-trigger"
          onClick={onJumpToPresent}
        >
          Jump to Present
        </button>
      )}
    </div>
  </div>
);

export default ChatMessages;
