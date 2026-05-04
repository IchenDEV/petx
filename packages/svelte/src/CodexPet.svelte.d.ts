import type { Component } from 'svelte';
import type { CodexPetAnimations, CodexPetAtlas, CodexPetManifest } from '@petx/core';

export type CodexPetProps = {
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
  title?: string;
};

declare const CodexPet: Component<CodexPetProps>;
export default CodexPet;
