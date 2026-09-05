import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { db } from '../db.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, env.JWT_SECRET, async (err, decodedUser) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(403).json({ error: 'Invalid or malformed token' });
    }

    try {
      // Verify user exists and status is active
      const user = await db.get('SELECT id, email, name, role, status FROM users WHERE id = ?', decodedUser.id);
      if (!user) {
        return res.status(401).json({ error: 'User account not found' });
      }
      if (user.status === 'suspended') {
        return res.status(403).json({ error: 'Account has been suspended' });
      }

      req.user = { ...decodedUser, ...user };
      next();
    } catch (dbErr) {
      next(dbErr);
    }
  });
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Forbidden: Access restricted to [${roles.join(', ')}] roles. Your role is '${req.user.role}'.` 
      });
    }

    next();
  };
}

export function recordAuditLog(action, details = null) {
  return (req, res, next) => {
    const originalSend = res.send;
    res.send = function (...args) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id || null;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
        const userAgent = req.headers['user-agent'] || null;
        const id = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const logDetails = typeof details === 'function' ? details(req) : (details || JSON.stringify(req.body || {}));

        db.run(`
          INSERT INTO audit_logs (id, timestamp, user_id, action, details, ip_address, user_agent)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [id, new Date().toISOString(), userId, action, logDetails, String(ip), String(userAgent)]).catch((auditErr) => {
          console.error('Audit log write failure:', auditErr.message);
        });
      }
      return originalSend.apply(this, args);
    };
    next();
  };
}
