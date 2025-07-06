"use client";

import { useFormContext } from "@/context/FormContext";
import { getStepsFromDraft, StepKey } from "@/lib/stepEngine";
import { calculateTotalPrice } from "@/lib/calculateTotal";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { usePathname } from "next/navigation";

// Import new components
import FormProgress from "./FormProgress";
import FormNavigation from "./FormNavigation";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { useFormNavigation } from "@/hooks/useFormNavigation";

// Step imports
import PathStep from "./steps/PathStep";
import CommSpecificStep from "./steps/CommSpecificStep";
import AddonsStep from "./steps/AddonsStep";
import UsageStep from "./steps/UsageStep";
import StreamingStep from "./steps/StreamingStep";
import ReferenceStep from "./steps/ReferenceStep";
import ExtraInfoStep from "./steps/ExtraInfoStep";
import SummaryStep from "./steps/SummaryStep";

export default function FormStepper() {
  const {
    data,
    currentStep,
    setStep,
    saveDraft,
    submitCommission,
    isSubmitting,
    isSaving,
    update,
  } = useFormContext();
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  const steps = getStepsFromDraft(data);
  const stepKey: StepKey = steps[currentStep];
  const total = calculateTotalPrice(data);

  // Show progress only after path is selected
  const hasSelectedPath = Boolean(data.category.name && data.type.name);
  const isPathStep = stepKey === "path";

  // Filter out path step for progress calculation
  const formSteps = steps.filter((step) => step !== "path");
  const currentFormStep = isPathStep ? 0 : formSteps.indexOf(stepKey) + 1;

  // Use custom hook for navigation logic
  const {
    showLeaveModal,
    modalLoading,
    setModalLoading,
    setShowLeaveModal,
    setPendingNav,
    guardedGoBack,
    handleDismiss,
    handleCancel,
  } = useFormNavigation(currentStep, isPathStep, setStep, stepKey);

  // Override goNext with our implementation
  const goNext = () => {
    if (currentStep < steps.length - 1) setStep(currentStep + 1);
  };

  // Recalculate total_price whenever data changes
  useEffect(() => {
    const newTotal = calculateTotalPrice(data);
    if (Math.abs(newTotal - data.total_price) > 0.01) {
      update({ total_price: newTotal });
    }
  }, [data, update]);

  // Navigation guard for URL bar navigation
  useEffect(() => {
    // Watch for pathname changes (URL bar navigation)
    const handlePathnameChange = () => {
      if (currentStep > 0 && !isPathStep && pathname !== "/commissions/new") {
        setPendingNav(() => () => {
          // Allow the navigation to proceed
        });
        setShowLeaveModal(true);
      }
    };

    // Intercept all navigation attempts
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a[href]") as HTMLAnchorElement;
      const button = target.closest("button[onclick]") as HTMLButtonElement;

      if (currentStep > 0 && !isPathStep && (link || button)) {
        const href = link?.href || "";
        const isExternalNav =
          href &&
          !href.includes("/commissions/new") &&
          !href.includes("javascript:");

        if (isExternalNav) {
          e.preventDefault();
          e.stopPropagation();
          setPendingNav(() => () => {
            window.location.href = href;
          });
          setShowLeaveModal(true);
        }
      }
    };

    if (currentStep > 0 && !isPathStep) {
      document.addEventListener("click", handleClick, true);
      // Use a small delay to catch URL bar navigation
      const timeoutId = setTimeout(handlePathnameChange, 100);

      return () => {
        document.removeEventListener("click", handleClick, true);
        clearTimeout(timeoutId);
      };
    }
  }, [currentStep, isPathStep, pathname]);

  // Modal actions
  const handleSaveDraft = async () => {
    setModalLoading(true);
    await saveDraft();
    localStorage.removeItem("commission-draft");
    localStorage.removeItem("commission-draft-step");
    setShowLeaveModal(false);
    setModalLoading(false);
    window.location.href = "/dashboard";
  };

  const handleSubmitCommission = async () => {
    try {
      setError(null);
      const commissionId = await submitCommission();
      // Redirect to commission page or show success
      window.location.href = `/commissions/${commissionId}`;
    } catch (err) {
      setError("Failed to submit commission. Please try again.");
      console.error("Submit commission error:", err);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Error Display */}
      <ErrorDisplay error={error} onDismiss={() => setError(null)} />

      {/* Progress Bar - Only show after path selection */}
      {hasSelectedPath && !isPathStep && (
        <FormProgress formSteps={formSteps} currentFormStep={currentFormStep} />
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepKey}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className={!isPathStep ? "form-card" : ""}
        >
          {stepKey === "path" && <PathStep onNext={goNext} />}
          {stepKey === "comm-specific" && <CommSpecificStep />}
          {stepKey === "addons" && <AddonsStep />}
          {stepKey === "usage" && <UsageStep />}
          {stepKey === "streaming" && <StreamingStep />}
          {stepKey === "references" && <ReferenceStep />}
          {stepKey === "extra-info" && <ExtraInfoStep />}
          {stepKey === "summary" && <SummaryStep />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons - Only show for non-path steps */}
      {!isPathStep && (
        <FormNavigation
          onBack={guardedGoBack}
          onNext={goNext}
          onSubmit={handleSubmitCommission}
          onSaveDraft={handleSaveDraft}
          isSubmitting={isSubmitting}
          isSaving={isSaving}
          hasSelectedPath={hasSelectedPath}
          stepKey={stepKey}
          total={total}
        />
      )}

      <Modal
        open={showLeaveModal}
        title="Leave Commission Form?"
        description="You have unsaved changes. Would you like to save as a draft before leaving?"
        onClose={handleCancel}
        actions={
          <>
            <button
              className="form-button-secondary"
              onClick={handleDismiss}
              disabled={modalLoading}
            >
              Dismiss
            </button>
            <button
              className="form-button"
              onClick={handleSaveDraft}
              disabled={modalLoading || isSaving}
            >
              {modalLoading || isSaving ? "Saving..." : "Save as Draft"}
            </button>
            <button
              className="form-button-secondary"
              onClick={handleCancel}
              disabled={modalLoading}
            >
              Cancel
            </button>
          </>
        }
      />
    </div>
  );
}
