import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { PetX as ReactPetX } from '@petx/react';
import { PetX as VuePetX } from '@petx/vue';

const spriteProps = {
  src: '/pets/frieren/spritesheet.webp',
  animation: 'runningRight',
  frame: 2,
  playing: false,
  size: 240,
  offsetX: 16,
  offsetY: 5,
  title: 'Frieren pet',
};

function assertRenderedPet(html) {
  assert.match(html, /class="codex-pet"/);
  assert.match(html, /data-animation="runningRight"/);
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="Frieren pet"/);
  assert.match(html, /--codex-pet-src:url\(&quot;\/pets\/frieren\/spritesheet\.webp&quot;\)/);
  assert.match(html, /--codex-pet-display-width:240px/);
  assert.match(html, /--codex-pet-display-height:260px/);
  assert.match(html, /--codex-pet-x:-384px/);
  assert.match(html, /--codex-pet-y:-208px/);
  assert.match(html, /--codex-pet-offset-x:20px/);
  assert.match(html, /--codex-pet-offset-y:6\.25px/);
}

test('React package renders the shared Codex pet contract', () => {
  const html = renderToStaticMarkup(React.createElement(ReactPetX, spriteProps));
  assertRenderedPet(html);
});

test('React Native package renders atlas frames through native View and Image primitives', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../packages/react-native/package.json', import.meta.url), 'utf8'));
  const entry = await readFile(new URL('../packages/react-native/dist/index.js', import.meta.url), 'utf8');
  const types = await readFile(new URL('../packages/react-native/dist/index.d.ts', import.meta.url), 'utf8');

  assert.equal(packageJson.name, '@petx/react-native');
  assert.equal(packageJson.peerDependencies['react-native'], '>=0.73');
  assert.equal(packageJson.sideEffects, false);
  assert.match(entry, /from ['"]react-native['"]/);
  assert.match(entry, /getCodexPetFrame/);
  assert.match(entry, /resizeMode: "stretch"/);
  assert.match(types, /source\?: ImageSourcePropType/);
  assert.match(types, /size\?: number/);
});

test('Vue package renders the shared Codex pet contract', async () => {
  const html = await renderToString(h(VuePetX, spriteProps));
  assertRenderedPet(html);
});

test('Solid package exposes the component and stylesheet for app bundlers', async () => {
  const solid = await import('@petx/solid');
  assert.equal(typeof solid.PetX, 'function');
  assert.equal(solid.CodexPet, solid.PetX);

  const css = await readFile(new URL('../packages/solid/dist/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.codex-pet/);
  assert.match(css, /background-image: var\(--codex-pet-src\)/);
});

test('Svelte package exposes a Svelte entry and shared stylesheet for app bundlers', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../packages/svelte/package.json', import.meta.url), 'utf8'));
  const component = await readFile(new URL('../packages/svelte/dist/PetX.svelte', import.meta.url), 'utf8');
  const entry = await readFile(new URL('../packages/svelte/dist/index.js', import.meta.url), 'utf8');
  const css = await readFile(new URL('../packages/svelte/dist/styles.css', import.meta.url), 'utf8');

  assert.equal(packageJson.exports['.'].svelte, './dist/PetX.svelte');
  assert.match(entry, /as PetX/);
  assert.match(entry, /as CodexPet/);
  assert.match(component, /class="codex-pet"/);
  assert.match(component, /getCodexPetStyleVars/);
  assert.match(css, /\.codex-pet/);
  assert.match(css, /background-image: var\(--codex-pet-src\)/);
});

test('Web Component package defines an element that applies the shared Codex pet variables', async () => {
  installDomStub();
  const { CodexPetElement, PetXElement, defineCodexPetElement, definePetXElement } = await import('@petx/webcomponent');

  definePetXElement('test-pet-x');
  assert.equal(globalThis.customElements.get('test-pet-x'), PetXElement);
  assert.equal(PetXElement, CodexPetElement);
  defineCodexPetElement('test-codex-pet');
  assert.equal(globalThis.customElements.get('test-codex-pet'), PetXElement);

  const element = new PetXElement();
  element.setAttribute('src', '/pets/frieren/spritesheet.webp');
  element.setAttribute('animation', 'runningRight');
  element.setAttribute('frame', '2');
  element.setAttribute('size', '240');
  element.setAttribute('offset-x', '16');
  element.setAttribute('offset-y', '5');
  element.setAttribute('title', 'Frieren pet');
  element.connectedCallback();

  assert.equal(element.getAttribute('data-animation'), 'runningRight');
  assert.equal(element.style.getPropertyValue('--codex-pet-src'), 'url("/pets/frieren/spritesheet.webp")');
  assert.equal(element.style.getPropertyValue('--codex-pet-display-width'), '240px');
  assert.equal(element.style.getPropertyValue('--codex-pet-display-height'), '260px');
  assert.equal(element.style.getPropertyValue('--codex-pet-x'), '-384px');
  assert.equal(element.style.getPropertyValue('--codex-pet-y'), '-208px');

  const sprite = element.shadowRoot.children.find((child) => child.className === 'sprite');
  assert.equal(sprite.getAttribute('role'), 'img');
  assert.equal(sprite.getAttribute('aria-label'), 'Frieren pet');
});

function installDomStub() {
  class FakeStyle {
    values = new Map();

    setProperty(name, value) {
      this.values.set(name, String(value));
    }

    removeProperty(name) {
      this.values.delete(name);
    }

    getPropertyValue(name) {
      return this.values.get(name) ?? '';
    }
  }

  class FakeElement {
    attributes = new Map();
    children = [];
    className = '';
    style = new FakeStyle();

    attachShadow() {
      this.shadowRoot = new FakeElement();
      return this.shadowRoot;
    }

    append(...children) {
      this.children.push(...children);
    }

    setAttribute(name, value) {
      this.attributes.set(name, String(value));
    }

    getAttribute(name) {
      return this.attributes.get(name) ?? null;
    }

    removeAttribute(name) {
      this.attributes.delete(name);
    }

    get isConnected() {
      return true;
    }
  }

  globalThis.HTMLElement = FakeElement;
  globalThis.document = {
    createElement() {
      return new FakeElement();
    },
  };
  globalThis.customElements = {
    registry: new Map(),
    define(name, element) {
      this.registry.set(name, element);
    },
    get(name) {
      return this.registry.get(name);
    },
  };
  globalThis.window = {
    matchMedia() {
      return { matches: true };
    },
    setInterval() {
      return 1;
    },
    clearInterval() {},
  };
}
