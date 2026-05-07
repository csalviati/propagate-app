"use client";

/**
 * Global navigation bar.
 * Shows contextual links depending on authentication state.
 * Sticky at the top with a frosted-glass effect and animated logo on mount.
 */

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

/** Animated nav link with a sliding underline on hover. */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative text-sm font-medium text-green-100 hover:text-white transition-colors duration-150
                 after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-amber-400
                 after:transition-all after:duration-200 hover:after:w-full"
    >
      {children}
    </Link>
  );
}

export default function Nav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-green-900/20 bg-green-800/95 backdrop-blur-sm text-white shadow-lg shadow-green-950/20">
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight hover:text-green-200 transition-colors"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            <span className="text-xl animate-sway inline-block origin-bottom">🌿</span>
            Propagate
          </Link>
        </motion.div>

        {/* Nav links */}
        <motion.div
          className="flex items-center gap-5"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        >
          <NavLink href="/marketplace">Marketplace</NavLink>
          <NavLink href="/feed">Feed</NavLink>

          {user ? (
            <>
              <NavLink href="/library">My Plants</NavLink>
              <NavLink href="/inbox">Inbox</NavLink>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-green-700 hover:bg-green-600 border border-green-600 px-3 py-1 text-sm font-medium transition-all active:scale-95"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink href="/login">Log in</NavLink>
              <Link
                href="/register"
                className="rounded-lg bg-amber-400 hover:bg-amber-300 text-green-950 px-3.5 py-1.5 text-sm font-semibold transition-all active:scale-95 shadow-sm"
              >
                Sign up
              </Link>
            </>
          )}
        </motion.div>
      </nav>
    </header>
  );
}
