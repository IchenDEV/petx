import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readmeUrl = new URL('../README.md', import.meta.url);
const aiGuideUrl = new URL('../docs/AI_AGENT_INTEGRATION.md', import.meta.url);

test('README links to the AI agent integration guide', async () => {
  const readme = await readFile(readmeUrl, 'utf8');

  assert.match(readme, /\[docs\/AI_AGENT_INTEGRATION\.md\]\(docs\/AI_AGENT_INTEGRATION\.md\)/);
});

test('AI integration guide is actionable for supported frameworks', async () => {
  const guide = await readFile(aiGuideUrl, 'utf8');

  for (const packageName of ['@petx/react', '@petx/vue', '@petx/svelte', '@petx/solid', '@petx/webcomponent']) {
    assert.match(guide, new RegExp(packageName.replace('/', '\\/')));
  }

  assert.match(guide, /Agent Task Prompt/);
  assert.match(guide, /Package Selection/);
  assert.match(guide, /Asset Setup/);
  assert.match(guide, /Verification Checklist/);
  assert.match(guide, /\/pets\/frieren\/spritesheet\.webp/);
  assert.match(guide, /<PetX/);
  assert.match(guide, /<pet-x/);
  assert.match(guide, /definePetXElement/);
});

test('AI integration guide points agents to the official custom pet docs', async () => {
  const guide = await readFile(aiGuideUrl, 'utf8');

  assert.match(guide, /https:\/\/developers\.openai\.com\/codex\/app\/settings#codex-pets/);
  assert.match(guide, /hatch-pet/);
});
