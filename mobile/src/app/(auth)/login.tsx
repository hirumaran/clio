import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores';

export default function LoginScreen() {
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
      style={styles.flex}
    >
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.root}>
          <View style={styles.header}>
            <View style={styles.brandMark}>
              <View style={styles.brandDot} />
              <Text style={styles.brandText}>Skēnē</Text>
            </View>
            <Text style={styles.subtitle}>Sign in</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              inputMode="email"
              keyboardType="email-address"
              onChangeText={(value) => {
                setEmail(value);
                setLocalError(null);
                clearError();
              }}
              placeholder="Email"
              placeholderTextColor="#8F9198"
              returnKeyType="next"
              textContentType="emailAddress"
              value={email}
            />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              onChangeText={(value) => {
                setPassword(value);
                setLocalError(null);
                clearError();
              }}
              onSubmitEditing={handleLogin}
              placeholder="Password"
              placeholderTextColor="#8F9198"
              returnKeyType="go"
              secureTextEntry
              textContentType="password"
              value={password}
            />

            {errorText ? (
              <Text style={styles.errorText}>{errorText}</Text>
            ) : null}

            <Button
              loading={isLoading}
              onPress={handleLogin}
              title="Sign in"
              variant="primary"
            />
          </View>

          <Pressable
            onPress={() => router.back()}
            style={styles.backLink}
          >
            <Text style={styles.backLinkText}>← Back to sign in options</Text>
          </Pressable>
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    gap: Spacing.five,
  },
  header: {
    gap: Spacing.three,
    alignItems: 'center',
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
  subtitle: {
    fontSize: 15,
    color: '#8F9198',
    fontWeight: '500',
  },
  form: {
    gap: Spacing.three,
  },
  errorText: {
    color: '#b42318',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  backLink: {
    alignItems: 'center',
    paddingTop: Spacing.two,
  },
  backLinkText: {
    fontSize: 14,
    color: '#8F9198',
    fontWeight: '500',
  },
});
