import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Rect } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

type IntroBootAnimationProps = {
  isBackdrop?: boolean;
  onFinish: () => void;
};

type Pixel = {
  hash: number;
  id: string;
  scan: number;
  size: number;
  x: number;
  y: number;
};

const TIMELINE_DURATION_MS = 2450;
const FADE_DELAY_MS = 1880;
const FADE_DURATION_MS = 420;
const BOOT_CELL_SIZE = 16;
const BOOT_REVEAL_OPACITY = 0.065;

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function smoothStep(value: number) {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
}

function hash2d(x: number, y: number) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function makePixels(width: number, height: number): Pixel[] {
  const cols = Math.ceil(width / BOOT_CELL_SIZE) + 1;
  const rows = Math.ceil(height / BOOT_CELL_SIZE) + 1;

  return Array.from({ length: rows * cols }, (_, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const x = col * BOOT_CELL_SIZE;
    const y = row * BOOT_CELL_SIZE;
    const noise = hash2d(col, row);

    return {
      hash: noise,
      id: `${col}-${row}`,
      scan: y / height,
      size: BOOT_CELL_SIZE * (0.54 + noise * 0.38),
      x,
      y,
    };
  });
}

export function IntroBootAnimation({
  isBackdrop = false,
  onFinish,
}: IntroBootAnimationProps) {
  const { height, width } = useWindowDimensions();
  const [frame, setFrame] = useState(0);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(0);
  const opacity = useSharedValue(1);
  const pixels = useMemo(() => makePixels(width, height), [height, width]);

  useEffect(() => {
    console.log('[intro-boot] mounted — starting native dither pixel boot');
    console.log('[intro-boot] native dither dimensions:', width, 'x', height);
    console.log('[intro-boot] native dither pixel count:', pixels.length);

    startTimeRef.current = Date.now();

    opacity.value = withDelay(
      FADE_DELAY_MS,
      withTiming(BOOT_REVEAL_OPACITY, {
        duration: FADE_DURATION_MS,
        easing: Easing.out(Easing.quad),
      })
    );

    const frameTimer = setInterval(() => {
      setProgress(clamp((Date.now() - startTimeRef.current) / 2200));
      setFrame((currentFrame) => {
        const nextFrame = currentFrame + 1;

        if (nextFrame === 1) {
          console.log('[intro-boot] native dither first frame');
        } else if (nextFrame === 15) {
          console.log('[intro-boot] native dither 15 frames');
        } else if (nextFrame === 30) {
          console.log('[intro-boot] native dither 30 frames');
        }

        return nextFrame;
      });
    }, 66);

    const finishTimer = setTimeout(() => {
      console.log('[intro-boot] finish timer fired — handing off');
      clearInterval(frameTimer);
      setProgress(1);
      onFinish();
    }, TIMELINE_DURATION_MS);

    return () => {
      console.log('[intro-boot] unmounting — clearing native dither timers');
      clearInterval(frameTimer);
      clearTimeout(finishTimer);
    };
  }, [height, onFinish, opacity, pixels.length, width]);

  useEffect(() => {
    return () => {
      console.log('[intro-boot] cleanup effect fired');
    };
  }, []);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: isBackdrop
      ? withTiming(1, {
          duration: 320,
          easing: Easing.out(Easing.quad),
        })
      : opacity.value,
  }));

  const arrival = smoothStep(progress / 0.36);
  const dissolve = smoothStep((progress - 0.62) / 0.32);
  const scanHead = 0.16 + arrival * 1.1;
  const jitterFrame = frame * 0.21;

  return (
    <Animated.View
      style={[
        styles.screen,
        isBackdrop ? styles.backdropScreen : null,
        screenStyle,
      ]}
    >
      <StatusBar style="dark" />
      <Svg
        height={height}
        pointerEvents="none"
        style={[styles.grid, isBackdrop ? styles.backdropGrid : null]}
        width={width}
      >
        {pixels.map((pixel) => {
          const temporalNoise = hash2d(
            Math.floor(pixel.x / BOOT_CELL_SIZE) + frame,
            Math.floor(pixel.y / BOOT_CELL_SIZE) - frame
          );
          const ripple =
            Math.sin(pixel.scan * 34 - jitterFrame * 7 + pixel.hash * 6) * 0.5 +
            0.5;
          const field =
            pixel.hash * 0.48 + temporalNoise * 0.32 + ripple * 0.2;
          const scanWake = smoothStep((scanHead - pixel.scan) / 0.24);
          const scanSpark = smoothStep(
            1 - Math.abs(pixel.scan - scanHead) / 0.08
          );
          const opening = Math.max(scanWake, scanSpark * 0.85);
          const breakup = pixel.hash * 0.72 + (1 - pixel.scan) * 0.28;
          const surviving = dissolve < breakup ? 1 : 0;
          const threshold = 0.58 - arrival * 0.18 + dissolve * 0.16;
          const visible = field > threshold && opening && surviving;
          const backdropField = pixel.hash * 0.72 + temporalNoise * 0.28;
          const backdropVisible = backdropField > 0.58;

          if (isBackdrop) {
            if (!backdropVisible) return null;
          } else if (!visible) return null;

          return (
            <Rect
              fill="#000000"
              height={pixel.size}
              key={pixel.id}
              opacity={
                isBackdrop
                  ? 0.025 + pixel.hash * 0.045
                  : 0.72 + pixel.hash * 0.28
              }
              width={pixel.size}
              x={pixel.x + (BOOT_CELL_SIZE - pixel.size) / 2}
              y={pixel.y + (BOOT_CELL_SIZE - pixel.size) / 2}
            />
          );
        })}
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#ffffff',
    bottom: 0,
    elevation: 1000,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  grid: {
    backgroundColor: '#ffffff',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  backdropScreen: {
    backgroundColor: 'transparent',
    bottom: '31%',
    elevation: 24,
    overflow: 'hidden',
    zIndex: 24,
  },
  backdropGrid: {
    backgroundColor: 'transparent',
  },
});
