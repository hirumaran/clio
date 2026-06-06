import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { LoadingState } from '@/components/ui/LoadingState';
import { SemanticColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores';

function TabLabel({ title, focused }: { title: string; focused: boolean }) {
  return (
    <ThemedText
      type="small"
      style={{
        color: focused ? SemanticColors.accent : '#8F9198',
        fontWeight: focused ? 700 : 500,
        fontSize: 12,
      }}
    >
      {title}
    </ThemedText>
  );
}

export default function TabLayout() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const hasHydrated = useAuthStore.persist.hasHydrated();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!hasHydrated) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const isDark = scheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.backgroundSelected,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: Spacing.one,
          paddingBottom: Spacing.two,
          height: 64,
        },
        tabBarActiveTintColor: SemanticColors.accent,
        tabBarInactiveTintColor: isDark ? '#6C6F76' : '#8F9198',
      }}
    >
      <Tabs.Screen
        name="catalogue"
        options={{
          title: 'Catalogue',
          tabBarLabel: ({ focused }) => (
            <TabLabel title="Catalogue" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarLabel: ({ focused }) => (
            <TabLabel title="Requests" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: ({ focused }) => (
            <TabLabel title="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
