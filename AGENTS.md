# AGENTS.md

Wanderlast — a travel booking landing page. Next.js 16.4 App Router, TypeScript, Tailwind v4. npm is the package manager (`package-lock.json`); scripts are only `dev` (Turbopack), `build`, `lint`, `start`.

Backend API (separate Express + MongoDB server, outside this repo): shared base URL in `src/lib/api.ts` from `NEXT_PUBLIC_API_URL` (`.env.local` is git-ignored), falling back to `http://localhost:8000`. Endpoints in use: `POST /add-destination` (form in `src/components/add-destination-form.tsx`), `GET /destinations` (server component in `src/app/destinations/page.tsx`, `cache: "no-store"` so the grid shows live data on every request), `PATCH /destination/:id` (singular route, `updateOne` via `ObjectId(id)` in `src/components/edit-destination-dialog.tsx`), and `DELETE /destination/:id` (singular route, `deleteOne` via `ObjectId(id)` in `src/components/DeleteDestinationDialog.tsx`).

## Verification

- `npm run lint` — ESLint (flat config, `core-web-vitals` + TS presets)
- `npx tsc --noEmit` — typecheck (no script for it; includes `.next/dev/types` so run after `next dev`/`next build`)
- `npm run build` — full check
- No test suite exists.

## Next.js version — not in your training data

`next` 16.4.5 with `cacheComponents: true`, `partialPrefetching: true`, and `reactCompiler: true` in `next.config.ts` — all non-default flags:

- `cacheComponents` is enabled: async server components need explicit `<Suspense>` boundaries and explicit cache shell; don't fetch data assuming classic static/dynamic behavior. Read the relevant guide in `node_modules/next/dist/docs/` before writing app-router code.
- React Compiler auto-memoizes; don't hand-wrap with `memo`/`useCallback`/`useMemo` unless there's a lint/compiler complaint.

## Layout and conventions

- App lives in `src/app` (README is stale create-next-app boilerplate; ignore its `app/page.tsx` path).
- `@/*` maps to `./src/*` (tsconfig paths).
- shadcn with `style: "base-nova"` (`components.json`): primitives come from **`@base-ui/react`** (e.g. `@base-ui/react/button`), NOT Radix. `cn` is the `cn` package, re-exported from `src/lib/utils.ts`.
- Tailwind v4 is config-less; the theme lives as CSS variables in `src/app/globals.css`. CSS is compiled via `@tailwindcss/turbopack` (rule in `next.config.ts`).
- Fonts: `layout.tsx` loads **Josefin Sans**, applied via `josefinSans.className` on `<html>`; its variable `--font-geist-sans` is a leftover create-next-app name that isn't consumed — don't "restore" Geist or `--font-geist-mono` thinking it's the intended font.
- Image assets live in `public/imges/` (typo, not `images`) — e.g. `public/imges/destinations/`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
