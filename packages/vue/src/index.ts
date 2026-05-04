import { computed, defineComponent, h, onBeforeUnmount, ref, watch, type PropType } from 'vue';
import {
  defaultFrameInterval,
  getCodexPetAnimation,
  getCodexPetStyleVars,
  resolvePetSpritesheet,
  type CodexPetAnimations,
  type CodexPetAtlas,
  type CodexPetManifest,
} from '@petx/core';

export const PetX = defineComponent({
  name: 'PetX',
  props: {
    src: String,
    pet: Object as PropType<CodexPetManifest>,
    manifestUrl: String,
    animation: {
      type: String,
      default: 'idle',
    },
    frame: Number,
    playing: {
      type: Boolean,
      default: true,
    },
    frameInterval: Number,
    atlas: Object as PropType<Partial<CodexPetAtlas>>,
    animations: Object as PropType<CodexPetAnimations>,
    size: [Number, String] as PropType<number | string>,
    offsetX: [Number, String] as PropType<number | string>,
    offsetY: [Number, String] as PropType<number | string>,
    title: String,
  },
  setup(props, { attrs }) {
    const currentFrame = ref(props.frame ?? 0);
    let timer: number | undefined;

    const animationConfig = computed(() => getCodexPetAnimation(props.animation, props.animations));
    const spriteSrc = computed(() => props.src ?? (props.pet ? resolvePetSpritesheet(props.pet, props.manifestUrl) : undefined));
    const styleVars = computed(() =>
      getCodexPetStyleVars({
        src: spriteSrc.value,
        animation: props.animation,
        frame: currentFrame.value,
        size: props.size,
        offsetX: props.offsetX,
        offsetY: props.offsetY,
        atlas: props.atlas,
        animations: props.animations,
      }),
    );

    function clearTimer() {
      if (timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    }

    function startTimer() {
      clearTimer();

      if (!props.playing || props.frame !== undefined) {
        return;
      }

      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      timer = window.setInterval(() => {
        currentFrame.value = (currentFrame.value + 1) % animationConfig.value.frames;
      }, props.frameInterval ?? animationConfig.value.frameInterval ?? defaultFrameInterval);
    }

    watch(
      () => props.frame,
      (value) => {
        if (value !== undefined) {
          currentFrame.value = value;
        }
      },
      { immediate: true },
    );

    watch(
      [() => props.animation, () => props.playing, () => props.frameInterval, () => props.frame, animationConfig],
      () => startTimer(),
      { immediate: true },
    );

    onBeforeUnmount(() => clearTimer());

    return () => {
      return h('span', {
        ...attrs,
        class: ['codex-pet', attrs.class],
        'data-animation': props.animation,
        role: props.title ? 'img' : undefined,
        'aria-label': props.title,
        'aria-hidden': props.title ? undefined : 'true',
        style: [attrs.style, styleVars.value],
      });
    };
  },
});

export const CodexPet = PetX;

export type { CodexPetAnimations, CodexPetAtlas, CodexPetManifest };
