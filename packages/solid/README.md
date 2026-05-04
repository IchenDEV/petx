# @petx/solid

SolidJS renderer for animated Codex pet spritesheets.

```bash
npm i @petx/solid
```

```tsx
import { PetX } from '@petx/solid';
import '@petx/solid/styles.css';

export function Preview() {
  return <PetX src="/pets/frieren/spritesheet.webp" animation="review" size={192} />;
}
```

Use `animation`, `frame`, `playing`, `frameInterval`, `atlas`, `animations`, `offsetX`, and `offsetY` to tune playback and alignment.
