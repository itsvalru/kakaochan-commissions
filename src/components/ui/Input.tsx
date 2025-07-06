import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className="block text-[var(--red-light)] font-medium text-sm">
          {label}
        </label>
      )}
      <input
        className={`form-input ${
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
