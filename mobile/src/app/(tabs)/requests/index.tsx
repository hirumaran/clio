import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Spacing } from '@/constants/theme';

export default function RequestsScreen() {
  return (
    <Screen scroll edges={['top']}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Requests</ThemedText>
      </View>
      <EmptyState title="Requests coming next" subtitle="Track your borrow requests and approvals." />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
});
