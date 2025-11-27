import React, { useState } from 'react';
import { RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import { useEmails } from '../hooks/useEmails';
import EmailList from '../components/EmailList';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';

const TrashPage: React.FC = () => {
  const { emails, pagination, loading, syncEmails, changePage, toggleStar, markAsRead } = useEmails('[Gmail]/Trash');

  const [syncing, setSyncing] = useState<boolean>(false);

  const handleSync = async (): Promise<void> => {
    setSyncing(true);
    await syncEmails();
    setSyncing(false);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Trash2 className="w-6 h-6 text-red-500" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Trash</h1>
            {pagination && <span className="text-sm text-gray-500">({pagination.total} items)</span>}
          </div>

          <div className="flex items-center gap-3">
            {/* Sync button */}
            <button onClick={handleSync} disabled={syncing} className="btn-secondary flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{syncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>

        {/* Warning notice */}
        <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium">Items in trash will be automatically deleted after 30 days</p>
            <p className="text-xs mt-1">Deleted emails are permanently removed from your account</p>
          </div>
        </div>
      </header>

      {/* Email list */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-800">
        {loading && !emails.length ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Trash2 className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">Trash is empty</p>
            <p className="text-sm">Deleted emails will appear here</p>
          </div>
        ) : (
          <EmailList emails={emails} onToggleStar={toggleStar} onMarkAsRead={markAsRead} />
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && <Pagination pagination={pagination} onPageChange={changePage} />}
    </div>
  );
};

export default TrashPage;
