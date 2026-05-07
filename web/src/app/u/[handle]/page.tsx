"use client";

/**
 * Public user profile page at /u/[handle].
 * Shows display name, city, follow/unfollow button, and the user's posts.
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { users, posts as postsApi, follows as followsApi, type User, type Post } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function UserProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followLoading, setFollowLoading] = useState(false);

  const userId = parseInt(handle);

  useEffect(() => {
    Promise.all([users.get(userId), postsApi.byUser(userId)])
      .then(([u, p]) => {
        setProfile(u);
        setUserPosts(p);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    if (me) {
      followsApi.following(me.id).then((list) => {
        setFollowing(list.some((u) => u.id === userId));
      });
    }
  }, [userId, me]);

  async function toggleFollow() {
    setFollowLoading(true);
    try {
      if (following) {
        await followsApi.unfollow(userId);
        setFollowing(false);
      } else {
        await followsApi.follow(userId);
        setFollowing(true);
      }
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) return <p className="p-8 text-stone-500">Loading…</p>;
  if (error || !profile)
    return <p className="p-8 text-red-600">{error || "User not found"}</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="card flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-800">{profile.display_name}</h1>
          {profile.city && (
            <p className="text-sm text-stone-400 mt-0.5">📍 {profile.city}</p>
          )}
          {profile.bio && <p className="text-sm text-stone-600 mt-2">{profile.bio}</p>}
        </div>
        {me && me.id !== userId && (
          <button
            onClick={toggleFollow}
            disabled={followLoading}
            className={following ? "btn-secondary text-sm" : "btn-primary text-sm"}
          >
            {following ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      <section>
        <h2 className="font-semibold text-stone-700 mb-3">Posts</h2>
        {userPosts.length === 0 ? (
          <p className="text-stone-400 text-sm">No posts yet.</p>
        ) : (
          <ul className="space-y-4">
            {userPosts.map((p) => (
              <li key={p.id} className="card space-y-2">
                <p className="text-stone-800 whitespace-pre-wrap">{p.body}</p>
                {p.photo_url && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${p.photo_url}`}
                    alt="post photo"
                    className="rounded-lg w-full object-cover max-h-64"
                  />
                )}
                <p className="text-xs text-stone-400">
                  {new Date(p.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
