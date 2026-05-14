# @petx/react-native

React Native renderer for animated Codex pet spritesheets.

```bash
npm i @petx/react-native
```

Remote spritesheet:

```tsx
import { PetX } from '@petx/react-native';

export function Preview() {
  return (
    <PetX
      src="https://example.com/pets/frieren/spritesheet.webp"
      animation="idle"
      size={192}
      title="Frieren Codex pet"
    />
  );
}
```

Bundled app asset:

```tsx
import { PetX } from '@petx/react-native';

export function Preview() {
  return (
    <PetX
      source={require('./assets/pets/frieren/spritesheet.webp')}
      animation="waving"
      size={192}
      title="Frieren Codex pet"
    />
  );
}
```

Use `animation`, `frame`, `playing`, `frameInterval`, `atlas`, `animations`, `offsetX`, and `offsetY` to tune playback and alignment.
