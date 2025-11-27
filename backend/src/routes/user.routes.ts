import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate, validationRules } from '../middleware/validate.middleware';
import { User, UserPreference, Email } from '../models';
import logger from '../utils/logger';
import { AuthenticatedRequest, UpdatePreferencesBody, IUserStats } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/users/profile
 * Get user profile
 */
router.get('/profile', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.userId!, {
      include: [{ model: UserPreference, as: 'preferences' }],
      attributes: { exclude: ['access_token', 'refresh_token'] },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

/**
 * PUT /api/users/preferences
 * Update user preferences
 */
router.put('/preferences', validationRules.preferences, validate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { emails_per_page, theme, notifications_enabled, auto_sync_interval, default_folder } = req.body as UpdatePreferencesBody;

    const [preference, created] = await UserPreference.findOrCreate({
      where: { user_id: req.userId! },
      defaults: {
        user_id: req.userId!,
        emails_per_page: emails_per_page || 20,
        theme: theme || 'system',
        notifications_enabled: notifications_enabled !== false,
        auto_sync_interval: auto_sync_interval || 5,
        default_folder: default_folder || 'INBOX',
      },
    });

    if (!created) {
      await preference.update({
        ...(emails_per_page !== undefined && { emails_per_page }),
        ...(theme !== undefined && { theme }),
        ...(notifications_enabled !== undefined && { notifications_enabled }),
        ...(auto_sync_interval !== undefined && { auto_sync_interval }),
        ...(default_folder !== undefined && { default_folder }),
      });
    }

    res.json({
      message: 'Preferences updated',
      preferences: preference,
    });
  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

/**
 * GET /api/users/preferences
 * Get user preferences
 */
router.get('/preferences', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let preference = await UserPreference.findOne({
      where: { user_id: req.userId! },
    });

    if (!preference) {
      preference = await UserPreference.create({ user_id: req.userId! });
    }

    res.json({ preferences: preference });
  } catch (error) {
    logger.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

/**
 * GET /api/users/stats
 * Get user statistics
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.userId!);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const totalEmails = await Email.count({
      where: { user_id: req.userId! },
    });

    const unreadEmails = await Email.count({
      where: { user_id: req.userId!, is_read: false },
    });

    const starredEmails = await Email.count({
      where: { user_id: req.userId!, is_starred: true },
    });

    const stats: IUserStats = {
      totalEmails,
      unreadEmails,
      starredEmails,
      lastSync: user.last_sync,
    };

    res.json({ stats });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

/**
 * DELETE /api/users/account
 * Delete user account and all data
 */
router.delete('/account', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Delete all user emails
    await Email.destroy({ where: { user_id: req.userId! } });

    // Delete user preferences
    await UserPreference.destroy({ where: { user_id: req.userId! } });

    // Delete user
    await User.destroy({ where: { id: req.userId! } });

    logger.info(`User ${req.userId} deleted their account`);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
