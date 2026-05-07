"use client";

/**
 * Inbox page: lists all exchange requests the authenticated user is party to.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requests as requestsApi, type ExchangeRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  declined: "bg-stone-100 text-stone-500",
  cancelled: "bg-red-100 text-red-500",
};

export default function InboxPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reqs, setReqs] = useState<ExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    requestsApi
      .list()
      .then(setReqs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) return <p className="p-8 text-stone-500">Loading…</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-green-800 mb-8">Inbox</h1>

      {reqs.length === 0 ? (
        <div className="card text-center py-16 text-stone-400">
          <p className="text-4xl mb-3">📬</p>
          <p>No requests yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {reqs.map((r) => (
            <li key={r.id}>
              <Link
                href={`/inbox/${r.id}`}
                className="card flex justify-between items-center hover:shadow-md transition"
              >
                <div>
                  <p className="font-medium text-stone-800">
                    Request #{r.id} · Listing #{r.listing_id}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs rounded-full px-2 py-0.5 font-medium capitalize ${STATUS_COLOR[r.status] ?? ""}`}
                >
                  {r.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
