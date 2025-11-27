import { Router, Request, Response } from 'express';
import { User, UserPreference } from '../models';
import googleAuthService from '../services/googleAuth.service';
import { authenticate, generateToken } from '../middleware/auth.middleware';
import { config } from '../config/env.config';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.get('/google', (_req: Request, res: Response) => {
  try {
    const authUrl = googleAuthService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    logger.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
});

router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code, error: authError } = req.query;

    if (authError) {
      logger.error('OAuth error:', authError);
      res.redirect(`${config.frontendUrl}/auth/error?message=${encodeURIComponent(String(authError))}`);
      return;
    }

    if (!code || typeof code !== 'string') {
      res.redirect(`${config.frontendUrl}/auth/error?message=${encodeURIComponent('No authorization code provided')}`);
      return;
    }

    const tokens = await googleAuthService.getTokens(code);

    if (!tokens.access_token) {
      throw new Error('No access token returned from Google');
    }

    const googleUser = await googleAuthService.getUserInfo(tokens.access_token);

    const [user, created] = await User.findOrCreate({
      where: { google_id: googleUser.id },
      defaults: {
        email: googleUser.email || '',
        name: googleUser.name || '',
        picture: googleUser.picture || '',
        google_id: googleUser.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });

    if (!created) {
      await user.update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || user.refresh_token,
        token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : user.token_expiry,
        name: googleUser.name || user.name,
        picture: googleUser.picture || user.picture,
      });
    } else {
      await UserPreference.create({ user_id: user.id });
    }

    const jwtToken = generateToken(user.id);

    res.redirect(`${config.frontendUrl}/auth/callback?token=${jwtToken}`);
  } catch (error) {
    logger.error('OAuth callback error:', error);
    res.redirect(`${config.frontendUrl}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
  }
});

router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.userId!, {
      include: [{ model: UserPreference, as: 'preferences' }],
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        last_sync: user.last_sync,
        preferences: (user as any).preferences,
      },
    });
  } catch (error) {
    logger.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

router.post('/logout', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  logger.info(`User ${req.userId} logged out`);
  res.json({ message: 'Logged out successfully' });
});

router.post('/refresh', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.userId!);

    if (!user?.refresh_token) {
      res.status(400).json({
        error: 'No refresh token available. Please re-authenticate.',
      });
      return;
    }

    const newTokens = await googleAuthService.refreshAccessToken(user.refresh_token);

    if (!newTokens.access_token) {
      throw new Error('Failed to refresh access token');
    }

    await user.update({
      access_token: newTokens.access_token,
      token_expiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : user.token_expiry,
    });

    res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

export default router;
