'use client';

import { useState } from 'react';
import { useFormContext } from '@/context/FormContext';
import { getStepsFromDraft, StepKey } from '@/lib/stepEngine';

// Step Components
import PathStep from './steps/PathStep';
import CommSpecificStep from './steps/CommSpecificStep';
import AddonsStep from './steps/AddonsStep';
import UsageStep from './steps/UsageStep';
import StreamingStep from './steps/StreamingStep';
import ReferenceStep from './steps/ReferenceStep';
import ExtraInfoStep from './steps/ExtraInfoStep';
import SummaryStep from './steps/SummaryStep';

export default function FormStepper() {
  const { data } = useFormContext();
  const steps = getStepsFromDraft(data);
  const [currentStep, setCurrentStep] = useState(0);

  const stepKey: StepKey = steps[currentStep];

  const goNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>Step {currentStep + 1} / {steps.length}</span>
        <span>{stepKey}</span>
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
