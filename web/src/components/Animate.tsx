"use client";

/**
 * Lightweight framer-motion wrappers used throughout the app.
 *
 * - FadeUp      : single element that fades in while sliding upward.
 * - FadeIn      : single element that fades in in place.
 * - Stagger     : container that staggers child animations.
 * - ScaleIn     : pops in with a spring scale, handy for cards / modals.
 * - PageEnter   : full-page entrance wrapper (fade + slight upward drift).
 */

import { motion } from "framer-motion";

// ─── Shared easing presets ────────────────────────────────────────────────────

const ease = [0.4, 0, 0.2, 1] as const;
const spring = { type: "spring", stiffness: 380, damping: 28 } as const;

// ─── FadeUp ───────────────────────────────────────────────────────────────────

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FadeUp({ children, delay = 0, className }: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── FadeIn ───────────────────────────────────────────────────────────────────

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Stagger (container) ──────────────────────────────────────────────────────

interface StaggerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

const staggerContainer = (staggerDelay: number) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.05,
    },
  },
});

const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease },
  },
};

export function Stagger({ children, staggerDelay = 0.07, className }: StaggerProps) {
  return (
    <motion.div
      variants={staggerContainer(staggerDelay)}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Wrap each child of a <Stagger> with this to animate it in sequence. */
export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// ─── ScaleIn ─────────────────────────────────────────────────────────────────

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function ScaleIn({ children, delay = 0, className }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── PageEnter ────────────────────────────────────────────────────────────────

export function PageEnter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
