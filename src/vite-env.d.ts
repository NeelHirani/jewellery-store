/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Supabase Configuration
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  
  // Admin Authentication
  readonly VITE_ADMIN_EMAIL: string
  readonly VITE_ADMIN_PASSWORD: string
  
  // Application Configuration
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENV: string
  
  // Security Configuration
  readonly VITE_SESSION_TIMEOUT: string
  readonly VITE_MAX_LOGIN_ATTEMPTS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
