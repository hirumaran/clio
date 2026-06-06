import {
  StyleSheet,
  TextInput as RNTextInput,
  Text,
  View,
  type TextInputProps as RNTextInputProps,
} from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextInputProps = RNTextInputProps & {
  label?: string;
  error?: string | null;
};

export function TextInput({ label, error, style, ...rest }: TextInputProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      ) : null}
      <RNTextInput
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            borderColor: error ? '#b42318' : theme.backgroundSelected,
            color: theme.text,
            backgroundColor: theme.backgroundElement,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text style={[styles.error, { color: '#b42318' }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.two,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 500,
  },
});
