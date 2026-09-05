# Mazin Zakaria

Personal website at https://mazinz.github.io/.

## Development

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

The page content lives in `app/page.tsx`, styles in `app/globals.css`, and the liquid animation in `app/liquid-renderer.ts`.

## Publishing

```sh
npm run build
git add app public docs
git commit -m "Update website"
git push origin master
```

Commit other source files as needed. The build generates static HTML, JavaScript, CSS, and fonts in `docs/`. GitHub Pages publishes the `master` branch's `/docs` directory. No server or external font requests are needed at runtime.

To replace the résumé, update `public/Mazin-Zakaria-Resume.pdf` and rebuild. The build also updates the previous résumé URL at `/files/Mazin_Zakaria_res.pdf`.
