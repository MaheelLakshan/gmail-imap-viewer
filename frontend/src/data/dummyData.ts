import { IEmail, IUser, IUserPreference, IUserStats, IFolder } from '../types';

// ============================================
// Dummy User Data
// ============================================

export const DUMMY_USER: IUser = {
  id: 1,
  email: 'johndoe@gmail.com',
  name: 'John Doe',
  picture: 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff',
  last_sync: new Date().toISOString(),
  preferences: {
    id: 1,
    user_id: 1,
    emails_per_page: 20,
    default_folder: 'INBOX',
    theme: 'system',
    notifications_enabled: true,
    auto_sync_interval: 5,
  },
};

export const DUMMY_PREFERENCES: IUserPreference = {
  id: 1,
  user_id: 1,
  emails_per_page: 20,
  default_folder: 'INBOX',
  theme: 'system',
  notifications_enabled: true,
  auto_sync_interval: 5,
};

export const DUMMY_STATS: IUserStats = {
  totalEmails: 156,
  unreadEmails: 23,
  starredEmails: 12,
  lastSync: new Date().toISOString(),
};

// ============================================
// Dummy Email Data
// ============================================

export const DUMMY_EMAILS: IEmail[] = [
  {
    id: 1,
    uid: 1001,
    message_id: 'msg-001@gmail.com',
    subject: 'Welcome to Gmail IMAP Viewer!',
    sender_email: 'support@example.com',
    sender_name: 'Support Team',
    recipient_email: 'johndoe@gmail.com',
    snippet: 'Thank you for signing up. We are excited to have you on board...',
    body_text: 'Thank you for signing up. We are excited to have you on board. This application allows you to view and manage your Gmail emails securely using the IMAP protocol.',
    body_html: '<p>Thank you for signing up. We are excited to have you on board.</p><p>This application allows you to view and manage your Gmail emails securely using the IMAP protocol.</p>',
    received_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    is_read: false,
    is_starred: true,
    has_attachments: false,
    folder: 'INBOX',
  },
  {
    id: 2,
    uid: 1002,
    message_id: 'msg-002@gmail.com',
    subject: 'Your Weekly Report is Ready',
    sender_email: 'reports@company.com',
    sender_name: 'Analytics Dashboard',
    recipient_email: 'johndoe@gmail.com',
    snippet: 'Your weekly analytics report has been generated. Click here to view...',
    body_text: 'Your weekly analytics report has been generated. Click here to view your metrics and insights for the past week.',
    body_html: '<p>Your weekly analytics report has been generated.</p><p>Click here to view your metrics and insights for the past week.</p>',
    received_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    is_read: true,
    is_starred: false,
    has_attachments: true,
    folder: 'INBOX',
  },
  {
    id: 3,
    uid: 1003,
    message_id: 'msg-003@gmail.com',
    subject: 'Meeting Reminder: Project Sync',
    sender_email: 'calendar@company.com',
    sender_name: 'Calendar',
    recipient_email: 'johndoe@gmail.com',
    snippet: 'Reminder: You have a meeting scheduled for tomorrow at 10:00 AM...',
    body_text: 'Reminder: You have a meeting scheduled for tomorrow at 10:00 AM. Project Sync with the development team.',
    body_html: '<p>Reminder: You have a meeting scheduled for tomorrow at 10:00 AM.</p><p>Project Sync with the development team.</p>',
    received_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    is_read: false,
    is_starred: false,
    has_attachments: false,
    folder: 'INBOX',
  },
  {
    id: 4,
    uid: 1004,
    message_id: 'msg-004@gmail.com',
    subject: 'Invoice #12345 - Payment Received',
    sender_email: 'billing@service.com',
    sender_name: 'Billing Department',
    recipient_email: 'johndoe@gmail.com',
    snippet: 'Thank you for your payment. Your invoice #12345 has been paid successfully...',
    body_text: 'Thank you for your payment. Your invoice #12345 has been paid successfully. Amount: $99.00',
    body_html: '<p>Thank you for your payment.</p><p>Your invoice #12345 has been paid successfully.</p><p><strong>Amount:</strong> $99.00</p>',
    received_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    is_read: true,
    is_starred: true,
    has_attachments: true,
    folder: 'INBOX',
  },
  {
    id: 5,
    uid: 1005,
    message_id: 'msg-005@gmail.com',
    subject: 'New Feature Announcement',
    sender_email: 'product@app.com',
    sender_name: 'Product Team',
    recipient_email: 'johndoe@gmail.com',
    snippet: 'We are excited to announce our latest feature update. Check out what is new...',
    body_text: 'We are excited to announce our latest feature update. Check out what is new in version 2.0!',
    body_html: '<h2>New Feature Announcement</h2><p>We are excited to announce our latest feature update.</p><ul><li>Dark mode support</li><li>Improved search</li><li>Email threading</li></ul>',
    received_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    is_read: true,
    is_starred: false,
    has_attachments: false,
    folder: 'INBOX',
  },
  {
    id: 6,
    uid: 1006,
    message_id: 'msg-006@gmail.com',
    subject: 'Security Alert: New Login Detected',
    sender_email: 'security@google.com',
    sender_name: 'Google Security',
    recipient_email: 'johndoe@gmail.com',
    snippet: 'A new sign-in to your Google Account was detected. If this was you, you can ignore...',
    body_text: 'A new sign-in to your Google Account was detected. If this was you, you can ignore this message.',
    body_html: '<p>A new sign-in to your Google Account was detected.</p><p>If this was you, you can ignore this message.</p>',
    received_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    is_read: false,
    is_starred: false,
    has_attachments: false,
    folder: 'INBOX',
  },
  {
    id: 7,
    uid: 1007,
    message_id: 'msg-007@gmail.com',
    subject: 'Your Order Has Been Shipped',
    sender_email: 'orders@shop.com',
    sender_name: 'Online Shop',
    recipient_email: 'johndoe@gmail.com',
    snippet: 'Great news! Your order #ORD-789456 has been shipped and is on its way...',
    body_text: 'Great news! Your order #ORD-789456 has been shipped and is on its way. Track your package using the link below.',
    body_html: '<p>Great news! Your order #ORD-789456 has been shipped.</p><p>Track your package using the link below.</p>',
    received_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
    is_read: true,
    is_starred: false,
    has_attachments: false,
    folder: 'INBOX',
  },
  {
    id: 8,
    uid: 1008,
    message_id: 'msg-008@gmail.com',
    subject: 'Invitation: Team Building Event',
    sender_email: 'hr@company.com',
    sender_name: 'HR Department',
    recipient_email: 'johndoe@gmail.com',
    snippet: 'You are invited to our annual team building event. Please RSVP by Friday...',
    body_text: 'You are invited to our annual team building event. Please RSVP by Friday. Date: Next Saturday, 2:00 PM',
    body_html: '<p>You are invited to our annual team building event.</p><p>Please RSVP by Friday.</p><p><strong>Date:</strong> Next Saturday, 2:00 PM</p>',
    received_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // 5 days ago
    is_read: true,
    is_starred: true,
    has_attachments: true,
    folder: 'INBOX',
  },
];

// ============================================
// Dummy Folders
// ============================================

export const DUMMY_FOLDERS: IFolder[] = [
  { name: 'INBOX', fullName: 'INBOX', delimiter: '/', flags: [] },
  { name: 'Starred', fullName: '[Gmail]/Starred', delimiter: '/', flags: [] },
  { name: 'Sent Mail', fullName: '[Gmail]/Sent Mail', delimiter: '/', flags: [] },
  { name: 'Drafts', fullName: '[Gmail]/Drafts', delimiter: '/', flags: [] },
  { name: 'Trash', fullName: '[Gmail]/Trash', delimiter: '/', flags: [] },
];

// ============================================
// Helper to simulate API delay
// ============================================

export const simulateApiDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// ============================================
// Dummy API Response Generators
// ============================================

export const generatePaginatedEmails = (page: number = 1, limit: number = 20, emails: IEmail[] = DUMMY_EMAILS) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedEmails = emails.slice(start, end);

  return {
    emails: paginatedEmails,
    pagination: {
      total: emails.length,
      page,
      limit,
      totalPages: Math.ceil(emails.length / limit),
      hasMore: end < emails.length,
    },
  };
};

export const searchDummyEmails = (query: string, emails: IEmail[] = DUMMY_EMAILS) => {
  const lowerQuery = query.toLowerCase();
  return emails.filter((email) => email.subject?.toLowerCase().includes(lowerQuery) || email.snippet?.toLowerCase().includes(lowerQuery) || email.sender_name?.toLowerCase().includes(lowerQuery) || email.sender_email?.toLowerCase().includes(lowerQuery));
};
