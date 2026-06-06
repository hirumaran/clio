import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SemanticColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundMap: Record<ButtonVariant, string> = {
    primary: SemanticColors.accent,
    secondary: theme.backgroundElement,
    ghost: 'transparent',
    danger: SemanticColors.danger,
  };

  const textMap: Record<ButtonVariant, string> = {
    primary: '#ffffff',
    secondary: theme.text,
    ghost: SemanticColors.accent,
    danger: '#ffffff',
  };

  const borderMap: Record<ButtonVariant, string | undefined> = {
    primary: undefined,
    secondary: theme.backgroundSelected,
    ghost: undefined,
    danger: undefined,
  };

  const bg = backgroundMap[variant];
  const color = textMap[variant];
  const border = borderMap[variant];

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => {
        const dynamicStyles: (import('react-native').ViewStyle | false | null | undefined)[] = [
          styles.base,
          { backgroundColor: bg },
          border ? { borderWidth: StyleSheet.hairlineWidth, borderColor: border } : null,
          (isDisabled || pressed) && styles.dimmed,
        ];
        if (style && typeof style !== 'function') {
          dynamicStyles.push(style as import('react-native').ViewStyle);
        }
        return dynamicStyles.filter(Boolean) as import('react-native').ViewStyle[];
      }}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <ThemedText type="smallBold" style={[styles.text, { color }]}>
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: Spacing.two,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: Spacing.three,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  dimmed: {
    opacity: 0.55,
  },
});
