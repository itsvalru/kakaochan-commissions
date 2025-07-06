import React from "react";

interface RadioOption {
  value: string | number | boolean;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: RadioOption[];
  value?: string | number | boolean;
  onChange?: (value: string | number | boolean) => void;
}

export default function RadioGroup({
  label,
  error,
  helperText,
  options,
  value,
  onChange,
}: RadioGroupProps) {
  const handleChange = (optionValue: string | number | boolean) => {
    if (onChange) {
      onChange(optionValue);
    }
  };

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-[var(--red-light)] font-medium text-sm">
          {label}
        </label>
      )}

      <div className="space-y-3">
        {options.map((option) => (
          <div
            key={String(option.value)}
            className={`form-card p-4 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
              value === option.value
                ? "border-[var(--red-primary)] bg-[var(--bg-tertiary)] ring-2 ring-[var(--red-primary)] ring-opacity-50"
                : "border-[var(--red-tertiary)] hover:border-[var(--red-primary)] hover:bg-[var(--bg-tertiary)]"
            }`}
            onClick={() => handleChange(option.value)}
          >
            <div className="flex items-center justify-between">
              <span
                className={`font-medium transition-colors duration-200 ${
                  value === option.value
                    ? "text-[var(--red-light)]"
                    : "text-[var(--red-muted)]"
                }`}
              >
                {option.label}
              </span>

              {/* Custom selection indicator */}
              <div
                className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                  value === option.value
                    ? "border-[var(--red-primary)] bg-[var(--red-primary)]"
                    : "border-[var(--red-tertiary)] bg-transparent"
                }`}
              >
                {value === option.value && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-[var(--red-primary)] text-sm">{error}</p>}
      {helperText && !error && (
        <p className="text-[var(--red-muted)] text-sm">{helperText}</p>
      )}
    </div>
  );
}
