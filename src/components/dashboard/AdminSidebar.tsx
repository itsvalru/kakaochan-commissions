import React from "react";

export default function AdminSidebar() {
  return (
    <aside className="h-screen w-56 bg-[var(--bg-secondary)] flex flex-col p-6 fixed top-0 left-0 z-40 shadow-lg">
      <h1 className="text-2xl font-bold text-[var(--red-light)] mb-8">
        KakaoChan
      </h1>
      <nav className="flex flex-col gap-4">
        <button className="text-lg font-semibold text-[var(--red-light)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-2 focus:outline-none">
          Commissions
        </button>
      </nav>
    </aside>
  );
}
