# @petx/webcomponent

Framework-free Web Component renderer for animated Codex pet spritesheets.

```bash
npm i @petx/webcomponent
```

```ts
import { definePetXElement } from '@petx/webcomponent';

definePetXElement();
```

```html
<pet-x src="/pets/frieren/spritesheet.webp" animation="idle" size="192"></pet-x>
```

Use attributes like `animation`, `frame`, `playing`, `frame-interval`, `offset-x`, and `offset-y` to tune playback and alignment.
