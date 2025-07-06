import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function useFormNavigation(
  currentStep: number,
  isPathStep: boolean,
  setStep: (step: number) => void,
  stepKey: string
) {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNav, setPendingNav] = useState<null | (() => void)>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const pathname = usePathname();

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

  // Navigation guard only for going back to PathStep from step 1
  const guardedGoBack = () => {
    if (currentStep > 0) {
      if (currentStep === 1 && stepKey !== "path") {
        // Going from step 1 (first form step) back to PathStep - show modal
        setPendingNav(() => () => setStep(0));
        setShowLeaveModal(true);
      } else {
        // Normal back navigation within form steps
        setStep(currentStep - 1);
      }
    }
  };

  const handleDismiss = () => {
    localStorage.removeItem("commission-draft");
    setShowLeaveModal(false);
    if (pendingNav) pendingNav();
  };

  const handleCancel = () => {
    setShowLeaveModal(false);
    setPendingNav(null);
  };

  return {
    showLeaveModal,
    modalLoading,
    setModalLoading,
    setShowLeaveModal,
    pendingNav,
    setPendingNav,
    guardedGoBack,
    handleDismiss,
    handleCancel,
  };
}
