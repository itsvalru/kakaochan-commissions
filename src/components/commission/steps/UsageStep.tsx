'use client';

import { useFormContext } from '@/context/FormContext';
import type { StepProps } from './types';

const options: Array<{ label: string; value: 'personal' | 'commercial' | 'content' }> = [
  { label: 'Personal Use (Default)', value: 'personal' },
  { label: 'Commercial Use (e.g. merch, reselling)', value: 'commercial' },
  { label: 'Content Use (e.g. streaming, YouTube)', value: 'content' },
];

export default function UsageStep({ onNext, onPrev }: StepProps) {
  const { data, update } = useFormContext();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">How will you use this commission?</h2>

      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="block">
            <input
              type="radio"
              name="usage"
              value={option.value}
              checked={data.usage_type === option.value}
              onChange={() => update({ usage_type: option.value })}
              className="mr-2"
            />
            {option.label}
          </label>
        ))}
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
