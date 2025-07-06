import React from "react";
import type { CommissionMessage } from "@/lib/types/types";

interface ChatMessageProps {
  message: CommissionMessage;
  isGrouped: boolean;
  isCurrentUser: boolean;
  senderName: string;
  senderInitial: string;
  avatarUrl?: string | null;
  onAvatarClick: (e: React.MouseEvent) => void;
  onSenderClick: (e: React.MouseEvent) => void;
  time: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isGrouped,
  isCurrentUser,
  senderName,
  senderInitial,
  avatarUrl,
  onAvatarClick,
  onSenderClick,
  time,
}) => {
  // Only add margin before a new group
  const groupMargin = !isGrouped ? "mt-4" : "mt-px";

  return (
    <div className={groupMargin + " flex"}>
      {/* Left gutter: avatar or empty */}
      <div className="w-16 flex-shrink-0 flex items-start justify-center">
        {!isGrouped &&
          (avatarUrl ? (
            <img
              src={avatarUrl}
              alt={senderName}
              className={`w-8 h-8 rounded-full object-cover border border-[var(--red-tertiary)] mt-1 info-card-trigger`}
              onClick={onAvatarClick}
              style={{ cursor: "pointer" }}
            />
          ) : (
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                isCurrentUser
                  ? "bg-[var(--red-primary)]"
                  : "bg-[var(--red-secondary)]"
              } info-card-trigger`}
              onClick={onAvatarClick}
              style={{ cursor: "pointer" }}
            >
              <span className="text-white text-sm font-semibold">
                {senderInitial}
              </span>
            </div>
          ))}
      </div>
      {/* Right: message content */}
      <div className="flex-1 min-w-0">
        {!isGrouped && (
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[var(--red-light)] font-semibold text-sm info-card-trigger"
              style={{ cursor: "pointer" }}
              onClick={onSenderClick}
            >
              {senderName}
            </span>
            <span className="text-[var(--red-muted)] text-xs">{time}</span>
          </div>
        )}
        <div className="text-[var(--red-light)] text-sm">{message.content}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
