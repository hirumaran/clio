import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SemanticColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores';

function ProfileRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.rowLabel}>
        {label}
      </ThemedText>
      <ThemedText type="small" style={[{ color: theme.text }, styles.rowValue]}>
        {value}
      </ThemedText>
    </View>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleLogout = useCallback(async () => {
    await logout();
    // Router will naturally redirect because auth state changes and tabs layout guards it,
    // but explicit replace avoids any intermediate render.
    router.replace('/(auth)/login');
  }, [logout, router]);

  if (!user) {
    return (
      <Screen edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Profile</ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Not signed in.
        </ThemedText>
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['top']}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Profile</ThemedText>
      </View>

      <Card style={styles.accountCard}>
        <View style={styles.accountHeader}>
          <Avatar name={user.name} size={56} />
          <View style={styles.accountMeta}>
            <ThemedText type="default" style={{ fontSize: 18, fontWeight: 700 }}>
              {user.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {user.email}
            </ThemedText>
          </View>
        </View>

        <View style={styles.details}>
          {user.role ? (
            <View style={styles.row}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.rowLabel}>
                Role
              </ThemedText>
              <Badge label={user.role} tone="accent" />
            </View>
          ) : null}

          {user.schoolName || user.school ? (
            <ProfileRow label="School" value={user.schoolName || user.school || ''} />
          ) : null}

          <ProfileRow label="Member since" value={new Date(user.joinedAt).toLocaleDateString()} />
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          loading={isLoading}
          onPress={handleLogout}
          title="Sign out"
          variant="secondary"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  accountCard: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  accountMeta: {
    flex: 1,
    gap: Spacing.half,
  },
  details: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontWeight: 500,
  },
  rowValue: {
    fontWeight: 600,
    textAlign: 'right',
    flexShrink: 1,
  },
  actions: {
    paddingTop: Spacing.four,
  },
});
