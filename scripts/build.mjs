import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';
import { specification } from '../dist/openapi.js';
await build({ entryPoints: ['src/browser/app.ts'], bundle: true, minify: true,
  outfile: 'public/assets/app.js', platform: 'browser', target: 'es2022' });
await writeFile('docs/openapi.json', JSON.stringify(specification, null, 2) + '\n');
