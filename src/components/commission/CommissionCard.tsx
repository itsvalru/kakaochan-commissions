import React from "react";

interface CommissionCardProps {
  title: string;
  isDraft?: boolean;
  status?: string;
  submitted: string;
  price: string;
  isEstimate?: boolean;
  onClick?: () => void;
}

export default function CommissionCard({
  title,
  isDraft = false,
  status,
  submitted,
  price,
  isEstimate = false,
  onClick,
}: CommissionCardProps) {
  function getStatusBadge() {
    if (isDraft) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--tag-draft-bg)] text-[var(--tag-draft-text)]">
          Draft
        </span>
      );
    }

    // Use actual status if provided, otherwise fallback to "Requested"
    const statusText = status || "Requested";
    const statusColors = {
      submitted: "bg-blue-100 text-blue-700",
      waitlist: "bg-teal-100 text-teal-700",
      payment: "bg-yellow-100 text-yellow-700",
      wip: "bg-purple-100 text-purple-700",
      finished: "bg-green-100 text-green-700",
      draft: "bg-[var(--tag-draft-bg)] text-[var(--tag-draft-text)]",
    };

    const colorClass =
      statusColors[statusText as keyof typeof statusColors] ||
      "bg-[var(--tag-requested-bg)] text-[var(--tag-requested-text)]";

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}
      >
        {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
      </span>
    );
  }

  return (
    <div
      className="grid grid-cols-6 gap-4 items-center bg-[var(--bg-secondary)] rounded-xl p-4 hover:bg-[var(--bg-tertiary)] transition cursor-pointer"
      onClick={onClick}
      tabIndex={0}
      role="button"
    >
      {/* Title (with placeholder image) */}
      <div className="flex items-center gap-4 col-span-3 min-w-0">
        <img
          src="/commission-placeholder.png"
          alt="Commission preview"
          className="w-12 h-12 rounded-lg object-cover border border-[var(--red-tertiary)] bg-[var(--bg-secondary)]"
        />
        <div className="font-medium text-[var(--red-light)] text-base truncate">
          {title}
        </div>
      </div>
      {/* Status (Draft or Requested) */}
      <div className="flex items-center">{getStatusBadge()}</div>
      {/* Submitted */}
      <div className="text-[var(--red-muted)] text-sm">{submitted}</div>
      {/* Price */}
      <div className="flex items-center gap-1 text-[var(--red-light)] font-semibold text-base">
        {price}
        {isEstimate && (
          <span className="ml-1 relative group">
            <span className="text-[var(--tag-estimate)]">🩸</span>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--red-tertiary)] rounded-lg text-xs text-[var(--red-light)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Estimated cost, not final
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
