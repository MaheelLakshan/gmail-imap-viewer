import { Op } from 'sequelize';
import { Email, User } from '../models';
import imapService from './imap.service';
import googleAuthService from './googleAuth.service';
import logger from '../utils/logger';
import { IPagination, IFolderStats, IEmailFromImap } from '../types';

interface IGetEmailsResult {
  emails: Email[];
  pagination: IPagination;
}

interface ISyncResult {
  synced: number;
  total: number;
}

interface ITokenResponse {
  access_token?: string;
  refresh_token?: string;
  expiry_date?: number;
  id_token?: string;
}

class EmailService {
  async syncEmails(userId: number, options: { folder?: string; limit?: number } = {}): Promise<ISyncResult> {
    const { folder = 'INBOX', limit = 50 } = options;

    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    let accessToken: string | null = user.access_token ?? null;
    if (!accessToken) throw new Error('No access token available');

    // Refresh token if expired
    if (user.isTokenExpired() && user.refresh_token) {
      const newTokens: ITokenResponse = await googleAuthService.refreshAccessToken(user.refresh_token);

      accessToken = newTokens.access_token ?? accessToken;

      await user.update({
        access_token: accessToken,
        token_expiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : user.token_expiry,
      });
    }

    // Fetch emails from IMAP
    const { emails, total } = await imapService.fetchEmails(user.email, accessToken, { folder, limit });

    // Upsert emails to database
    let syncedCount = 0;
    for (const emailData of emails) {
      try {
        await Email.upsert({
          user_id: userId,
          message_id: emailData.message_id,
          uid: emailData.uid,
          subject: emailData.subject,
          sender_email: emailData.sender_email,
          sender_name: emailData.sender_name,
          recipient_email: emailData.recipient_email,
          snippet: emailData.snippet,
          body_text: emailData.body_text,
          body_html: emailData.body_html,
          received_at: emailData.received_at,
          is_read: emailData.is_read,
          is_starred: emailData.is_starred,
          has_attachments: emailData.has_attachments,
          folder,
        });
        syncedCount++;
      } catch (error) {
        logger.error(`Error syncing email ${emailData.message_id}:`, error);
      }
    }

    // Update last sync time
    await user.update({ last_sync: new Date() });

    logger.info(`Synced ${syncedCount} emails for user ${userId}`);
    return { synced: syncedCount, total };
  }

  async getEmails(
    userId: number,
    options: {
      page?: number;
      limit?: number;
      folder?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    } = {}
  ): Promise<IGetEmailsResult> {
    const { page = 1, limit = 20, folder = 'INBOX', sortBy = 'received_at', sortOrder = 'DESC' } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await Email.findAndCountAll({
      where: { user_id: userId, folder },
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      attributes: ['id', 'uid', 'message_id', 'subject', 'sender_email', 'sender_name', 'snippet', 'received_at', 'is_read', 'is_starred', 'has_attachments', 'folder'],
    });

    return {
      emails: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        hasMore: page * limit < count,
      },
    };
  }

  async searchEmails(userId: number, query: string, options: { page?: number; limit?: number } = {}): Promise<IGetEmailsResult> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;
    const searchPattern = `%${query}%`;

    const { count, rows } = await Email.findAndCountAll({
      where: {
        user_id: userId,
        [Op.or]: [{ subject: { [Op.like]: searchPattern } }, { snippet: { [Op.like]: searchPattern } }, { sender_email: { [Op.like]: searchPattern } }, { sender_name: { [Op.like]: searchPattern } }, { body_text: { [Op.like]: searchPattern } }],
      },
      order: [['received_at', 'DESC']],
      limit,
      offset,
      attributes: ['id', 'uid', 'message_id', 'subject', 'sender_email', 'sender_name', 'snippet', 'received_at', 'is_read', 'is_starred', 'has_attachments', 'folder'],
    });

    return {
      emails: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        hasMore: page * limit < count,
      },
    };
  }

  async getEmailById(userId: number, emailId: number): Promise<Email | null> {
    return Email.findOne({ where: { id: emailId, user_id: userId } });
  }

  async getEmailFromImap(userId: number, uid: number, folder: string = 'INBOX'): Promise<IEmailFromImap | null> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    let accessToken: string | null = user.access_token ?? null;
    if (!accessToken) throw new Error('User not authenticated');

    if (user.isTokenExpired() && user.refresh_token) {
      const newTokens: ITokenResponse = await googleAuthService.refreshAccessToken(user.refresh_token);
      accessToken = newTokens.access_token ?? accessToken;

      await user.update({
        access_token: accessToken,
        token_expiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : user.token_expiry,
      });
    }

    return imapService.fetchEmailByUid(user.email, accessToken, uid, folder);
  }

  async markAsRead(userId: number, emailId: number): Promise<boolean> {
    const [updated] = await Email.update({ is_read: true }, { where: { id: emailId, user_id: userId } });
    return updated > 0;
  }

  async toggleStar(userId: number, emailId: number): Promise<Email | null> {
    const email = await Email.findOne({ where: { id: emailId, user_id: userId } });
    if (!email) return null;
    await email.update({ is_starred: !email.is_starred });
    return email;
  }

  async getFolderStats(userId: number): Promise<IFolderStats[]> {
    const stats = await Email.findAll({
      where: { user_id: userId },
      attributes: ['folder', [Email.sequelize!.fn('COUNT', Email.sequelize!.col('id')), 'total'], [Email.sequelize!.fn('SUM', Email.sequelize!.literal('CASE WHEN is_read = 0 THEN 1 ELSE 0 END')), 'unread']],
      group: ['folder'],
      raw: true,
    });

    return stats.map((s: any) => ({
      folder: s.folder,
      total: parseInt(s.total, 10),
      unread: parseInt(s.unread, 10) || 0,
    }));
  }
}

export const emailService = new EmailService();
export default emailService;
