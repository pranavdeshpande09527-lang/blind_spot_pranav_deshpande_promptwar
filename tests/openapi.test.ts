import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { specification } from '../src/openapi.js';
test('OpenAPI covers exactly the implemented application endpoints', async () => {
  const source = await readFile('src/app.ts','utf8');
  const actual = [...source.matchAll(/app\.(get|post|patch|put|delete)\('([^']+)'/g)]
    .filter(m => m[2] !== '/')
    .map(m => `${m[1]} ${m[2].replace(/:([A-Za-z]+)/g,'{$1}')}`).sort();
  const documented = Object.entries(specification.paths).flatMap(([path, methods]) => Object.keys(methods).map(method => `${method} ${path}`)).sort();
  assert.deepEqual(actual,documented);
});
