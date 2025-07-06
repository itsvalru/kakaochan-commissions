import React from "react";

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  onChange?: (value: string | number) => void;
}

export default function Select({
  label,
  error,
  helperText,
  options,
  onChange,
  className = "",
  ...props
}: SelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-[var(--red-light)] font-medium text-sm">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--red-tertiary)] rounded-lg text-[var(--red-light)] focus:border-[var(--red-primary)] focus:ring-2 focus:ring-[var(--red-primary)] focus:ring-opacity-20 transition-all duration-200 appearance-none cursor-pointer ${
          error
            ? "border-[var(--red-primary)] focus:border-[var(--red-primary)]"
            : ""
        } ${className}`}
        onChange={handleChange}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23dc2626' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: "right 0.75rem center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "1.5em 1.5em",
          paddingRight: "2.5rem",
        }}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className="bg-[var(--bg-secondary)] text-[var(--red-light)]"
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[var(--red-primary)] text-sm">{error}</p>}
      {helperText && !error && (
        <p className="text-[var(--red-muted)] text-sm">{helperText}</p>
      )}
    </div>
  );
}
