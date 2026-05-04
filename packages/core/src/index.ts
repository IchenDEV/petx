export type CodexPetAnimationName =
  | 'idle'
  | 'runningRight'
  | 'runningLeft'
  | 'waving'
  | 'jumping'
  | 'failed'
  | 'waiting'
  | 'sleeping'
  | 'review'
  | 'running';

export type CodexPetManifest = {
  id: string;
  displayName: string;
  description?: string;
  spritesheetPath: string;
};

export type CodexPetAnimation = {
  row: number;
  frames: number;
  frameInterval?: number;
};

export type CodexPetAnimations = Record<string, CodexPetAnimation>;

export type CodexPetAtlas = {
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
};

export type CodexPetFrame = {
  animation: string;
  row: number;
  frame: number;
  frameWidth: number;
  frameHeight: number;
  backgroundWidth: number;
  backgroundHeight: number;
  backgroundPositionX: number;
  backgroundPositionY: number;
};

export type CodexPetStyleVars = Record<string, string | undefined>;

export const defaultCodexPetAtlas: CodexPetAtlas = {
  frameWidth: 192,
  frameHeight: 208,
  columns: 8,
  rows: 9,
};

export const defaultCodexPetAnimations: Record<CodexPetAnimationName, CodexPetAnimation> = {
  idle: { row: 0, frames: 6, frameInterval: 160 },
  runningRight: { row: 1, frames: 8, frameInterval: 120 },
  runningLeft: { row: 2, frames: 8, frameInterval: 120 },
  waving: { row: 3, frames: 4, frameInterval: 140 },
  jumping: { row: 4, frames: 5, frameInterval: 140 },
  failed: { row: 5, frames: 8, frameInterval: 140 },
  waiting: { row: 6, frames: 6, frameInterval: 150 },
  sleeping: { row: 6, frames: 6, frameInterval: 150 },
  running: { row: 7, frames: 6, frameInterval: 120 },
  review: { row: 8, frames: 6, frameInterval: 150 },
};

export const defaultFrameInterval = 140;

export function getCodexPetAnimation(
  animation: string,
  animations: CodexPetAnimations = defaultCodexPetAnimations,
): CodexPetAnimation {
  return animations[animation] ?? defaultCodexPetAnimations.idle;
}

export function getCodexPetFrame(options: {
  animation?: string;
  frame?: number;
  atlas?: Partial<CodexPetAtlas>;
  animations?: CodexPetAnimations;
}): CodexPetFrame {
  const atlas = { ...defaultCodexPetAtlas, ...options.atlas };
  const animationName = options.animation ?? 'idle';
  const animation = getCodexPetAnimation(animationName, options.animations);
  const safeFrame = Math.max(0, Math.floor(options.frame ?? 0)) % animation.frames;

  return {
    animation: animationName,
    row: animation.row,
    frame: safeFrame,
    frameWidth: atlas.frameWidth,
    frameHeight: atlas.frameHeight,
    backgroundWidth: atlas.frameWidth * atlas.columns,
    backgroundHeight: atlas.frameHeight * atlas.rows,
    backgroundPositionX: safeFrame * -atlas.frameWidth,
    backgroundPositionY: animation.row * -atlas.frameHeight,
  };
}

export function getCodexPetStyleVars(options: {
  src?: string;
  animation?: string;
  frame?: number;
  size?: number | string;
  offsetX?: number | string;
  offsetY?: number | string;
  atlas?: Partial<CodexPetAtlas>;
  animations?: CodexPetAnimations;
}): CodexPetStyleVars {
  const frame = getCodexPetFrame(options);
  const displayWidth = options.size
    ? typeof options.size === 'number'
      ? `${options.size}px`
      : options.size
    : `${frame.frameWidth}px`;
  const displayHeight = options.size
    ? typeof options.size === 'number'
      ? `${(options.size * frame.frameHeight) / frame.frameWidth}px`
      : `calc(${options.size} * ${frame.frameHeight / frame.frameWidth})`
    : `${frame.frameHeight}px`;
  const scale = getScale(options.size, frame.frameWidth);

  return {
    '--codex-pet-src': options.src ? `url("${options.src}")` : undefined,
    '--codex-pet-frame-width': `${frame.frameWidth}px`,
    '--codex-pet-frame-height': `${frame.frameHeight}px`,
    '--codex-pet-display-width': displayWidth,
    '--codex-pet-display-height': displayHeight,
    '--codex-pet-background-width': `${frame.backgroundWidth}px`,
    '--codex-pet-background-height': `${frame.backgroundHeight}px`,
    '--codex-pet-x': `${frame.backgroundPositionX}px`,
    '--codex-pet-y': `${frame.backgroundPositionY}px`,
    '--codex-pet-offset-x': formatCssLength(options.offsetX, scale),
    '--codex-pet-offset-y': formatCssLength(options.offsetY, scale),
    '--codex-pet-scale': `${scale}`,
  };
}

export function getCodexPetCssText(vars: CodexPetStyleVars): string {
  return Object.entries(vars)
    .filter((entry): entry is [string, string] => entry[1] !== undefined)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
}

export function resolvePetSpritesheet(manifest: CodexPetManifest, manifestUrl?: string): string {
  if (isAbsoluteUrl(manifest.spritesheetPath) || manifest.spritesheetPath.startsWith('/')) {
    return manifest.spritesheetPath;
  }

  if (!manifestUrl) {
    return manifest.spritesheetPath;
  }

  if (isAbsoluteUrl(manifestUrl)) {
    return new URL(manifest.spritesheetPath, manifestUrl).toString();
  }

  return resolveRelativeUrl(manifest.spritesheetPath, manifestUrl);
}

function isAbsoluteUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function resolveRelativeUrl(value: string, baseUrl: string): string {
  const baseDirectory = baseUrl.endsWith('/') ? baseUrl : baseUrl.slice(0, baseUrl.lastIndexOf('/') + 1);
  const keepsLeadingSlash = baseUrl.startsWith('/');
  const parts = `${baseDirectory}${value}`.split('/');
  const normalized: string[] = [];

  for (const part of parts) {
    if (!part || part === '.') {
      continue;
    }

    if (part === '..') {
      normalized.pop();
      continue;
    }

    normalized.push(part);
  }

  return `${keepsLeadingSlash ? '/' : ''}${normalized.join('/')}`;
}

function formatCssLength(value: number | string | undefined, scale: number): string {
  if (value === undefined) {
    return '0px';
  }

  return typeof value === 'number' ? `${value * scale}px` : value;
}

function getScale(size: number | string | undefined, frameWidth: number): number {
  if (typeof size === 'number') {
    return size / frameWidth;
  }

  if (typeof size === 'string' && size.endsWith('px')) {
    const parsed = Number(size.slice(0, -2));
    return Number.isFinite(parsed) ? parsed / frameWidth : 1;
  }

  return 1;
}
