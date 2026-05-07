"use client";

/**
 * Registration page: collects display name, email, password, and optional
 * city, then calls the API and redirects to the library on success.
 * Form panel slides in from below on mount.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { auth as authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// ─── Form field wrapper ───────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    display_name: "",
    email: "",
    password: "",
    city: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.register(form);
      await login(res.access_token);
      router.push("/library");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
          initial={{ scale: 0.5, rotate: 15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        >
          🌱
        </motion.div>

        <div className="card p-8 shadow-md shadow-green-900/5">
          <h1
            className="text-3xl font-bold text-green-900 mb-2 text-center"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Create account
          </h1>
          <p className="text-sm text-stone-500 text-center mb-8">
            Join a community of plant lovers
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Display name" required>
              <input
                className="input"
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                required
              />
            </Field>
            <Field label="Email" required>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </Field>
            <Field label="Password" required>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
              />
            </Field>
            <Field label="City (optional)">
              <input
                className="input"
                placeholder="e.g. Austin, TX"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </Field>

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
              {loading ? "Creating account…" : "Sign up free 🌿"}
            </motion.button>
          </form>

          <p className="mt-6 text-sm text-stone-500 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-green-700 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
