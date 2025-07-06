import React from "react";

interface ModalProps {
  open: boolean;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onClose: () => void;
  actions?: React.ReactNode;
}

export default function Modal({
  open,
  title,
  description,
  children,
  onClose,
  actions,
}: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[var(--bg-secondary)] border border-[var(--red-tertiary)] rounded-lg shadow-lg p-6 max-w-md w-full relative">
        <button
          className="absolute top-3 right-3 text-[var(--red-muted)] hover:text-[var(--red-primary)] text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {title && (
          <h2 className="text-xl font-bold text-[var(--red-light)] mb-2">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-[var(--red-muted)] mb-4">{description}</p>
        )}
        {children}
        {actions && (
          <div className="mt-6 flex gap-3 justify-end">{actions}</div>
        )}
      </div>
    </div>
  );
}
