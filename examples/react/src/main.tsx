import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PetX } from '@petx/react';
import '@petx/react/styles.css';
import './site.css';

const animations = ['idle', 'runningRight', 'runningLeft', 'waving', 'jumping', 'failed', 'waiting', 'running', 'review'];

const atlasLabels: Record<number, string> = {
  0: 'idle',
  8: 'runRight',
  16: 'runLeft',
  24: 'waving',
  32: 'jumping',
  40: 'failed',
  48: 'waiting',
  56: 'running',
  64: 'review',
};

const frameworks = [
  { name: 'React', pkg: '@petx/react', command: 'npm i @petx/react' },
  { name: 'Vue', pkg: '@petx/vue', command: 'npm i @petx/vue' },
  { name: 'Svelte', pkg: '@petx/svelte', command: 'npm i @petx/svelte' },
  { name: 'SolidJS', pkg: '@petx/solid', command: 'npm i @petx/solid' },
  { name: 'Web Component', pkg: '@petx/webcomponent', command: 'npm i @petx/webcomponent' },
];

const pets = ['frieren', 'jobs', 'trumpet'];
const aiGuideUrl = 'https://github.com/IchenDEV/petx/blob/main/docs/AI_AGENT_INTEGRATION.md';
const codexPetsDocsUrl = 'https://developers.openai.com/codex/app/settings#codex-pets';
const assetPath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

const props = [
  {
    name: 'src',
    type: 'string',
    defaultValue: '-',
    description: {
      en: 'Spritesheet URL. Usually `/pets/<id>/spritesheet.webp`.',
      zh: 'Spritesheet 地址，通常是 `/pets/<id>/spritesheet.webp`。',
    },
  },
  {
    name: 'pet',
    type: 'CodexPetManifest',
    defaultValue: '-',
    description: {
      en: 'Optional manifest object with `spritesheetPath`.',
      zh: '可选的 pet manifest 对象，里面包含 `spritesheetPath`。',
    },
  },
  {
    name: 'manifestUrl',
    type: 'string',
    defaultValue: '-',
    description: {
      en: 'Base URL for resolving a relative manifest spritesheet path.',
      zh: '用于解析 manifest 里相对 spritesheet 路径的基准 URL。',
    },
  },
  {
    name: 'animation',
    type: 'string',
    defaultValue: 'idle',
    description: {
      en: 'Animation key. Defaults are idle, runningRight, runningLeft, waving, jumping, failed, waiting, running, review.',
      zh: '动画名称。内置值包括 idle、runningRight、runningLeft、waving、jumping、failed、waiting、running、review。',
    },
  },
  {
    name: 'frame',
    type: 'number',
    defaultValue: '-',
    description: {
      en: 'Pin a single frame. Omit it to animate.',
      zh: '固定到某一帧；不传时按动画播放。',
    },
  },
  {
    name: 'playing',
    type: 'boolean',
    defaultValue: 'true',
    description: {
      en: 'Pause or resume the interval animation.',
      zh: '暂停或继续按间隔播放动画。',
    },
  },
  {
    name: 'frameInterval',
    type: 'number',
    defaultValue: '140',
    description: {
      en: 'Milliseconds between frames.',
      zh: '每帧之间的毫秒间隔。',
    },
  },
  {
    name: 'size',
    type: 'number | string',
    defaultValue: '192',
    description: {
      en: 'Rendered width. Height keeps the 192:208 frame ratio.',
      zh: '渲染宽度，高度会保持 192:208 的帧比例。',
    },
  },
  {
    name: 'offsetX / offsetY',
    type: 'number | string',
    defaultValue: '0',
    description: {
      en: 'Move the visible sprite inside its frame when transparent padding is uneven.',
      zh: '透明边距不均匀时，用它调整角色在帧里的位置。',
    },
  },
  {
    name: 'atlas',
    type: 'Partial<CodexPetAtlas>',
    defaultValue: '192x208, 8x9',
    description: {
      en: 'Override frame size, columns, or rows.',
      zh: '覆盖帧尺寸、列数或行数。',
    },
  },
  {
    name: 'animations',
    type: 'CodexPetAnimations',
    defaultValue: 'built-in map',
    description: {
      en: 'Override row and frame count for custom atlas layouts.',
      zh: '给自定义 atlas 覆盖动画行号和帧数。',
    },
  },
  {
    name: 'title',
    type: 'string',
    defaultValue: '-',
    description: {
      en: 'Accessible label. Without it the sprite is hidden from screen readers.',
      zh: '无障碍标签。不传时，角色会对屏幕阅读器隐藏。',
    },
  },
];

type FrameworkName = 'React' | 'Vue' | 'Svelte' | 'Solid' | 'Web Component';
type Locale = 'en' | 'zh';
type HighlightToken = {
  text: string;
  kind?: 'comment' | 'string' | 'keyword' | 'tag' | 'attribute' | 'number' | 'function' | 'operator';
};

const quickstartFrameworks: Array<{ value: FrameworkName; label: string }> = [
  { value: 'React', label: 'React' },
  { value: 'Vue', label: 'Vue' },
  { value: 'Svelte', label: 'Svelte' },
  { value: 'Solid', label: 'SolidJS' },
  { value: 'Web Component', label: 'Web Component' },
];

const quickstartByFramework: Record<FrameworkName, { install: string; importCode: string; usageCode: string }> = {
  React: {
    install: 'npm i @petx/react',
    importCode: "import { PetX } from '@petx/react';\nimport '@petx/react/styles.css';",
    usageCode: '<PetX src="/pets/frieren/spritesheet.webp" animation="idle" />',
  },
  Vue: {
    install: 'npm i @petx/vue',
    importCode: "import { PetX } from '@petx/vue';\nimport '@petx/vue/styles.css';",
    usageCode: '<PetX src="/pets/frieren/spritesheet.webp" animation="idle" />',
  },
  Svelte: {
    install: 'npm i @petx/svelte',
    importCode: "import PetX from '@petx/svelte';\nimport '@petx/svelte/styles.css';",
    usageCode: '<PetX src="/pets/frieren/spritesheet.webp" animation="idle" />',
  },
  Solid: {
    install: 'npm i @petx/solid',
    importCode: "import { PetX } from '@petx/solid';\nimport '@petx/solid/styles.css';",
    usageCode: '<PetX src="/pets/frieren/spritesheet.webp" animation="idle" />',
  },
  'Web Component': {
    install: 'npm i @petx/webcomponent',
    importCode: "import { definePetXElement } from '@petx/webcomponent';\n\ndefinePetXElement();",
    usageCode: '<pet-x src="/pets/frieren/spritesheet.webp" animation="idle"></pet-x>',
  },
};

const content = {
  en: {
    navAria: 'Main navigation',
    brandAria: 'PetX home',
    nav: {
      quickstart: 'Quickstart',
      playground: 'Playground',
      props: 'Props',
      atlas: 'Atlas',
    },
    install: 'Install',
    themeLight: 'Light',
    themeDark: 'Dark',
    languageLabel: 'Language',
    heroTitle: 'Render Codex pets anywhere.',
    heroBody:
      'PetX turns the Codex pet atlas into framework-native components for React, Vue, Svelte, SolidJS, and plain Web Components.',
    aiInstallPrompt:
      'Ask your code agent: follow https://github.com/IchenDEV/petx/blob/main/docs/AI_AGENT_INTEGRATION.md to integrate PetX.',
    aiInstallGuide: 'AI integration guide',
    tryProps: 'Playground',
    buildPets: 'Build your own pets',
    quickstartTitle: 'Connect it in three steps.',
    quickstartBody: 'Install the package for your framework, import the CSS once, then pass a Codex pet spritesheet URL.',
    quickstartFrameworkLabel: 'Framework',
    steps: [
      {
        title: 'Install a target package',
        body: 'Each framework has its own entry. Apps only install the package they actually use.',
        code: 'npm i @petx/react',
      },
      {
        title: 'Import component and CSS',
        body: 'The CSS maps atlas frame coordinates into variables that every package can share.',
        code: "import '@petx/react/styles.css'",
      },
      {
        title: 'Pass a spritesheet',
        body: 'The default atlas is 8 x 9 with 192 x 208 pixels per frame.',
        code: 'src="/pets/frieren/spritesheet.webp"',
      },
    ],
    frameworksTitle: 'One sprite format. Five rendering targets.',
    frameworksBody: 'Use the same `spritesheet.webp` and `pet.json` across the front-end stack.',
    playgroundTitle: 'Play with the props, copy the code.',
    playgroundBody: 'The controls update the preview and code in real time, so developers can copy the exact integration.',
    codeTabsAria: 'Code examples',
    propsTitle: 'Every useful parameter is explicit.',
    propsBody: 'Defaults fit the current Codex pet format, while custom atlases, animation rows, and padding offsets stay configurable.',
    propsHead: {
      prop: 'Prop',
      type: 'Type',
      defaultValue: 'Default',
      use: 'Use',
    },
    atlasTitle: 'Built for the Codex pet atlas.',
    atlasBody:
      'PetX keeps frame math in `@petx/core`, then maps it into CSS variables for every framework package. Per-pet offsets handle transparent padding without changing atlas coordinates.',
    atlasAria: 'Codex pet atlas geometry',
    galleryTitle: 'Made for character galleries too.',
    galleryBody: 'The same component can render packs, previews, stores, docs, and desktop companion pickers.',
    demo: {
      aria: 'Interactive PetX demo',
      animation: 'Animation',
      size: 'Size',
      offsetX: 'Offset X',
      offsetY: 'Offset Y',
      frameInterval: 'Frame interval',
      playing: 'Playing',
      atlasFooter: '8 x 9 atlas',
      frameFooter: '192 x 208 frame',
      loopSuffix: 'ms loop',
      petTitle: 'Frieren Codex pet',
    },
  },
  zh: {
    navAria: '主导航',
    brandAria: 'PetX 首页',
    nav: {
      quickstart: '快速开始',
      playground: '调试台',
      props: '参数',
      atlas: '图集',
    },
    install: '安装',
    themeLight: '浅色',
    themeDark: '深色',
    languageLabel: '语言',
    heroTitle: '在任何前端里渲染 Codex 宠物。',
    heroBody: 'PetX 把 Codex pet atlas 变成 React、Vue、Svelte、SolidJS 和 Web Components 都能直接用的组件。',
    aiInstallPrompt: '告诉 code agent：参考 https://github.com/IchenDEV/petx/blob/main/docs/AI_AGENT_INTEGRATION.md 接入 PetX。',
    aiInstallGuide: 'AI 接入文档',
    tryProps: 'Playground',
    buildPets: '创建自己的宠物',
    quickstartTitle: '接入只要三步。',
    quickstartBody: '先安装对应框架包，再导入 CSS，最后传入 Codex pet 的 spritesheet 地址。',
    quickstartFrameworkLabel: '框架',
    steps: [
      {
        title: '安装目标框架包',
        body: '每个框架都有单独入口，应用只需要安装自己用的那一个。',
        code: 'npm i @petx/react',
      },
      {
        title: '导入组件和 CSS',
        body: 'CSS 把 atlas 帧坐标映射成变量，所有框架包都复用同一套渲染规则。',
        code: "import '@petx/react/styles.css'",
      },
      {
        title: '传入 spritesheet',
        body: '默认支持 8 x 9、单帧 192 x 208 的 Codex pet atlas。',
        code: 'src="/pets/frieren/spritesheet.webp"',
      },
    ],
    frameworksTitle: '一种 sprite 格式，五种渲染目标。',
    frameworksBody: '同一个 `spritesheet.webp` 和 `pet.json` 可以在整套前端技术栈里复用。',
    playgroundTitle: '调参数，看预览，复制代码。',
    playgroundBody: '这里的控件会实时更新预览和代码，开发者可以直接复制对应框架的写法。',
    codeTabsAria: '代码示例',
    propsTitle: '常用参数都直接暴露。',
    propsBody: '默认值适合当前 Codex pet 格式；特殊 atlas、特殊动画行、透明边距都可以配置。',
    propsHead: {
      prop: '属性',
      type: '类型',
      defaultValue: '默认值',
      use: '用途',
    },
    atlasTitle: '为 Codex pet atlas 设计。',
    atlasBody:
      'PetX 在 `@petx/core` 里处理帧计算，再把结果映射成各框架都能用的 CSS 变量。每个宠物可以单独配置偏移，处理透明边距带来的视觉位置问题。',
    atlasAria: 'Codex pet atlas 结构',
    galleryTitle: '也适合角色图库。',
    galleryBody: '同一个组件可以用于角色包、预览页、商店、文档和桌面伴侣选择器。',
    demo: {
      aria: 'PetX 交互示例',
      animation: '动画',
      size: '尺寸',
      offsetX: 'X 偏移',
      offsetY: 'Y 偏移',
      frameInterval: '帧间隔',
      playing: '播放',
      atlasFooter: '8 x 9 图集',
      frameFooter: '192 x 208 单帧',
      loopSuffix: 'ms 循环',
      petTitle: 'Frieren Codex 宠物',
    },
  },
} as const;

function codeFor(framework: FrameworkName, options: DemoOptions) {
  const shared = {
    animation: options.animation,
    size: options.size,
    offsetX: options.offsetX,
    offsetY: options.offsetY,
    frameInterval: options.frameInterval,
    playing: options.playing,
  };

  if (framework === 'Vue') {
    return `<script setup lang="ts">
import { PetX } from '@petx/vue';
import '@petx/vue/styles.css';
</script>

<template>
  <PetX
    src="/pets/frieren/spritesheet.webp"
    animation="${shared.animation}"
    :size="${shared.size}"
    :offset-x="${shared.offsetX}"
    :offset-y="${shared.offsetY}"
    :frame-interval="${shared.frameInterval}"
    :playing="${shared.playing}"
  />
</template>`;
  }

  if (framework === 'Svelte') {
    return `<script lang="ts">
  import PetX from '@petx/svelte';
  import '@petx/svelte/styles.css';
</script>

<PetX
  src="/pets/frieren/spritesheet.webp"
  animation="${shared.animation}"
  size={${shared.size}}
  offsetX={${shared.offsetX}}
  offsetY={${shared.offsetY}}
  frameInterval={${shared.frameInterval}}
  playing={${shared.playing}}
/>`;
  }

  if (framework === 'Solid') {
    return `import { PetX } from '@petx/solid';
import '@petx/solid/styles.css';

export function Preview() {
  return (
    <PetX
      src="/pets/frieren/spritesheet.webp"
      animation="${shared.animation}"
      size={${shared.size}}
      offsetX={${shared.offsetX}}
      offsetY={${shared.offsetY}}
      frameInterval={${shared.frameInterval}}
      playing={${shared.playing}}
    />
  );
}`;
  }

  if (framework === 'Web Component') {
    return `import { definePetXElement } from '@petx/webcomponent';

definePetXElement();

document.body.innerHTML = \`
  <pet-x
    src="/pets/frieren/spritesheet.webp"
    animation="${shared.animation}"
    size="${shared.size}"
    offset-x="${shared.offsetX}"
    offset-y="${shared.offsetY}"
    frame-interval="${shared.frameInterval}"
    playing="${shared.playing}"
  ></pet-x>
\`;`;
  }

  return `import { PetX } from '@petx/react';
import '@petx/react/styles.css';

export function Preview() {
  return (
    <PetX
      src="/pets/frieren/spritesheet.webp"
      animation="${shared.animation}"
      size={${shared.size}}
      offsetX={${shared.offsetX}}
      offsetY={${shared.offsetY}}
      frameInterval={${shared.frameInterval}}
      playing={${shared.playing}}
    />
  );
}`;
}

const highlightPattern =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|`(?:\\.|[^`])*`|'(?:\\.|[^'])*'|"(?:\\.|[^"])*"|<\/?[A-Z][A-Za-z0-9.-]*|<\/?[a-z][A-Za-z0-9.-]*|\b(?:import|from|export|function|return|const|let|var|if|else|document|body|innerHTML|true|false)\b|\b\d+\b|[A-Za-z_$][\w$-]*(?=\=)|[A-Za-z_$][\w$]*(?=\()|[{}()[\].,:;=<>/]+)/g;

function classifyHighlightToken(text: string, nextCharacter = ''): HighlightToken['kind'] {
  if (text.startsWith('//') || text.startsWith('/*')) {
    return 'comment';
  }

  if (text.startsWith('"') || text.startsWith("'") || text.startsWith('`')) {
    return 'string';
  }

  if (text.startsWith('<')) {
    return 'tag';
  }

  if (/^\d+$/.test(text)) {
    return 'number';
  }

  if (/^[{}()[\].,:;=<>/]+$/.test(text)) {
    return 'operator';
  }

  if (nextCharacter === '=') {
    return 'attribute';
  }

  if (
    [
      'import',
      'from',
      'export',
      'function',
      'return',
      'const',
      'let',
      'var',
      'if',
      'else',
      'document',
      'body',
      'innerHTML',
      'true',
      'false',
    ].includes(text)
  ) {
    return 'keyword';
  }

  if (/^[A-Za-z_$][\w$-]*$/.test(text) && text.includes('-')) {
    return 'attribute';
  }

  if (/^[A-Za-z_$][\w$]*$/.test(text)) {
    return 'function';
  }

  return undefined;
}

function tokenizeCode(code: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  let lastIndex = 0;

  for (const match of code.matchAll(highlightPattern)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      tokens.push({ text: code.slice(lastIndex, index) });
    }

    tokens.push({ text: match[0], kind: classifyHighlightToken(match[0], code[index + match[0].length]) });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < code.length) {
    tokens.push({ text: code.slice(lastIndex) });
  }

  return tokens;
}

function HighlightedCode({ code }: { code: string }) {
  const tokens = useMemo(() => tokenizeCode(code), [code]);

  return (
    <code>
      {tokens.map((token, index) =>
        token.kind ? (
          <span className={`token token-${token.kind}`} key={`${index}-${token.text}`}>
            {token.text}
          </span>
        ) : (
          <React.Fragment key={`${index}-${token.text}`}>{token.text}</React.Fragment>
        ),
      )}
    </code>
  );
}

function GitHubIcon() {
  return (
    <svg className="footer-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.19-3.37-1.19-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.64.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6c.85 0 1.7.11 2.5.34 1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
      />
    </svg>
  );
}

type DemoOptions = {
  animation: string;
  size: number;
  offsetX: number;
  offsetY: number;
  frameInterval: number;
  playing: boolean;
};

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [locale, setLocale] = useState<Locale>('en');
  const [demo, setDemo] = useState<DemoOptions>({
    animation: 'idle',
    size: 286,
    offsetX: 0,
    offsetY: 0,
    frameInterval: 140,
    playing: true,
  });
  const [quickstartFramework, setQuickstartFramework] = useState<FrameworkName>('React');
  const [framework, setFramework] = useState<FrameworkName>('React');
  const currentSnippet = useMemo(() => codeFor(framework, demo), [framework, demo]);
  const selectedQuickstart = quickstartByFramework[quickstartFramework];
  const quickstartCodes = [selectedQuickstart.install, selectedQuickstart.importCode, selectedQuickstart.usageCode];
  const t = content[locale];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.locale = locale;
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  }, [locale]);

  function updateDemo<K extends keyof DemoOptions>(key: K, value: DemoOptions[K]) {
    setDemo((current) => ({ ...current, [key]: value }));
  }

  return (
    <main>
      <nav className="site-nav" aria-label={t.navAria}>
        <a className="brand" href="#top" aria-label={t.brandAria}>
          <span className="brand-mark" aria-hidden="true" />
          <span>PetX</span>
        </a>
        <div className="nav-links">
          <a href="#quickstart">{t.nav.quickstart}</a>
          <a href="#playground">{t.nav.playground}</a>
          <a href="#props">{t.nav.props}</a>
          <a href="#atlas">{t.nav.atlas}</a>
        </div>
        <div className="nav-tools">
          <a className="nav-action" href="#install">
            {t.install}
          </a>
          <div className="language-toggle" role="group" aria-label={t.languageLabel}>
            <button
              type="button"
              className={locale === 'en' ? 'active' : ''}
              aria-pressed={locale === 'en'}
              onClick={() => setLocale('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={locale === 'zh' ? 'active' : ''}
              aria-pressed={locale === 'zh'}
              onClick={() => setLocale('zh')}
            >
              中文
            </button>
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? t.themeLight : t.themeDark}
          </button>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true">
          {Array.from({ length: 84 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
        <div className="hero-content">
          <h1>{t.heroTitle}</h1>
          <p>{t.heroBody}</p>
          <div className="hero-actions" id="install">
            <code>{t.aiInstallPrompt}</code>
            <a href={aiGuideUrl} target="_blank" rel="noreferrer">
              {t.aiInstallGuide}
            </a>
            <a href="#playground">{t.tryProps}</a>
            <a href={codexPetsDocsUrl} target="_blank" rel="noreferrer">
              {t.buildPets}
            </a>
          </div>
        </div>

        <PetPlayground demo={demo} labels={t.demo} onChange={updateDemo} compact />
      </section>

      <section className="quickstart" id="quickstart">
        <div className="section-heading quickstart-heading">
          <div>
            <h2>{t.quickstartTitle}</h2>
            <p>{t.quickstartBody}</p>
          </div>
          <label className="quickstart-picker" htmlFor="quickstart-framework">
            <span>{t.quickstartFrameworkLabel}</span>
            <select
              id="quickstart-framework"
              value={quickstartFramework}
              onChange={(event) => setQuickstartFramework(event.target.value as FrameworkName)}
            >
              {quickstartFrameworks.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="steps">
          {t.steps.map((step, index) => (
            <article key={step.title}>
              <span>{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <code>{quickstartCodes[index]}</code>
            </article>
          ))}
        </div>
      </section>

      <section className="frameworks" id="frameworks">
        <div className="section-heading">
          <h2>{t.frameworksTitle}</h2>
          <p>{t.frameworksBody}</p>
        </div>
        <div className="framework-grid">
          {frameworks.map((item) => (
            <article className="framework-row" key={item.pkg}>
              <div>
                <h3>{item.name}</h3>
                <p>{item.pkg}</p>
              </div>
              <code>{item.command}</code>
            </article>
          ))}
        </div>
      </section>

      <section className="playground-section" id="playground">
        <div className="section-heading">
          <h2>{t.playgroundTitle}</h2>
          <p>{t.playgroundBody}</p>
        </div>
        <div className="playground-layout">
          <PetPlayground demo={demo} labels={t.demo} onChange={updateDemo} />
          <div className="code-layout">
            <div className="snippet-tabs" role="tablist" aria-label={t.codeTabsAria}>
              {(['React', 'Vue', 'Svelte', 'Solid', 'Web Component'] as FrameworkName[]).map((item) => (
                <button key={item} className={framework === item ? 'active' : ''} onClick={() => setFramework(item)}>
                  {item}
                </button>
              ))}
            </div>
            <pre className="code-block">
              <HighlightedCode code={currentSnippet} />
            </pre>
          </div>
        </div>
      </section>

      <section className="props-section" id="props">
        <div className="section-heading">
          <h2>{t.propsTitle}</h2>
          <p>{t.propsBody}</p>
        </div>
        <div className="props-table">
          <div className="props-head">
            <span>{t.propsHead.prop}</span>
            <span>{t.propsHead.type}</span>
            <span>{t.propsHead.defaultValue}</span>
            <span>{t.propsHead.use}</span>
          </div>
          {props.map((prop) => (
            <div className="props-row" key={prop.name}>
              <code>{prop.name}</code>
              <span>{prop.type}</span>
              <span>{prop.defaultValue}</span>
              <p>{prop.description[locale]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="atlas" id="atlas">
        <div className="atlas-copy">
          <h2>{t.atlasTitle}</h2>
          <p>{t.atlasBody}</p>
        </div>
        <div className="atlas-board" aria-label={t.atlasAria}>
          <img src={assetPath('pets/frieren/spritesheet.webp')} alt="" aria-hidden="true" />
          <div className="atlas-grid" aria-hidden="true">
            {Array.from({ length: 72 }).map((_, index) => (
              <span key={index}>
                {atlasLabels[index] ? <span className="atlas-row-label">{atlasLabels[index]}</span> : null}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="gallery" id="gallery">
        <div className="section-heading">
          <h2>{t.galleryTitle}</h2>
          <p>{t.galleryBody}</p>
        </div>
        <div className="pet-strip">
          {pets.map((pet, index) => (
            <article key={pet}>
              <div className="pet-thumb">
                <PetX
                  src={assetPath(`pets/${pet}/spritesheet.webp`)}
                  animation={index % 2 === 0 ? 'idle' : 'waving'}
                  size={126}
                  offsetX={pet === 'frieren' ? 7 : 0}
                  offsetY={pet === 'frieren' ? 2 : 0}
                  title={`${pet} pet`}
                />
              </div>
              <span>{pet}</span>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <a className="footer-link" href="https://github.com/IchenDEV/petx" target="_blank" rel="noreferrer">
          <GitHubIcon />
          <span>GitHub</span>
        </a>
      </footer>
    </main>
  );
}

function PetPlayground({
  demo,
  labels,
  onChange,
  compact = false,
}: {
  demo: DemoOptions;
  labels: (typeof content)[Locale]['demo'];
  onChange: <K extends keyof DemoOptions>(key: K, value: DemoOptions[K]) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'hero-demo' : 'hero-demo playground-card'} aria-label={labels.aria}>
      <div className="demo-toolbar">
        <span>Frieren</span>
        <label>
          {labels.animation}
          <select value={demo.animation} onChange={(event) => onChange('animation', event.target.value)}>
            {animations.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="demo-stage">
        <div className="pet-preview-slot">
          <PetX
            src={assetPath('pets/frieren/spritesheet.webp')}
            animation={demo.animation}
            size={demo.size}
            offsetX={demo.offsetX}
            offsetY={demo.offsetY}
            frameInterval={demo.frameInterval}
            playing={demo.playing}
            title={labels.petTitle}
          />
        </div>
      </div>
      {!compact ? (
        <div className="demo-controls">
          <RangeControl label={labels.size} value={demo.size} min={96} max={360} step={1} onChange={(value) => onChange('size', value)} />
          <RangeControl label={labels.offsetX} value={demo.offsetX} min={-40} max={40} step={1} onChange={(value) => onChange('offsetX', value)} />
          <RangeControl label={labels.offsetY} value={demo.offsetY} min={-30} max={30} step={1} onChange={(value) => onChange('offsetY', value)} />
          <RangeControl
            label={labels.frameInterval}
            value={demo.frameInterval}
            min={60}
            max={420}
            step={10}
            suffix="ms"
            onChange={(value) => onChange('frameInterval', value)}
          />
          <label className="toggle-row">
            <span>{labels.playing}</span>
            <input type="checkbox" checked={demo.playing} onChange={(event) => onChange('playing', event.target.checked)} />
          </label>
        </div>
      ) : null}
      <div className="demo-footer">
        <span>{labels.atlasFooter}</span>
        <span>{labels.frameFooter}</span>
        <span>
          {demo.frameInterval}
          {labels.loopSuffix}
        </span>
      </div>
    </div>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  suffix = 'px',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="range-row">
      <span>
        {label}
        <strong>
          {value}
          {suffix}
        </strong>
      </span>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
