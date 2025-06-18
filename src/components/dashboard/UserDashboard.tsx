'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Commission } from '@/lib/types';

export function UserDashboard({ email }: { email: string }) {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    const fetchCommissions = async () => {
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error(error);
      else setCommissions(data ?? []);

      setLoading(false);
    };

    fetchCommissions();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome back, {email}</h1>
      <p className="text-muted mb-4">Your Commissions:</p>

      {loading ? (
        <p>Loading...</p>
      ) : commissions.length === 0 ? (
        <p>You haven't submitted any commissions yet.</p>
      ) : (
        <ul className="space-y-3">
          {commissions.map((c) => (
            <li key={c.id} className="border p-3 rounded shadow">
              <div className="font-semibold">{c.category} - {c.subcategory}</div>
              <div className="text-sm text-gray-500">{c.status}</div>
              <div className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
