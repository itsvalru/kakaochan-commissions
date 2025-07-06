import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const draftId = searchParams.get("id");

    if (!draftId) {
      return NextResponse.json(
        { error: "Draft ID is required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the draft commission
    const { data: commission, error } = await supabase
      .from("commissions")
      .select("*")
      .eq("id", draftId)
      .eq("user_id", session.user.id)
      .eq("status", "draft")
      .single();

    if (error) {
      console.error("Error fetching draft:", error);
      return NextResponse.json(
        { error: "Failed to fetch draft" },
        { status: 500 }
      );
    }

    if (!commission) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json(commission);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
