# Backend stubs

These modules replace the real Firebase / Supabase / Shopify SDKs at build time
via Vite's resolve.alias config in vite.config.js. They preserve the same
exported API shape but every operation is a no-op (returns empty data, never
errors). This keeps the kush-light template fully renderable with no backend.

If you want to wire up a real backend later, delete the matching alias entries
in vite.config.js and the original Firebase / Supabase / Shopify imports will
resolve to the real packages again (which are kept in package.json).
