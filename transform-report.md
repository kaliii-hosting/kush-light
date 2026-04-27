# kush-light v2 transform report

Source:  github.com/kaliii-hosting/kush@main
Output:  C:\Users\mothe\kush-light-v2
Generated: 2026-04-27T06:48:20.479Z

## Summary

- Files transformed:  103
- Files passed through: 136
- Media files skipped:  4
- Theme-token swaps in: 15 files

## Strategy (v2 vs v1)

v2 keeps EVERY kush component/page/context unchanged and instead redirects backend SDK imports
to local no-op stubs via Vite resolve.alias. This preserves the entire kush layout — same
homepage sections, same desktop+mobile menu pages, same components — but with no backend calls.

Stubs live in `src/_stubs/` and are wired in `vite.config.js`. To re-enable real Firebase/Supabase/Shopify,
delete the matching alias entries in vite.config.js (the real packages are still in package.json).

## Next steps

1. `cd ..\..\..\..\..\..\kush-light-v2 && npm install --force`
2. `npx vite build` — should produce a clean dist/
3. `npm run dev` — visually verify all kush pages render with grey media placeholders
4. Force-push to `kaliii-hosting/kush-light` to replace the v1 over-stripped version
