"use client";

/**
 * Listing detail page: shows listing details and a request form for visitors.
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  listings as listingsApi,
  plants as plantsApi,
  type Listing,
  type Plant,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [plant, setPlant] = useState<Plant | null>(null);
  const [message, setMessage] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const listingId = parseInt(id);

  useEffect(() => {
    listingsApi
      .get(listingId)
      .then((l) => {
        setListing(l);
        return plantsApi.get(l.plant_instance_id);
      })
      .then(setPlant)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [listingId]);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    setRequesting(true);
    try {
      await listingsApi.createRequest(listingId, { message });
      setRequested(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setRequesting(false);
    }
  }

  if (loading) return <p className="p-8 text-stone-500">Loading…</p>;
  if (error || !listing)
    return <p className="p-8 text-red-600">{error || "Listing not found"}</p>;

  const isOwner = user?.id === listing.owner_id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <Link href="/marketplace" className="text-sm text-green-700 hover:underline">
        ← Back to marketplace
      </Link>

      {listing.photo_url ? (
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}${listing.photo_url}`}
          alt={listing.title}
          className="w-full rounded-xl max-h-64 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-green-50 rounded-xl flex items-center justify-center text-6xl">
          {listing.type === "cutting" ? "✂️" : "🌰"}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-green-800">{listing.title}</h1>
        <p className="text-sm text-green-700 capitalize mt-1">{listing.type}</p>
        {listing.status !== "available" && (
          <span className="inline-block mt-2 text-xs bg-stone-100 text-stone-500 rounded px-2 py-0.5 capitalize">
            {listing.status}
          </span>
        )}
      </div>

      {listing.description && (
        <p className="text-stone-700 whitespace-pre-wrap">{listing.description}</p>
      )}

      {plant && (
        <div className="card text-sm">
          <p className="font-medium text-stone-700 mb-1">About this plant</p>
          <Link
            href={`/library/${plant.id}`}
            className="text-green-700 hover:underline font-medium"
          >
            {plant.nickname ?? plant.common_name}
          </Link>
          {plant.variety && (
            <p className="text-stone-400 italic text-xs">{plant.variety}</p>
          )}
        </div>
      )}

      {/* Request form */}
      {!isOwner && listing.status === "available" && (
        <section className="card">
          <h2 className="font-semibold text-stone-800 mb-3">
            Request this {listing.type}
          </h2>
          {requested ? (
            <p className="text-green-700 text-sm">
              ✓ Request sent! Check your{" "}
              <Link href="/inbox" className="underline">
                inbox
              </Link>{" "}
              for updates.
            </p>
          ) : (
            <form onSubmit={handleRequest} className="space-y-3">
              <textarea
                className="input min-h-[72px] resize-y"
                placeholder="Introduce yourself and why you'd love this plant (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={requesting}
                className="btn-primary"
              >
                {requesting ? "Sending…" : "Send request"}
              </button>
            </form>
          )}
        </section>
      )}

      {isOwner && (
        <div className="flex gap-3">
          <Link href="/inbox" className="btn-secondary text-sm">
            View requests in inbox
          </Link>
        </div>
      )}
    </div>
  );
}
