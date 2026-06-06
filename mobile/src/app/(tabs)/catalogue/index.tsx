import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Spacing } from '@/constants/theme';

export default function CatalogueScreen() {
  return (
    <Screen scroll edges={['top']}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Catalogue</ThemedText>
      </View>
      <EmptyState title="Catalogue coming next" subtitle="Browse and search theatre resources from your network." />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
});
