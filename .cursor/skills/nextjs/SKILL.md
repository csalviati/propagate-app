---
name: nextjs
description: Best practices for the Next.js 16 App Router + TypeScript frontend used in Propagate.
---

# Next.js (App Router) Best Practices

## Project conventions

- All source files are TypeScript (`.ts` / `.tsx`). Never generate `.js` or `.jsx`.
- Pages live in `web/src/app/` using the App Router file convention (`page.tsx`, `layout.tsx`).
- Client components are marked `"use client"` at the top; server components are the default.
- Shared reusable UI lives in `web/src/components/`.
- API calls go through `web/src/lib/api.ts` — never call `fetch` directly in components.
- Auth state is managed via `web/src/contexts/AuthContext.tsx`.

## Key rules

1. `useSearchParams()` must always be wrapped in a `<Suspense>` boundary or its component must be a child of one.
2. Dynamic imports (`next/dynamic`) are required for any library that uses browser-only APIs (e.g. `react-d3-tree`).
3. Images served from the API use `${process.env.NEXT_PUBLIC_API_URL}${photo_url}`.
4. Use Tailwind utility classes. The custom `.input`, `.btn-primary`, `.btn-secondary`, and `.card` classes are defined in `globals.css`.
5. Run `npm run build` before committing to catch TypeScript errors early.

## Common patterns

```tsx
// Client component that guards auth
useEffect(() => {
  if (!authLoading && !user) router.push("/login");
}, [user, authLoading, router]);

// Polling with cleanup
const ref = useRef<ReturnType<typeof setInterval>>();
useEffect(() => {
  ref.current = setInterval(fetch, 4000);
  return () => clearInterval(ref.current);
}, []);
```
