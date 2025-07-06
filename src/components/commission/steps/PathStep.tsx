"use client";

import { useFormContext } from "@/context/FormContext";
import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getCommissionOffers } from "@/lib/supabase-client";
import type { StepProps } from "./types";
import type { CommissionOffer } from "@/lib/types/types";

export default function PathStep({ onNext }: StepProps) {
  const { data, update, applyOffer } = useFormContext();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [offers, setOffers] = useState<CommissionOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfferLoading, setIsOfferLoading] = useState(false);

  useEffect(() => {
    getCommissionOffers()
      .then((data) => {
        setOffers(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load commission offers");
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const categoryMap = new Map<string, { name: string; minPrice?: number }>();
    offers.forEach((offer) => {
      const existing = categoryMap.get(offer.category_name);
      if (!existing) {
        categoryMap.set(offer.category_name, {
          name: offer.category_name,
          minPrice: offer.base_price,
        });
      } else if (offer.base_price < (existing.minPrice ?? Infinity)) {
        existing.minPrice = offer.base_price;
      }
    });
    return Array.from(categoryMap.values());
  }, [offers]);

  const types = useMemo(() => {
    const typeMap = new Map<string, { name: string; minPrice?: number }>();
    offers
      .filter((o) => o.category_name === data.category.name)
      .forEach((offer) => {
        const existing = typeMap.get(offer.type_name);
        if (!existing) {
          typeMap.set(offer.type_name, {
            name: offer.type_name,
            minPrice: offer.base_price,
          });
        } else if (offer.base_price < (existing.minPrice ?? Infinity)) {
          existing.minPrice = offer.base_price;
        }
      });
    return Array.from(typeMap.values());
  }, [offers, data.category.name]);

  const subtypes = useMemo(() => {
    const subtypeMap = new Map<string, { name: string; price: number }>();
    offers
      .filter(
        (o) =>
          o.category_name === data.category.name &&
          o.type_name === data.type.name &&
          o.subtype_name
      )
      .forEach((offer) => {
        if (offer.subtype_name) {
          subtypeMap.set(offer.subtype_name, {
            name: offer.subtype_name,
            price: 0, // You can extend this if you add subtype price to DB
          });
        }
      });
    return Array.from(subtypeMap.values());
  }, [offers, data.category.name, data.type.name]);

  const selectCategory = (name: string) => {
    update({
      category: { name, price: 0 },
      type: { name: "", price: 0 },
      subtype: undefined,
    });
    setStep(1);
  };

  const selectType = async (name: string) => {
    update({
      type: { name, price: 0 },
      subtype: undefined,
    });
    const relatedSubtypes = offers
      .filter(
        (o) =>
          o.category_name === data.category.name &&
          o.type_name === name &&
          o.subtype_name
      )
      .map((o) => o.subtype_name!);
    if (relatedSubtypes.length > 0) {
      setStep(2);
    } else {
      const offer = offers.find(
        (o) =>
          o.category_name === data.category.name &&
          o.type_name === name &&
          !o.subtype_name
      );
      if (offer) {
        setIsOfferLoading(true);
        await applyOffer(offer);
        setIsOfferLoading(false);
        onNext?.();
      }
    }
  };

  const selectSubtype = async (name: string) => {
    const offer = offers.find(
      (o) =>
        o.category_name === data.category.name &&
        o.type_name === data.type.name &&
        o.subtype_name === name
    );
    if (offer) {
      update({ subtype: { name: offer.subtype_name! } });
      setIsOfferLoading(true);
      await applyOffer(offer);
      setIsOfferLoading(false);
      onNext?.();
    }
  };

  const goBack = () => {
    if (step === 2) {
      update({ subtype: undefined });
      setStep(1);
    } else if (step === 1) {
      update({
        type: { name: "", price: 0 },
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

  if (loading) {
    return (
      <div className="text-center text-[var(--red-light)] py-12">
        Loading commission offers...
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center text-[var(--red-primary)] py-12">{error}</div>
    );
  }

  if (isOfferLoading) {
    return (
      <div className="text-center text-[var(--red-light)] py-12">
        Loading commission details...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[var(--red-light)] mb-4">
          Choose Your Commission
        </h2>
        <p className="text-[var(--red-muted)] text-lg">
          Select the perfect commission for your vision
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            {...stepVariants}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="form-grid">
              {categories.map((category) => (
                <motion.button
                  key={category.name}
                  onClick={() => selectCategory(category.name)}
                  className={`form-card p-6 text-left transition-all duration-200 hover:scale-105 ${
                    data.category.name === category.name
                      ? "border-[#dc2626] bg-[#2a0a0a]"
                      : "border-[#7f1d1d] hover:border-[#dc2626] hover:bg-[#2a0a0a]"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold text-[#fecaca] text-lg mb-2">
                    {category.name}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            {...stepVariants}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="form-grid">
              {types.map((type) => (
                <motion.button
                  key={type.name}
                  onClick={() => selectType(type.name)}
                  className={`form-card p-6 text-left transition-all duration-200 hover:scale-105 ${
                    data.type.name === type.name
                      ? "border-[#dc2626] bg-[#2a0a0a]"
                      : "border-[#7f1d1d] hover:border-[#dc2626] hover:bg-[#2a0a0a]"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold text-[#fecaca] text-lg mb-2">
                    {type.name}
                  </div>
                  {type.minPrice !== undefined && (
                    <div className="text-[#9ca3af] text-sm">
                      from €{type.minPrice}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && subtypes.length > 0 && (
          <motion.div
            key="step2"
            {...stepVariants}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="form-grid">
              {subtypes.map((subtype) => (
                <motion.button
                  key={subtype.name}
                  onClick={() => selectSubtype(subtype.name)}
                  className={`form-card p-6 text-left transition-all duration-200 hover:scale-105 ${
                    data.subtype?.name === subtype.name
                      ? "border-[#dc2626] bg-[#2a0a0a]"
                      : "border-[#7f1d1d] hover:border-[#dc2626] hover:bg-[#2a0a0a]"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold text-[#fecaca] text-lg mb-2">
                    {subtype.name}
                  </div>
                  {subtype.price > 0 && (
                    <div className="text-[#9ca3af] text-sm">
                      +€{subtype.price}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {step > 0 && (
        <motion.div
          className="text-center pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button onClick={goBack} className="form-button-secondary">
            ← Back
          </button>
        </motion.div>
      )}
    </div>
  );
}
