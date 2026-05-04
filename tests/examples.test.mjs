import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';

const examples = ['react', 'vue', 'svelte', 'solid', 'webcomponent'];

for (const example of examples) {
  test(`${example} example build ships app code and shared pet assets`, async () => {
    const root = new URL(`../examples/${example}/dist/`, import.meta.url);
    const html = await readFile(new URL('index.html', root), 'utf8');
    const assets = await readdir(new URL('assets/', root));
    const sprite = await stat(new URL('pets/frieren/spritesheet.webp', root));
    const manifest = JSON.parse(await readFile(new URL('pets/frieren/pet.json', root), 'utf8'));

    assert.match(html, /<script type="module"/);
    assert.ok(assets.some((name) => name.endsWith('.js')), 'expected a JavaScript bundle');
    assert.ok(sprite.size > 100_000, 'expected the Frieren spritesheet to be copied');
    assert.equal(manifest.spritesheetPath, 'spritesheet.webp');

    const bundledCode = await Promise.all(
      assets.filter((name) => name.endsWith('.js')).map((name) => readFile(new URL(`assets/${name}`, root), 'utf8')),
    );
    assert.match(bundledCode.join('\n'), /codex-pet/);
    assert.match(bundledCode.join('\n'), /spritesheet\.webp/);
  });
}
