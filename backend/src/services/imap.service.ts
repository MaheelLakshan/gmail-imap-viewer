import Imap from 'imap';
import { simpleParser } from 'mailparser';
import logger from '../utils/logger';
import googleAuthService from './googleAuth.service';
import { IEmailFromImap, IFetchEmailsResult, IImapFolder } from '../types';

class ImapService {
  /**
   * Create IMAP connection with OAuth2
   */
  private createConnection(email: string, accessToken: string): Imap {
    const xoauth2Token = googleAuthService.generateXOAuth2Token(email, accessToken);

    return new Imap({
      user: email,
      xoauth2: xoauth2Token,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 30000,
      connTimeout: 30000,
    } as any);
  }

  /**
   * Connect to IMAP server
   */
  private connect(imap: Imap): Promise<void> {
    return new Promise((resolve, reject) => {
      imap.once('ready', () => {
        logger.info('IMAP connection established');
        resolve();
      });

      imap.once('error', (err: Error) => {
        logger.error('IMAP connection error:', err);
        reject(err);
      });

      imap.connect();
    });
  }

  /**
   * Open a mailbox folder
   */
  private openBox(imap: Imap, boxName: string = 'INBOX', readOnly: boolean = true): Promise<Imap.Box> {
    return new Promise((resolve, reject) => {
      imap.openBox(boxName, readOnly, (err, box) => {
        if (err) {
          logger.error(`Error opening ${boxName}:`, err);
          reject(err);
        } else {
          resolve(box);
        }
      });
    });
  }

  /**
   * Fetch emails from mailbox
   */
  async fetchEmails(email: string, accessToken: string, options: { folder?: string; limit?: number; offset?: number } = {}): Promise<IFetchEmailsResult> {
    const { folder = 'INBOX', limit = 20, offset = 0 } = options;
    const imap = this.createConnection(email, accessToken);

    try {
      await this.connect(imap);
      const box = await this.openBox(imap, folder);

      const totalMessages = box.messages.total;
      if (totalMessages === 0) {
        imap.end();
        return { emails: [], total: 0 };
      }

      const start = Math.max(1, totalMessages - offset - limit + 1);
      const end = Math.max(1, totalMessages - offset);

      if (start > end) {
        imap.end();
        return { emails: [], total: totalMessages };
      }

      const fetchedEmails = await this.fetchRange(imap, `${start}:${end}`);
      fetchedEmails.sort((a, b) => new Date(b.received_at || 0).getTime() - new Date(a.received_at || 0).getTime());

      imap.end();
      return { emails: fetchedEmails, total: totalMessages };
    } catch (error) {
      logger.error('Error fetching emails:', error);
      if (imap.state !== 'disconnected') {
        imap.end();
      }
      throw error;
    }
  }

  /**
   * Fetch a range of messages
   */
  private fetchRange(imap: Imap, range: string): Promise<IEmailFromImap[]> {
    return new Promise((resolve, reject) => {
      const emails: IEmailFromImap[] = [];

      const fetch = imap.seq.fetch(range, {
        bodies: ['HEADER', 'TEXT', ''],
        struct: true,
        envelope: true,
      });

      fetch.on('message', (msg, seqno) => {
        const email: Partial<IEmailFromImap> = { uid: seqno };
        let bodyBuffer = '';

        msg.on('body', (stream) => {
          stream.on('data', (chunk) => {
            bodyBuffer += chunk.toString('utf8');
          });
        });

        msg.once('attributes', (attrs) => {
          email.uid = attrs.uid;
          email.is_read = attrs.flags?.includes('\\Seen') || false;
          email.is_starred = attrs.flags?.includes('\\Flagged') || false;

          if (attrs.envelope) {
            const env = attrs.envelope;
            email.message_id = env.messageId || `gen-${Date.now()}-${seqno}`;
            email.subject = env.subject || '(No Subject)';
            email.received_at = env.date ? new Date(env.date) : null;

            if (env.from && env.from[0]) {
              email.sender_name = env.from[0].name || '';
              email.sender_email = `${env.from[0].mailbox}@${env.from[0].host}`;
            }

            if (env.to && env.to[0]) {
              email.recipient_email = `${env.to[0].mailbox}@${env.to[0].host}`;
            }
          }
        });

        msg.once('end', async () => {
          try {
            if (bodyBuffer) {
              const parsed = await simpleParser(bodyBuffer);
              email.body_text = parsed.text || '';
              email.body_html = parsed.html || '';
              email.snippet = (parsed.text || '').substring(0, 200);
              email.has_attachments = (parsed.attachments?.length || 0) > 0;
            }
          } catch (parseErr) {
            logger.error('Error parsing email:', parseErr);
            email.snippet = bodyBuffer.substring(0, 200);
          }
          emails.push(email as IEmailFromImap);
        });
      });

      fetch.once('error', (err) => {
        logger.error('Fetch error:', err);
        reject(err);
      });

      fetch.once('end', () => {
        resolve(emails);
      });
    });
  }

  /**
   * Fetch single email by UID
   */
  async fetchEmailByUid(email: string, accessToken: string, uid: number, folder: string = 'INBOX'): Promise<IEmailFromImap | null> {
    const imap = this.createConnection(email, accessToken);

    try {
      await this.connect(imap);
      await this.openBox(imap, folder);

      const emailData = await new Promise<IEmailFromImap | null>((resolve, reject) => {
        const fetch = imap.fetch(uid, {
          bodies: '',
          struct: true,
        });

        let emailContent = '';

        fetch.on('message', (msg) => {
          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              emailContent += chunk.toString('utf8');
            });
          });

          msg.once('end', async () => {
            try {
              const parsed = await simpleParser(emailContent);
              resolve({
                uid,
                message_id: parsed.messageId || `gen-${Date.now()}`,
                subject: parsed.subject || '(No Subject)',
                sender_name: parsed.from?.value[0]?.name || '',
                sender_email: parsed.from?.value[0]?.address || '',
                recipient_email: (parsed.to as any)?.value?.[0]?.address || '',
                received_at: parsed.date || null,
                body_text: parsed.text || '',
                body_html: parsed.html || '',
                snippet: (parsed.text || '').substring(0, 200),
                has_attachments: (parsed.attachments?.length || 0) > 0,
                is_read: false,
                is_starred: false,
                attachments: parsed.attachments?.map((att) => ({
                  filename: att.filename || 'unknown',
                  contentType: att.contentType,
                  size: att.size,
                })),
              });
            } catch (err) {
              reject(err);
            }
          });
        });

        fetch.once('error', reject);
      });

      imap.end();
      return emailData;
    } catch (error) {
      logger.error('Error fetching email by UID:', error);
      if (imap.state !== 'disconnected') {
        imap.end();
      }
      throw error;
    }
  }

  /**
   * Get list of available folders
   */
  async getFolders(email: string, accessToken: string): Promise<IImapFolder[]> {
    const imap = this.createConnection(email, accessToken);

    try {
      await this.connect(imap);

      const folders = await new Promise<IImapFolder[]>((resolve, reject) => {
        imap.getBoxes((err, boxes) => {
          if (err) reject(err);
          else resolve(this.parseFolders(boxes));
        });
      });

      imap.end();
      return folders;
    } catch (error) {
      logger.error('Error getting folders:', error);
      if (imap.state !== 'disconnected') {
        imap.end();
      }
      throw error;
    }
  }

  /**
   * Parse folder structure
   */
  private parseFolders(boxes: Imap.MailBoxes, prefix: string = ''): IImapFolder[] {
    const folders: IImapFolder[] = [];

    for (const [name, box] of Object.entries(boxes)) {
      const fullName = prefix ? `${prefix}${box.delimiter}${name}` : name;
      folders.push({
        name,
        fullName,
        delimiter: box.delimiter,
        flags: box.attribs,
      });

      if (box.children) {
        folders.push(...this.parseFolders(box.children, fullName));
      }
    }

    return folders;
  }
}

export const imapService = new ImapService();
export default imapService;
