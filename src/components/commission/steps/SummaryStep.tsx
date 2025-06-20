'use client';

import { useFormContext } from '@/context/FormContext';
import type { StepProps } from './types';
import { useEffect } from 'react';

export default function SummaryStep({ onPrev }: StepProps) {
  const { data, update } = useFormContext();

  // Calculate total
  let total = data.base_price || 0;

  // Extra characters
  if (data.character_count > 1) {
    total += (data.character_count - 1) * (data.extra_character_price || 0);
  }

  // Addons
  data.addons?.forEach((addon) => {
    if (addon.type === 'boolean' && addon.value === true && addon.price) {
      total += addon.price;
    }
    if (addon.type === 'input' && addon.value && addon.price) {
      total += addon.price;
    }
    if (addon.type === 'list' && Array.isArray(addon.value) && addon.price) {
      total += addon.value.length * addon.price;
    }
  });

  // Streaming Fee (25% if not allowed)
  const streamFee = data.allow_streaming === false ? total * 0.25 : 0;
  const finalTotal = total + streamFee;

  useEffect(() => {
    update({ total_price: finalTotal });
  }, [finalTotal]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Summary & Total</h2>

      <ul className="space-y-2 text-sm">
        <li><strong>Category:</strong> {data.category.name}</li>
        <li><strong>Type:</strong> {data.type.name}</li>
        {data.subtype?.name && <li><strong>Subtype:</strong> {data.subtype.name}</li>}
        <li><strong>Usage:</strong> {data.usage_type}</li>
        <li><strong>Streaming Allowed:</strong> {data.allow_streaming ? 'Yes' : 'No (25% fee)'}</li>
        <li><strong>Characters:</strong> {data.character_count} {data.extra_character_price > 0 && `(Extra char. x${data.character_count - 1})`}</li>
      </ul>

      <div>
        <h3 className="font-semibold mt-4">Add-Ons:</h3>
        {data.addons?.filter((a) => {
          if (a.type === 'boolean') return a.value === true;
          if (a.type === 'input') return a.value;
          if (a.type === 'list') return Array.isArray(a.value) && a.value.length > 0;
        }).length === 0 && <p className="text-sm text-gray-500">None</p>}
        <ul className="text-sm list-disc ml-6">
          {data.addons?.map((addon, i) => {
            if (addon.type === 'boolean' && addon.value === true)
              return <li key={i}>{addon.name} (+{addon.price}€)</li>;
            if (addon.type === 'input' && addon.value)
              return <li key={i}>{addon.name}: "{addon.value}" {addon.price && `(+${addon.price}€)`}</li>;
            if (addon.type === 'list' && Array.isArray(addon.value) && addon.value.length > 0)
              return <li key={i}>{addon.name} x{addon.value.length} (+{(addon.price ?? 0) * addon.value.length}€)</li>;
            return null;
          })}
        </ul>
      </div>

      <div className="border-t pt-4 text-xl font-bold">
        Total: {finalTotal.toFixed(2)} €
      </div>

      <div className="flex justify-between pt-4">
        {onPrev && (
          <button onClick={onPrev} className="px-4 py-2 border rounded">
            Back
          </button>
        )}
        <button
          onClick={() => alert('SUBMIT LOGIC GOES HERE')}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Submit Commission
        </button>
      </div>
    </div>
  );
}
