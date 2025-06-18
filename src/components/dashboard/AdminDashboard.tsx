'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Commission } from '@/lib/types';

const STATUS_ORDER = ['pending_review', 'awaiting_payment', 'in_progress', 'delivered', 'closed'];

export function AdminDashboard() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    const fetchAll = async () => {
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error(error);
      else setCommissions(data ?? []);

      setLoading(false);
    };

    fetchAll();
  }, []);

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    items: commissions.filter((c) => c.status === status),
  }));

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin: Manage Commissions</h1>

      {loading ? (
        <p>Loading commissions...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {grouped.map((group) => (
            <div key={group.status} className="bg-gray-100 p-3 rounded">
              <h2 className="font-semibold mb-2 capitalize">{group.status.replace(/_/g, ' ')}</h2>
              <div className="space-y-2">
                {group.items.length === 0 ? (
                  <p className="text-sm text-gray-500">No commissions</p>
                ) : (
                  group.items.map((c) => (
                    <div key={c.id} className="border p-2 rounded bg-white shadow-sm">
                      <div className="text-sm font-medium">
                        {c.category} – {c.subcategory}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(c.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
