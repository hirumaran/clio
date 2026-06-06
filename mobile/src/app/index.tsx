import { useCallback, useEffect, useState } from 'react';
import { Redirect } from 'expo-router';

import { LoadingState } from '@/components/ui/LoadingState';
import { useAuthStore } from '@/stores';

export default function Index() {
  const hasHydrated = useAuthStore.persist.hasHydrated();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [showLoading, setShowLoading] = useState(!hasHydrated);

  // Small grace period so we never flicker the loading spinner away instantly
  useEffect(() => {
    if (hasHydrated) {
      const t = setTimeout(() => setShowLoading(false), 250);
      return () => clearTimeout(t);
    }
  }, [hasHydrated]);

  if (showLoading || !hasHydrated) {
    return <LoadingState message="Starting up..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/catalogue" />;
}
