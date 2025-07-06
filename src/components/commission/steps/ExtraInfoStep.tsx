"use client";

import { useFormContext } from "@/context/FormContext";
import Textarea from "@/components/ui/Textarea";

export default function ExtraInfoStep() {
  const { data, update } = useFormContext();

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--red-light)] mb-3">
          Extra Information
        </h2>
        <p className="text-[var(--red-muted)]">
          Include anything else you want KakaoChan to know. This could be your
          vision, references to style, meme ideas, personal boundaries, or
          &quot;pls draw huge boobas&quot;.
        </p>
      </div>

      <Textarea
        placeholder="Write here..."
        value={data.extra_info}
        onChange={(e) => update({ extra_info: e.target.value })}
        rows={8}
      />
    </div>
  );
}
