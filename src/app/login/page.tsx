"use client";

import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function LoginPage() {
  const supabase = useSupabaseClient();

  const login = (provider: "google" | "discord") => {
    supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)]">
      <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-xl flex flex-col items-center gap-6 w-full max-w-md border border-[var(--red-tertiary)]">
        <h1 className="text-3xl font-bold text-[var(--red-light)] mb-2">
          Welcome to KakaoChan Commissions
        </h1>
        <p className="text-[var(--red-muted)] text-center mb-4">
          Login to start your commission journey with KakaoChan!
          <br />
          Choose your preferred login method below.
        </p>
        <button
          onClick={() => login("google")}
          className="form-button w-full flex items-center justify-center gap-2 text-lg mb-2"
        >
          <img src="/globe.svg" alt="Google" className="w-6 h-6" />
          Login with Google
        </button>
        <button
          onClick={() => login("discord")}
          className="form-button w-full flex items-center justify-center gap-2 text-lg bg-[#5865F2] hover:bg-[#404eed]"
        >
          <img src="/globe.svg" alt="Discord" className="w-6 h-6" />
          Login with Discord
        </button>
      </div>
    </div>
  );
}
