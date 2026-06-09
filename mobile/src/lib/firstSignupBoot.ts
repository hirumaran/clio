import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_SIGNUP_BOOT_PENDING_KEY = 'clio:firstSignupBootPending';
const HAS_SEEN_SIGNUP_BOOT_KEY = 'clio:hasSeenSignupBoot';

export async function markFirstSignupBootPending() {
  await AsyncStorage.setItem(FIRST_SIGNUP_BOOT_PENDING_KEY, 'true');
}

export async function shouldShowFirstSignupBoot() {
  const pending = await AsyncStorage.getItem(FIRST_SIGNUP_BOOT_PENDING_KEY);
  const alreadySeen = await AsyncStorage.getItem(HAS_SEEN_SIGNUP_BOOT_KEY);

  return pending === 'true' && alreadySeen !== 'true';
}

export async function markFirstSignupBootSeen() {
  await AsyncStorage.setItem(HAS_SEEN_SIGNUP_BOOT_KEY, 'true');
  await AsyncStorage.removeItem(FIRST_SIGNUP_BOOT_PENDING_KEY);
}

export async function clearFirstSignupBootPending() {
  await AsyncStorage.removeItem(FIRST_SIGNUP_BOOT_PENDING_KEY);
}
