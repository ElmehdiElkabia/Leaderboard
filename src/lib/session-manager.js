// Session management with enhanced security
import { security } from './security.js';

export const sessionManager = {
  // Session storage (in production, use Redis or database)
  sessions: new Map(),
  
  // Session configuration
  SESSION_TIMEOUT: 3600000, // 1 hour
  MAX_SESSIONS_PER_USER: 3,
  SESSION_RENEWAL_THRESHOLD: 600000, // 10 minutes
  
  // Create a new session
  createSession: (userId, userData, options = {}) => {
    try {
      const sessionId = security.generateSecureToken();
      const now = Date.now();
      
      const session = {
        id: sessionId,
        userId,
        userData: sessionManager.sanitizeUserData(userData),
        createdAt: now,
        lastAccessed: now,
        expiresAt: now + (options.timeout || sessionManager.SESSION_TIMEOUT),
        ipAddress: options.ipAddress || 'unknown',
        userAgent: options.userAgent || 'unknown',
        isActive: true,
        renewalCount: 0
      };
      
      // Clean up old sessions for this user
      sessionManager.cleanupUserSessions(userId);
      
      // Store session
      sessionManager.sessions.set(sessionId, session);
      
      // Log session creation
      security.logSecurityEvent('session_created', {
        sessionId,
        userId,
        userLogin: userData.login
      });
      
      return sessionId;
    } catch (error) {
      security.logSecurityEvent('session_creation_failed', { 
        error: error.message,
        userId 
      });
      return null;
    }
  },
  
  // Validate and get session
  getSession: (sessionId, options = {}) => {
    if (!sessionId || typeof sessionId !== 'string') {
      return null;
    }
    
    const session = sessionManager.sessions.get(sessionId);
    if (!session) {
      return null;
    }
    
    const now = Date.now();
    
    // Check if session expired
    if (now > session.expiresAt || !session.isActive) {
      sessionManager.destroySession(sessionId);
      return null;
    }
    
    // Check session timeout
    if (now - session.lastAccessed > sessionManager.SESSION_TIMEOUT) {
      security.logSecurityEvent('session_timeout', { sessionId });
      sessionManager.destroySession(sessionId);
      return null;
    }
    
    // Validate IP and User Agent if strict mode
    if (options.strictValidation) {
      if (options.ipAddress && session.ipAddress !== options.ipAddress) {
        security.logSecurityEvent('session_ip_mismatch', { 
          sessionId,
          expected: session.ipAddress,
          actual: options.ipAddress
        });
        sessionManager.destroySession(sessionId);
        return null;
      }
      
      if (options.userAgent && session.userAgent !== options.userAgent) {
        security.logSecurityEvent('session_useragent_mismatch', { sessionId });
        sessionManager.destroySession(sessionId);
        return null;
      }
    }
    
    // Update last accessed time
    session.lastAccessed = now;
    
    // Auto-renew session if near expiration
    if (session.expiresAt - now < sessionManager.SESSION_RENEWAL_THRESHOLD) {
      sessionManager.renewSession(sessionId);
    }
    
    return session;
  },
  
  // Renew session expiration
  renewSession: (sessionId) => {
    const session = sessionManager.sessions.get(sessionId);
    if (!session) return false;
    
    const now = Date.now();
    session.expiresAt = now + sessionManager.SESSION_TIMEOUT;
    session.renewalCount += 1;
    session.lastAccessed = now;
    
    // Limit renewal count for security
    if (session.renewalCount > 10) {
      security.logSecurityEvent('excessive_session_renewals', { sessionId });
      sessionManager.destroySession(sessionId);
      return false;
    }
    
    return true;
  },
  
  // Destroy a session
  destroySession: (sessionId) => {
    const session = sessionManager.sessions.get(sessionId);
    if (session) {
      security.logSecurityEvent('session_destroyed', { 
        sessionId,
        userId: session.userId
      });
      sessionManager.sessions.delete(sessionId);
      return true;
    }
    return false;
  },
  
  // Destroy all sessions for a user
  destroyUserSessions: (userId) => {
    let count = 0;
    for (const [sessionId, session] of sessionManager.sessions.entries()) {
      if (session.userId === userId) {
        sessionManager.sessions.delete(sessionId);
        count++;
      }
    }
    
    if (count > 0) {
      security.logSecurityEvent('user_sessions_destroyed', { 
        userId,
        sessionCount: count
      });
    }
    
    return count;
  },
  
  // Clean up old sessions for a user (keep only latest sessions)
  cleanupUserSessions: (userId) => {
    const userSessions = [];
    
    for (const [sessionId, session] of sessionManager.sessions.entries()) {
      if (session.userId === userId) {
        userSessions.push({ sessionId, session });
      }
    }
    
    // Sort by creation time (newest first)
    userSessions.sort((a, b) => b.session.createdAt - a.session.createdAt);
    
    // Remove excess sessions
    if (userSessions.length > sessionManager.MAX_SESSIONS_PER_USER) {
      const sessionsToRemove = userSessions.slice(sessionManager.MAX_SESSIONS_PER_USER);
      for (const { sessionId } of sessionsToRemove) {
        sessionManager.sessions.delete(sessionId);
      }
      
      security.logSecurityEvent('excess_sessions_cleaned', {
        userId,
        removed: sessionsToRemove.length
      });
    }
  },
  
  // Clean up expired sessions (call periodically)
  cleanupExpiredSessions: () => {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [sessionId, session] of sessionManager.sessions.entries()) {
      if (now > session.expiresAt || !session.isActive) {
        sessionManager.sessions.delete(sessionId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired sessions`);
    }
    
    return cleanedCount;
  },
  
  // Sanitize user data for session storage
  sanitizeUserData: (userData) => {
    if (!userData || typeof userData !== 'object') {
      return {};
    }
    
    return {
      id: userData.id,
      login: security.sanitizeInput(userData.login || ''),
      email: security.sanitizeInput(userData.email || ''),
      first_name: security.sanitizeInput(userData.first_name || ''),
      last_name: security.sanitizeInput(userData.last_name || ''),
      displayname: security.sanitizeInput(userData.displayname || ''),
      image_url: security.sanitizeInput(userData.image_url || ''),
      // Only include safe, necessary fields
    };
  },
  
  // Get session statistics
  getSessionStats: () => {
    const now = Date.now();
    let active = 0;
    let expired = 0;
    
    for (const session of sessionManager.sessions.values()) {
      if (now <= session.expiresAt && session.isActive) {
        active++;
      } else {
        expired++;
      }
    }
    
    return {
      total: sessionManager.sessions.size,
      active,
      expired,
      timestamp: now
    };
  }
};

// Auto-cleanup expired sessions every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    sessionManager.cleanupExpiredSessions();
  }, 600000);
}
