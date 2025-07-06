"use client";

import { useFormContext } from "@/context/FormContext";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export default function CommSpecificStep() {
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
      ? Array.from({ length: data.max_character_count }, (_, i) => ({
          value: i + 1,
          label: `${i + 1} ${
            i === 0 ? "(Included)" : `(+€${i * data.extra_character_price})`
          }`,
        }))
      : [];

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--red-light)] mb-3">
          Commission Details
        </h2>
        <p className="text-[var(--red-muted)]">
          Configure the specific requirements for your commission
        </p>
      </div>

      {/* Character Count Selector */}
      {characterOptions.length > 0 && (
        <Select
          label="How many characters?"
          options={characterOptions}
          value={data.character_count}
          onChange={(value) => handleCharacterCountChange(Number(value))}
        />
      )}

      {/* Commission Specific Inputs */}
      {data.comm_specific_inputs?.map((field, index) => (
        <div key={index}>
          {field.type === "input" && (
            <Input
              label={field.name}
              value={field.value as string}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`Enter ${field.name.toLowerCase()}`}
            />
          )}

          {field.type === "boolean" && (
            <div className="space-y-2">
              <label className="block text-[var(--red-light)] font-medium text-sm">
                {field.name}
              </label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value as boolean}
                    onChange={(e) => handleChange(index, e.target.checked)}
                    className="w-4 h-4 text-[var(--red-primary)] bg-[var(--bg-secondary)] border-[var(--red-tertiary)] rounded focus:ring-[var(--red-primary)] focus:ring-2 focus:ring-opacity-20"
                  />
                  <span className="ml-3 text-[var(--red-light)] font-medium text-sm">
                    Yes
                  </span>
                </label>
              </div>
            </div>
          )}

          {field.type === "list" && (
            <div className="space-y-2">
              <label className="block text-[var(--red-light)] font-medium text-sm">
                {field.name}
              </label>
              <textarea
                className="form-input"
                placeholder="Enter multiple items, one per line"
                value={(field.value as string[]).join("\n")}
                onChange={(e) =>
                  handleChange(index, e.target.value.split("\n"))
                }
                rows={4}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
