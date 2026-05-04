import { definePetXElement } from '@petx/webcomponent';
import '../../shared.css';

definePetXElement();

const animations = ['idle', 'runningRight', 'runningLeft', 'waving', 'jumping', 'failed', 'waiting', 'running', 'review'];

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="example-page">
    <header class="example-header">
      <div>
        <h1>Web Component</h1>
        <p>Use the custom element in plain HTML.</p>
      </div>
    </header>
    <section class="example-toolbar" aria-label="Pet controls">
      <label>
        Animation
        <select id="animation">
          ${animations.map((item) => `<option value="${item}">${item}</option>`).join('')}
        </select>
      </label>
    </section>
    <section class="example-stage">
      <pet-x src="/pets/frieren/spritesheet.webp" animation="idle" size="240" title="Frieren pet"></pet-x>
    </section>
    <pre class="example-code">npm run dev:example:webcomponent</pre>
  </main>
`;

const select = document.querySelector<HTMLSelectElement>('#animation')!;
const pet = document.querySelector('pet-x')!;

select.addEventListener('input', () => {
  pet.setAttribute('animation', select.value);
});
