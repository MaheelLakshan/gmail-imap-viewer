import React, { useState } from 'react';
import { RefreshCw, File, Edit } from 'lucide-react';
import { useEmails } from '../hooks/useEmails';
import EmailList from '../components/EmailList';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';

const DraftsPage: React.FC = () => {
  const { emails, pagination, loading, syncEmails, changePage, toggleStar, markAsRead } = useEmails('[Gmail]/Drafts');

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
            <File className="w-6 h-6 text-gray-500" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Drafts</h1>
            {pagination && <span className="text-sm text-gray-500">({pagination.total} drafts)</span>}
          </div>

          <div className="flex items-center gap-3">
            {/* Sync button */}
            <button onClick={handleSync} disabled={syncing} className="btn-secondary flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{syncing ? 'Syncing...' : 'Sync'}</span>
            </button>
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
            <Edit className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No drafts</p>
            <p className="text-sm">Save email drafts to access them here</p>
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

export default DraftsPage;
