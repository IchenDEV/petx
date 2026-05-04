<script lang="ts">
  import PetX from '@petx/svelte';

  const animations = ['idle', 'runningRight', 'runningLeft', 'waving', 'jumping', 'failed', 'waiting', 'running', 'review'];
  let animation = $state('idle');
</script>

<main class="example-page">
  <header class="example-header">
    <div>
      <h1>Svelte</h1>
      <p>Use the Svelte component with a Codex pet spritesheet.</p>
    </div>
  </header>
  <section class="example-toolbar" aria-label="Pet controls">
    <label>
      Animation
      <select bind:value={animation}>
        {#each animations as item}
          <option value={item}>{item}</option>
        {/each}
      </select>
    </label>
  </section>
  <section class="example-stage">
    <PetX src="/pets/frieren/spritesheet.webp" {animation} size={240} title="Frieren pet" />
  </section>
  <pre class="example-code">npm run dev:example:svelte</pre>
</main>
