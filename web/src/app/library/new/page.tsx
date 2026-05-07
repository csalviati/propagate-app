"use client";

/**
 * Add a new plant to the authenticated user's library.
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { plants as plantsApi, type Species } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function NewPlantPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    common_name: "",
    variety: "",
    nickname: "",
    notes: "",
    species_id: undefined as number | undefined,
  });
  const [speciesQuery, setSpeciesQuery] = useState("");
  const [speciesSuggestions, setSpeciesSuggestions] = useState<Species[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  function handleSpeciesInput(val: string) {
    setSpeciesQuery(val);
    setSelectedSpecies(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 2) {
      setSpeciesSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      plantsApi.searchSpecies(val).then(setSpeciesSuggestions).catch(() => {});
    }, 300);
  }

  function pickSpecies(s: Species) {
    setSelectedSpecies(s);
    setSpeciesQuery(s.common_name ?? s.scientific_name);
    setForm((f) => ({ ...f, species_id: s.id }));
    setSpeciesSuggestions([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const plant = await plantsApi.create({
        common_name: form.common_name,
        variety: form.variety || undefined,
        nickname: form.nickname || undefined,
        notes: form.notes || undefined,
        species_id: form.species_id,
      });
      router.push(`/library/${plant.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create plant");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-8">Add a plant</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="label">
            Common name <span className="text-red-500">*</span>
          </span>
          <input
            className="input mt-1"
            value={form.common_name}
            onChange={(e) => setForm({ ...form, common_name: e.target.value })}
            required
            placeholder="e.g. Monstera, Pothos"
          />
        </label>

        <label className="block relative">
          <span className="label">Species (optional — start typing to search)</span>
          <input
            className="input mt-1"
            value={speciesQuery}
            onChange={(e) => handleSpeciesInput(e.target.value)}
            placeholder="e.g. Monstera deliciosa"
            autoComplete="off"
          />
          {speciesSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg text-sm overflow-hidden">
              {speciesSuggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => pickSpecies(s)}
                    className="w-full text-left px-4 py-2 hover:bg-green-50"
                  >
                    <span className="font-medium">{s.common_name}</span>
                    <span className="text-stone-400 ml-2 italic text-xs">
                      {s.scientific_name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selectedSpecies && (
            <p className="text-xs text-green-700 mt-1">
              ✓ {selectedSpecies.scientific_name}
            </p>
          )}
        </label>

        <label className="block">
          <span className="label">Variety (optional)</span>
          <input
            className="input mt-1"
            value={form.variety}
            onChange={(e) => setForm({ ...form, variety: e.target.value })}
            placeholder="e.g. Thai Constellation"
          />
        </label>

        <label className="block">
          <span className="label">Nickname (optional)</span>
          <input
            className="input mt-1"
            value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            placeholder="e.g. Big Leaf"
          />
        </label>

        <label className="block">
          <span className="label">Personal notes (optional)</span>
          <textarea
            className="input mt-1 min-h-[80px] resize-y"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Where did you get it? Any quirks?"
          />
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full btn-primary">
          {loading ? "Saving…" : "Add plant"}
        </button>
      </form>
    </div>
  );
}
