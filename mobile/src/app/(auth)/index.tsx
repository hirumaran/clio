import { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores';

export default function AuthLandingScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect authenticated users away from auth landing
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/catalogue');
    }
  }, [isAuthenticated, router]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.root}>
          {/* Upper brand area */}
          <View style={styles.brandArea}>
            <View style={styles.brandMark}>
              <View style={styles.brandDot} />
              <Text style={styles.brandText}>Skēnē</Text>
            </View>
          </View>

          {/* Bottom dark auth panel */}
          <View style={styles.panel}>
            <View style={styles.panelInner}>
              <Button
                disabled
                onPress={() => {}}
                size="compact"
                title="Continue with Apple"
                variant="light"
              />
              <Button
                disabled
                onPress={() => {}}
                size="compact"
                title="Continue with Google"
                variant="dark"
              />
              <Button
                onPress={() => router.push('/register')}
                size="compact"
                title="Sign up with email"
                variant="dark"
              />
              <Button
                onPress={() => router.push('/login')}
                size="compact"
                title="Log in"
                variant="outline"
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  brandArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMark: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6B1E2E',
  },
  brandText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#050505',
    letterSpacing: -0.5,
  },
  panel: {
    backgroundColor: '#080808',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  panelInner: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
});
