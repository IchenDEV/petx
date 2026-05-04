# @petx/svelte

Svelte renderer for animated Codex pet spritesheets.

```bash
npm i @petx/svelte
```

```svelte
<script lang="ts">
  import PetX from '@petx/svelte';
  import '@petx/svelte/styles.css';
</script>

<PetX src="/pets/frieren/spritesheet.webp" animation="jumping" size={192} />
```

Use `animation`, `frame`, `playing`, `frameInterval`, `atlas`, `animations`, `offsetX`, and `offsetY` to tune playback and alignment.
