"use client";

/**
 * Plant library: shows all plants owned by the authenticated user.
 * Cards animate in as a staggered grid; loading uses skeleton cards.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { plants as plantsApi, type Plant } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { PageEnter } from "@/components/Animate";

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="card space-y-3 overflow-hidden">
      <div className="skeleton h-40 w-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  );
}

// ─── Plant card ───────────────────────────────────────────────────────────────

function PlantCard({ plant }: { plant: Plant }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
      <Link
        href={`/library/${plant.id}`}
        className="card block overflow-hidden hover:shadow-md hover:border-green-200 transition-all duration-200"
      >
        {plant.photo_url ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}${plant.photo_url}`}
            alt={plant.common_name}
            className="w-full h-40 object-cover rounded-xl mb-3"
          />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl mb-3 flex items-center justify-center text-5xl">
            🌱
          </div>
        )}
        <p className="font-semibold text-stone-800 leading-snug">
          {plant.nickname ?? plant.common_name}
        </p>
        {plant.nickname && (
          <p className="text-xs text-stone-500 mt-0.5">{plant.common_name}</p>
        )}
        {plant.variety && (
          <p className="text-xs text-stone-400 italic mt-0.5">{plant.variety}</p>
        )}
      </Link>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    plantsApi
      .list()
      .then(setPlants)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <PageEnter className="page-wrap">
      <div className="flex justify-between items-center mb-8">
        <h1
          className="text-4xl font-bold text-green-900"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          My Plant Library
        </h1>
        <Link href="/library/new" className="btn-primary">
          + Add plant
        </Link>
      </div>

      {/* Loading skeletons */}
      {(authLoading || loading) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !authLoading && plants.length === 0 && (
        <motion.div
          className="card text-center py-20 text-stone-400"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-6xl mb-4">🪴</p>
          <p className="text-lg font-medium text-stone-500">Your library is empty.</p>
          <p className="text-sm mt-1 mb-6 text-stone-400">
            Add your first plant to start tracking its lineage.
          </p>
          <Link href="/library/new" className="btn-primary">
            Add your first plant
          </Link>
        </motion.div>
      )}

      {/* Plant grid */}
      {!loading && !authLoading && plants.length > 0 && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07 } },
          }}
        >
          {plants.map((p) => (
            <motion.div
              key={p.id}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
              }}
            >
              <PlantCard plant={p} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageEnter>
  );
}
