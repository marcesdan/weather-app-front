# Weather

Vite + React 19 + Ionic React 9 (shell) + shadcn on Base UI (components) + Tailwind 4 + TanStack Query + Capacitor 8. Cross-repo decisions: ADR 0001 in ~/code/docs/adr.

- Toolchain: Node 26 LTS (`engines` + `.nvmrc`), pnpm 11 (`packageManager`; Vercel falls back to pnpm 9 without it). Bumps go to Astropia, Marcesia and Weather together.
- `__NATIVE__` is a build-time constant (`vite build --mode native`): native-only plugins load inside `if (__NATIVE__)` so the web build drops them. Ionic stays in both builds; `vite.config.ts` tree-shakes its unused components.
- Ionic CSS: only `core.css` + `structure.css`; colors bridged to the shared tokens in `src/styles/theme-variables.css`.
- Tests: `pnpm test.unit`, `pnpm test.e2e` (Playwright chromium + webkit, all network mocked, port 5299), `pnpm ui-review <route>` (agent-browser, light/dark x 5 widths) before a UI change is done.
- Push to `master` deploys to Vercel. Backend: `weather-app-api` on Render (push to `master` deploys).
