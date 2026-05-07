"use client";

/**
 * Login page: email + password form that stores the JWT and redirects.
 * Form panel slides in from below on mount.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { auth as authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      await login(res.access_token);
      router.push("/library");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16
                    bg-gradient-to-b from-[#e8f5e9] to-[var(--cream)]">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Decorative icon */}
        <motion.div
          className="text-5xl text-center mb-6"
          initial={{ scale: 0.5, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        >
          🌿
        </motion.div>

        <div className="card p-8 shadow-md shadow-green-900/5">
          <h1
            className="text-3xl font-bold text-green-900 mb-2 text-center"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Welcome back
          </h1>
          <p className="text-sm text-stone-500 text-center mb-8">
            Sign in to your garden
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="label">Email</span>
              <input
                type="email"
                className="input mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="label">Password</span>
              <input
                type="password"
                className="input mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error && (
              <motion.p
                className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 mt-2"
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Signing in…" : "Log in"}
            </motion.button>
          </form>

          <p className="mt-6 text-sm text-stone-500 text-center">
            No account?{" "}
            <Link href="/register" className="text-green-700 font-medium hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
