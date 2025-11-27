// ============================================
// User Types
// ============================================

export interface IUser {
  id: number;
  email: string;
  name: string | null;
  picture: string | null;
  last_sync: string | null;
  preferences?: IUserPreference;
}

export interface IUserPreference {
  id: number;
  user_id: number;
  emails_per_page: number;
  default_folder: string;
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  auto_sync_interval: number;
}

// ============================================
// Email Types
// ============================================

export interface IEmail {
  id: number;
  uid: number | null;
  message_id: string;
  subject: string | null;
  sender_email: string | null;
  sender_name: string | null;
  recipient_email?: string | null;
  snippet: string | null;
  body_text?: string | null;
  body_html?: string | null;
  received_at: string | null;
  is_read: boolean;
  is_starred: boolean;
  has_attachments: boolean;
  folder: string;
  attachments?: IEmailAttachment[];
}

export interface IEmailAttachment {
  filename: string;
  contentType: string;
  size: number;
}

// ============================================
// API Response Types
// ============================================

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface IEmailsResponse {
  emails: IEmail[];
  pagination: IPagination;
}

export interface ISearchResponse extends IEmailsResponse {
  query: string;
}

export interface ISyncResponse {
  message: string;
  synced: number;
  total: number;
}

export interface IAuthResponse {
  authUrl: string;
}

export interface IUserResponse {
  user: IUser;
}

export interface IUserStats {
  totalEmails: number;
  unreadEmails: number;
  starredEmails: number;
  lastSync: string | null;
}

export interface IStatsResponse {
  stats: IUserStats;
}

export interface IPreferencesResponse {
  preferences: IUserPreference;
}

export interface IFolderStats {
  folder: string;
  total: number;
  unread: number;
}

export interface IFolder {
  name: string;
  fullName: string;
  delimiter: string;
  flags: string[];
}

// ============================================
// Context Types
// ============================================

export interface IAuthContext {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getGoogleAuthUrl: () => Promise<string>;
  updateUser: (userData: Partial<IUser>) => void;
  checkAuth: () => Promise<void>;
}

// ============================================
// Component Props Types
// ============================================

export interface IEmailListProps {
  emails: IEmail[];
  onToggleStar: (emailId: number) => void;
  onMarkAsRead: (emailId: number) => void;
}

export interface IPaginationProps {
  pagination: IPagination;
  onPageChange: (page: number) => void;
}

export interface ISearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  loading: boolean;
  placeholder?: string;
}
