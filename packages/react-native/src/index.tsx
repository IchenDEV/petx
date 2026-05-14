import { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  defaultFrameInterval,
  getCodexPetAnimation,
  getCodexPetFrame,
  resolvePetSpritesheet,
  type CodexPetAnimations,
  type CodexPetAtlas,
  type CodexPetManifest,
} from '@petx/core';

export type PetXProps = {
  source?: ImageSourcePropType;
  src?: string;
  pet?: CodexPetManifest;
  manifestUrl?: string;
  animation?: string;
  frame?: number;
  playing?: boolean;
  frameInterval?: number;
  atlas?: Partial<CodexPetAtlas>;
  animations?: CodexPetAnimations;
  size?: number;
  offsetX?: number;
  offsetY?: number;
  title?: string;
  style?: StyleProp<ViewStyle>;
  frameStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  testID?: string;
  respectReduceMotion?: boolean;
};

export type CodexPetProps = PetXProps;

export function PetX({
  source,
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
  offsetX = 0,
  offsetY = 0,
  title,
  style,
  frameStyle,
  imageStyle,
  testID,
  respectReduceMotion = true,
}: PetXProps) {
  const resolvedSrc = src ?? (pet ? resolvePetSpritesheet(pet, manifestUrl) : undefined);
  const imageSource = source ?? (resolvedSrc ? { uri: resolvedSrc } : undefined);
  const animationConfig = useMemo(() => getCodexPetAnimation(animation, animations), [animation, animations]);
  const [currentFrame, setCurrentFrame] = useState(frame ?? 0);
  const reduceMotion = useReduceMotion(respectReduceMotion);

  useEffect(() => {
    if (frame !== undefined) {
      setCurrentFrame(frame);
    }
  }, [frame]);

  useEffect(() => {
    if (!playing || frame !== undefined || reduceMotion) {
      return undefined;
    }

    const timer = setInterval(() => {
      setCurrentFrame((value) => (value + 1) % animationConfig.frames);
    }, frameInterval ?? animationConfig.frameInterval ?? defaultFrameInterval);

    return () => clearInterval(timer);
  }, [animationConfig, frame, frameInterval, playing, reduceMotion]);

  const spriteFrame = getCodexPetFrame({
    animation,
    frame: currentFrame,
    atlas,
    animations,
  });
  const scale = (size ?? spriteFrame.frameWidth) / spriteFrame.frameWidth;
  const displayWidth = spriteFrame.frameWidth * scale;
  const displayHeight = spriteFrame.frameHeight * scale;

  return (
    <View
      accessible={Boolean(title)}
      accessibilityLabel={title}
      accessibilityRole={title ? 'image' : undefined}
      importantForAccessibility={title ? 'auto' : 'no-hide-descendants'}
      testID={testID}
      style={[styles.root, { width: displayWidth, height: displayHeight }, style]}
    >
      <View
        style={[
          styles.frame,
          {
            width: displayWidth,
            height: displayHeight,
            transform: [{ translateX: offsetX * scale }, { translateY: offsetY * scale }],
          },
          frameStyle,
        ]}
      >
        {imageSource ? (
          <Image
            source={imageSource}
            resizeMode="stretch"
            style={[
              styles.image,
              {
                left: spriteFrame.backgroundPositionX * scale,
                top: spriteFrame.backgroundPositionY * scale,
                width: spriteFrame.backgroundWidth * scale,
                height: spriteFrame.backgroundHeight * scale,
              },
              imageStyle,
            ]}
          />
        ) : null}
      </View>
    </View>
  );
}

export const CodexPet = PetX;

export type { CodexPetAnimations, CodexPetAtlas, CodexPetManifest, ImageSourcePropType };

function useReduceMotion(enabled: boolean): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setReduceMotion(false);
      return undefined;
    }

    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) {
          setReduceMotion(value);
        }
      })
      .catch(() => {
        if (mounted) {
          setReduceMotion(false);
        }
      });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [enabled]);

  return reduceMotion;
}

const styles = StyleSheet.create({
  root: {
    overflow: 'visible',
  },
  frame: {
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
  },
});
