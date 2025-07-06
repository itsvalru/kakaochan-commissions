"use client";

import { useFormContext } from "@/context/FormContext";
import { useEffect } from "react";

export default function SummaryStep() {
  const { data, update } = useFormContext();

  // Calculate total
  let total = data.base_price || 0;

  // Extra characters
  if (data.character_count > 1) {
    total += (data.character_count - 1) * (data.extra_character_price || 0);
  }

  // Addons
  data.addons?.forEach((addon) => {
    if (addon.type === "boolean" && addon.value === true && addon.price) {
      total += addon.price;
    }
    if (addon.type === "input" && addon.value && addon.price) {
      total += addon.price;
    }
    if (addon.type === "list" && Array.isArray(addon.value) && addon.price) {
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
      <h2 className="text-xl font-bold text-[var(--red-light)]">
        Summary & Total
      </h2>

      <ul className="space-y-2 text-sm">
        <li>
          <strong>Category:</strong> {data.category.name}
        </li>
        <li>
          <strong>Type:</strong> {data.type.name}
        </li>
        {data.subtype?.name && (
          <li>
            <strong>Subtype:</strong> {data.subtype.name}
          </li>
        )}
        <li>
          <strong>Usage:</strong> {data.usage_type}
        </li>
        <li>
          <strong>Streaming Allowed:</strong>{" "}
          {data.allow_streaming ? "Yes" : "No (25% fee)"}
        </li>
        <li>
          <strong>Characters:</strong> {data.character_count}{" "}
          {data.extra_character_price > 0 &&
            `(Extra char. x${data.character_count - 1})`}
        </li>
      </ul>
      <div>
        <h3 className="font-semibold mt-4">Commission Details:</h3>
        {data.comm_specific_inputs?.filter((input) => {
          if (input.type === "boolean") return input.value === true;
          if (input.type === "input") return input.value;
          if (input.type === "list")
            return Array.isArray(input.value) && input.value.length > 0;
        }).length === 0 && (
          <p className="text-sm text-[var(--red-muted)]">None</p>
        )}

        <ul className="text-sm list-disc ml-6">
          {data.comm_specific_inputs?.map((input, i) => {
            if (input.type === "boolean" && input.value === true)
              return (
                <li key={i}>
                  {input.name} {input.price && `(+${input.price}€)`}
                </li>
              );
            if (input.type === "input" && input.value)
              return (
                <li key={i}>
                  {input.name}: &quot;{input.value}&quot;{" "}
                  {input.price && `(+${input.price}€)`}
                </li>
              );
            if (
              input.type === "list" &&
              Array.isArray(input.value) &&
              input.value.length > 0
            )
              return (
                <li key={i}>
                  {input.name} x{input.value.length}{" "}
                  {input.price && `(+${input.value.length * input.price}€)`}
                </li>
              );
            return null;
          })}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mt-4">Add-Ons:</h3>
        {data.addons?.filter((a) => {
          if (a.type === "boolean") return a.value === true;
          if (a.type === "input") return a.value;
          if (a.type === "list")
            return Array.isArray(a.value) && a.value.length > 0;
        }).length === 0 && (
          <p className="text-sm text-[var(--red-muted)]">None</p>
        )}
        <ul className="text-sm list-disc ml-6">
          {data.addons?.map((addon, i) => {
            if (addon.type === "boolean" && addon.value === true)
              return (
                <li key={i}>
                  {addon.name} (+{addon.price}€)
                </li>
              );
            if (addon.type === "input" && addon.value)
              return (
                <li key={i}>
                  {addon.name}: &quot;{addon.value}&quot;{" "}
                  {addon.price && `(+${addon.price}€)`}
                </li>
              );
            if (
              addon.type === "list" &&
              Array.isArray(addon.value) &&
              addon.value.length > 0
            )
              return (
                <li key={i}>
                  {addon.name} x{addon.value.length} (+
                  {(addon.price ?? 0) * addon.value.length}€)
                </li>
              );
            return null;
          })}
        </ul>
      </div>

      <div className="border-t pt-4 text-xl font-bold text-[var(--red-light)]">
        Total: {finalTotal.toFixed(2)} €
      </div>
    </div>
  );
}
