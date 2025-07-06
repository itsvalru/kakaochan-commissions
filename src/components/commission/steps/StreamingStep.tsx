"use client";

import { useFormContext } from "@/context/FormContext";
import RadioGroup from "@/components/ui/RadioGroup";

const options = [
  { label: "Yes, it can be streamed", value: true },
  { label: "No — add 25% private fee", value: false },
];

export default function StreamingStep() {
  const { data, update } = useFormContext();

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--red-light)] mb-3">
          Will you allow this to be shown on stream?
        </h2>
        <p className="text-[var(--red-muted)]">
          Choose whether KakaoChan can showcase your commission during streams
        </p>
      </div>

      <RadioGroup
        options={options}
        value={data.allow_streaming}
        onChange={(value) => update({ allow_streaming: value as boolean })}
      />
    </div>
  );
}
