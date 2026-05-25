export function getEnv(key, fallback = '') {
  return import.meta.env[key] ?? fallback
}

export const baseApi = getEnv('VITE_APP_BASE_API')
