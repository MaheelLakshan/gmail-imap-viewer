import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate, validationRules } from '../middleware/validate.middleware';
import emailService from '../services/email.service';
import imapService from '../services/imap.service';
import { User } from '../models';
import logger from '../utils/logger';
import { AuthenticatedRequest, GetEmailsQuery, SearchEmailsQuery, SyncEmailsBody } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/emails/sync
 * Sync emails from Gmail
 */
router.post('/sync', validationRules.sync, validate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { folder = 'INBOX', limit = 50 } = req.body as SyncEmailsBody;

    const result = await emailService.syncEmails(req.userId!, { folder, limit });

    res.json({
      message: 'Emails synced successfully',
      ...result,
    });
  } catch (error: any) {
    logger.error('Sync error:', error);

    if (error.message?.includes('AUTHENTICATIONFAILED')) {
      res.status(401).json({
        error: 'Gmail authentication failed',
        message: 'Please re-authenticate with Google',
      });
      return;
    }

    res.status(500).json({
      error: 'Failed to sync emails',
      message: error.message,
    });
  }
});

/**
 * GET /api/emails
 * Get paginated emails from database
 */
router.get('/', validationRules.pagination, validate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', folder = 'INBOX', sortBy = 'received_at', sortOrder = 'DESC' } = req.query as GetEmailsQuery;

    const result = await emailService.getEmails(req.userId!, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      folder,
      sortBy,
      sortOrder: sortOrder as 'ASC' | 'DESC',
    });

    res.json(result);
  } catch (error) {
    logger.error('Get emails error:', error);
    res.status(500).json({ error: 'Failed to retrieve emails' });
  }
});

/**
 * GET /api/emails/search
 * Search emails
 */
router.get('/search', [...validationRules.search, ...validationRules.pagination], validate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { q, page = '1', limit = '20' } = req.query as unknown as SearchEmailsQuery;

    const result = await emailService.searchEmails(req.userId!, q, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    res.json({ ...result, query: q });
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search emails' });
  }
});

/**
 * GET /api/emails/folders
 * Get available folders from Gmail
 */
router.get('/folders', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.userId!);

    if (!user?.access_token) {
      res.status(401).json({ error: 'Gmail not connected' });
      return;
    }

    const folders = await imapService.getFolders(user.email, user.access_token);

    res.json({ folders });
  } catch (error) {
    logger.error('Get folders error:', error);
    res.status(500).json({ error: 'Failed to retrieve folders' });
  }
});

/**
 * GET /api/emails/stats
 * Get folder statistics
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const stats = await emailService.getFolderStats(req.userId!);
    res.json({ stats });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

/**
 * GET /api/emails/:id
 * Get single email by ID
 */
router.get('/:id', validationRules.emailId, validate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const emailId = parseInt(req.params.id, 10);
    const email = await emailService.getEmailById(req.userId!, emailId);

    if (!email) {
      res.status(404).json({ error: 'Email not found' });
      return;
    }

    // Mark as read
    await emailService.markAsRead(req.userId!, emailId);

    res.json({ email });
  } catch (error) {
    logger.error('Get email error:', error);
    res.status(500).json({ error: 'Failed to retrieve email' });
  }
});

/**
 * GET /api/emails/:id/fresh
 * Fetch email directly from IMAP
 */
router.get('/:id/fresh', validationRules.emailId, validate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const emailId = parseInt(req.params.id, 10);
    const dbEmail = await emailService.getEmailById(req.userId!, emailId);

    if (!dbEmail) {
      res.status(404).json({ error: 'Email not found' });
      return;
    }

    if (!dbEmail.uid) {
      res.status(400).json({ error: 'Cannot fetch fresh - no UID available' });
      return;
    }

    const email = await emailService.getEmailFromImap(req.userId!, dbEmail.uid, dbEmail.folder);

    res.json({ email });
  } catch (error) {
    logger.error('Get fresh email error:', error);
    res.status(500).json({ error: 'Failed to retrieve email from server' });
  }
});

/**
 * PATCH /api/emails/:id/read
 * Mark email as read
 */
router.patch('/:id/read', validationRules.emailId, validate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const emailId = parseInt(req.params.id, 10);
    const updated = await emailService.markAsRead(req.userId!, emailId);

    if (!updated) {
      res.status(404).json({ error: 'Email not found' });
      return;
    }

    res.json({ message: 'Email marked as read' });
  } catch (error) {
    logger.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark email as read' });
  }
});

/**
 * PATCH /api/emails/:id/star
 * Toggle email star status
 */
router.patch('/:id/star', validationRules.emailId, validate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const emailId = parseInt(req.params.id, 10);
    const email = await emailService.toggleStar(req.userId!, emailId);

    if (!email) {
      res.status(404).json({ error: 'Email not found' });
      return;
    }

    res.json({
      message: 'Star status toggled',
      is_starred: email.is_starred,
    });
  } catch (error) {
    logger.error('Toggle star error:', error);
    res.status(500).json({ error: 'Failed to toggle star' });
  }
});

export default router;
