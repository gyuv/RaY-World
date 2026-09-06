# RAYWORLD brand assets

Drop the exported logo files here with these **exact names**. The site is
already wired to them and will use them automatically once present; until then it
falls back to the built-in CSS logo (so nothing looks broken).

| File | Used for | Recommended export |
| --- | --- | --- |
| `header.png` | Navbar (top of every page) | Horizontal lockup, transparent PNG, ~80px tall (2×: 160px) |
| `footer.png` | Footer | Stacked or horizontal lockup with tagline, transparent PNG, ~160px tall |
| `watchplayer.png` | Watch player, top-right branding | Compact mark/lockup, transparent PNG, ~56px tall |
| `app-icon.png` | Android app + browser tab / PWA icon | **512×512**, square (the rounded app-icon artwork) |

Notes
- **Transparent background** for `header`, `footer`, `watchplayer` (they sit on
  dark surfaces). `app-icon.png` can keep its dark rounded background.
- **PNG** keeps it simple; SVG also works if you change the extensions in the
  code references. If you use different names/paths, update:
  - `src/components/Navbar.tsx` (header)
  - `src/components/Footer.tsx` (footer)
  - `src/components/watch/VideoEmbed.tsx` (watchplayer)
  - `src/app/manifest.ts` and `src/app/layout.tsx` (app-icon)
- After adding the files, commit and push — Vercel redeploys and the real logos
  appear everywhere.
