import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { SemanticColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type BadgeTone = 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'gold';

interface BadgeProps extends ViewProps {
  label: string;
  tone?: BadgeTone;
}

export function Badge({ label, tone = 'default', style, ...rest }: BadgeProps) {
  const theme = useTheme();

  const toneMap: Record<BadgeTone, { bg: string; text: string }> = {
    default: { bg: theme.backgroundSelected, text: theme.textSecondary },
    success: { bg: 'rgba(26,127,55,0.12)', text: SemanticColors.success },
    warning: { bg: 'rgba(179,89,0,0.12)', text: SemanticColors.warning },
    danger: { bg: 'rgba(180,35,24,0.12)', text: SemanticColors.danger },
    accent: { bg: 'rgba(107,30,46,0.12)', text: SemanticColors.accent },
    gold: { bg: 'rgba(201,168,76,0.15)', text: SemanticColors.gold },
  };

  const { bg, text } = toneMap[tone];

  return (
    <View
      style={[styles.badge, { backgroundColor: bg }, style]}
      {...rest}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  text: {
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 16,
  },
});
