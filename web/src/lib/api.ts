/**
 * Typed API client for the Propagate FastAPI backend.
 *
 * All requests attach the JWT stored in localStorage as a Bearer token.
 * The base URL is read from NEXT_PUBLIC_API_URL.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body?.detail ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function requestMultipart<T>(path: string, formData: FormData): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: res.statusText }));
      throw new ApiError(res.status, body?.detail ?? res.statusText);
    }
    return res.json() as Promise<T>;
  });
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const auth = {
  register: (data: {
    email: string;
    password: string;
    display_name: string;
    city?: string;
    lat?: number;
    lng?: number;
  }) =>
    request<{ access_token: string; token_type: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (email: string, password: string) =>
    request<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/auth/me"),
};

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const users = {
  get: (id: number) => request<User>(`/users/${id}`),
};

// ---------------------------------------------------------------------------
// Plants
// ---------------------------------------------------------------------------

export const plants = {
  list: () => request<Plant[]>("/plants"),
  create: (data: PlantCreate) =>
    request<Plant>("/plants", { method: "POST", body: JSON.stringify(data) }),
  get: (id: number) => request<Plant>(`/plants/${id}`),
  update: (id: number, data: Partial<PlantCreate>) =>
    request<Plant>(`/plants/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/plants/${id}`, { method: "DELETE" }),
  uploadPhoto: (id: number, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return requestMultipart<Plant>(`/plants/${id}/photo`, fd);
  },
  lineage: (id: number) => request<LineageNode>(`/plants/${id}/lineage`),
  searchSpecies: (q: string) =>
    request<Species[]>(`/plants/species?q=${encodeURIComponent(q)}`),
  listNotes: (id: number) => request<Note[]>(`/plants/${id}/notes`),
  createNote: (id: number, data: NoteCreate) =>
    request<Note>(`/plants/${id}/notes`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

export const listings = {
  browse: (params?: {
    q?: string;
    type?: string;
    near?: string;
  }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [
        string,
        string
      ][]
    ).toString();
    return request<Listing[]>(`/listings${qs ? `?${qs}` : ""}`);
  },
  create: (data: ListingCreate) =>
    request<Listing>("/listings", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  get: (id: number) => request<Listing>(`/listings/${id}`),
  update: (id: number, data: Partial<{ title: string; description: string; status: string }>) =>
    request<Listing>(`/listings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/listings/${id}`, { method: "DELETE" }),
  uploadPhoto: (id: number, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return requestMultipart<Listing>(`/listings/${id}/photo`, fd);
  },
  createRequest: (listingId: number, data: { message?: string; offered_listing_id?: number }) =>
    request<ExchangeRequest>(`/listings/${listingId}/requests`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export const requests = {
  list: () => request<ExchangeRequest[]>("/requests"),
  get: (id: number) => request<ExchangeRequest>(`/requests/${id}`),
  accept: (id: number) =>
    request<ExchangeRequest>(`/requests/${id}/accept`, { method: "POST" }),
  decline: (id: number) =>
    request<ExchangeRequest>(`/requests/${id}/decline`, { method: "POST" }),
  cancel: (id: number) =>
    request<ExchangeRequest>(`/requests/${id}/cancel`, { method: "POST" }),
  complete: (id: number) =>
    request<ExchangeRequest>(`/requests/${id}/complete`, { method: "POST" }),
  messages: (id: number) => request<Message[]>(`/requests/${id}/messages`),
  sendMessage: (id: number, body: string) =>
    request<Message>(`/requests/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ body }),
    }),
};

// ---------------------------------------------------------------------------
// Posts & Feed
// ---------------------------------------------------------------------------

export const posts = {
  create: (data: PostCreate) =>
    request<Post>("/posts", { method: "POST", body: JSON.stringify(data) }),
  feed: (page = 1) => request<Post[]>(`/posts/feed?page=${page}`),
  byUser: (userId: number, page = 1) =>
    request<Post[]>(`/posts/user/${userId}?page=${page}`),
};

// ---------------------------------------------------------------------------
// Follows
// ---------------------------------------------------------------------------

export const follows = {
  follow: (userId: number) =>
    request<Follow>(`/follows/${userId}`, { method: "POST" }),
  unfollow: (userId: number) =>
    request<void>(`/follows/${userId}`, { method: "DELETE" }),
  followers: (userId: number) =>
    request<User[]>(`/follows/users/${userId}/followers`),
  following: (userId: number) =>
    request<User[]>(`/follows/users/${userId}/following`),
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  id: number;
  email: string;
  display_name: string;
  bio?: string;
  city?: string;
  lat?: number;
  lng?: number;
  created_at: string;
}

export interface Species {
  id: number;
  scientific_name: string;
  common_name?: string;
}

export interface Plant {
  id: number;
  owner_id: number;
  species_id?: number;
  common_name: string;
  variety?: string;
  nickname?: string;
  notes?: string;
  photo_url?: string;
  parent_id?: number;
  origin_user_id?: number;
  created_at: string;
}

export interface PlantCreate {
  common_name: string;
  variety?: string;
  nickname?: string;
  notes?: string;
  species_id?: number;
}

export interface LineageNode {
  id: number;
  owner_id: number;
  common_name: string;
  nickname?: string;
  photo_url?: string;
  children: LineageNode[];
}

export interface Note {
  id: number;
  plant_instance_id: number;
  author_id: number;
  body: string;
  visibility: "private" | "public";
  created_at: string;
}

export interface NoteCreate {
  body: string;
  visibility: "private" | "public";
}

export interface Listing {
  id: number;
  owner_id: number;
  plant_instance_id: number;
  type: "cutting" | "seed";
  title: string;
  description?: string;
  photo_url?: string;
  lat?: number;
  lng?: number;
  status: "available" | "reserved" | "completed" | "cancelled";
  created_at: string;
}

export interface ListingCreate {
  plant_instance_id: number;
  type: "cutting" | "seed";
  title: string;
  description?: string;
  lat?: number;
  lng?: number;
}

export interface ExchangeRequest {
  id: number;
  listing_id: number;
  requester_id: number;
  message?: string;
  offered_listing_id?: number;
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled";
  created_at: string;
}

export interface Message {
  id: number;
  request_id: number;
  sender_id: number;
  body: string;
  created_at: string;
}

export interface Post {
  id: number;
  author_id: number;
  plant_instance_id?: number;
  body: string;
  photo_url?: string;
  created_at: string;
}

export interface PostCreate {
  body: string;
  plant_instance_id?: number;
}

export interface Follow {
  follower_id: number;
  followee_id: number;
  created_at: string;
}
