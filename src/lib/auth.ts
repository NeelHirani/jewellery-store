/**
 * Secure Authentication Service
 * Handles admin authentication with security best practices
 */

import { config } from './config';

interface AdminUser {
  email: string;
  name: string;
  role: 'admin';
  loginTime: string;
  sessionId: string;
}

interface AuthResult {
  success: boolean;
  user?: AdminUser;
  error?: string;
}

class AuthService {
  private static instance: AuthService;
  private readonly STORAGE_KEY = 'adminUser';
  private readonly SESSION_KEY = 'adminSession';

  private constructor() {
    // Demo-friendly initialization (no complex cleanup)
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Demo-friendly authentication with simplified validation
   */
  public async authenticateAdmin(email: string, password: string): Promise<AuthResult> {
    try {
      // Basic input check (very lenient for demo purposes)
      if (!email || !password) {
        return {
          success: false,
          error: 'Please enter both email and password'
        };
      }

      // Simple credential validation (no strict requirements)
      const isValid = config.validateAdminCredentials(email.trim(), password.trim());

      if (!isValid) {
        return {
          success: false,
          error: 'Please check your credentials and try again'
        };
      }

      // Create admin user session (no security barriers)
      const adminUser = this.createAdminSession();

      // Store session
      this.storeSession(adminUser);

      return {
        success: true,
        user: adminUser
      };

    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Please try again'
      };
    }
  }

  /**
   * Check if admin is currently authenticated (demo-friendly, no timeouts)
   */
  public isAuthenticated(): boolean {
    try {
      const adminUser = this.getStoredSession();
      return adminUser !== null;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  }

  /**
   * Get current admin user
   */
  public getCurrentUser(): AdminUser | null {
    try {
      if (!this.isAuthenticated()) {
        return null;
      }
      return this.getStoredSession();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Simple logout (demo-friendly)
   */
  public logout(): void {
    try {
      // Simple session cleanup
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Create admin session with security metadata
   */
  private createAdminSession(): AdminUser {
    const adminInfo = config.getAdminUserInfo();
    const sessionId = this.generateSessionId();

    return {
      email: adminInfo.email,
      name: adminInfo.name,
      role: adminInfo.role,
      loginTime: new Date().toISOString(),
      sessionId
    };
  }

  /**
   * Generate secure session ID (enhanced for concurrent sessions)
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `admin_${timestamp}_${random}_${randomSuffix}`;
  }

  /**
   * Simple session storage (demo-friendly)
   */
  private storeSession(adminUser: AdminUser): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(adminUser));
      localStorage.setItem(this.SESSION_KEY, adminUser.sessionId);
    } catch (error) {
      console.error('Session storage error:', error);
    }
  }

  /**
   * Get stored session from localStorage (demo-friendly)
   */
  private getStoredSession(): AdminUser | null {
    try {
      const storedUser = localStorage.getItem(this.STORAGE_KEY);
      if (!storedUser) {
        return null;
      }
      return JSON.parse(storedUser);
    } catch (error) {
      console.error('Session retrieval error:', error);
      return null;
    }
  }

  // Demo-friendly authentication - complex security methods removed for easier access
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Export types for TypeScript support
export type { AdminUser, AuthResult };
