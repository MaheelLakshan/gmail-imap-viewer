import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { SignOptions, Secret } from 'jsonwebtoken';
import { User } from '../models';
import { config } from '../config/env.config';
import logger from '../utils/logger';
import { AuthenticatedRequest, ITokenPayload } from '../types';

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid token',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as ITokenPayload;

    const user = await User.findByPk(decoded.userId);

    if (!user) {
      res.status(401).json({
        error: 'User not found',
        message: 'The user associated with this token no longer exists',
      });
      return;
    }

    if (!user.is_active) {
      res.status(401).json({
        error: 'Account disabled',
        message: 'This account has been disabled',
      });
      return;
    }

    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please login again.',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid',
      });
      return;
    }

    res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication',
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req: AuthenticatedRequest, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as ITokenPayload;
    const user = await User.findByPk(decoded.userId);

    if (user && user.is_active) {
      req.user = user;
      req.userId = user.id;
    }

    next();
  } catch {
    // Continue without authentication
    next();
  }
};

/**
 * Generate JWT token
 */

export const generateToken = (userId: number): string => {
  const secret: Secret = config.jwt.secret;
  if (!secret) throw new Error('JWT secret is not defined');

  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as `${number}${'d' | 'h' | 'm' | 's'}`,
  };

  return jwt.sign({ userId }, secret, options);
};
