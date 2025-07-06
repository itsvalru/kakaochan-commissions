import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatWindow from "@/components/chat/ChatWindow";
import type { Commission } from "@/lib/types/types";

interface CommissionPageProps {
  params: {
    id: string;
  };
}

export default async function CommissionPage({ params }: CommissionPageProps) {
  const supabase = createServerSupabaseClient();
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  // Get the commission
  const { data: commission, error } = await supabase
    .from("commissions")
    .select("*, users!user_id (display_name, avatar_url)")
    .eq("id", params.id)
    .single();

  if (error || !commission) {
    redirect("/dashboard");
  }

  // Check if user has access to this commission
  const adminCheck = await isAdmin();
  if (!adminCheck && commission.user_id !== user.id) {
    redirect("/dashboard");
  }

  // For admins, get all users and their commissions
  let allUsersData: {
    user: { id: string; display_name: string; avatar_url: string | null };
    commissions: (Commission & { display_name?: string })[];
  }[] = [];

  // For chat display names, get all users who have sent messages in this commission
  let allUsersForChat: {
    user: { id: string; display_name: string; avatar_url: string | null };
    commissions: (Commission & { display_name?: string })[];
  }[] = [];

  // Fetch all users who have sent messages in this commission
  const { data: messageUsers } = await supabase
    .from("commission_messages")
    .select("user_id")
    .eq("commission_id", params.id);

  if (messageUsers && messageUsers.length > 0) {
    // Get unique user IDs from messages
    const uniqueUserIds = [...new Set(messageUsers.map((m) => m.user_id))];

    // Fetch user data for all users who have sent messages
    const { data: usersData } = await supabase
      .from("users")
      .select("id, display_name, avatar_url")
      .in("id", uniqueUserIds);

    if (usersData) {
      allUsersForChat = usersData.map((user) => ({
        user: {
          id: user.id,
          display_name: user.display_name || "Unknown",
          avatar_url: user.avatar_url || null,
        },
        commissions: [], // Empty for regular users, will be populated for admins
      }));
    }
  }

  if (adminCheck) {
    // Fetch all commissions with user data (excluding drafts)
    const { data: allCommissions } = await supabase
      .from("commissions")
      .select("*, users!user_id (display_name, avatar_url)")
      .neq("status", "draft")
      .order("created_at", { ascending: false });

    // Fetch all users for admin view
    const { data: allUsers } = await supabase
      .from("users")
      .select("id, display_name, avatar_url");

    if (allCommissions) {
      // Group by user for sidebar (only users with commissions)
      const userMap: Record<
        string,
        {
          user: { id: string; display_name: string; avatar_url: string | null };
          commissions: (Commission & { display_name?: string })[];
        }
      > = {};

      allCommissions.forEach((c) => {
        if (!userMap[c.user_id]) {
          userMap[c.user_id] = {
            user: {
              id: c.user_id,
              display_name: c.users?.display_name || "Unknown",
              avatar_url: c.users?.avatar_url || null,
            },
            commissions: [],
          };
        }
        userMap[c.user_id].commissions.push({
          ...c,
          display_name: c.users?.display_name || undefined,
        });
      });

      // Only include users who have commissions in the sidebar
      allUsersData = Object.values(userMap);

      // Update allUsersForChat with commission data for admins
      if (allUsers) {
        allUsersForChat = allUsers.map((user) => ({
          user: {
            id: user.id,
            display_name: user.display_name || "Unknown",
            avatar_url: user.avatar_url || null,
          },
          commissions: userMap[user.id]?.commissions || [],
        }));
      }
    }
  }

  // For regular users, get their commissions (excluding drafts)
  let userCommissions: (Commission & {
    display_name?: string;
  })[] = [];

  if (!adminCheck) {
    const { data: userComms } = await supabase
      .from("commissions")
      .select("*, users!user_id (display_name, avatar_url)")
      .eq("user_id", commission.user_id)
      .neq("status", "draft")
      .order("created_at", { ascending: false });

    userCommissions = (userComms || []).map((c) => ({
      ...c,
      display_name: c.users?.display_name || undefined,
    }));
  }

  // Map the commission data to include display_name and avatar_url
  const commissionWithDisplayName = {
    ...commission,
    display_name: commission.users?.display_name || undefined,
    avatar_url: commission.users?.avatar_url || null,
  };

  return (
    <div>
      <ChatWindow
        commission={commissionWithDisplayName}
        userCommissions={userCommissions}
        allUsers={allUsersData}
        allUsersForChat={allUsersForChat}
        isAdmin={adminCheck}
      />
    </div>
  );
}
