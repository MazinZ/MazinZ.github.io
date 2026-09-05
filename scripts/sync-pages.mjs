import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const output = new URL('docs/', root);
rmSync(output, { recursive: true, force: true });
cpSync(new URL('dist/client/', root), output, { recursive: true });
writeFileSync(new URL('.nojekyll', output), '');
// Preserve links to the résumé from the previous website.
mkdirSync(new URL('files/', output), { recursive: true });
cpSync(new URL('public/Mazin-Zakaria-Resume.pdf', root), new URL('files/Mazin_Zakaria_res.pdf', output));
console.log('GitHub Pages output is ready in docs/.');
