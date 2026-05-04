# PetX AI Agent Integration Guide

Use this document as the instruction source for a code agent. Give the agent this GitHub link or paste the whole file into its task prompt.

Goal: add PetX to an existing app so it renders an animated Codex pet from a `spritesheet.webp` atlas.

## Agent Task Prompt

Copy this block into the target project's code agent:

```text
Integrate PetX into this app.

Use the PetX AI Agent Integration Guide as the source of truth.

Requirements:
- Detect the app framework from package.json and source files.
- Install the matching PetX package.
- Import the PetX CSS once, if the selected package has CSS.
- Add one visible animated Codex pet preview to the most appropriate page or component.
- Use /pets/frieren/spritesheet.webp as the default asset path unless the app already has a pet asset URL or the user provides another one.
- Do not publish packages, change unrelated UI, or rewrite the app structure.
- Run the app's typecheck, build, or test command after the change.
- Report changed files and verification output.
```

## Package Selection

Read the target app's `package.json` and choose one package:

| App signal | Install |
| --- | --- |
| `react` or `next` | `@petx/react` |
| `vue` or `nuxt` | `@petx/vue` |
| `svelte` or `@sveltejs/kit` | `@petx/svelte` |
| `solid-js` or `solid-start` | `@petx/solid` |
| no framework, mixed framework, static HTML, or unknown | `@petx/webcomponent` |

Use the target project's package manager:

```bash
npm i @petx/react
pnpm add @petx/react
yarn add @petx/react
bun add @petx/react
```

Replace `@petx/react` with the selected package.

## Asset Setup

PetX renders a spritesheet URL. It does not bundle pet images.

To create custom Codex pet assets, use the official Codex pets guide:
https://developers.openai.com/codex/app/settings#codex-pets

The Codex app guide tells users to install the `hatch-pet` skill and then ask it to create a pet. Use the generated `spritesheet.webp` and `pet.json` files as the PetX asset source.

Preferred public asset layout:

```text
public/
  pets/
    frieren/
      pet.json
      spritesheet.webp
```

Use this URL in components:

```text
/pets/frieren/spritesheet.webp
```

If the target app already stores static assets somewhere else, keep its convention and pass that URL to `src`.

Default Codex pet atlas format:

| Property | Value |
| --- | --- |
| columns | 8 |
| rows | 9 |
| frame size | 192 x 208 px |
| full spritesheet | 1536 x 1872 px |

Default animation names:

```text
idle
runningRight
runningLeft
waving
jumping
failed
waiting
running
review
```

## React

Install:

```bash
npm i @petx/react
```

Import CSS once, usually in `src/main.tsx`, `src/App.tsx`, `app/layout.tsx`, or the existing global CSS entry:

```tsx
import '@petx/react/styles.css';
```

Render:

```tsx
import { PetX } from '@petx/react';

export function PetPreview() {
  return (
    <PetX
      src="/pets/frieren/spritesheet.webp"
      animation="idle"
      size={192}
      title="Frieren Codex pet"
    />
  );
}
```

## Vue

Install:

```bash
npm i @petx/vue
```

Import CSS once, usually in `src/main.ts`, `src/App.vue`, or the app's global CSS entry:

```ts
import '@petx/vue/styles.css';
```

Render:

```vue
<script setup lang="ts">
import { PetX } from '@petx/vue';
</script>

<template>
  <PetX
    src="/pets/frieren/spritesheet.webp"
    animation="waving"
    :size="192"
    title="Frieren Codex pet"
  />
</template>
```

## Svelte

Install:

```bash
npm i @petx/svelte
```

Import CSS once, usually in `src/routes/+layout.svelte`, `src/App.svelte`, or the app's global CSS entry:

```ts
import '@petx/svelte/styles.css';
```

Render:

```svelte
<script lang="ts">
  import PetX from '@petx/svelte';
</script>

<PetX
  src="/pets/frieren/spritesheet.webp"
  animation="jumping"
  size={192}
  title="Frieren Codex pet"
/>
```

## SolidJS

Install:

```bash
npm i @petx/solid
```

Import CSS once, usually in `src/index.tsx`, `src/App.tsx`, or the app's global CSS entry:

```tsx
import '@petx/solid/styles.css';
```

Render:

```tsx
import { PetX } from '@petx/solid';

export function PetPreview() {
  return (
    <PetX
      src="/pets/frieren/spritesheet.webp"
      animation="review"
      size={192}
      title="Frieren Codex pet"
    />
  );
}
```

## Web Component

Install:

```bash
npm i @petx/webcomponent
```

Define the custom element once, usually in the app entry file:

```ts
import { definePetXElement } from '@petx/webcomponent';

definePetXElement();
```

Render in HTML:

```html
<pet-x
  src="/pets/frieren/spritesheet.webp"
  animation="idle"
  size="192"
  title="Frieren Codex pet"
></pet-x>
```

The Web Component package does not require a CSS import.

## Common Props

| Prop | Type | Default | Use |
| --- | --- | --- | --- |
| `src` | `string` | none | Spritesheet URL. |
| `pet` | `CodexPetManifest` | none | Manifest object with `spritesheetPath`. |
| `manifestUrl` | `string` | none | Base URL for resolving relative manifest paths. |
| `animation` | `string` | `idle` | Animation key. |
| `frame` | `number` | auto | Fixed frame. Set this for static previews. |
| `playing` | `boolean` | `true` | Turn animation on or off. |
| `frameInterval` | `number` | animation default | Milliseconds per frame. |
| `size` | `number | string` | atlas frame width | Display width. Height scales from the 192 x 208 frame ratio. |
| `offsetX` | `number | string` | `0` | Horizontal visual adjustment. |
| `offsetY` | `number | string` | `0` | Vertical visual adjustment. |
| `atlas` | `Partial<CodexPetAtlas>` | default atlas | Use for non-default frame sizes. |
| `animations` | `CodexPetAnimations` | default animations | Use for custom row or frame counts. |
| `title` | `string` | none | Accessible image label. |

Web Component attribute names use kebab case:

```html
<pet-x frame-interval="140" offset-x="0" offset-y="0"></pet-x>
```

## Placement Guidance

Choose the smallest useful integration:

- For dashboards or docs, add a small `PetPreview` component near an existing preview, toolbar, empty state, or demo panel.
- For picker UIs, render multiple `PetX` instances in a grid and change `animation` on hover or selection.
- For a desktop companion or mascot, place the pet in a fixed or sticky layer and keep `pointer-events` behavior aligned with the host app.
- Keep the pet container large enough for a 192 x 208 frame. If the image looks clipped, increase container height or allow `overflow: visible`.

Minimal wrapper:

```css
.petx-preview {
  display: inline-grid;
  place-items: center;
  width: 240px;
  min-height: 260px;
  overflow: visible;
}
```

## Verification Checklist

After integration, run the target app's normal checks. Prefer existing scripts in this order:

```bash
npm run typecheck
npm run build
npm test
```

Use the matching package manager if the repo uses `pnpm`, `yarn`, or `bun`.

Then verify in a browser:

- The page contains an element with class `codex-pet`, or a `<pet-x>` custom element.
- The rendered element has `--codex-pet-src` pointing at the spritesheet URL.
- The pet is visible and not clipped.
- The selected animation changes frames unless `playing={false}` or `frame` is set.
- The browser network panel can load `spritesheet.webp` with HTTP 200.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Nothing visible | Check `src`, confirm the asset URL returns 200, and import the package CSS for React, Vue, Svelte, or SolidJS. |
| The pet is clipped | Increase wrapper height or set `overflow: visible` on the preview container. |
| Wrong animation row | Use one of the default animation names or pass a custom `animations` map. |
| Animation does not move | Check `playing`, `frame`, reduced-motion settings, and `frameInterval`. |
| TypeScript cannot find CSS imports | Add the app's usual CSS module declaration or import CSS from a global entry already accepted by the bundler. |
| SSR warning | Import and render the framework component normally. For the Web Component, call `definePetXElement()` only in browser code if the host framework renders on the server. |

## Completion Report Format

The code agent should finish with:

```text
Changed files:
- ...

Installed package:
- ...

Pet asset path:
- ...

Verification:
- npm run typecheck: ...
- npm run build: ...
- browser check: ...
```
