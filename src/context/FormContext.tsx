'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import type { CommissionDraft, CommissionOffer } from '@/lib/types/commission';
import { commissionOffers } from '@/lib/commissionOffers';

const defaultDraft: CommissionDraft = {
  id: '', // Supabase will assign this later
  user_id: undefined,

  category: { name: '', price: 0 },
  type: { name: '', price: 0 },
  base_price: 0,

  usage_type: 'personal',
  allow_streaming: true,
  references: [],
  extra_info: '',

  character_count: 1,
  extra_character_price: 0,
  max_character_count: 1,

  comm_specific_inputs: [],
  addons: [],

  total_price: 0,
  is_submitted: false,
};

type FormContextType = {
  data: CommissionDraft;
  update: (newData: Partial<CommissionDraft>) => void;
  applyOffer: (offer: CommissionOffer) => void;
  reset: () => void;
  resetFull: () => void;
  currentStep: number;
  setStep: (step: number) => void;
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<CommissionDraft>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('commissionDraft');
      if (stored) return JSON.parse(stored);
    }
    return { ...defaultDraft };
  });

  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const storedStep = localStorage.getItem('commissionStep');
      return storedStep ? parseInt(storedStep) : 0;
    }
    return 0;
  });

  useEffect(() => {
    localStorage.setItem('commissionDraft', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('commissionStep', String(currentStep));
  }, [currentStep]);

  const update = (newData: Partial<CommissionDraft>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const setStep = (step: number) => {
    setCurrentStep(step);
  };

  const applyOffer = (offer: CommissionOffer) => {
    setData((prev) => ({
      ...prev,
      base_price: offer.base_price,
      character_count: 1,
      extra_character_price: offer.character_count?.price_per_extra ?? 0,
      max_character_count: offer.character_count?.max ?? 1,
      comm_specific_inputs: offer.comm_specific_inputs ?? [],
      addons: offer.addons ?? [],
    }));
  };

  const reset = () => {
    setData({ ...defaultDraft });
    localStorage.setItem('commissionDraft', JSON.stringify(defaultDraft));
  };

  const resetFull = () => {
    setData({ ...defaultDraft });
    setCurrentStep(0);
    localStorage.setItem('commissionDraft', JSON.stringify(defaultDraft));
    localStorage.setItem('commissionStep', '0');
  };

  return (
    <FormContext.Provider
      value={{
        data,
        update,
        applyOffer,
        reset,
        resetFull,
        currentStep,
        setStep,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) throw new Error('useFormContext must be used inside FormProvider');
  return context;
};
