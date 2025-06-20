'use client';

import { useFormContext } from '@/context/FormContext';
import type { StepProps } from './types';

export default function CommSpecificStep({ onNext, onPrev }: StepProps) {
  const { data, update } = useFormContext();

  const handleChange = (index: number, value: string | boolean | string[]) => {
    const updated = [...(data.comm_specific_inputs ?? [])];
    updated[index].value = value;
    update({ comm_specific_inputs: updated });
  };

  const handleCharacterCountChange = (count: number) => {
    update({ character_count: count });
  };

  const characterOptions =
    data.max_character_count && data.max_character_count > 1
      ? Array.from({ length: data.max_character_count }, (_, i) => i + 1)
      : [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Commission Details</h2>

      {/* Character Count Selector */}
      {characterOptions.length > 0 && (
        <div className="space-y-2">
          <label className="block font-medium">How many characters?</label>
          <select
            className="w-full border rounded text-black px-3 py-2"
            value={data.character_count}
            onChange={(e) => handleCharacterCountChange(Number(e.target.value))}
          >
            {characterOptions.map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? '(Included)' : `(+€${(count - 1) * data.extra_character_price})`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Commission Specific Inputs */}
      {data.comm_specific_inputs?.map((field, index) => (
        <div key={index} className="space-y-2">
          <label className="block font-medium">{field.name}</label>

          {field.type === 'input' && (
            <input
              type="text"
              className="w-full text-black border rounded px-3 py-2"
              value={field.value as string}
              onChange={(e) => handleChange(index, e.target.value)}
            />
          )}

          {field.type === 'boolean' && (
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={field.value as boolean}
                onChange={(e) => handleChange(index, e.target.checked)}
              />
              <span>Yes</span>
            </label>
          )}

          {field.type === 'list' && (
            <textarea
              className="w-full border rounded px-3 py-2 text-black"
              placeholder="Enter multiple items, one per line"
              value={(field.value as string[]).join('\n')}
              onChange={(e) => handleChange(index, e.target.value.split('\n'))}
            />
          )}
        </div>
      ))}

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
