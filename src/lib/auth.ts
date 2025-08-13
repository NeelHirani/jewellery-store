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

interface LoginAttempt {
  timestamp: number;
  ip?: string;
}

interface AuthResult {
  success: boolean;
  user?: AdminUser;
  error?: string;
  remainingAttempts?: number;
}

class AuthService {
  private static instance: AuthService;
  private readonly STORAGE_KEY = 'adminUser';
  private readonly ATTEMPTS_KEY = 'loginAttempts';
  private readonly SESSION_KEY = 'adminSession';
  private readonly SESSIONS_KEY = 'adminSessions'; // For concurrent sessions

  private constructor() {
    this.cleanupExpiredSessions();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Authenticate admin user with secure credential validation
   */
  public async authenticateAdmin(email: string, password: string): Promise<AuthResult> {
    try {
      // Check for rate limiting
      const rateLimitResult = this.checkRateLimit();
      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: `Too many login attempts. Please try again later.`,
          remainingAttempts: 0
        };
      }

      // Validate input
      if (!email || !password) {
        this.recordFailedAttempt();
        return {
          success: false,
          error: 'Email and password are required',
          remainingAttempts: rateLimitResult.remaining
        };
      }

      // Validate credentials using secure comparison
      const isValid = config.validateAdminCredentials(email.trim(), password);

      if (!isValid) {
        this.recordFailedAttempt();
        return {
          success: false,
          error: 'Invalid admin credentials',
          remainingAttempts: rateLimitResult.remaining - 1
        };
      }

      // Clear failed attempts on successful login
      this.clearFailedAttempts();

      // Create admin user session
      const adminUser = this.createAdminSession();

      // Store session securely
      this.storeSession(adminUser);

      return {
        success: true,
        user: adminUser
      };

    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Authentication service error'
      };
    }
  }

  /**
   * Check if admin is currently authenticated
   */
  public isAuthenticated(): boolean {
    try {
      const adminUser = this.getStoredSession();
      if (!adminUser) {
        return false;
      }

      // Check session expiry
      const loginTime = new Date(adminUser.loginTime).getTime();
      const currentTime = Date.now();
      const sessionTimeout = config.getSecurityConfig().sessionTimeout;

      if (currentTime - loginTime > sessionTimeout) {
        this.logout();
        return false;
      }

      return true;
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
   * Logout admin user (removes current session but preserves other concurrent sessions)
   */
  public logout(): void {
    try {
      const currentSession = this.getStoredSession();

      // Remove current session from storage
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.SESSION_KEY);

      // Remove current session from concurrent sessions list
      if (currentSession) {
        const allSessions = this.getAllSessions();
        const updatedSessions = allSessions.filter(session =>
          session.sessionId !== currentSession.sessionId
        );
        localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(updatedSessions));
      }

      this.clearFailedAttempts();
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
   * Store session securely in localStorage (supports concurrent sessions)
   */
  private storeSession(adminUser: AdminUser): void {
    try {
      // Store current session (for backward compatibility)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(adminUser));
      localStorage.setItem(this.SESSION_KEY, adminUser.sessionId);

      // Store in concurrent sessions list
      const existingSessions = this.getAllSessions();
      const updatedSessions = [...existingSessions, adminUser];
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Session storage error:', error);
      throw new Error('Failed to store session');
    }
  }

  /**
   * Get stored session from localStorage
   */
  private getStoredSession(): AdminUser | null {
    try {
      const storedUser = localStorage.getItem(this.STORAGE_KEY);
      const storedSessionId = localStorage.getItem(this.SESSION_KEY);

      if (!storedUser || !storedSessionId) {
        return null;
      }

      const adminUser: AdminUser = JSON.parse(storedUser);

      // Validate session ID
      if (adminUser.sessionId !== storedSessionId) {
        this.logout();
        return null;
      }

      return adminUser;
    } catch (error) {
      console.error('Session retrieval error:', error);
      this.logout();
      return null;
    }
  }

  /**
   * Get all active sessions (for concurrent session support)
   */
  private getAllSessions(): AdminUser[] {
    try {
      const storedSessions = localStorage.getItem(this.SESSIONS_KEY);
      if (!storedSessions) {
        return [];
      }
      return JSON.parse(storedSessions);
    } catch (error) {
      console.error('Sessions retrieval error:', error);
      return [];
    }
  }

  /**
   * Clean up expired sessions from the sessions list
   */
  private cleanupExpiredSessionsList(): void {
    try {
      const allSessions = this.getAllSessions();
      const currentTime = Date.now();
      const sessionTimeout = config.getSecurityConfig().sessionTimeout;

      const activeSessions = allSessions.filter(session => {
        const loginTime = new Date(session.loginTime).getTime();
        return currentTime - loginTime <= sessionTimeout;
      });

      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(activeSessions));
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }

  /**
   * Rate limiting for login attempts
   */
  private checkRateLimit(): { allowed: boolean; remaining: number } {
    try {
      const attempts = this.getFailedAttempts();
      const maxAttempts = config.getSecurityConfig().maxLoginAttempts;
      const currentAttempts = attempts.length;

      // Clean old attempts (older than 15 minutes)
      const fifteenMinutesAgo = Date.now() - (15 * 60 * 1000);
      const recentAttempts = attempts.filter(attempt => attempt.timestamp > fifteenMinutesAgo);
      
      if (recentAttempts.length !== currentAttempts) {
        this.storeFailedAttempts(recentAttempts);
      }

      const remaining = Math.max(0, maxAttempts - recentAttempts.length);
      
      return {
        allowed: recentAttempts.length < maxAttempts,
        remaining
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true, remaining: 5 };
    }
  }

  /**
   * Record failed login attempt
   */
  private recordFailedAttempt(): void {
    try {
      const attempts = this.getFailedAttempts();
      attempts.push({
        timestamp: Date.now()
      });
      this.storeFailedAttempts(attempts);
    } catch (error) {
      console.error('Failed to record login attempt:', error);
    }
  }

  /**
   * Get failed login attempts
   */
  private getFailedAttempts(): LoginAttempt[] {
    try {
      const stored = localStorage.getItem(this.ATTEMPTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get login attempts:', error);
      return [];
    }
  }

  /**
   * Store failed login attempts
   */
  private storeFailedAttempts(attempts: LoginAttempt[]): void {
    try {
      localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(attempts));
    } catch (error) {
      console.error('Failed to store login attempts:', error);
    }
  }

  /**
   * Clear failed login attempts
   */
  private clearFailedAttempts(): void {
    try {
      localStorage.removeItem(this.ATTEMPTS_KEY);
    } catch (error) {
      console.error('Failed to clear login attempts:', error);
    }
  }

  /**
   * Cleanup expired sessions on service initialization
   */
  private cleanupExpiredSessions(): void {
    try {
      // Clean up expired sessions from the concurrent sessions list
      this.cleanupExpiredSessionsList();

      // Check if current session is still valid
      if (!this.isAuthenticated()) {
        this.logout();
      }
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Export types for TypeScript support
export type { AdminUser, AuthResult };
