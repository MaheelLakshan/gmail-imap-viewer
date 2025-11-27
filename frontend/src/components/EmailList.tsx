import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isYesterday, isThisYear } from 'date-fns';
import { Star, Paperclip, Mail, MailOpen } from 'lucide-react';
import { IEmail, IEmailListProps } from '../types';

const EmailList: React.FC<IEmailListProps> = ({ emails, onToggleStar, onMarkAsRead }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    }
    if (isYesterday(date)) {
      return 'Yesterday';
    }
    if (isThisYear(date)) {
      return format(date, 'MMM d');
    }
    return format(date, 'MMM d, yyyy');
  };

  const handleEmailClick = (email: IEmail): void => {
    if (!email.is_read) {
      onMarkAsRead(email.id);
    }
    navigate(`/email/${email.id}`);
  };

  const handleStarClick = (e: React.MouseEvent<HTMLButtonElement>, emailId: number): void => {
    e.stopPropagation();
    onToggleStar(emailId);
  };

  if (!emails || emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Mail className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium">No emails found</p>
        <p className="text-sm">Try syncing your emails or adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {emails.map((email) => (
        <div
          key={email.id}
          onClick={() => handleEmailClick(email)}
          className={`
            email-item group
            ${!email.is_read ? 'email-item-unread' : ''}
          `}
        >
          {/* Star button */}
          <button onClick={(e) => handleStarClick(e, email.id)} className="flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
            <Star className={`w-5 h-5 ${email.is_starred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
          </button>

          {/* Read status icon */}
          <div className="flex-shrink-0">{email.is_read ? <MailOpen className="w-5 h-5 text-gray-400" /> : <Mail className="w-5 h-5 text-primary-600" />}</div>

          {/* Email content */}
          <div className="flex-1 min-w-0">
            {/* Sender and date */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={`text-sm truncate ${!email.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{email.sender_name || email.sender_email || 'Unknown'}</span>
              <span className="text-xs text-gray-500 flex-shrink-0">{formatDate(email.received_at)}</span>
            </div>

            {/* Subject */}
            <p className={`text-sm truncate ${!email.is_read ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{email.subject || '(No Subject)'}</p>

            {/* Snippet */}
            <p className="text-sm text-gray-500 truncate mt-0.5">{email.snippet}</p>
          </div>

          {/* Attachment indicator */}
          {email.has_attachments && <Paperclip className="flex-shrink-0 w-4 h-4 text-gray-400" />}
        </div>
      ))}
    </div>
  );
};

export default EmailList;
