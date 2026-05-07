"use client";

/**
 * Create a new marketplace listing linked to one of the user's plants.
 */

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { listings as listingsApi, plants as plantsApi, type Plant } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function NewListingPage() {
  return (
    <Suspense fallback={<p className="p-8 text-stone-500">Loading…</p>}>
      <NewListingForm />
    </Suspense>
  );
}

function NewListingForm() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPlantId = searchParams.get("plant_id");

  const [myPlants, setMyPlants] = useState<Plant[]>([]);
  const [form, setForm] = useState({
    plant_instance_id: preselectedPlantId ? parseInt(preselectedPlantId) : 0,
    type: "cutting" as "cutting" | "seed",
    title: "",
    description: "",
    lat: "",
    lng: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    plantsApi.list().then(setMyPlants).catch(() => {});
  }, [user, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const listing = await listingsApi.create({
        plant_instance_id: form.plant_instance_id,
        type: form.type,
        title: form.title,
        description: form.description || undefined,
        lat: form.lat ? parseFloat(form.lat) : undefined,
        lng: form.lng ? parseFloat(form.lng) : undefined,
      });
      router.push(`/marketplace/${listing.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-8">New listing</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="label">
            Plant <span className="text-red-500">*</span>
          </span>
          <select
            className="input mt-1"
            value={form.plant_instance_id}
            onChange={(e) =>
              setForm({ ...form, plant_instance_id: parseInt(e.target.value) })
            }
            required
          >
            <option value={0} disabled>
              Select a plant from your library…
            </option>
            {myPlants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nickname ?? p.common_name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="label">
            Type <span className="text-red-500">*</span>
          </span>
          <select
            className="input mt-1"
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as "cutting" | "seed" })
            }
          >
            <option value="cutting">Cutting</option>
            <option value="seed">Seed</option>
          </select>
        </label>

        <label className="block">
          <span className="label">
            Title <span className="text-red-500">*</span>
          </span>
          <input
            className="input mt-1"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            placeholder="e.g. Rooted Monstera cutting — happy &amp; healthy!"
          />
        </label>

        <label className="block">
          <span className="label">Description (optional)</span>
          <textarea
            className="input mt-1 min-h-[80px] resize-y"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="label">Latitude (optional)</span>
            <input
              className="input mt-1"
              type="number"
              step="any"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
              placeholder="37.77"
            />
          </label>
          <label className="block">
            <span className="label">Longitude (optional)</span>
            <input
              className="input mt-1"
              type="number"
              step="any"
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: e.target.value })}
              placeholder="-122.41"
            />
          </label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full btn-primary">
          {loading ? "Creating…" : "Create listing"}
        </button>
      </form>
    </div>
  );
}
