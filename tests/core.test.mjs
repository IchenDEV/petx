import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultCodexPetAnimations,
  getCodexPetCssText,
  getCodexPetFrame,
  getCodexPetStyleVars,
  resolvePetSpritesheet,
} from '@petx/core';

test('default animation rows match the Codex pet atlas', () => {
  assert.equal(defaultCodexPetAnimations.idle.row, 0);
  assert.equal(defaultCodexPetAnimations.runningRight.row, 1);
  assert.equal(defaultCodexPetAnimations.runningLeft.row, 2);
  assert.equal(defaultCodexPetAnimations.waving.row, 3);
  assert.equal(defaultCodexPetAnimations.jumping.row, 4);
  assert.equal(defaultCodexPetAnimations.failed.row, 5);
  assert.equal(defaultCodexPetAnimations.waiting.row, 6);
  assert.equal(defaultCodexPetAnimations.running.row, 7);
  assert.equal(defaultCodexPetAnimations.review.row, 8);
});

test('frame math wraps frames and maps to background coordinates', () => {
  const frame = getCodexPetFrame({ animation: 'runningRight', frame: 10 });

  assert.equal(frame.row, 1);
  assert.equal(frame.frame, 2);
  assert.equal(frame.frameWidth, 192);
  assert.equal(frame.frameHeight, 208);
  assert.equal(frame.backgroundWidth, 1536);
  assert.equal(frame.backgroundHeight, 1872);
  assert.equal(frame.backgroundPositionX, -384);
  assert.equal(frame.backgroundPositionY, -208);
});

test('style variables produce a visible scaled sprite frame', () => {
  const vars = getCodexPetStyleVars({
    src: '/pets/frieren/spritesheet.webp',
    animation: 'runningRight',
    frame: 2,
    size: 240,
    offsetX: 16,
    offsetY: 5,
  });

  assert.equal(vars['--codex-pet-src'], 'url("/pets/frieren/spritesheet.webp")');
  assert.equal(vars['--codex-pet-display-width'], '240px');
  assert.equal(vars['--codex-pet-display-height'], '260px');
  assert.equal(vars['--codex-pet-x'], '-384px');
  assert.equal(vars['--codex-pet-y'], '-208px');
  assert.equal(vars['--codex-pet-offset-x'], '20px');
  assert.equal(vars['--codex-pet-offset-y'], '6.25px');
  assert.equal(vars['--codex-pet-scale'], '1.25');

  const cssText = getCodexPetCssText(vars);
  assert.match(cssText, /--codex-pet-src: url\("\/pets\/frieren\/spritesheet\.webp"\);/);
  assert.match(cssText, /--codex-pet-x: -384px;/);
});

test('manifest spritesheet paths resolve for absolute, root-relative, and manifest-relative URLs', () => {
  assert.equal(
    resolvePetSpritesheet({ spritesheetPath: 'https://cdn.example/pets/frieren/spritesheet.webp' }),
    'https://cdn.example/pets/frieren/spritesheet.webp',
  );
  assert.equal(
    resolvePetSpritesheet({ spritesheetPath: '/pets/frieren/spritesheet.webp' }, '/pets/frieren/pet.json'),
    '/pets/frieren/spritesheet.webp',
  );
  assert.equal(
    resolvePetSpritesheet({ spritesheetPath: './spritesheet.webp' }, 'https://cdn.example/pets/frieren/pet.json'),
    'https://cdn.example/pets/frieren/spritesheet.webp',
  );
  assert.equal(
    resolvePetSpritesheet({ spritesheetPath: './spritesheet.webp' }, '/pets/frieren/pet.json'),
    '/pets/frieren/spritesheet.webp',
  );
  assert.equal(
    resolvePetSpritesheet({ spritesheetPath: '../shared/spritesheet.webp' }, 'pets/frieren/pet.json'),
    'pets/shared/spritesheet.webp',
  );
});
