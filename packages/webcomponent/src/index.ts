import {
  defaultFrameInterval,
  getCodexPetAnimation,
  getCodexPetStyleVars,
  type CodexPetAnimations,
  type CodexPetAtlas,
} from '@petx/core';

const elementStyles = `
:host {
  display: inline-block;
  width: var(--codex-pet-display-width, 192px);
  height: var(--codex-pet-display-height, 208px);
  overflow: visible;
  vertical-align: middle;
}

.sprite {
  width: var(--codex-pet-frame-width, 192px);
  height: var(--codex-pet-frame-height, 208px);
  background-image: var(--codex-pet-src);
  background-position: var(--codex-pet-x, 0) var(--codex-pet-y, 0);
  background-repeat: no-repeat;
  background-size: var(--codex-pet-background-width, 1536px) var(--codex-pet-background-height, 1872px);
  image-rendering: auto;
  transform: translate(var(--codex-pet-offset-x, 0), var(--codex-pet-offset-y, 0)) scale(var(--codex-pet-scale, 1));
  transform-origin: top left;
}
`;

export class PetXElement extends HTMLElement {
  static observedAttributes = [
    'src',
    'animation',
    'frame',
    'playing',
    'frame-interval',
    'size',
    'offset-x',
    'offset-y',
    'title',
    'atlas',
    'animations',
  ];

  private currentFrame = 0;
  private timer: number | undefined;
  private sprite: HTMLSpanElement;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = elementStyles;
    this.sprite = document.createElement('span');
    this.sprite.className = 'sprite';
    root.append(style, this.sprite);
  }

  connectedCallback() {
    this.currentFrame = this.frame ?? 0;
    this.render();
    this.startTimer();
  }

  disconnectedCallback() {
    this.clearTimer();
  }

  attributeChangedCallback() {
    if (this.frame !== undefined) {
      this.currentFrame = this.frame;
    }

    this.render();
    this.startTimer();
  }

  get src(): string | undefined {
    return this.getAttribute('src') ?? undefined;
  }

  set src(value: string | undefined) {
    this.setOptionalAttribute('src', value);
  }

  get animation(): string {
    return this.getAttribute('animation') ?? 'idle';
  }

  set animation(value: string) {
    this.setAttribute('animation', value);
  }

  get frame(): number | undefined {
    return readNumber(this.getAttribute('frame'));
  }

  set frame(value: number | undefined) {
    this.setOptionalAttribute('frame', value);
  }

  get playing(): boolean {
    return this.getAttribute('playing') !== 'false';
  }

  set playing(value: boolean) {
    this.setAttribute('playing', String(value));
  }

  get frameInterval(): number | undefined {
    return readNumber(this.getAttribute('frame-interval'));
  }

  set frameInterval(value: number | undefined) {
    this.setOptionalAttribute('frame-interval', value);
  }

  get size(): number | string | undefined {
    const value = this.getAttribute('size');
    return readNumber(value) ?? value ?? undefined;
  }

  set size(value: number | string | undefined) {
    this.setOptionalAttribute('size', value);
  }

  get offsetX(): number | string | undefined {
    const value = this.getAttribute('offset-x');
    return readNumber(value) ?? value ?? undefined;
  }

  set offsetX(value: number | string | undefined) {
    this.setOptionalAttribute('offset-x', value);
  }

  get offsetY(): number | string | undefined {
    const value = this.getAttribute('offset-y');
    return readNumber(value) ?? value ?? undefined;
  }

  set offsetY(value: number | string | undefined) {
    this.setOptionalAttribute('offset-y', value);
  }

  get atlas(): Partial<CodexPetAtlas> | undefined {
    return readJsonAttribute<Partial<CodexPetAtlas>>(this.getAttribute('atlas'));
  }

  set atlas(value: Partial<CodexPetAtlas> | undefined) {
    this.setOptionalJsonAttribute('atlas', value);
  }

  get animations(): CodexPetAnimations | undefined {
    return readJsonAttribute<CodexPetAnimations>(this.getAttribute('animations'));
  }

  set animations(value: CodexPetAnimations | undefined) {
    this.setOptionalJsonAttribute('animations', value);
  }

  private render() {
    const vars = getCodexPetStyleVars({
      src: this.src,
      animation: this.animation,
      frame: this.currentFrame,
      size: this.size,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      atlas: this.atlas,
      animations: this.animations,
    });

    this.setAttribute('data-animation', this.animation);
    for (const [key, value] of Object.entries(vars)) {
      if (value === undefined) {
        this.style.removeProperty(key);
      } else {
        this.style.setProperty(key, value);
      }
    }

    const title = this.getAttribute('title');
    if (title) {
      this.sprite.setAttribute('role', 'img');
      this.sprite.setAttribute('aria-label', title);
      this.sprite.removeAttribute('aria-hidden');
    } else {
      this.sprite.removeAttribute('role');
      this.sprite.removeAttribute('aria-label');
      this.sprite.setAttribute('aria-hidden', 'true');
    }
  }

  private startTimer() {
    this.clearTimer();

    if (!this.isConnected || !this.playing || this.frame !== undefined) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const animation = getCodexPetAnimation(this.animation, this.animations);
    this.timer = window.setInterval(() => {
      this.currentFrame = (this.currentFrame + 1) % animation.frames;
      this.render();
    }, this.frameInterval ?? animation.frameInterval ?? defaultFrameInterval);
  }

  private clearTimer() {
    if (this.timer !== undefined) {
      window.clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private setOptionalAttribute(name: string, value: string | number | undefined) {
    if (value === undefined) {
      this.removeAttribute(name);
    } else {
      this.setAttribute(name, String(value));
    }
  }

  private setOptionalJsonAttribute(name: string, value: object | undefined) {
    if (value === undefined) {
      this.removeAttribute(name);
    } else {
      this.setAttribute(name, JSON.stringify(value));
    }
  }
}

export const CodexPetElement = PetXElement;

export function definePetXElement(tagName = 'pet-x') {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, PetXElement);
  }
}

export function defineCodexPetElement(tagName = 'codex-pet') {
  definePetXElement(tagName);
}

function readNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readJsonAttribute<T>(value: string | null): T | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}
