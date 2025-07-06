"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { CommissionDraft } from "@/lib/types/types";
import {
  createCommission,
  updateCommission,
  getCurrentUser,
  getCommissionOfferFields,
  getCommissionOfferAddons,
} from "@/lib/supabase-client";
import { calculateTotalPrice } from "@/lib/calculateTotal";

// Change applyOffer to accept CommissionOffer from Supabase
type SupabaseCommissionOffer = {
  id: string;
  category_name: string;
  type_name: string;
  subtype_name: string | null;
  base_price: number;
  description?: string | null;
  character_count_max?: number | null;
  character_count_price_per_extra?: number | null;
  // ...other fields as needed
};

interface FormContextType {
  data: CommissionDraft;
  currentStep: number;
  setStep: (step: number) => void;
  update: (updates: Partial<CommissionDraft>) => void;
  applyOffer: (offer: SupabaseCommissionOffer) => void;
  saveDraft: () => Promise<void>;
  submitCommission: () => Promise<string>; // Returns commission ID
  isSubmitting: boolean;
  isSaving: boolean;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const initialDraft: CommissionDraft = {
  id: "",
  category: { name: "", price: 0 },
  type: { name: "", price: 0 },
  base_price: 0,
  usage_type: "personal",
  allow_streaming: true,
  references: [],
  extra_info: "",
  character_count: 1,
  extra_character_price: 0,
  total_price: 0,
  is_submitted: false,
};

function getDraftKey(id: string) {
  return `commission-draft-${id}`;
}
function getStepKey(id: string) {
  return `commission-draft-step-${id}`;
}

export function FormProvider({ children }: { children: React.ReactNode }) {
  // Synchronously check for draft param
  let hasDraftParam = false;
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    hasDraftParam = !!params.get("draft");
  }

  const [hydrated, setHydrated] = useState(!hasDraftParam);
  const [data, setData] = useState<CommissionDraft>(
    !hasDraftParam ? { ...initialDraft, id: "" } : initialDraft
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasDraftParam) return; // Already hydrated synchronously

    const params = new URLSearchParams(window.location.search);
    const draftId = params.get("draft");
    (async () => {
      let draft: CommissionDraft | undefined = undefined;
      let savedStep: number | null = null;
      // Try localStorage first
      const local = localStorage.getItem(getDraftKey(draftId!));
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed.id === draftId) draft = parsed;
        } catch {}
      }
      // If not in localStorage, fetch from API
      if (!draft) {
        try {
          const res = await fetch(`/api/commissions/draft?id=${draftId}`);
          if (res.ok) {
            const apiDraft = await res.json();
            if (apiDraft && apiDraft.form_snapshot) {
              draft = apiDraft.form_snapshot;
              localStorage.setItem(
                getDraftKey(draftId!),
                JSON.stringify(draft)
              );
            }
          }
        } catch {}
      }
      if (!draft) draft = { ...initialDraft, id: "" };
      setData(draft);
      if (draft.category?.name && draft.type?.name) {
        const stepStr = localStorage.getItem(getStepKey(draftId!));
        savedStep = stepStr ? parseInt(stepStr, 10) : null;
        setCurrentStep(savedStep !== null ? savedStep : 1);
      } else {
        setCurrentStep(0);
      }
      setHydrated(true);
    })();
  }, []);

  // Save to localStorage on every change (if id exists)
  useEffect(() => {
    if (hydrated && data && data.id) {
      localStorage.setItem(getDraftKey(data.id), JSON.stringify(data));
    }
  }, [data, hydrated]);

  // Save currentStep to localStorage (if id exists)
  useEffect(() => {
    if (hydrated && data && data.id) {
      localStorage.setItem(getStepKey(data.id), String(currentStep));
    }
  }, [currentStep, hydrated, data]);

  // Clear only the current draft if not on /commissions/new
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleRouteChange = () => {
      if (!window.location.pathname.startsWith("/commissions/new")) {
        if (data && data.id) {
          localStorage.removeItem(getDraftKey(data.id));
          localStorage.removeItem(getStepKey(data.id));
        }
      }
    };
    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("pushstate", handleRouteChange);
    window.addEventListener("replacestate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("pushstate", handleRouteChange);
      window.removeEventListener("replacestate", handleRouteChange);
    };
  }, [data]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0000] to-[#1a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#fecaca] text-lg mb-2">Loading draft...</div>
          <div className="text-[#9ca3af] text-sm">Please wait</div>
        </div>
      </div>
    );
  }

  const update = (updates: Partial<CommissionDraft>) => {
    setData((prev) => ({ ...prev!, ...updates }));
  };

  const setStep = (step: number) => {
    setCurrentStep(step);
  };

  // Make applyOffer async and fetch fields/addons from Supabase
  const applyOffer = async (offer: SupabaseCommissionOffer) => {
    setData((prev) => ({
      ...prev!,
      category: { name: offer.category_name },
      type: { name: offer.type_name, price: offer.base_price },
      subtype: offer.subtype_name ? { name: offer.subtype_name } : undefined,
      base_price: offer.base_price,
      character_count: 1,
      extra_character_price: offer.character_count_price_per_extra || 0,
      max_character_count: offer.character_count_max || 1,
    }));

    // Fetch fields and addons from Supabase
    if (offer.id) {
      const [fields, addons] = await Promise.all([
        getCommissionOfferFields(offer.id),
        getCommissionOfferAddons(offer.id),
      ]);
      setData((prev) => ({
        ...prev!,
        comm_specific_inputs: fields.map((f) => ({
          name: f.field_name,
          type: f.field_type,
          value:
            f.field_type === "boolean"
              ? false
              : f.field_type === "list"
              ? []
              : "",
          price: f.field_price ?? undefined,
        })),
        addons: addons.map((a) => ({
          name: a.addon_name,
          type: a.addon_type,
          value:
            a.addon_type === "boolean"
              ? false
              : a.addon_type === "list"
              ? []
              : "",
          price: a.addon_price ?? undefined,
        })),
      }));
    } else {
      setData((prev) => ({ ...prev!, comm_specific_inputs: [], addons: [] }));
    }
  };

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      console.log("FormContext: Starting saveDraft...");
      const user = await getCurrentUser();
      if (!user) throw new Error("Not logged in");
      console.log("FormContext: User authenticated:", user.id);

      // Always recalculate total_price before saving
      const total_price = calculateTotalPrice(data!);
      console.log("FormContext: Calculated total_price:", total_price);

      const commissionData = {
        user_id: user.id,
        offer_id: null,
        category_name: data!.category.name,
        type_name: data!.type.name,
        subtype_name: data!.subtype?.name || null,
        final_price: null,
        character_count: data!.character_count,
        extra_character_price: data!.extra_character_price,
        usage_type: data!.usage_type,
        allow_streaming: data!.allow_streaming,
        comm_specific_data:
          data!.comm_specific_inputs?.reduce((acc, field) => {
            acc[field.name] = field.value;
            return acc;
          }, {} as Record<string, boolean | string | string[]>) || null,
        addons_data:
          data!.addons?.reduce((acc, addon) => {
            acc[addon.name] = addon.value;
            return acc;
          }, {} as Record<string, boolean | string | string[]>) || null,
        reference_urls: data!.references,
        extra_info: data!.extra_info,
        status: "draft" as const,
        accepted_at: null,
        payment_received_at: null,
        completed_at: null,
        waitlisted_at: null,
        payment_requested_at: null,
        work_started_at: null,
        total_price,
        form_snapshot: data!,
      };

      console.log("FormContext: Commission data prepared:", commissionData);

      if (data!.id && data!.id !== initialDraft.id) {
        console.log("FormContext: Updating existing commission:", data!.id);
        const result = await updateCommission(data!.id, commissionData);
        console.log("FormContext: Update result:", result);
      } else {
        console.log("FormContext: Creating new commission");
        const newCommission = await createCommission(commissionData);
        console.log("FormContext: New commission created:", newCommission);
        update({ id: newCommission.id });
      }

      console.log("FormContext: Draft saved successfully");
    } catch (error) {
      console.error("FormContext: Failed to save draft:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const submitCommission = async (): Promise<string> => {
    setIsSubmitting(true);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("Not logged in");
      // Always recalculate total_price before submitting
      const total_price = calculateTotalPrice(data!);
      const commissionData = {
        user_id: user.id,
        offer_id: null,
        category_name: data!.category.name,
        type_name: data!.type.name,
        subtype_name: data!.subtype?.name || null,
        final_price: null,
        character_count: data!.character_count,
        extra_character_price: data!.extra_character_price,
        usage_type: data!.usage_type,
        allow_streaming: data!.allow_streaming,
        comm_specific_data:
          data!.comm_specific_inputs?.reduce((acc, field) => {
            acc[field.name] = field.value;
            return acc;
          }, {} as Record<string, boolean | string | string[]>) || null,
        addons_data:
          data!.addons?.reduce((acc, addon) => {
            acc[addon.name] = addon.value;
            return acc;
          }, {} as Record<string, boolean | string | string[]>) || null,
        reference_urls: data!.references,
        extra_info: data!.extra_info,
        status: "submitted" as const,
        accepted_at: null,
        payment_received_at: null,
        completed_at: null,
        waitlisted_at: null,
        payment_requested_at: null,
        work_started_at: null,
        total_price,
        form_snapshot: data!,
      };
      let commissionId: string;
      if (data!.id && data!.id !== initialDraft.id) {
        const updatedCommission = await updateCommission(data!.id, {
          ...commissionData,
        });
        commissionId = updatedCommission.id;
      } else {
        const newCommission = await createCommission(commissionData);
        commissionId = newCommission.id;
      }
      localStorage.removeItem(getDraftKey(data!.id));
      localStorage.removeItem(getStepKey(data!.id));
      setData(initialDraft);
      setCurrentStep(0);
      return commissionId;
    } catch (error) {
      console.error("Failed to submit commission:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContext.Provider
      value={{
        data: data!,
        currentStep,
        setStep,
        update,
        applyOffer,
        saveDraft,
        submitCommission,
        isSubmitting,
        isSaving,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}
