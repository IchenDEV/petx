import { createSignal, For } from 'solid-js';
import { render } from 'solid-js/web';
import { PetX } from '@petx/solid';
import '@petx/solid/styles.css';
import '../../shared.css';

const animations = ['idle', 'runningRight', 'runningLeft', 'waving', 'jumping', 'failed', 'waiting', 'running', 'review'];

function App() {
  const [animation, setAnimation] = createSignal('idle');

  return (
    <main class="example-page">
      <header class="example-header">
        <div>
          <h1>SolidJS</h1>
          <p>Use the SolidJS component with a Codex pet spritesheet.</p>
        </div>
      </header>
      <section class="example-toolbar" aria-label="Pet controls">
        <label>
          Animation
          <select value={animation()} onInput={(event) => setAnimation(event.currentTarget.value)}>
            <For each={animations}>{(item) => <option value={item}>{item}</option>}</For>
          </select>
        </label>
      </section>
      <section class="example-stage">
        <PetX src="/pets/frieren/spritesheet.webp" animation={animation()} size={240} title="Frieren pet" />
      </section>
      <pre class="example-code">npm run dev:example:solid</pre>
    </main>
  );
}

render(() => <App />, document.getElementById('root')!);
