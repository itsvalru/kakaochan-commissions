'use client';

import { useFormContext } from '@/context/FormContext';
import type { StepProps } from './types';

export default function StreamingStep({ onNext, onPrev }: StepProps) {
  const { data, update } = useFormContext();

  const handleChange = (value: boolean) => {
    update({ allow_streaming: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Will you allow this to be shown on stream?</h2>

      <div className="space-y-2">
        <label className="block">
          <input
            type="radio"
            name="streaming"
            checked={data.allow_streaming === true}
            onChange={() => handleChange(true)}
            className="mr-2"
          />
          Yes, it can be streamed
        </label>

        <label className="block">
          <input
            type="radio"
            name="streaming"
            checked={data.allow_streaming === false}
            onChange={() => handleChange(false)}
            className="mr-2"
          />
          No — add 25% private fee
        </label>
      </div>

      <div className="flex justify-between pt-4">
        {onPrev && (
          <button onClick={onPrev} className="px-4 py-2 border rounded">
            Back
          </button>
        )}
        <button onClick={onNext} className="px-4 py-2 bg-red-500 text-white rounded">
          Continue
        </button>
      </div>
    </div>
  );
}
