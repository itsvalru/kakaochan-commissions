export type StepKey =
  | "path"
  | "comm-specific"
  | "addons"
  | "usage"
  | "streaming"
  | "references"
  | "extra-info"
  | "summary";

import type { CommissionDraft } from "@/lib/types/commission";

export function getStepsFromDraft(draft: CommissionDraft): StepKey[] {
  const steps: StepKey[] = ["path"];

  const hasCommSpecificFields = (draft.comm_specific_inputs?.length ?? 0) > 0;
  const hasCharacterCountStep =
    (draft.max_character_count ?? 1) > 1 && draft.extra_character_price > 0;

  if (hasCommSpecificFields || hasCharacterCountStep) {
    steps.push("comm-specific");
  }

  if (draft.addons && draft.addons.length > 0) {
    steps.push("addons");
  }

  steps.push("usage");
  steps.push("streaming");
  steps.push("references");
  steps.push("extra-info");
  steps.push("summary");

  return steps;
}
