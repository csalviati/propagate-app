"use client";

/**
 * Marketplace browse page: searchable, filterable listing grid.
 * Listings animate in as a staggered grid; loading state uses skeleton cards.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { listings as listingsApi, type Listing } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { PageEnter } from "@/components/Animate";

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="card space-y-3 overflow-hidden">
      <div className="skeleton h-36 w-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/3" />
    </div>
  );
}

// ─── Listing card ─────────────────────────────────────────────────────────────

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
      <Link
        href={`/marketplace/${listing.id}`}
        className="card block overflow-hidden hover:shadow-md hover:border-green-200 transition-all duration-200"
      >
        {listing.photo_url ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}${listing.photo_url}`}
            alt={listing.title}
            className="w-full h-36 object-cover rounded-xl mb-3"
          />
        ) : (
          <div className="w-full h-36 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl mb-3 flex items-center justify-center text-4xl">
            {listing.type === "cutting" ? "✂️" : "🌰"}
          </div>
        )}
        <p className="font-semibold text-stone-800 leading-snug">{listing.title}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full capitalize">
            {listing.type}
          </span>
          {listing.lat && (
            <span className="text-xs text-stone-400">📍 Local pickup</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const { user } = useAuth();
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    listingsApi
      .browse({ q: q || undefined, type: type || undefined })
      .then(setAllListings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q, type]);

  return (
    <PageEnter className="page-wrap">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1
          className="text-4xl font-bold text-green-900"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Marketplace
        </h1>
        {user && (
          <Link href="/marketplace/new" className="btn-primary shrink-0">
            + New listing
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-8">
        <input
          className="input max-w-xs"
          placeholder="Search plants…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input max-w-[140px]"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All types</option>
          <option value="cutting">Cuttings</option>
          <option value="seed">Seeds</option>
        </select>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && allListings.length === 0 && (
        <motion.div
          className="card text-center py-20 text-stone-400"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-6xl mb-4">🌾</p>
          <p className="text-lg font-medium text-stone-500">No listings found.</p>
          <p className="text-sm mt-1">Try a different search or type filter.</p>
        </motion.div>
      )}

      {/* Listing grid */}
      {!loading && allListings.length > 0 && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06 } },
          }}
        >
          {allListings.map((l) => (
            <motion.div
              key={l.id}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
              }}
            >
              <ListingCard listing={l} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageEnter>
  );
}
