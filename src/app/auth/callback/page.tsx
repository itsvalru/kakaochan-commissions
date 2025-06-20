'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function Callback() {
  const supabase = useSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      router.replace('/dashboard')
    })
  }, [])

  return <div>Logge den Wampwoo ein...</div>
}
