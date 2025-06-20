'use client';

import { useFormContext } from '@/context/FormContext';
import type { StepProps } from './types';
import { useState } from 'react';

export default function ReferenceStep({ onNext, onPrev }: StepProps) {
  const { data, update } = useFormContext();
  const [input, setInput] = useState('');

  const addReference = () => {
    if (!input.trim()) return;
    update({ references: [...data.references, input.trim()] });
    setInput('');
  };

  const removeReference = (index: number) => {
    const refs = [...data.references];
    refs.splice(index, 1);
    update({ references: refs });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">References</h2>

      <p className="text-sm text-gray-500">Upload reference links or image URLs. Example: Imgur, Discord uploads, Dropbox.</p>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          placeholder="Paste image URL or link"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={addReference}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {data.references.map((ref, index) => (
          <li key={index} className="flex items-center justify-between border rounded px-3 py-2">
            <span className="truncate">{ref}</span>
            <button
              onClick={() => removeReference(index)}
              className="text-red-500 text-sm"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

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
