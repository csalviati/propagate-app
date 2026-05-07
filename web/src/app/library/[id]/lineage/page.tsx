"use client";

/**
 * Lineage visualization page.
 * Uses react-d3-tree to render the propagation tree rooted at the origin ancestor.
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { RawNodeDatum } from "react-d3-tree";
import { plants as plantsApi, type LineageNode } from "@/lib/api";

/** react-d3-tree uses browser APIs; load it client-only. */
const Tree = dynamic(() => import("react-d3-tree").then((m) => m.Tree), {
  ssr: false,
  loading: () => <p className="text-stone-400 text-sm">Loading tree…</p>,
});

/** Transform API LineageNode shape into the format react-d3-tree expects. */
function toD3(node: LineageNode): RawNodeDatum {
  return {
    name: node.nickname ?? node.common_name,
    attributes: { id: node.id, owner: node.owner_id },
    children: node.children.map(toD3),
  };
}

export default function LineagePage() {
  const { id } = useParams<{ id: string }>();
  const [lineage, setLineage] = useState<LineageNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    plantsApi
      .lineage(parseInt(id))
      .then(setLineage)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-8 text-stone-500">Loading lineage…</p>;
  if (error || !lineage)
    return <p className="p-8 text-red-600">{error || "Lineage not found"}</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/library/${id}`} className="btn-secondary text-sm">
          ← Back to plant
        </Link>
        <h1 className="text-2xl font-bold text-green-800">Propagation Lineage</h1>
      </div>

      <div
        className="w-full rounded-xl border border-stone-200 bg-white overflow-hidden"
        style={{ height: "560px" }}
      >
        <Tree
          data={toD3(lineage)}
          orientation="vertical"
          pathFunc="step"
          translate={{ x: 400, y: 60 }}
          separation={{ siblings: 1.5, nonSiblings: 2 }}
          nodeSize={{ x: 160, y: 120 }}
          renderCustomNodeElement={({ nodeDatum }) => (
            <g>
              <circle r={20} fill="#166534" />
              <text
                fill="white"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                fontWeight="600"
              >
                🌿
              </text>
              <text
                fill="#1c1917"
                textAnchor="middle"
                y={34}
                fontSize={11}
                fontWeight="500"
              >
                {(nodeDatum as RawNodeDatum).name}
              </text>
            </g>
          )}
        />
      </div>
    </div>
  );
}
