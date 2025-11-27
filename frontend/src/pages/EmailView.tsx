import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import { ArrowLeft, Star, Paperclip, User, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { useEmail } from '../hooks/useEmails';
import { emailAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const EmailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const emailId = id ? parseInt(id, 10) : null;
  const { email, loading, error, refetch } = useEmail(emailId);
  const [starring, setStarring] = useState<boolean>(false);

  const handleBack = (): void => {
    navigate(-1);
  };

  const handleToggleStar = async (): Promise<void> => {
    if (!email) return;
    setStarring(true);
    try {
      // ========== DUMMY DATA - Uncomment to use ==========
      // await new Promise((r) => setTimeout(r, 200));
      // refetch();
      // return;
      // ===================================================

      await emailAPI.toggleStar(email.id);
      refetch();
    } catch (err) {
      toast.error('Failed to update star');
    } finally {
      setStarring(false);
    }
  };

  // Sanitize HTML content
  const sanitizedHtml = useMemo((): string | null => {
    if (!email?.body_html) return null;
    return DOMPurify.sanitize(email.body_html, {
      ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'img', 'div', 'span'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'style', 'class', 'target'],
      ALLOW_DATA_ATTR: false,
    });
  }, [email?.body_html]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Email Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'The email you are looking for does not exist'}</p>
          <button onClick={handleBack} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-medium text-gray-900 dark:text-white truncate max-w-md">{email.subject || '(No Subject)'}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleToggleStar} disabled={starring} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Star className={`w-5 h-5 ${email.is_starred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
            </button>
            <button onClick={refetch} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Email content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Email header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{email.subject || '(No Subject)'}</h2>

              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary-600" />
                </div>

                {/* Sender info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{email.sender_name || 'Unknown Sender'}</p>
                      <p className="text-sm text-gray-500">{email.sender_email}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{email.received_at && format(new Date(email.received_at), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>

                  {/* To */}
                  {email.recipient_email && <p className="mt-2 text-sm text-gray-500">To: {email.recipient_email}</p>}
                </div>
              </div>

              {/* Attachments */}
              {email.has_attachments && email.attachments && email.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Paperclip className="w-4 h-4" />
                    <span>{email.attachments.length} attachment(s)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {email.attachments.map((att, idx) => (
                      <div key={idx} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                        {att.filename}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Email body */}
            <div className="p-6">{sanitizedHtml ? <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} /> : email.body_text ? <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300">{email.body_text}</pre> : <p className="text-gray-500 italic">No content available</p>}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailView;
