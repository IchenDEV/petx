# @petx/core

Shared frame math, animation defaults, manifest helpers, and CSS variable builders for Codex pet atlases.

```bash
npm i @petx/core
```

```ts
import { getCodexPetStyleVars, resolvePetSpritesheet } from '@petx/core';

const src = resolvePetSpritesheet(pet, '/pets/frieren/pet.json');
const style = getCodexPetStyleVars({ src, animation: 'idle', size: 192 });
```

The default atlas is 8 columns by 9 rows with 192 x 208 px frames.
