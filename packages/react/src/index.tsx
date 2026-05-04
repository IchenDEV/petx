import { useEffect, useMemo, useState } from 'react';
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
  className?: string;
  title?: string;
};

export type CodexPetProps = PetXProps;

export function PetX({
  src,
  pet,
  manifestUrl,
  animation = 'idle',
  frame,
  playing = true,
  frameInterval,
  atlas,
  animations,
  size,
  offsetX,
  offsetY,
  className,
  title,
}: PetXProps) {
  const resolvedSrc = src ?? (pet ? resolvePetSpritesheet(pet, manifestUrl) : undefined);
  const animationConfig = useMemo(() => getCodexPetAnimation(animation, animations), [animation, animations]);
  const [currentFrame, setCurrentFrame] = useState(frame ?? 0);

  useEffect(() => {
    if (frame !== undefined) {
      setCurrentFrame(frame);
    }
  }, [frame]);

  useEffect(() => {
    if (!playing || frame !== undefined) {
      return undefined;
    }

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCurrentFrame((value) => (value + 1) % animationConfig.frames);
    }, frameInterval ?? animationConfig.frameInterval ?? defaultFrameInterval);

    return () => window.clearInterval(timer);
  }, [animationConfig, frame, frameInterval, playing]);

  const style = getCodexPetStyleVars({
    src: resolvedSrc,
    animation,
    frame: currentFrame,
    size,
    offsetX,
    offsetY,
    atlas,
    animations,
  }) as React.CSSProperties;

  return (
    <span
      className={['codex-pet', className].filter(Boolean).join(' ')}
      data-animation={animation}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={style}
    />
  );
}

export const CodexPet = PetX;

export type { CodexPetAnimations, CodexPetAtlas, CodexPetManifest };
