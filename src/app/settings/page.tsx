"use client";

import { useEffect, useRef, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import Input from "@/components/ui/Input";

export default function SettingsPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data, error } = await supabase
        .from("users")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .single();
      if (!error && data) {
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url || null);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user, supabase]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!user) return;
    setSubmitting(true);
    let finalAvatarUrl = avatarUrl;
    if (avatarFile) {
      const { error } = await supabase.storage
        .from("avatars")
        .upload(`${user.id}.png`, avatarFile, { upsert: true });
      if (!error) {
        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(`${user.id}.png`);
        finalAvatarUrl = data.publicUrl;
      }
    }
    const { error: updateError } = await supabase
      .from("users")
      .update({ display_name: displayName, avatar_url: finalAvatarUrl })
      .eq("id", user.id);
    setSubmitting(false);
    if (updateError) {
      setErrorMsg("Failed to update profile. Please try again.");
    } else {
      setSuccessMsg("Profile updated successfully!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-xl flex flex-col items-center gap-6 w-full max-w-md border border-[var(--red-tertiary)]"
      >
        <h2 className="text-2xl font-bold text-[var(--red-light)] mb-2">
          Settings
        </h2>
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full bg-[var(--bg-tertiary)] border-4 border-[var(--red-tertiary)] flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-[var(--red-primary)]"
              onClick={() => fileInputRef.current?.click()}
              title="Change avatar"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl text-[var(--red-muted)]">?</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <span className="text-[var(--red-muted)] text-xs">
            Click to upload avatar
          </span>
        </div>
        <Input
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your display name"
          required
        />
        {errorMsg && (
          <div className="text-[var(--red-primary)] text-sm">{errorMsg}</div>
        )}
        {successMsg && (
          <div className="text-[var(--success)] text-sm">{successMsg}</div>
        )}
        <button
          type="submit"
          className="form-button w-full mt-2"
          disabled={submitting || !displayName}
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
