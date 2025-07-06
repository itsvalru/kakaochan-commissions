import React from "react";
import type { Commission } from "@/lib/types/types";

interface ChatHeaderProps {
  commission: Commission & { display_name?: string };
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ commission }) => (
  <div className="bg-[var(--bg-secondary)] p-4">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-[var(--red-light)] font-semibold text-lg">
          {commission.category_name} - {commission.type_name}
          {commission.subtype_name && ` (${commission.subtype_name})`}
        </h2>
        <p className="text-[var(--red-muted)] text-sm">
          Commission #{commission.id.slice(0, 8)}
        </p>
      </div>
      <div className="text-[var(--red-muted)] text-sm">
        Status: <span className="capitalize">{commission.status}</span>
      </div>
    </div>
  </div>
);

export default ChatHeader;
