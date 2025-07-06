import React from "react";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  helperText?: string;
  onChange?: (checked: boolean) => void;
}

export default function Checkbox({
  label,
  error,
  helperText,
  onChange,
  className = "",
  ...props
}: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className="space-y-2">
      <label className="inline-flex items-center cursor-pointer group">
        <div className="relative flex-shrink-0">
          <input
            type="checkbox"
            className="sr-only"
            onChange={handleChange}
            {...props}
          />
          <div
            className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${
              props.checked
                ? "bg-[var(--red-primary)] border-[var(--red-primary)]"
                : "bg-[var(--bg-secondary)] border-[var(--red-tertiary)] group-hover:border-[var(--red-primary)]"
            } ${error ? "border-[var(--red-primary)]" : ""} ${className}`}
          >
            <svg
              className={`w-3 h-3 transition-all duration-200 ${
                props.checked
                  ? "text-white opacity-100 scale-100"
                  : "text-transparent opacity-0 scale-75"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {label && (
          <span className="ml-3 text-[var(--red-light)] font-medium text-sm group-hover:text-[var(--red-primary)] transition-colors duration-200">
            {label}
          </span>
        )}
      </label>
      {error && <p className="text-[var(--red-primary)] text-sm">{error}</p>}
      {helperText && !error && (
        <p className="text-[var(--red-muted)] text-sm">{helperText}</p>
      )}
    </div>
  );
}
