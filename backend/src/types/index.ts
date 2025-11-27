import { Request } from 'express';

// ============================================
// User Types
// ============================================

export interface IUser {
  id: number;
  email: string;
  name: string | null;
  picture: string | null;
  google_id: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expiry: Date | null;
  last_sync: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IUserPreference {
  id: number;
  user_id: number;
  emails_per_page: number;
  default_folder: string;
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  auto_sync_interval: number;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// Email Types
// ============================================

export interface IEmail {
  id: number;
  user_id: number;
  message_id: string;
  uid: number | null;
  thread_id: string | null;
  subject: string | null;
  sender_email: string | null;
  sender_name: string | null;
  recipient_email: string | null;
  snippet: string | null;
  body_text: string | null;
  body_html: string | null;
  received_at: Date | null;
  is_read: boolean;
  is_starred: boolean;
  labels: string[];
  has_attachments: boolean;
  folder: string;
  created_at: Date;
  updated_at: Date;
}

export interface IEmailAttachment {
  filename: string;
  contentType: string;
  size: number;
}

export interface IEmailFromImap {
  uid: number;
  message_id: string;
  subject: string;
  sender_email: string;
  sender_name: string;
  recipient_email: string;
  snippet: string;
  body_text: string;
  body_html: string;
  received_at: Date | null;
  is_read: boolean;
  is_starred: boolean;
  has_attachments: boolean;
  flags?: string[];
  attachments?: IEmailAttachment[];
}

// ============================================
// API Types
// ============================================

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: IPagination;
}

// ============================================
// Auth Types
// ============================================

export interface ITokenPayload {
  userId: number;
  iat?: number;
  exp?: number;
}

export interface IGoogleTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date: number;
  token_type: string;
  scope: string;
}

export interface IGoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
}

// ============================================
// Request Types
// ============================================

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  userId?: number;
}

export interface GetEmailsQuery {
  page?: string;
  limit?: string;
  folder?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface SearchEmailsQuery {
  q: string;
  page?: string;
  limit?: string;
}

export interface SyncEmailsBody {
  folder?: string;
  limit?: number;
}

export interface UpdatePreferencesBody {
  emails_per_page?: number;
  theme?: 'light' | 'dark' | 'system';
  notifications_enabled?: boolean;
  auto_sync_interval?: number;
  default_folder?: string;
}

// ============================================
// IMAP Types
// ============================================

export interface IImapFolder {
  name: string;
  fullName: string;
  delimiter: string;
  flags: string[];
}

export interface IFetchEmailsResult {
  emails: IEmailFromImap[];
  total: number;
}

// ============================================
// Stats Types
// ============================================

export interface IUserStats {
  totalEmails: number;
  unreadEmails: number;
  starredEmails: number;
  lastSync: Date | null;
}

export interface IFolderStats {
  folder: string;
  total: number;
  unread: number;
}
