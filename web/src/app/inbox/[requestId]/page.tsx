"use client";

/**
 * Request thread page: shows request details, action buttons (accept /
 * decline / complete / cancel), and the in-app message thread with polling.
 */

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  requests as requestsApi,
  type ExchangeRequest,
  type Message,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const POLL_INTERVAL_MS = 4000;

export default function RequestThreadPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const { user } = useAuth();
  const [req, setReq] = useState<ExchangeRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reqId = parseInt(requestId);

  async function loadMessages() {
    try {
      const msgs = await requestsApi.messages(reqId);
      setMessages(msgs);
    } catch {
      /* silently ignore polling errors */
    }
  }

  useEffect(() => {
    Promise.all([requestsApi.get(reqId), requestsApi.messages(reqId)])
      .then(([r, msgs]) => {
        setReq(r);
        setMessages(msgs);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    pollingRef.current = setInterval(loadMessages, POLL_INTERVAL_MS);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [reqId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const msg = await requestsApi.sendMessage(reqId, body);
      setMessages((prev) => [...prev, msg]);
      setBody("");
    } finally {
      setSending(false);
    }
  }

  async function doAction(action: "accept" | "decline" | "cancel" | "complete") {
    setActionLoading(true);
    try {
      const updated = await requestsApi[action](reqId);
      setReq(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <p className="p-8 text-stone-500">Loading…</p>;
  if (error || !req) return <p className="p-8 text-red-600">{error || "Not found"}</p>;

  const isOwner = req.listing_id !== undefined; // refined below via listing lookup
  // We infer who is the "listing owner side" from status or just show all relevant buttons
  const isRequester = user?.id === req.requester_id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <Link href="/inbox" className="text-sm text-green-700 hover:underline">
        ← Back to inbox
      </Link>

      <div className="card">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-stone-800">
              Request #{req.id} ·{" "}
              <Link
                href={`/marketplace/${req.listing_id}`}
                className="text-green-700 hover:underline"
              >
                Listing #{req.listing_id}
              </Link>
            </p>
            <p className="text-xs text-stone-400 mt-0.5 capitalize">{req.status}</p>
          </div>
          {/* Action buttons */}
          <div className="flex gap-2">
            {req.status === "pending" && !isRequester && (
              <>
                <button
                  onClick={() => doAction("accept")}
                  disabled={actionLoading}
                  className="btn-primary text-xs"
                >
                  Accept
                </button>
                <button
                  onClick={() => doAction("decline")}
                  disabled={actionLoading}
                  className="btn-secondary text-xs"
                >
                  Decline
                </button>
              </>
            )}
            {req.status === "accepted" && !isRequester && (
              <button
                onClick={() => doAction("complete")}
                disabled={actionLoading}
                className="btn-primary text-xs"
              >
                Mark complete
              </button>
            )}
            {(req.status === "pending" || req.status === "accepted") && (
              <button
                onClick={() => doAction("cancel")}
                disabled={actionLoading}
                className="btn-secondary text-xs text-red-600"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        {req.message && (
          <p className="mt-3 text-sm text-stone-600 bg-stone-50 rounded-lg p-3">
            &ldquo;{req.message}&rdquo;
          </p>
        )}
      </div>

      {/* Message thread */}
      <section>
        <h2 className="font-semibold text-stone-700 mb-3">Messages</h2>
        <div className="card min-h-[200px] max-h-[360px] overflow-y-auto space-y-3 mb-3">
          {messages.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-8">
              No messages yet. Say hello!
            </p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                    m.sender_id === user?.id
                      ? "bg-green-700 text-white"
                      : "bg-stone-100 text-stone-800"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {(req.status === "pending" || req.status === "accepted") && (
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Type a message…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <button type="submit" disabled={sending} className="btn-primary">
              Send
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
