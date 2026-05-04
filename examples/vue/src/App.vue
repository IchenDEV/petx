<script setup lang="ts">
import { ref } from 'vue';
import { PetX } from '@petx/vue';

const animations = ['idle', 'runningRight', 'runningLeft', 'waving', 'jumping', 'failed', 'waiting', 'running', 'review'];
const animation = ref('idle');
</script>

<template>
  <main class="example-page">
    <header class="example-header">
      <div>
        <h1>Vue</h1>
        <p>Use the Vue component with a Codex pet spritesheet.</p>
      </div>
    </header>
    <section class="example-toolbar" aria-label="Pet controls">
      <label>
        Animation
        <select v-model="animation">
          <option v-for="item in animations" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>
    </section>
    <section class="example-stage">
      <PetX src="/pets/frieren/spritesheet.webp" :animation="animation" :size="240" title="Frieren pet" />
    </section>
    <pre class="example-code">npm run dev:example:vue</pre>
  </main>
</template>
