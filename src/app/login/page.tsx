'use client'

import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function LoginPage() {
  const supabase = useSupabaseClient()

  const login = (provider: 'google' | 'discord') => {
    supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <button onClick={() => login('google')} className="mb-4">Login with Google</button>
      <button onClick={() => login('discord')}>Login with Discord</button>
    </div>
  )
}
