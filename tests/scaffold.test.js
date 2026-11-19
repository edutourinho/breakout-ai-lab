import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('HTML declares Portuguese and responsive viewport', async () => {
  const html = await readFile('index.html', 'utf8');
  assert.match(html, /lang="pt-BR"/);
  assert.match(html, /name="viewport"/);
});
