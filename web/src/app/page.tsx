"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const ease = [0.4, 0, 0.2, 1] as const;

function Feature({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <motion.div
      className="card-hover flex flex-col items-start gap-3 p-6"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 380, damping: 20 }}
    >
      <span className="text-3xl">{icon}</span>
      <h3
        className="text-lg font-semibold"
        style={{ fontFamily: "var(--font-playfair)", color: "var(--dk-green)" }}
      >
        {title}
      </h3>
      <p className="text-sm text-stone-600 leading-relaxed">{body}</p>
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="flex flex-col items-center justify-center text-center px-4 py-28 sm:py-36"
        style={{
          background: "linear-gradient(160deg, var(--sky) 0%, var(--sky-mid) 50%, var(--cream) 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 230, damping: 16, delay: 0.06 }}
          className="text-6xl mb-6 inline-block"
        >
          🌿
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.62, delay: 0.2, ease }}
          className="text-5xl sm:text-6xl font-bold leading-tight mb-5"
          style={{ fontFamily: "var(--font-playfair)", color: "var(--dk-green)" }}
        >
          Share the roots.{" "}
          <span style={{ color: "var(--md-green)" }}>Grow together.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, delay: 0.38, ease }}
          className="text-lg text-stone-600 leading-relaxed mb-10 max-w-lg"
        >
          A free marketplace for gardeners to exchange cuttings and seeds — and
          trace the living lineage of every plant you grow.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, delay: 0.52, ease }}
        >
          <Link href="/marketplace" className="btn-primary text-base px-8 py-3">
            Browse listings
          </Link>
          <Link href="/register" className="btn-secondary text-base px-8 py-3">
            Join the community
          </Link>
        </motion.div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "var(--cream)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease }}
            className="text-3xl font-bold text-center mb-12"
            style={{ fontFamily: "var(--font-playfair)", color: "var(--dk-green)" }}
          >
            How it works
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12 } },
            }}
          >
            {[
              {
                icon: "🪴",
                title: "Build your plant library",
                body: "Log every plant you own — species, variety, origin. Your garden in one place.",
              },
              {
                icon: "✂️",
                title: "List a cutting or seed",
                body: "Offering a propagation? Post it in the marketplace. Local pickup, no money needed.",
              },
              {
                icon: "🌳",
                title: "Trace the lineage",
                body: "Every exchange links parent to child. Watch your plant's family tree grow across the community.",
              },
            ].map((f) => (
              <motion.div
                key={f.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
                }}
              >
                <Feature {...f} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <motion.section
        className="py-16 px-4 text-center"
        style={{ background: "linear-gradient(to bottom, var(--cream), #e0f0d8)" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p
          className="text-2xl font-semibold mb-6"
          style={{ fontFamily: "var(--font-playfair)", color: "var(--dk-green)" }}
        >
          Ready to start propagating?
        </p>
        <Link
          href="/register"
          className="btn-primary text-base px-9 py-3"
          style={{ boxShadow: "0 4px 14px rgba(30,74,42,0.22)" }}
        >
          Create a free account →
        </Link>
      </motion.section>
    </div>
  );
}
