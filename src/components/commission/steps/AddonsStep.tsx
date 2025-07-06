"use client";

import { useFormContext } from "@/context/FormContext";
import Input from "@/components/ui/Input";
import Checkbox from "@/components/ui/Checkbox";
import type { CommissionCustomField } from "@/lib/types/commission";

export default function AddonsStep() {
  const { data, update } = useFormContext();

  const handleChange = (index: number, value: string | boolean | string[]) => {
    const updated = [...(data.addons ?? [])];
    updated[index].value = value;
    update({ addons: updated });
  };

  const addListItem = (addonIndex: number) => {
    const current = [...(data.addons ?? [])];
    const value = current[addonIndex].value as string[];
    current[addonIndex].value = [...value, ""];
    update({ addons: current });
  };

  const updateListItem = (
    addonIndex: number,
    itemIndex: number,
    newValue: string
  ) => {
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

  const renderPriceDisplay = (field: CommissionCustomField) => {
    if (!field.price) return null;

    let priceText = "";
    if (field.type === "boolean") {
      priceText = `+€${field.price}`;
    } else if (field.type === "input") {
      priceText = `+€${field.price}`;
    } else if (field.type === "list") {
      const itemCount = (field.value as string[]).filter((item) =>
        item.trim()
      ).length;
      if (itemCount > 0) {
        priceText = `+€${field.price * itemCount} (${itemCount} × €${
          field.price
        })`;
      } else {
        priceText = `+€${field.price} each`;
      }
    }

    return (
      <span className="text-[var(--red-muted)] text-sm font-medium">
        {priceText}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--red-light)] mb-3">
          Add-Ons
        </h2>
        <p className="text-[var(--red-muted)]">
          Select additional features to enhance your commission
        </p>
      </div>

      {data.addons?.map((field, index) => (
        <div key={index} className="space-y-4">
          {field.type === "input" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Input
                  label={field.name}
                  value={field.value as string}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder={`Enter ${field.name.toLowerCase()}`}
                />
                {renderPriceDisplay(field)}
              </div>
            </div>
          )}

          {field.type === "boolean" && (
            <div className="flex items-center justify-between">
              <Checkbox
                label={field.name}
                checked={field.value as boolean}
                onChange={(checked) => handleChange(index, checked)}
              />
              {renderPriceDisplay(field)}
            </div>
          )}

          {field.type === "list" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[var(--red-light)] font-medium text-sm">
                  {field.name}
                </label>
                {renderPriceDisplay(field)}
              </div>
              {(field.value as string[]).map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateListItem(index, i, e.target.value)}
                    placeholder={`Item ${i + 1}`}
                    className="flex-1"
                  />
                  <button
                    onClick={() => removeListItem(index, i)}
                    className="px-3 py-2 bg-[var(--red-primary)] text-white rounded hover:bg-[var(--red-secondary)] transition-colors duration-200"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => addListItem(index)}
                className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--red-tertiary)] text-[var(--red-light)] rounded hover:bg-[var(--red-tertiary)] transition-colors duration-200"
              >
                ➕ Add Item
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
