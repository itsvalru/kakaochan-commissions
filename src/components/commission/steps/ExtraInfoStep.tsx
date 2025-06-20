'use client';

import { useFormContext } from '@/context/FormContext';
import type { StepProps } from './types';

export default function ExtraInfoStep({ onNext, onPrev }: StepProps) {
  const { data, update } = useFormContext();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Extra Information</h2>

      <p className="text-sm text-gray-500">
        Include anything else you want KakaoChan to know. This could be your vision, references to style, meme ideas, personal boundaries, or "pls draw huge boobas".
      </p>

      <textarea
        className="w-full border rounded px-3 py-2 text-black min-h-[150px]"
        placeholder="Write here..."
        value={data.extra_info}
        onChange={(e) => update({ extra_info: e.target.value })}
      />

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
