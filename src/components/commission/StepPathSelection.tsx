'use client';

import { useFormContext } from '@/context/FormContext';
import type { PathDefiner } from '@/lib/types/commission';
import { useEffect, useState } from 'react';

type Props = {
  categoryOptions: PathDefiner[];
  getTypesForCategory: (categoryName: string) => PathDefiner[];
  getSubtypesForType: (categoryName: string, typeName: string) => PathDefiner[] | undefined;
};

export default function StepPathSelection({
  categoryOptions,
  getTypesForCategory,
  getSubtypesForType,
}: Props) {
  const { data, update } = useFormContext();

  const [typeOptions, setTypeOptions] = useState<PathDefiner[]>([]);
  const [subtypeOptions, setSubtypeOptions] = useState<PathDefiner[]>([]);

  // Update types when category changes
  useEffect(() => {
    if (data.category.name) {
      const types = getTypesForCategory(data.category.name);
      setTypeOptions(types);
    }
  }, [data.category]);

  // Update subtypes when type changes
  useEffect(() => {
    if (data.type.name && data.category.name) {
      const subtypes = getSubtypesForType(data.category.name, data.type.name);
      setSubtypeOptions(subtypes || []);
    }
  }, [data.type]);

  return (
    <div className="space-y-6">
      {/* CATEGORY */}
      <div>
        <h2 className="text-xl font-bold">Choose a Category</h2>
        <div className="grid grid-cols-2 gap-2">
          {categoryOptions.map((option) => (
            <button
              key={option.name}
              className={`p-3 border rounded ${
                data.category.name === option.name ? 'border-red-500' : 'border-gray-300'
              }`}
              onClick={() => {
                update({
                  category: option,
                  type: { name: '', price: 0 },
                  subtype: undefined,
                });
              }}
            >
              {option.name}
              {option.description && (
                <p className="text-sm text-gray-500">{option.description}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TYPE */}
      {data.category.name && (
        <div>
          <h2 className="text-xl font-bold">Choose a Type</h2>
          <div className="grid grid-cols-2 gap-2">
            {typeOptions.map((option) => (
              <button
                key={option.name}
                className={`p-3 border rounded ${
                  data.type.name === option.name ? 'border-red-500' : 'border-gray-300'
                }`}
                onClick={() =>
                  update({
                    type: option,
                    subtype: undefined,
                  })
                }
              >
                {option.name}
                {option.description && (
                  <p className="text-sm text-gray-500">{option.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SUBTYPE (optional) */}
      {data.type.name && subtypeOptions.length > 0 && (
        <div>
          <h2 className="text-xl font-bold">Choose a Subtype</h2>
          <div className="grid grid-cols-2 gap-2">
            {subtypeOptions.map((option) => (
              <button
                key={option.name}
                className={`p-3 border rounded ${
                  data.subtype?.name === option.name ? 'border-red-500' : 'border-gray-300'
                }`}
                onClick={() => update({ subtype: option })}
              >
                {option.name}
                {option.description && (
                  <p className="text-sm text-gray-500">{option.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
