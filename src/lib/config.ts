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
    const errors: string[] = [];

    // Validate Supabase configuration
    if (!this.config.supabase.url) {
      errors.push('VITE_SUPABASE_URL is required');
    }
    if (!this.config.supabase.anonKey) {
      errors.push('VITE_SUPABASE_ANON_KEY is required');
    }

    // Validate admin credentials
    if (!this.config.admin.email) {
      errors.push('VITE_ADMIN_EMAIL is required');
    } else if (!this.isValidEmail(this.config.admin.email)) {
      errors.push('VITE_ADMIN_EMAIL must be a valid email address');
    }

    if (!this.config.admin.password) {
      errors.push('VITE_ADMIN_PASSWORD is required');
    } else if (!this.isStrongPassword(this.config.admin.password)) {
      errors.push('VITE_ADMIN_PASSWORD must be at least 8 characters');
    }

    if (!this.config.admin.name) {
      errors.push('VITE_ADMIN_NAME is required');
    }

    if (errors.length > 0) {
      console.error('Configuration validation errors:', errors);
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isStrongPassword(password: string): boolean {
    // Simplified validation - at least 8 characters
    return password.length >= 8;
  }

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

  // Secure admin credential validation
  public validateAdminCredentials(email: string, password: string): boolean {
    try {
      return email === this.config.admin.email && password === this.config.admin.password;
    } catch (error) {
      console.error('Admin credential validation error:', error);
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
