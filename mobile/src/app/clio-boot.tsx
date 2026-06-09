import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ClioBootAnimation } from '@/components/ClioBootAnimation';
import {
  markFirstSignupBootSeen,
  shouldShowFirstSignupBoot,
} from '@/lib/firstSignupBoot';

const MAIN_APP_ROUTE = '/(tabs)/catalogue';

export default function ClioBootRoute() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkPermission() {
      try {
        const allowed = await shouldShowFirstSignupBoot();

        if (!mounted) return;

        if (allowed) {
          setIsAllowed(true);
          setIsChecking(false);
        } else {
          router.replace(MAIN_APP_ROUTE);
        }
      } catch {
        router.replace(MAIN_APP_ROUTE);
      }
    }

    void checkPermission();

    return () => {
      mounted = false;
    };
  }, []);

  const handleFinish = useCallback(async () => {
    try {
      await markFirstSignupBootSeen();
    } finally {
      router.replace(MAIN_APP_ROUTE);
    }
  }, []);

  if (isChecking || !isAllowed) {
    return <View style={styles.fallback} />;
  }

  return <ClioBootAnimation onFinish={handleFinish} />;
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
});
