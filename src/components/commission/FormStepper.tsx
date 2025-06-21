'use client';

import { useFormContext } from '@/context/FormContext';
import { getStepsFromDraft, StepKey } from '@/lib/stepEngine';
import { calculateTotalPrice } from '@/lib/calculateTotal';

// Step imports
import PathStep from './steps/PathStep';
import CommSpecificStep from './steps/CommSpecificStep';
import AddonsStep from './steps/AddonsStep';
import UsageStep from './steps/UsageStep';
import StreamingStep from './steps/StreamingStep';
import ReferenceStep from './steps/ReferenceStep';
import ExtraInfoStep from './steps/ExtraInfoStep';
import SummaryStep from './steps/SummaryStep';

export default function FormStepper() {
  const { data, currentStep, setStep } = useFormContext();
  const steps = getStepsFromDraft(data);

  const stepKey: StepKey = steps[currentStep];
  const total = calculateTotalPrice(data);

  const goNext = () => {
    if (currentStep < steps.length - 1) setStep(currentStep + 1);
  };

  const goBack = () => {
    if (currentStep > 0) setStep(currentStep - 1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>Step {currentStep + 1} / {steps.length}</span>
        <span className="text-right">
          Total: <span className="text-white font-bold">{total.toFixed(2)} €</span>
        </span>
      </div>

      {stepKey === 'path' && <PathStep onNext={goNext} />}
      {stepKey === 'comm-specific' && <CommSpecificStep onNext={goNext} onPrev={goBack} />}
      {stepKey === 'addons' && <AddonsStep onNext={goNext} onPrev={goBack} />}
      {stepKey === 'usage' && <UsageStep onNext={goNext} onPrev={goBack} />}
      {stepKey === 'streaming' && <StreamingStep onNext={goNext} onPrev={goBack} />}
      {stepKey === 'references' && <ReferenceStep onNext={goNext} onPrev={goBack} />}
      {stepKey === 'extra-info' && <ExtraInfoStep onNext={goNext} onPrev={goBack} />}
      {stepKey === 'summary' && <SummaryStep onPrev={goBack} />}
    </div>
  );
}
