# @petx/react

React renderer for animated Codex pet spritesheets.

```bash
npm i @petx/react
```

```tsx
import { PetX } from '@petx/react';
import '@petx/react/styles.css';

export function Preview() {
  return <PetX src="/pets/frieren/spritesheet.webp" animation="idle" size={192} />;
}
```

Use `animation`, `frame`, `playing`, `frameInterval`, `atlas`, `animations`, `offsetX`, and `offsetY` to tune playback and alignment.
