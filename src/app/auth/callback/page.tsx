"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import Input from "@/components/ui/Input";

export default function Callback() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const user = useUser();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [fetchedDisplayName, setFetchedDisplayName] = useState("");
  const [providerDisplayName, setProviderDisplayName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [providerAvatarUrl, setProviderAvatarUrl] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function checkUserProfile() {
      if (!user) return;
      // Fetch user profile from DB
      const { data, error } = await supabase
        .from("users")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .single();
      if (error) {
        setLoading(false);
        return;
      }
      setFetchedDisplayName(data.display_name || "");
      setDisplayName(""); // Let user type a new one
      setAvatarUrl(data.avatar_url || null);
      setProviderAvatarUrl(user.user_metadata?.avatar_url || null);
      setProviderDisplayName(
        user.user_metadata?.full_name || user.user_metadata?.name || ""
      );
      setShowOnboarding(!data.display_name || !data.avatar_url);
      setLoading(false);
    }
    checkUserProfile();
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
    if (!user) return;
    setSubmitting(true);
    let finalAvatarUrl = avatarUrl;

    // If a new avatar file is uploaded, use it
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
    } else if (
      providerAvatarUrl &&
      (!avatarUrl || avatarUrl === providerAvatarUrl)
    ) {
      // If no new file, but provider avatar exists and isn't already in storage, fetch and upload it
      try {
        const response = await fetch(providerAvatarUrl);
        const blob = await response.blob();
        await supabase.storage
          .from("avatars")
          .upload(`${user.id}.png`, blob, { upsert: true });
        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(`${user.id}.png`);
        finalAvatarUrl = data.publicUrl;
      } catch {
        // fallback: use provider avatar url directly if upload fails
        finalAvatarUrl = providerAvatarUrl;
      }
    }

    // Use the typed displayName, or fallback to providerDisplayName, then fetchedDisplayName, then 'User'
    const nameToSave =
      displayName || providerDisplayName || fetchedDisplayName || "User";

    const { error: updateError } = await supabase
      .from("users")
      .update({ display_name: nameToSave, avatar_url: finalAvatarUrl })
      .eq("id", user.id);

    setSubmitting(false);
    if (updateError) {
      setErrorMsg("Failed to update profile. Please try again.");
      return;
    }
    router.replace("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        Loading...
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-xl flex flex-col items-center gap-6 w-full max-w-md border border-[var(--red-tertiary)]"
        >
          <h2 className="text-2xl font-bold text-[var(--red-light)] mb-2">
            Welcome! Set up your profile
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
                ) : providerAvatarUrl ? (
                  <img
                    src={providerAvatarUrl}
                    alt="Provider avatar preview"
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
            placeholder={
              providerDisplayName ||
              fetchedDisplayName ||
              "Enter your display name"
            }
            required
          />
          {errorMsg && (
            <div className="text-[var(--red-primary)] text-sm">{errorMsg}</div>
          )}
          <button
            type="submit"
            className="form-button w-full mt-2"
            disabled={
              submitting ||
              !(displayName || providerDisplayName || fetchedDisplayName)
            }
          >
            {submitting ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen text-lg">
      Logging in...
    </div>
  );
}
