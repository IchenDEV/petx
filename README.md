# Codex Pet UI

UI rendering packages for Codex desktop pets.

The default renderer expects the current Codex pet atlas format:

- `spritesheet.webp`
- 8 columns by 9 rows
- 192 x 208 px per frame
- `pet.json` with `id`, `displayName`, `description`, `spritesheetPath`

Default animation rows:

| Name | Row | Frames |
| --- | ---: | ---: |
| `idle` | 0 | 6 |
| `runningRight` | 1 | 8 |
| `runningLeft` | 2 | 8 |
| `waving` | 3 | 4 |
| `jumping` | 4 | 5 |
| `failed` | 5 | 8 |
| `waiting` | 6 | 6 |
| `running` | 7 | 6 |
| `review` | 8 | 6 |

`sleeping` is kept as a compatibility alias for row 6.

## Packages

- `@petx/core`: shared types, animation table, frame style helpers
- `@petx/react`: React component
- `@petx/react-native`: React Native component
- `@petx/vue`: Vue component
- `@petx/webcomponent`: framework-free custom element
- `@petx/svelte`: Svelte component
- `@petx/solid`: SolidJS component

## AI agent integration

Give a code agent this guide when it needs to add PetX to another app: [docs/AI_AGENT_INTEGRATION.md](docs/AI_AGENT_INTEGRATION.md).

## Release

The first public release is `0.1`. npm package versions use the SemVer form `0.1.0`.

## React

```tsx
import { PetX } from '@petx/react';
import '@petx/react/styles.css';

export function Preview() {
  return (
    <PetX
      src="/pets/frieren/spritesheet.webp"
      animation="idle"
      size={192}
      frameInterval={140}
    />
  );
}
```

## React Native

```tsx
import { PetX } from '@petx/react-native';

export function Preview() {
  return (
    <PetX
      source={require('./assets/pets/frieren/spritesheet.webp')}
      animation="idle"
      size={192}
      title="Frieren Codex pet"
    />
  );
}
```

Use `src` for remote spritesheets and `source` for bundled app assets. React Native does not need a PetX CSS import.

## Vue

```vue
<script setup lang="ts">
import { PetX } from '@petx/vue';
import '@petx/vue/styles.css';
</script>

<template>
  <PetX src="/pets/frieren/spritesheet.webp" animation="waving" :size="192" />
</template>
```

## Web Component

```ts
import { definePetXElement } from '@petx/webcomponent';

definePetXElement();
```

```html
<pet-x src="/pets/frieren/spritesheet.webp" animation="idle" size="192"></pet-x>
```

## Svelte

```svelte
<script lang="ts">
  import PetX from '@petx/svelte';
  import '@petx/svelte/styles.css';
</script>

<PetX src="/pets/frieren/spritesheet.webp" animation="jumping" size={192} />
```

## SolidJS

```tsx
import { PetX } from '@petx/solid';
import '@petx/solid/styles.css';

export function Preview() {
  return <PetX src="/pets/frieren/spritesheet.webp" animation="review" size={192} />;
}
```

## Manifest helper

```ts
import { resolvePetSpritesheet } from '@petx/core';

const url = resolvePetSpritesheet(pet, '/pets/frieren/pet.json');
```

Use `animations` when a pet package uses a different row or frame count.

## Examples

Each example is a small Vite app using the same pet assets from `examples/assets/pets`.

```bash
pnpm dev                    # website
pnpm dev:site               # same as pnpm dev
pnpm dev:example:react
pnpm dev:example:vue
pnpm dev:example:svelte
pnpm dev:example:solid
pnpm dev:example:webcomponent
```

All examples share the same interaction: choose an animation and preview `/pets/frieren/spritesheet.webp`.

## Tests

```bash
pnpm test
```

The test command typechecks every workspace, builds every package and example, then runs Node tests against the published package entrypoints and shared example assets.
