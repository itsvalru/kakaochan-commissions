import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/auth";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { UserDashboard } from "@/components/dashboard/UserDashboard";

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();

  // ✅ Get the logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ❌ If not logged in → redirect
  if (!user) {
    redirect("/login");
  }

  // ✅ Check if user is admin
  const admin = await isAdmin();

  // ✅ Render the correct dashboard
  return admin ? (
    <AdminDashboard />
  ) : (
    <UserDashboard email={user.email} />
  );
}
