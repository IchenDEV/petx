import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const mainUrl = new URL('../examples/react/src/main.tsx', import.meta.url);
const htmlUrl = new URL('../examples/react/index.html', import.meta.url);
const cssUrl = new URL('../examples/react/src/site.css', import.meta.url);
const viteConfigUrl = new URL('../examples/react/vite.config.ts', import.meta.url);
const pagesWorkflowUrl = new URL('../.github/workflows/pages.yml', import.meta.url);

test('site declares a favicon from the static asset root', async () => {
  const html = await readFile(htmlUrl, 'utf8');
  const favicon = await readFile(new URL('../examples/assets/favicon.svg', import.meta.url), 'utf8');

  assert.match(html, /<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg" \/>/);
  assert.match(favicon, /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 64 64">/);
});

test('site footer shows the GitHub link without unrelated footer items', async () => {
  const source = await readFile(mainUrl, 'utf8');

  assert.match(source, /href="https:\/\/github\.com\/IchenDEV\/petx"/);
  assert.match(source, /GitHubIcon/);
  assert.doesNotMatch(source, /PyTorchLogo/);
  assert.doesNotMatch(source, /pytorch\.org|PyTorch/);
  assert.doesNotMatch(source, /<code>npm run dev<\/code>/);
});

test('site links to the official Codex pets builder docs', async () => {
  const source = await readFile(mainUrl, 'utf8');

  assert.match(source, /https:\/\/developers\.openai\.com\/codex\/app\/settings#codex-pets/);
  assert.match(source, /buildPets: 'Build your own pets'/);
  assert.match(source, /buildPets: '创建自己的宠物'/);
  assert.doesNotMatch(source, /Build your own pets\?/);
  assert.doesNotMatch(source, /创建自己的宠物？/);
});

test('hero install path points code agents to the GitHub AI integration guide', async () => {
  const source = await readFile(mainUrl, 'utf8');
  const heroActions = source.match(/<div className="hero-actions" id="install">[\s\S]*?<\/div>/)?.[0] ?? '';

  assert.match(source, /https:\/\/github\.com\/IchenDEV\/petx\/blob\/main\/docs\/AI_AGENT_INTEGRATION\.md/);
  assert.match(
    source,
    /Ask your code agent: follow https:\/\/github\.com\/IchenDEV\/petx\/blob\/main\/docs\/AI_AGENT_INTEGRATION\.md to integrate PetX\./,
  );
  assert.match(
    source,
    /告诉 code agent：参考 https:\/\/github\.com\/IchenDEV\/petx\/blob\/main\/docs\/AI_AGENT_INTEGRATION\.md 接入 PetX。/,
  );
  assert.match(heroActions, /aiInstallPrompt/);
  assert.doesNotMatch(heroActions, /npm i @petx\/react/);
});

test('quickstart has a framework selector and framework-specific commands', async () => {
  const source = await readFile(mainUrl, 'utf8');

  assert.match(source, /quickstartFramework/);
  assert.match(source, /id="quickstart-framework"/);
  assert.equal(source.match(/tryProps: 'Playground'/g)?.length, 2);
  assert.doesNotMatch(source, /Try the props/);
  assert.match(source, /npm i @petx\/vue/);
  assert.match(source, /npm i @petx\/react-native/);
  assert.match(source, /source=\{require\("\.\/assets\/pets\/frieren\/spritesheet\.webp"\)\}/);
  assert.match(source, /definePetXElement/);
  assert.match(source, /<PetX/);
  assert.match(source, /<pet-x/);
  assert.match(source, /@petx\/svelte\/styles\.css/);
});

test('site introduces React Native as a rendering target', async () => {
  const source = await readFile(mainUrl, 'utf8');

  assert.match(source, /React Native/);
  assert.match(source, /@petx\/react-native/);
  assert.match(source, /One sprite format\. Six rendering targets\./);
  assert.match(source, /一种 sprite 格式，六种渲染目标。/);
  assert.match(source, /React Native renders through native View and Image primitives/);
  assert.match(source, /React Native 通过原生 View 和 Image 渲染，不需要 CSS。/);
});

test('dark theme uses neutral accents instead of green UI chrome', async () => {
  const css = await readFile(cssUrl, 'utf8');
  const darkTheme = css.match(/:root\[data-theme="dark"\]\s*\{[\s\S]*?\n\}/)?.[0] ?? '';

  assert.match(darkTheme, /--accent: #f3f7f4;/);
  assert.match(darkTheme, /--soft-accent: #242827;/);
  assert.doesNotMatch(darkTheme, /#31d89f|#123529|#93e6b0/i);
});

test('dark theme keeps syntax highlighting readable without green chrome', async () => {
  const css = await readFile(cssUrl, 'utf8');
  const darkTheme = css.match(/:root\[data-theme="dark"\]\s*\{[\s\S]*?\n\}/)?.[0] ?? '';

  assert.match(darkTheme, /--code-keyword: #82aaff;/);
  assert.match(darkTheme, /--code-string: #f6c177;/);
  assert.match(darkTheme, /--code-tag: #f78c6c;/);
  assert.match(darkTheme, /--code-attribute: #c792ea;/);
  assert.match(darkTheme, /--code-number: #ffcb6b;/);
  assert.match(darkTheme, /--code-function: #89ddff;/);
  assert.doesNotMatch(darkTheme, /--code-(?:keyword|string|tag|attribute|number|function): #[def][def][def]/i);
  assert.doesNotMatch(darkTheme, /#31d89f|#123529|#93e6b0/i);
});

test('brand logo has explicit dark-mode colors and no dark shadow block', async () => {
  const css = await readFile(cssUrl, 'utf8');
  const darkTheme = css.match(/:root\[data-theme="dark"\]\s*\{[\s\S]*?\n\}/)?.[0] ?? '';

  assert.match(css, /--brand-mark-bg:/);
  assert.match(css, /--brand-mark-ink:/);
  assert.match(css, /--brand-mark-shadow:/);
  assert.match(darkTheme, /--brand-mark-bg: #f3f7f4;/);
  assert.match(darkTheme, /--brand-mark-ink: #0f1010;/);
  assert.match(darkTheme, /--brand-mark-shadow: transparent;/);
});

test('gallery shows only approved demo pets', async () => {
  const source = await readFile(mainUrl, 'utf8');
  const petsLine = source.match(/const pets = \[[^\]]+\];/)?.[0] ?? '';

  assert.match(petsLine, /frieren/);
  assert.match(petsLine, /jobs/);
  assert.match(petsLine, /trumpet/);
  assert.doesNotMatch(petsLine, /doraemon|leijun/);
});

test('site is configured for the custom-domain GitHub Pages root', async () => {
  const source = await readFile(mainUrl, 'utf8');
  const viteConfig = await readFile(viteConfigUrl, 'utf8');
  const workflow = await readFile(pagesWorkflowUrl, 'utf8');
  const cname = await readFile(new URL('../examples/assets/CNAME', import.meta.url), 'utf8');

  assert.match(viteConfig, /base: '\/'/);
  assert.match(source, /const assetPath = \(path: string\) => `\$\{import\.meta\.env\.BASE_URL\}\$\{path\.replace\(\//);
  assert.match(source, /src=\{assetPath\('pets\/frieren\/spritesheet\.webp'\)\}/);
  assert.match(workflow, /pnpm\/action-setup@v4/);
  assert.match(workflow, /pnpm install --frozen-lockfile/);
  assert.doesNotMatch(workflow, /GITHUB_PAGES: 'true'/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /path: examples\/react\/dist/);
  assert.equal(cname.trim(), 'petx.idevlab.dev');
});
