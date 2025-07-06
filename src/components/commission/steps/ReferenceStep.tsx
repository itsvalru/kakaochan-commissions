"use client";

import { useFormContext } from "@/context/FormContext";
import { useState } from "react";
import Input from "@/components/ui/Input";

export default function ReferenceStep() {
  const { data, update } = useFormContext();
  const [input, setInput] = useState("");

  const addReference = () => {
    if (!input.trim()) return;
    update({ references: [...data.references, input.trim()] });
    setInput("");
  };

  const removeReference = (index: number) => {
    const refs = [...data.references];
    refs.splice(index, 1);
    update({ references: refs });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--red-light)] mb-3">
          References
        </h2>
        <p className="text-[var(--red-muted)]">
          Upload reference links or image URLs. Example: Imgur, Discord uploads,
          Dropbox.
        </p>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Paste image URL or link"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addReference()}
          className="flex-1"
        />
        <button onClick={addReference} className="form-button px-6">
          Add
        </button>
      </div>

      {data.references.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[var(--red-light)] font-medium text-sm">
            Added References:
          </h3>
          <ul className="space-y-2">
            {data.references.map((ref, index) => (
              <li
                key={index}
                className="flex items-center justify-between form-card p-3"
              >
                <span className="truncate text-[var(--red-light)] text-sm">
                  {ref}
                </span>
                <button
                  onClick={() => removeReference(index)}
                  className="text-[var(--red-primary)] text-sm hover:text-[var(--red-secondary)] transition-colors duration-200"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
