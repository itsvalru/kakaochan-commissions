// src/app/(dashboard)/layout.tsx
import { getSessionUser, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return <>{children}</>; // Authenticated → pass to page.tsx
}
