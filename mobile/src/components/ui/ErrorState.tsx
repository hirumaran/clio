import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { Spacing } from '@/constants/theme';

interface ErrorStateProps extends ViewProps {
  message: string;
}

export function ErrorState({ message, style, ...rest }: ErrorStateProps) {
  return (
    <View style={[styles.container, style]} {...rest}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    backgroundColor: 'rgba(180,35,24,0.08)',
    borderRadius: Spacing.two,
  },
  text: {
    color: '#b42318',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
});
