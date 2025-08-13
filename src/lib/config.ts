/**
 * Environment Configuration Manager
 * Handles secure access to environment variables
 */

interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  admin: {
    email: string;
    password: string;
    name: string;
  };
  app: {
    name: string;
    version: string;
    environment: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
}

class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): AppConfig {
    return {
      supabase: {
        url: import.meta.env.VITE_SUPABASE_URL || '',
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      },
      admin: {
        email: import.meta.env.VITE_ADMIN_EMAIL || '',
        password: import.meta.env.VITE_ADMIN_PASSWORD || '',
        name: import.meta.env.VITE_ADMIN_NAME || 'Admin User',
      },
      app: {
        name: import.meta.env.VITE_APP_NAME || 'Jewel Mart',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        environment: import.meta.env.VITE_APP_ENV || 'development',
      },
      security: {
        sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600000'),
        maxLoginAttempts: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || '5'),
      },
    };
  }

  private validateConfig(): void {
    // Demo-friendly validation - minimal requirements for easy setup
    const warnings: string[] = [];

    if (!this.config.admin.email) {
      warnings.push('Demo credentials not configured - using defaults');
    }
    if (!this.config.admin.password) {
      warnings.push('Demo password not configured - using defaults');
    }

    if (warnings.length > 0) {
      console.warn('Demo configuration warnings:', warnings);
    }
  }

  // Demo-friendly configuration - strict validation methods removed for easier setup

  // Public getters for configuration values
  public getSupabaseConfig() {
    return { ...this.config.supabase };
  }

  public getAppConfig() {
    return { ...this.config.app };
  }

  public getSecurityConfig() {
    return { ...this.config.security };
  }

  // Demo-friendly credential validation (case-insensitive, lenient)
  public validateAdminCredentials(email: string, password: string): boolean {
    try {
      // Lenient comparison for demo purposes
      const configEmail = this.config.admin.email.toLowerCase().trim();
      const configPassword = this.config.admin.password.trim();
      const inputEmail = email.toLowerCase().trim();
      const inputPassword = password.trim();

      return inputEmail === configEmail && inputPassword === configPassword;
    } catch (error) {
      console.error('Credential validation error:', error);
      return false;
    }
  }

  // Get admin user info (without sensitive data)
  public getAdminUserInfo() {
    return {
      email: this.config.admin.email,
      name: this.config.admin.name,
      role: 'admin' as const,
    };
  }

  // Development mode check
  public isDevelopment(): boolean {
    return this.config.app.environment === 'development';
  }

  // Production mode check
  public isProduction(): boolean {
    return this.config.app.environment === 'production';
  }
}

// Export singleton instance
export const config = ConfigManager.getInstance();

// Export types for TypeScript support
export type { AppConfig };
