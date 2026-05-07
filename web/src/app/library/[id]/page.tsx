"use client";

/**
 * Plant detail page: shows photo, metadata, care notes, and links to lineage
 * and new listing.  Owner sees edit/delete controls and photo upload.
 */

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { plants as plantsApi, type Note, type Plant } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function PlantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteBody, setNoteBody] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("public");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const plantId = parseInt(id);
  const isOwner = user?.id === plant?.owner_id;

  useEffect(() => {
    Promise.all([plantsApi.get(plantId), plantsApi.listNotes(plantId)])
      .then(([p, n]) => {
        setPlant(p);
        setNotes(n);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [plantId]);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !plant) return;
    setUploadLoading(true);
    try {
      const updated = await plantsApi.uploadPhoto(plant.id, file);
      setPlant(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this plant? This cannot be undone.")) return;
    await plantsApi.delete(plantId);
    router.push("/library");
  }

  async function submitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteBody.trim()) return;
    const note = await plantsApi.createNote(plantId, {
      body: noteBody,
      visibility,
    });
    setNotes((prev) => [note, ...prev]);
    setNoteBody("");
  }

  if (loading) return <p className="p-8 text-stone-500">Loading…</p>;
  if (error || !plant) return <p className="p-8 text-red-600">{error || "Plant not found"}</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-green-800">
            {plant.nickname ?? plant.common_name}
          </h1>
          {plant.nickname && (
            <p className="text-stone-500 text-sm">{plant.common_name}</p>
          )}
          {plant.variety && (
            <p className="text-stone-400 text-xs italic">{plant.variety}</p>
          )}
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Link
              href={`/marketplace/new?plant_id=${plant.id}`}
              className="btn-secondary text-xs"
            >
              + List cutting / seed
            </Link>
            <button
              onClick={handleDelete}
              className="btn-secondary text-xs text-red-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Photo */}
      {plant.photo_url ? (
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}${plant.photo_url}`}
          alt={plant.common_name}
          className="w-full rounded-xl object-cover max-h-72"
        />
      ) : (
        <div className="w-full h-48 bg-green-50 rounded-xl flex items-center justify-center text-6xl">
          🌱
        </div>
      )}

      {isOwner && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadLoading}
            className="btn-secondary text-xs"
          >
            {uploadLoading ? "Uploading…" : "Change photo"}
          </button>
        </div>
      )}

      {/* Notes */}
      {plant.notes && (
        <div className="card">
          <p className="text-sm font-medium text-stone-600 mb-1">Personal notes</p>
          <p className="text-stone-800 text-sm whitespace-pre-wrap">{plant.notes}</p>
        </div>
      )}

      {/* Lineage link */}
      <Link
        href={`/library/${plant.id}/lineage`}
        className="inline-flex items-center gap-2 text-green-700 text-sm font-medium hover:underline"
      >
        🌳 View propagation lineage
      </Link>

      {/* Care notes */}
      <section>
        <h2 className="text-xl font-semibold text-green-800 mb-3">Care tips &amp; notes</h2>

        {user && (
          <form onSubmit={submitNote} className="card mb-4 space-y-3">
            <textarea
              className="input min-h-[72px] resize-y"
              placeholder="Add a care tip or observation…"
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === "public"}
                  onChange={() => setVisibility("public")}
                />
                Public
              </label>
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === "private"}
                  onChange={() => setVisibility("private")}
                />
                Private
              </label>
              <button type="submit" className="btn-primary ml-auto text-xs">
                Post note
              </button>
            </div>
          </form>
        )}

        {notes.length === 0 ? (
          <p className="text-stone-400 text-sm">No notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="card">
                <p className="text-stone-800 text-sm whitespace-pre-wrap">{n.body}</p>
                <p className="text-xs text-stone-400 mt-1">
                  {n.visibility === "private" ? "🔒 Private" : "🌍 Public"} ·{" "}
                  {new Date(n.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
