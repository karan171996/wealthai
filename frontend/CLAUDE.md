@AGENTS.md

## Next.js Conventions

- **Auth/redirect checks**: put them in `middleware.js` (project root, alongside `app/`), scoped with `config.matcher` to only the routes that need it. Don't re-check auth ad hoc in every route/page.
- **Session lookup**: centralize in one helper (e.g. `lib/auth.js`) that verifies the token and returns the session/user. Server Components call it directly; only use a client-side `useEffect` fetch (e.g. `/api/me`) when the auth state is optional/non-blocking for that view.
- **Cache invalidation**: prefer `revalidateTag()` over `revalidatePath()` when multiple routes depend on the same data — tag the fetch (`next: { tags: [...] }`) once, invalidate everywhere with one call. Use plain `export const revalidate = N` only for simple time-based refresh on a single route type.
- **Dynamic routes**: use `[param]` for required segments, `[...slug]` for required catch-all, `[[...slug]]` only when the route must also match the parent with no segment at all. Always pair with `generateStaticParams()` when the set of values is known at build time.
- **Images**: always use `next/image`, never a raw `<img>`. Set `priority` only on above-the-fold images. Add remote hosts to `images.remotePatterns` in `next.config.js` before using external `src`.
- **Fonts**: load via `next/font/google` or `next/font/local` in the root layout, not `<link>` tags or `@import`. Use the CSS-variable form (`variable: '--font-x'`) when multiple fonts need to coexist in child components.
