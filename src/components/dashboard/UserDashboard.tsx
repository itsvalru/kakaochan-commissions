"use client";

import { useEffect, useState } from "react";
import CommissionCard from "@/components/commission/CommissionCard";
import { getUserCommissions } from "@/lib/supabase-client";
import type { Commission } from "@/lib/types/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import DashboardTabs from "./DashboardTabs";
import { useCommissionFilters } from "@/hooks/useCommissionFilters";

function formatDate(date: string | null | undefined) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UserDashboard() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const data = await getUserCommissions();
        setCommissions(data);
      } catch (err) {
        console.error("Failed to fetch commissions:", err);
        setError("Failed to load commissions");
      } finally {
        setLoading(false);
      }
    };
    fetchCommissions();
  }, []);

  // Use custom hook for filtering logic
  const { filtered, tabCounts } = useCommissionFilters(commissions, tab);

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold text-[#fecaca] mb-8">My Requests</h1>

      {/* Tabs */}
      <DashboardTabs tab={tab} setTab={setTab} tabCounts={tabCounts} />

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-6 gap-4 px-4 py-2 text-[#9ca3af] text-xs uppercase tracking-wider">
        <div className="col-span-3">Title</div>
        <div>Status</div>
        <div>Submitted</div>
        <div>Price</div>
      </div>

      {/* Commission Rows */}
      <div className="space-y-3">
        {loading ? (
          <LoadingSpinner message="Loading commissions..." />
        ) : error ? (
          <ErrorDisplay error={error} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-[#9ca3af]">
            No commissions found in this category.
          </div>
        ) : (
          filtered.map((c) => {
            const isDraft = c.status === "draft";
            const hasFinal = !isDraft && c.final_price != null;
            const price = hasFinal
              ? `€${c.final_price?.toFixed(2)}`
              : `€${(c.total_price ?? 0).toFixed(2)}`;
            const isEstimate = !hasFinal;
            return (
              <CommissionCard
                key={c.id}
                title={
                  c.category_name +
                  (c.type_name ? ` - ${c.type_name}` : "") +
                  (c.subtype_name ? ` (${c.subtype_name})` : "")
                }
                isDraft={isDraft}
                status={c.status}
                submitted={formatDate(c.created_at)}
                price={price}
                isEstimate={isEstimate}
                onClick={() => {
                  if (c.status === "draft") {
                    window.location.href = `/commissions/new?draft=${c.id}`;
                  } else {
                    window.location.href = `/commissions/${c.id}`;
                  }
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
