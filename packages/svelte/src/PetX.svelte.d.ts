import type { Component } from 'svelte';
import type { CodexPetAnimations, CodexPetAtlas, CodexPetManifest } from '@petx/core';

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
  title?: string;
};

export type CodexPetProps = PetXProps;

declare const PetX: Component<PetXProps>;
export default PetX;
