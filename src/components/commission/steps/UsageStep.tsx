"use client";

import { useFormContext } from "@/context/FormContext";
import RadioGroup from "@/components/ui/RadioGroup";

const options: Array<{
  label: string;
  value: "personal" | "commercial" | "content";
}> = [
  { label: "Personal Use (Default)", value: "personal" },
  { label: "Commercial Use (e.g. merch, reselling)", value: "commercial" },
  { label: "Content Use (e.g. streaming, YouTube)", value: "content" },
];

export default function UsageStep() {
  const { data, update } = useFormContext();

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--red-light)] mb-3">
          How will you use this commission?
        </h2>
        <p className="text-[var(--red-muted)]">
          Choose the usage rights that best fit your needs
        </p>
      </div>

      <RadioGroup
        options={options}
        value={data.usage_type}
        onChange={(value) =>
          update({ usage_type: value as "personal" | "commercial" | "content" })
        }
      />
    </div>
  );
}
