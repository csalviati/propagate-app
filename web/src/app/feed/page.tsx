"use client";

/**
 * Social feed page: shows posts from the authenticated user and followed gardeners.
 * Posts animate in as a staggered list; a loading skeleton fills the initial state.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { posts as postsApi, plants as plantsApi, type Post, type Plant } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { PageEnter } from "@/components/Animate";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonPost() {
  return (
    <div className="card space-y-3">
      <div className="flex justify-between">
        <div className="skeleton h-4 w-28" />
        <div className="skeleton h-4 w-16" />
      </div>
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-4/5" />
    </div>
  );
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="card space-y-3"
    >
      <div className="flex justify-between items-center">
        <Link
          href={`/u/${post.author_id}`}
          className="text-sm font-semibold text-green-700 hover:text-green-600 hover:underline transition-colors"
        >
          User #{post.author_id}
        </Link>
        <span className="text-xs text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full">
          {new Date(post.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      <p className="text-stone-700 whitespace-pre-wrap leading-relaxed">{post.body}</p>
      {post.photo_url && (
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}${post.photo_url}`}
          alt="post photo"
          className="rounded-xl w-full object-cover max-h-64"
        />
      )}
      {post.plant_instance_id && (
        <Link
          href={`/library/${post.plant_instance_id}`}
          className="inline-flex items-center gap-1.5 text-xs text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-full transition-colors"
        >
          🌿 View tagged plant
        </Link>
      )}
    </motion.li>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [feed, setFeed] = useState<Post[]>([]);
  const [myPlants, setMyPlants] = useState<Plant[]>([]);
  const [body, setBody] = useState("");
  const [plantId, setPlantId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    Promise.all([postsApi.feed(), plantsApi.list()])
      .then(([f, p]) => {
        setFeed(f);
        setMyPlants(p);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    try {
      const post = await postsApi.create({ body, plant_instance_id: plantId });
      setFeed((prev) => [post, ...prev]);
      setBody("");
      setPlantId(undefined);
    } finally {
      setPosting(false);
    }
  }

  return (
    <PageEnter className="page-wrap-narrow space-y-6">
      <h1
        className="text-4xl font-bold text-green-900"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        Feed
      </h1>

      {/* Composer */}
      <div className="card space-y-3">
        <form onSubmit={submitPost} className="space-y-3">
          <textarea
            className="input min-h-[88px] resize-y"
            placeholder="Share a plant update, tip, or milestone…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <select
              className="input max-w-[200px] text-sm"
              value={plantId ?? ""}
              onChange={(e) =>
                setPlantId(e.target.value ? parseInt(e.target.value) : undefined)
              }
            >
              <option value="">No plant tag</option>
              {myPlants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nickname ?? p.common_name}
                </option>
              ))}
            </select>
            <motion.button
              type="submit"
              disabled={posting || !body.trim()}
              className="btn-primary ml-auto"
              whileTap={{ scale: 0.95 }}
            >
              {posting ? "Posting…" : "Post 🌱"}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Loading skeletons */}
      {(authLoading || loading) && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonPost key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && !authLoading && feed.length === 0 && (
        <motion.div
          className="card text-center py-20"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-6xl mb-4">🌻</p>
          <p className="text-lg font-medium text-stone-500">Your feed is quiet.</p>
          <p className="text-sm text-stone-400 mt-1">
            Follow other gardeners to see their posts here.
          </p>
        </motion.div>
      )}

      {/* Posts */}
      {!loading && !authLoading && feed.length > 0 && (
        <AnimatePresence mode="popLayout">
          <ul className="space-y-4">
            {feed.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </ul>
        </AnimatePresence>
      )}
    </PageEnter>
  );
}
