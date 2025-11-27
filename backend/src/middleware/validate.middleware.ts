import { Request, Response, NextFunction } from 'express';
import { validationResult, body, query, param, ValidationChain } from 'express-validator';

/**
 * Validation result handler
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors.array().map((err) => ({
        field: (err as any).path,
        message: err.msg,
        value: (err as any).value,
      })),
    });
    return;
  }

  next();
};

/**
 * Common validation rules
 */
export const validationRules = {
  // Pagination validation
  pagination: [query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(), query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt()] as ValidationChain[],

  // Email ID validation
  emailId: [param('id').isInt({ min: 1 }).withMessage('Invalid email ID').toInt()] as ValidationChain[],

  // Search validation
  search: [query('q').trim().notEmpty().withMessage('Search query is required').isLength({ min: 2, max: 200 }).withMessage('Search query must be between 2 and 200 characters').escape()] as ValidationChain[],

  // Folder validation
  folder: [query('folder').optional().trim().isLength({ max: 100 }).withMessage('Folder name too long')] as ValidationChain[],

  // User preferences validation
  preferences: [body('emails_per_page').optional().isInt({ min: 10, max: 100 }).withMessage('Emails per page must be between 10 and 100'), body('theme').optional().isIn(['light', 'dark', 'system']).withMessage('Theme must be light, dark, or system'), body('notifications_enabled').optional().isBoolean().withMessage('Notifications enabled must be a boolean'), body('auto_sync_interval').optional().isInt({ min: 1, max: 60 }).withMessage('Auto sync interval must be between 1 and 60 minutes')] as ValidationChain[],

  // Sync options validation
  sync: [body('folder').optional().trim().isLength({ max: 100 }), body('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Sync limit must be between 1 and 500')] as ValidationChain[],
};

/**
 * Sanitize input helper
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

export { body, query, param };
