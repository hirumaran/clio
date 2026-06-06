import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

import { SemanticColors, Spacing } from '@/constants/theme';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'light'
  | 'dark'
  | 'outline';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  size?: 'default' | 'compact';
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  size = 'default',
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const backgroundMap: Record<ButtonVariant, string> = {
    primary: SemanticColors.accent,
    secondary: '#F0F0F3',
    ghost: 'transparent',
    danger: '#b42318',
    light: '#ffffff',
    dark: '#242424',
    outline: 'transparent',
  };

  const textMap: Record<ButtonVariant, string> = {
    primary: '#ffffff',
    secondary: '#000000',
    ghost: SemanticColors.accent,
    danger: '#ffffff',
    light: '#050505',
    dark: '#ffffff',
    outline: '#ffffff',
  };

  const borderMap: Record<ButtonVariant, string | undefined> = {
    primary: undefined,
    secondary: '#E0E1E6',
    ghost: undefined,
    danger: undefined,
    light: undefined,
    dark: undefined,
    outline: 'rgba(255,255,255,0.15)',
  };

  const bg = backgroundMap[variant];
  const color = textMap[variant];
  const border = borderMap[variant];

  const height = size === 'compact' ? 44 : 52;

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => {
        const dynamicStyles: (import('react-native').ViewStyle | false | null | undefined)[] = [
          styles.base,
          { backgroundColor: bg, minHeight: height },
          border ? { borderWidth: 1, borderColor: border } : null,
          (isDisabled || pressed) && styles.dimmed,
        ];
        if (style && typeof style !== 'function') {
          dynamicStyles.push(style as import('react-native').ViewStyle);
        }
        return dynamicStyles.filter(Boolean) as import('react-native').ViewStyle[];
      }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text
          style={[
            styles.text,
            { color, fontSize: size === 'compact' ? 14 : 16 },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: Spacing.two,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  text: {
    lineHeight: 20,
    fontWeight: '600',
  },
  dimmed: {
    opacity: 0.55,
  },
});
