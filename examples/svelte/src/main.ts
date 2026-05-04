import { mount } from 'svelte';
import App from './App.svelte';
import '@petx/svelte/styles.css';
import '../../shared.css';

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
