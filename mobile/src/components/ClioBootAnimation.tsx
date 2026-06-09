import { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type ClioBootAnimationProps = {
  onFinish: () => void;
};

const { width } = Dimensions.get('window');

const DOT = 13;
const GAP = 9;
const CELL = DOT + GAP;

type DotPoint = {
  x: number;
  y: number;
  delay: number;
};

function makeDots(
  points: [number, number][],
  baseDelay: number,
  stepDelay: number
): DotPoint[] {
  return points.map(([x, y], index) => ({
    x,
    y,
    delay: baseDelay + index * stepDelay,
  }));
}

const CLIO_DOTS: DotPoint[] = [
  ...makeDots(
    [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 1],
      [4, 3],
      [1, 4],
      [2, 4],
      [3, 4],
    ],
    260,
    18
  ),
  ...makeDots(
    [
      [6, 0],
      [7, 0],
      [8, 0],
      [8, 1],
      [8, 2],
      [8, 3],
      [6, 4],
      [7, 4],
      [8, 4],
      [9, 4],
      [10, 4],
    ],
    430,
    18
  ),
  ...makeDots(
    [
      [12, 2],
      [13, 2],
      [14, 1],
      [14, 2],
      [14, 3],
      [12, 4],
      [13, 4],
      [14, 4],
      [15, 4],
    ],
    610,
    20
  ),
  ...makeDots(
    [
      [18, 1],
      [19, 1],
      [20, 1],
      [17, 2],
      [21, 2],
      [17, 3],
      [21, 3],
      [18, 4],
      [19, 4],
      [20, 4],
    ],
    820,
    18
  ),
  {
    x: 14,
    y: -1,
    delay: 1120,
  },
];

function AnimatedDot({ point }: { point: DotPoint }) {
  const progress = useSharedValue(0);
  const bounce = useSharedValue(0);
  const isIDot = point.x === 14 && point.y === -1;

  useEffect(() => {
    progress.value = withDelay(
      point.delay,
      withSpring(1, {
        damping: 10,
        stiffness: 185,
      })
    );

    if (isIDot) {
      bounce.value = withDelay(
        point.delay + 100,
        withSequence(
          withTiming(-11, {
            duration: 110,
            easing: Easing.out(Easing.quad),
          }),
          withSpring(0, {
            damping: 7,
            stiffness: 190,
          })
        )
      );
    }
  }, [bounce, isIDot, point.delay, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        scale: interpolate(progress.value, [0, 1], [0.15, 1]),
      },
      {
        translateY: bounce.value,
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.logoDot,
        {
          left: point.x * CELL,
          top: point.y * CELL,
        },
        animatedStyle,
      ]}
    />
  );
}

export function ClioBootAnimation({ onFinish }: ClioBootAnimationProps) {
  const singleDotScale = useSharedValue(0);
  const singleDotOpacity = useSharedValue(1);
  const logoScale = useSharedValue(0.96);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    singleDotScale.value = withSequence(
      withSpring(1, {
        damping: 9,
        stiffness: 180,
      }),
      withDelay(
        220,
        withTiming(0, {
          duration: 160,
          easing: Easing.out(Easing.quad),
        })
      )
    );

    singleDotOpacity.value = withDelay(
      330,
      withTiming(0, {
        duration: 120,
      })
    );

    logoScale.value = withDelay(
      780,
      withSpring(1, {
        damping: 13,
        stiffness: 120,
      })
    );

    screenOpacity.value = withDelay(
      1620,
      withTiming(0, {
        duration: 320,
        easing: Easing.out(Easing.quad),
      })
    );

    const timer = setTimeout(() => {
      onFinish();
    }, 1980);

    return () => clearTimeout(timer);
  }, [logoScale, onFinish, screenOpacity, singleDotOpacity, singleDotScale]);

  const singleDotStyle = useAnimatedStyle(() => ({
    opacity: singleDotOpacity.value,
    transform: [{ scale: singleDotScale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const logoWidth = 22 * CELL;
  const logoHeight = 6 * CELL;

  return (
    <Animated.View style={[styles.screen, screenStyle]}>
      <Animated.View style={[styles.singleDot, singleDotStyle]} />

      <Animated.View
        style={[
          styles.logoWrap,
          {
            width: logoWidth,
            height: logoHeight,
            left: width / 2 - logoWidth / 2,
          },
          logoStyle,
        ]}
      >
        {CLIO_DOTS.map((point, index) => (
          <AnimatedDot key={`${point.x}-${point.y}-${index}`} point={point} />
        ))}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flex: 1,
    justifyContent: 'center',
    zIndex: 9999,
  },
  singleDot: {
    backgroundColor: '#000000',
    borderRadius: 8,
    height: 16,
    width: 16,
  },
  logoWrap: {
    position: 'absolute',
    top: '43%',
  },
  logoDot: {
    backgroundColor: '#000000',
    borderRadius: DOT / 2,
    height: DOT,
    position: 'absolute',
    width: DOT,
  },
});
