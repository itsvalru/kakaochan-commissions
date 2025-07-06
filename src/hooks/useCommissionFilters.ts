import { useMemo } from "react";
import type { Commission } from "@/lib/types/types";

export function useCommissionFilters(commissions: Commission[], tab: string) {
  // Tab filtering logic
  const filtered = useMemo(() => {
    if (tab === "all") return commissions;
    if (tab === "draft") return commissions.filter((c) => c.status === "draft");
    if (tab === "pending")
      return commissions.filter((c) =>
        ["submitted", "waitlist", "payment"].includes(c.status)
      );
    if (tab === "accepted")
      return commissions.filter((c) => c.status === "wip");
    if (tab === "completed")
      return commissions.filter((c) => c.status === "finished");
    return commissions.filter(
      (c) =>
        ![
          "draft",
          "submitted",
          "waitlist",
          "payment",
          "wip",
          "finished",
        ].includes(c.status)
    );
  }, [commissions, tab]);

  // Tab counts
  const tabCounts: Record<string, number> = useMemo(() => {
    return {
      all: commissions.length,
      draft: commissions.filter((c) => c.status === "draft").length,
      pending: commissions.filter((c) =>
        ["submitted", "waitlist", "payment"].includes(c.status)
      ).length,
      accepted: commissions.filter((c) => c.status === "wip").length,
      completed: commissions.filter((c) => c.status === "finished").length,
      other: commissions.filter(
        (c) =>
          ![
            "draft",
            "submitted",
            "waitlist",
            "payment",
            "wip",
            "finished",
          ].includes(c.status)
      ).length,
    };
  }, [commissions]);

  return { filtered, tabCounts };
}
