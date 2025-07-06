import React from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Textarea({
  label,
  error,
  helperText,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-[var(--red-light)] font-medium text-sm">
          {label}
        </label>
      )}
      <textarea
        className={`form-input resize-none ${
          error
            ? "border-[var(--red-primary)] focus:border-[var(--red-primary)]"
            : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-[var(--red-primary)] text-sm">{error}</p>}
      {helperText && !error && (
        <p className="text-[var(--red-muted)] text-sm">{helperText}</p>
      )}
    </div>
  );
}
