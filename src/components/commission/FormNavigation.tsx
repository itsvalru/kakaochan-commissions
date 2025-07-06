import React from "react";

interface FormNavigationProps {
  onBack: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  onSaveDraft?: () => void;
  isSubmitting: boolean;
  isSaving: boolean;
  hasSelectedPath: boolean;
  stepKey: string;
  total: number;
}

export default function FormNavigation({
  onBack,
  onNext,
  onSubmit,
  onSaveDraft,
  isSubmitting,
  isSaving,
  hasSelectedPath,
  stepKey,
  total,
}: FormNavigationProps) {
  return (
    <div className="flex justify-between items-center pt-3">
      <button
        onClick={onBack}
        className="form-button-secondary"
        disabled={isSubmitting || isSaving}
      >
        ← Back
      </button>

      {/* Total Price - Centered without border */}
      <div className="text-center">
        <div className="text-sm text-[#9ca3af]">Total:</div>
        <div className="text-[#fecaca] font-semibold text-lg">
          €{total.toFixed(2)}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Save Draft Button */}
        {hasSelectedPath && stepKey !== "summary" && (
          <button
            onClick={onSaveDraft}
            disabled={isSubmitting || isSaving}
            className="px-4 py-2 bg-[#2a0a0a] border border-[#7f1d1d] text-[#fecaca] rounded hover:bg-[#7f1d1d] transition-colors duration-200 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
        )}

        {stepKey !== "summary" ? (
          <button
            onClick={onNext}
            className="form-button"
            disabled={isSubmitting || isSaving}
          >
            Continue
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={isSubmitting || isSaving}
            className="form-button"
          >
            {isSubmitting ? "Submitting..." : "Submit Commission"}
          </button>
        )}
      </div>
    </div>
  );
}
