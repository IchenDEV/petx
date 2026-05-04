# @petx/vue

Vue renderer for animated Codex pet spritesheets.

```bash
npm i @petx/vue
```

```vue
<script setup lang="ts">
import { PetX } from '@petx/vue';
import '@petx/vue/styles.css';
</script>

<template>
  <PetX src="/pets/frieren/spritesheet.webp" animation="waving" :size="192" />
</template>
```

Use `animation`, `frame`, `playing`, `frameInterval`, `atlas`, `animations`, `offsetX`, and `offsetY` to tune playback and alignment.
