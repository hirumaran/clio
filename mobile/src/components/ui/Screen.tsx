import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = ViewProps & {
  scroll?: boolean;
  keyboardAvoid?: boolean;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  children: React.ReactNode;
};

export function Screen({
  scroll = false,
  keyboardAvoid = true,
  edges = ['top', 'bottom'],
  children,
  style,
  ...rest
}: ScreenProps) {
  const theme = useTheme();

  const inner = (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );

  const withSafeArea = (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={edges}>
      {inner}
    </SafeAreaView>
  );

  const withScroll = scroll ? (
    <ScrollView
      style={[styles.flex, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {inner}
    </ScrollView>
  ) : (
    withSafeArea
  );

  if (keyboardAvoid && Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView
        behavior="padding"
        style={[styles.flex, { backgroundColor: theme.background }]}>
        {scroll ? withScroll : withSafeArea}
      </KeyboardAvoidingView>
    );
  }

  return scroll ? withScroll : withSafeArea;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.four,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
