import { createEffect, createMemo, createSignal, onCleanup, onMount, type JSX } from 'solid-js';
import {
  defaultFrameInterval,
  getCodexPetAnimation,
  getCodexPetStyleVars,
  resolvePetSpritesheet,
  type CodexPetAnimations,
  type CodexPetAtlas,
  type CodexPetManifest,
} from '@petx/core';

export type PetXProps = {
  src?: string;
  pet?: CodexPetManifest;
  manifestUrl?: string;
  animation?: string;
  frame?: number;
  playing?: boolean;
  frameInterval?: number;
  atlas?: Partial<CodexPetAtlas>;
  animations?: CodexPetAnimations;
  size?: number | string;
  offsetX?: number | string;
  offsetY?: number | string;
  class?: string;
  title?: string;
};

export type CodexPetProps = PetXProps;

export function PetX(props: PetXProps): HTMLSpanElement {
  const [currentFrame, setCurrentFrame] = createSignal(props.frame ?? 0);
  const element = document.createElement('span');
  const animationName = createMemo(() => props.animation ?? 'idle');
  const animationConfig = createMemo(() => getCodexPetAnimation(animationName(), props.animations));
  const spriteSrc = createMemo(() => props.src ?? (props.pet ? resolvePetSpritesheet(props.pet, props.manifestUrl) : undefined));

  createEffect(() => {
    if (props.frame !== undefined) {
      setCurrentFrame(props.frame);
    }
  });

  createEffect(() => {
    if (props.playing === false || props.frame !== undefined || typeof window === 'undefined') {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentFrame((value) => (value + 1) % animationConfig().frames);
    }, props.frameInterval ?? animationConfig().frameInterval ?? defaultFrameInterval);

    onCleanup(() => window.clearInterval(timer));
  });

  const styleVars = createMemo(
    () =>
      getCodexPetStyleVars({
        src: spriteSrc(),
        animation: animationName(),
        frame: currentFrame(),
        size: props.size,
        offsetX: props.offsetX,
        offsetY: props.offsetY,
        atlas: props.atlas,
        animations: props.animations,
      }) as JSX.CSSProperties,
  );

  onMount(() => {
    createEffect(() => {
      element.className = ['codex-pet', props.class].filter(Boolean).join(' ');
      element.dataset.animation = animationName();

      if (props.title) {
        element.setAttribute('role', 'img');
        element.setAttribute('aria-label', props.title);
        element.removeAttribute('aria-hidden');
      } else {
        element.removeAttribute('role');
        element.removeAttribute('aria-label');
        element.setAttribute('aria-hidden', 'true');
      }

      for (const [key, value] of Object.entries(styleVars())) {
        if (value === undefined) {
          element.style.removeProperty(key);
        } else {
          element.style.setProperty(key, value);
        }
      }
    });
  });

  return element;
}

export const CodexPet = PetX;

export type { CodexPetAnimations, CodexPetAtlas, CodexPetManifest };
