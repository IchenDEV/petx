<script lang="ts">
  import { onDestroy } from 'svelte';
  import {
    defaultFrameInterval,
    getCodexPetAnimation,
    getCodexPetCssText,
    getCodexPetStyleVars,
    resolvePetSpritesheet,
    type CodexPetAnimations,
    type CodexPetAtlas,
    type CodexPetManifest,
  } from '@petx/core';

  export let src: string | undefined = undefined;
  export let pet: CodexPetManifest | undefined = undefined;
  export let manifestUrl: string | undefined = undefined;
  export let animation = 'idle';
  export let frame: number | undefined = undefined;
  export let playing = true;
  export let frameInterval: number | undefined = undefined;
  export let atlas: Partial<CodexPetAtlas> | undefined = undefined;
  export let animations: CodexPetAnimations | undefined = undefined;
  export let size: number | string | undefined = undefined;
  export let offsetX: number | string | undefined = undefined;
  export let offsetY: number | string | undefined = undefined;
  export let title: string | undefined = undefined;

  let currentFrame = frame ?? 0;
  let timer: ReturnType<typeof window.setInterval> | undefined;

  $: spriteSrc = src ?? (pet ? resolvePetSpritesheet(pet, manifestUrl) : undefined);
  $: animationConfig = getCodexPetAnimation(animation, animations);
  $: if (frame !== undefined) {
    currentFrame = frame;
  }
  $: styleText = getCodexPetCssText(
    getCodexPetStyleVars({
      src: spriteSrc,
      animation,
      frame: currentFrame,
      size,
      offsetX,
      offsetY,
      atlas,
      animations,
    }),
  );
  $: restartTimer(animation, playing, frame, frameInterval, animations);

  function restartTimer(
    animationName: string,
    shouldPlay: boolean,
    fixedFrame: number | undefined,
    interval: number | undefined,
    animationMap: CodexPetAnimations | undefined,
  ) {
    clearTimer();

    if (!shouldPlay || fixedFrame !== undefined || typeof window === 'undefined') {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const config = getCodexPetAnimation(animationName, animationMap);
    timer = window.setInterval(() => {
      currentFrame = (currentFrame + 1) % config.frames;
    }, interval ?? config.frameInterval ?? defaultFrameInterval);
  }

  function clearTimer() {
    if (timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
    }
  }

  onDestroy(() => clearTimer());
</script>

<span
  class="codex-pet"
  data-animation={animation}
  role={title ? 'img' : undefined}
  aria-label={title}
  aria-hidden={title ? undefined : 'true'}
  style={styleText}
></span>
