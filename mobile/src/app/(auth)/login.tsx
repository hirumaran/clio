import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { SemanticColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const clearError = useAuthStore((state) => state.clearError);
  const isLoading = useAuthStore((state) => state.isLoading);
  const storeError = useAuthStore((state) => state.error);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect authenticated users away from login
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/catalogue');
    }
  }, [isAuthenticated, router]);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password) {
      setLocalError('Enter an email and password.');
      return;
    }

    setLocalError(null);
    clearError();
    const didLogin = await login(email.trim(), password);
    if (!didLogin) {
      setPassword('');
    }
  }, [email, password, login, clearError]);

  const errorText = localError || storeError;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.flex, { backgroundColor: theme.background }]}
    >
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <ThemedText type="title" style={{ textAlign: 'center' }}>
              Skēnē
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
              Sign in to your account
            </ThemedText>
          </View>

          <View style={styles.form}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              inputMode="email"
              keyboardType="email-address"
              label="Email"
              onChangeText={(value) => {
                setEmail(value);
                setLocalError(null);
                clearError();
              }}
              placeholder="you@school.edu"
              returnKeyType="next"
              textContentType="emailAddress"
              value={email}
            />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              label="Password"
              onChangeText={(value) => {
                setPassword(value);
                setLocalError(null);
                clearError();
              }}
              onSubmitEditing={handleLogin}
              placeholder="••••••••"
              returnKeyType="go"
              secureTextEntry
              textContentType="password"
              value={password}
            />

            {errorText ? (
              <ThemedText type="small" style={styles.errorText}>
                {errorText}
              </ThemedText>
            ) : null}

            <Button
              loading={isLoading}
              onPress={handleLogin}
              title="Sign in"
              variant="primary"
            />
          </View>

          <View style={styles.footer}>
            <ThemedText type="small" themeColor="textSecondary">
              Don&apos;t have an account?{' '}
            </ThemedText>
            <Link href="/register" asChild>
              <Pressable>
                <ThemedText type="small" style={{ color: SemanticColors.accent, fontWeight: '700' }}>
                  Sign up
                </ThemedText>
              </Pressable>
            </Link>
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
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  header: {
    gap: Spacing.two,
    alignItems: 'center',
  },
  form: {
    gap: Spacing.three,
  },
  errorText: {
    color: SemanticColors.danger,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.three,
  },
});
