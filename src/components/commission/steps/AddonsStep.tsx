'use client';

import { useFormContext } from '@/context/FormContext';
import type { StepProps } from './types';
import type { CommissionCustomField } from '@/lib/types/commission';

export default function AddonsStep({ onNext, onPrev }: StepProps) {
  const { data, update } = useFormContext();

  const handleChange = (index: number, value: string | boolean | string[]) => {
    const updated = [...(data.addons ?? [])];
    updated[index].value = value;
    update({ addons: updated });
  };

  const addListItem = (addonIndex: number) => {
    const current = [...(data.addons ?? [])];
    const value = current[addonIndex].value as string[];
    current[addonIndex].value = [...value, ''];
    update({ addons: current });
  };

  const updateListItem = (addonIndex: number, itemIndex: number, newValue: string) => {
    const current = [...(data.addons ?? [])];
    const list = [...(current[addonIndex].value as string[])];
    list[itemIndex] = newValue;
    current[addonIndex].value = list;
    update({ addons: current });
  };

  const removeListItem = (addonIndex: number, itemIndex: number) => {
    const current = [...(data.addons ?? [])];
    const list = [...(current[addonIndex].value as string[])];
    list.splice(itemIndex, 1);
    current[addonIndex].value = list;
    update({ addons: current });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Add-Ons</h2>

      {data.addons?.map((field, index) => (
        <div key={index} className="space-y-2">
          <label className="block font-medium">{field.name}</label>

          {field.type === 'input' && (
            <input
              type="text"
              className="w-full border rounded text-black px-3 py-2"
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
              <span>Enable</span>
            </label>
          )}

          {field.type === 'list' && (
            <div className="space-y-2">
              {(field.value as string[]).map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 border rounded px-3 py-2 text-black"
                    value={item}
                    onChange={(e) => updateListItem(index, i, e.target.value)}
                  />
                  <button
                    onClick={() => removeListItem(index, i)}
                    className="px-2 py-1 bg-red-600 text-white rounded text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => addListItem(index)}
                className="mt-1 px-3 py-1 bg-red-500 text-white text-sm rounded"
              >
                ➕ Add Item
              </button>
            </div>
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
