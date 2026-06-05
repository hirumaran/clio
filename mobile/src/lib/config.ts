/**
 * Platform-agnostic config.
 *
 * React Native: there is no Vite / import.meta.env, so values are NOT picked
 * up automatically. Call setConfig() at app startup (before the auth store
 * is imported) with the values appropriate for the build (dev / staging /
 * prod). See src/stores/index.ts for the boot wiring.
 */

export interface AppConfig {
  matrixHomeserverUrl: string
  apiBaseUrl: string
}

let config: AppConfig = {
  matrixHomeserverUrl: '',
  apiBaseUrl: 'http://localhost:3000/api/v1',
}

export function setConfig(overrides: Partial<AppConfig>) {
  config = { ...config, ...overrides }
}

export function getConfig(): AppConfig {
  return config
}
