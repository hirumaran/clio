import * as SecureStore from 'expo-secure-store';

/**
 * AuthStorageAdapter contract — must match the one expected by
 * src/stores/auth-store.ts. Mirrors the shape used by the web frontend so
 * the same Zustand `persist` storage factory works on both platforms.
 */
export interface AuthStorageAdapter {
  getItem: (key: string) => Promise<string | null> | string | null
  setItem: (key: string, value: string) => Promise<void> | void
  removeItem: (key: string) => Promise<void> | void
}

/**
 * SecureStore-backed adapter. Tokens never touch AsyncStorage / disk in
 * cleartext; SecureStore uses the iOS Keychain and Android Keystore.
 *
 * On web (where expo-secure-store is not available) this module should
 * not be loaded — `src/stores/index.ts` branches on `Platform.OS`.
 */
export const secureStoreAdapter: AuthStorageAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};
