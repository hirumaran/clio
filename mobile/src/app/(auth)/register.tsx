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

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const signup = useAuthStore((state) => state.signup);
  const clearError = useAuthStore((state) => state.clearError);
  const isLoading = useAuthStore((state) => state.isLoading);
  const storeError = useAuthStore((state) => state.error);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/catalogue');
    }
  }, [isAuthenticated, router]);

  const handleSignup = useCallback(async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setLocalError('Enter your first and last name.');
      return;
    }
    if (!email.trim()) {
      setLocalError('Enter your email address.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setLocalError(null);
    clearError();
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const didSignup = await signup(email.trim(), password, fullName);
    if (!didSignup) {
      // Keep form values so user can correct errors
    }
  }, [firstName, lastName, email, password, signup, clearError]);

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
              Create your account
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <TextInput
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isLoading}
                  label="First name"
                  onChangeText={(value) => {
                    setFirstName(value);
                    setLocalError(null);
                    clearError();
                  }}
                  placeholder="Jane"
                  returnKeyType="next"
                  textContentType="givenName"
                  value={firstName}
                />
              </View>
              <View style={styles.nameField}>
                <TextInput
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isLoading}
                  label="Last name"
                  onChangeText={(value) => {
                    setLastName(value);
                    setLocalError(null);
                    clearError();
                  }}
                  placeholder="Doe"
                  returnKeyType="next"
                  textContentType="familyName"
                  value={lastName}
                />
              </View>
            </View>

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
              onSubmitEditing={handleSignup}
              placeholder="••••••••"
              returnKeyType="go"
              secureTextEntry
              textContentType="newPassword"
              value={password}
            />

            {errorText ? (
              <ThemedText type="small" style={styles.errorText}>
                {errorText}
              </ThemedText>
            ) : null}

            <Button
              loading={isLoading}
              onPress={handleSignup}
              title="Create account"
              variant="primary"
            />
          </View>

          <View style={styles.footer}>
            <ThemedText type="small" themeColor="textSecondary">
              Already have an account?{' '}
            </ThemedText>
            <Link href="/login" asChild>
              <Pressable>
                <ThemedText type="small" style={{ color: SemanticColors.accent, fontWeight: '700' }}>
                  Sign in
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
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  nameField: {
    flex: 1,
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
