import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export default function LoadingSpinner({
  message = "Loading...",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div className={`text-center py-8 text-[var(--red-light)] ${className}`}>
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--red-primary)] mb-4"></div>
      <div className="text-lg">{message}</div>
    </div>
  );
}
