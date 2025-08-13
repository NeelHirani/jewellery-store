/**
 * Environment Configuration Manager
 * Handles secure access to environment variables
 */

interface AdminAccount {
  email: string;
  password: string;
  name: string;
}

interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  admin: {
    accounts: AdminAccount[];
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
    // Load admin accounts from environment variables
    const adminAccounts: AdminAccount[] = [
      {
        email: import.meta.env.VITE_ADMIN_1_EMAIL || '',
        password: import.meta.env.VITE_ADMIN_1_PASSWORD || '',
        name: import.meta.env.VITE_ADMIN_1_NAME || 'Admin 1',
      },
      {
        email: import.meta.env.VITE_ADMIN_2_EMAIL || '',
        password: import.meta.env.VITE_ADMIN_2_PASSWORD || '',
        name: import.meta.env.VITE_ADMIN_2_NAME || 'Admin 2',
      }
    ];

    return {
      supabase: {
        url: import.meta.env.VITE_SUPABASE_URL || '',
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      },
      admin: {
        accounts: adminAccounts,
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

    // Validate admin accounts
    if (!this.config.admin.accounts || this.config.admin.accounts.length === 0) {
      errors.push('At least one admin account is required');
    } else {
      this.config.admin.accounts.forEach((account, index) => {
        const adminPrefix = `Admin ${index + 1}`;

        if (!account.email) {
          errors.push(`${adminPrefix} email is required`);
        } else if (!this.isValidEmail(account.email)) {
          errors.push(`${adminPrefix} email must be a valid email address`);
        }

        if (!account.password) {
          errors.push(`${adminPrefix} password is required`);
        } else if (!this.isStrongPassword(account.password)) {
          errors.push(`${adminPrefix} password must be at least 8 characters`);
        }

        if (!account.name) {
          errors.push(`${adminPrefix} name is required`);
        }
      });
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
      return this.config.admin.accounts.some(account =>
        account.email === email && account.password === password
      );
    } catch (error) {
      console.error('Admin credential validation error:', error);
      return false;
    }
  }

  // Get admin user info by email (without sensitive data)
  public getAdminUserInfo(email?: string) {
    try {
      if (email) {
        const account = this.config.admin.accounts.find(account => account.email === email);
        if (account) {
          return {
            email: account.email,
            name: account.name,
            role: 'admin' as const,
          };
        }
      }

      // Fallback to first admin account if no email provided or not found
      const firstAdmin = this.config.admin.accounts[0];
      return {
        email: firstAdmin?.email || '',
        name: firstAdmin?.name || 'Admin User',
        role: 'admin' as const,
      };
    } catch (error) {
      console.error('Get admin user info error:', error);
      return {
        email: '',
        name: 'Admin User',
        role: 'admin' as const,
      };
    }
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
export type { AppConfig, AdminAccount };
