import React from "react";

const TABS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "completed", label: "Completed" },
  { key: "other", label: "Other" },
];

interface DashboardTabsProps {
  tab: string;
  setTab: (tab: string) => void;
  tabCounts: Record<string, number>;
}

export default function DashboardTabs({
  tab,
  setTab,
  tabCounts,
}: DashboardTabsProps) {
  return (
    <div className="flex gap-8 border-b border-[#2a0a0a] mb-6">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          className={`relative pb-2 font-semibold text-lg transition-colors duration-200 ${
            tab === t.key
              ? "text-[#fecaca] border-b-2 border-[#dc2626]"
              : "text-[#9ca3af]"
          }`}
        >
          {t.label}
          <span className="ml-2 text-xs bg-[#2a0a0a] px-2 py-0.5 rounded-full">
            {tabCounts[t.key] || 0}
          </span>
        </button>
      ))}
    </div>
  );
}
