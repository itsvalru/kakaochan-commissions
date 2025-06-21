'use client';

import { useFormContext } from '@/context/FormContext';
import { commissionOffers } from '@/lib/commissionOffers';
import type { StepProps } from './types';
import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function PathStep({ onNext }: StepProps) {
  const { data, update, applyOffer } = useFormContext();
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const categories = useMemo(() => {
    return [...new Set(commissionOffers.map((o) => o.category.name))];
  }, []);

  const types = useMemo(() => {
    return [...new Set(
      commissionOffers
        .filter((o) => o.category.name === data.category.name)
        .map((o) => o.type.name)
    )];
  }, [data.category.name]);

  const subtypes = useMemo(() => {
    return [...new Set(
      commissionOffers
        .filter(
          (o) =>
            o.category.name === data.category.name &&
            o.type.name === data.type.name &&
            o.subtype?.name
        )
        .map((o) => o.subtype!.name)
    )];
  }, [data.category.name, data.type.name]);

  const selectCategory = (name: string) => {
    update({
      category: { name, price: 0 },
      type: { name: '', price: 0 },
      subtype: undefined,
    });
    setStep(1);
  };

  const selectType = (name: string) => {
    update({
      type: { name, price: 0 },
      subtype: undefined,
    });

    const relatedSubtypes = commissionOffers
      .filter(
        (o) =>
          o.category.name === data.category.name &&
          o.type.name === name &&
          o.subtype?.name
      )
      .map((o) => o.subtype!.name);

    if (relatedSubtypes.length > 0) {
      setStep(2);
    } else {
      const offer = commissionOffers.find(
        (o) =>
          o.category.name === data.category.name &&
          o.type.name === name &&
          !o.subtype
      );
      if (offer) {
        applyOffer(offer);
        onNext();
      }
    }
  };

  const selectSubtype = (name: string) => {
    const offer = commissionOffers.find(
      (o) =>
        o.category.name === data.category.name &&
        o.type.name === data.type.name &&
        o.subtype?.name === name
    );
    if (offer) {
      update({ subtype: offer.subtype });
      applyOffer(offer);
      onNext();
    }
  };

  const goBack = () => {
    if (step === 2) {
      update({ subtype: undefined });
      setStep(1);
    } else if (step === 1) {
      update({
        type: { name: '', price: 0 },
        subtype: undefined,
      });
      setStep(0);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold mb-4">Choose your commission path</h2>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            {...stepVariants}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <h3 className="font-semibold mb-2">1. Choose a Category</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((name) => (
                <button
                  key={name}
                  onClick={() => selectCategory(name)}
                  className={`p-3 border rounded ${
                    data.category.name === name ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            {...stepVariants}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <h3 className="font-semibold mb-2">2. Choose a Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {types.map((name) => (
                <button
                  key={name}
                  onClick={() => selectType(name)}
                  className={`p-3 border rounded ${
                    data.type.name === name ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && subtypes.length > 0 && (
          <motion.div
            key="step2"
            {...stepVariants}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <h3 className="font-semibold mb-2">3. Choose a Subtype</h3>
            <div className="grid grid-cols-2 gap-2">
              {subtypes.map((name) => (
                <button
                  key={name}
                  onClick={() => selectSubtype(name)}
                  className={`p-3 border rounded ${
                    data.subtype?.name === name ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {step > 0 && (
        <div className="pt-6">
          <button
            onClick={goBack}
            className="text-sm text-gray-400 hover:text-white"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
