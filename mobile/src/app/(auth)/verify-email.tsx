import { useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores';

function MailIcon() {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.envelope}>
        <View style={styles.envelopeBody} />
        <View style={styles.envelopeFlap} />
      </View>
      <View style={styles.alertDot} />
    </View>
  );
}

export default function VerifyEmailScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If not authenticated, there's nothing to verify — send back to auth landing
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)');
    }
  }, [isAuthenticated, router]);

  const handleSignOut = useCallback(async () => {
    await logout();
    router.replace('/(auth)');
  }, [logout, router]);

  const handleVerified = useCallback(() => {
    // Placeholder: in the future this would check verification status
    // For now, just go to tabs
    router.replace('/(tabs)/catalogue');
  }, [router]);

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <View style={styles.root}>
        <View style={styles.content}>
          <MailIcon />
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            Tap the link we sent to your email.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            onPress={handleVerified}
            title="I've verified my email"
            variant="primary"
          />
          <Button
            onPress={handleSignOut}
            title="Sign out"
            variant="secondary"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  iconContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  envelope: {
    width: 40,
    height: 28,
    borderWidth: 2,
    borderColor: '#050505',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  envelopeBody: {
    position: 'absolute',
    width: 26,
    height: 2,
    backgroundColor: '#050505',
    top: 10,
  },
  envelopeFlap: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#050505',
    top: 2,
  },
  alertDot: {
    position: 'absolute',
    top: 6,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#eb5757',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#050505',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8F9198',
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: 280,
    lineHeight: 20,
  },
  actions: {
    gap: Spacing.three,
    paddingTop: Spacing.four,
  },
});
