import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { RefreshCw, Inbox } from 'lucide-react';
import { useEmails, useEmailSearch } from '../hooks/useEmails';
import EmailList from '../components/EmailList';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { folderName } = useParams<{ folderName?: string }>();
  const currentFolder = folderName ? decodeURIComponent(folderName) : 'INBOX';

  const { emails, pagination, loading, syncEmails, changePage, toggleStar, markAsRead } = useEmails(currentFolder);

  const { results: searchResults, pagination: searchPagination, loading: searchLoading, query: searchQuery, search, clearSearch } = useEmailSearch();

  const [syncing, setSyncing] = useState<boolean>(false);

  const handleSync = async (): Promise<void> => {
    setSyncing(true);
    await syncEmails();
    setSyncing(false);
  };

  const displayEmails = searchQuery ? searchResults : emails;
  const displayPagination = searchQuery ? searchPagination : pagination;
  const isLoading = loading || searchLoading;

  const getFolderTitle = (): string => {
    if (currentFolder === 'INBOX') return 'Inbox';
    if (currentFolder.includes('Starred')) return 'Starred';
    if (currentFolder.includes('Sent')) return 'Sent Mail';
    if (currentFolder.includes('Drafts')) return 'Drafts';
    if (currentFolder.includes('Trash')) return 'Trash';
    return currentFolder;
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Inbox className="w-6 h-6 text-primary-600" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{getFolderTitle()}</h1>
            {pagination && <span className="text-sm text-gray-500">({pagination.total} emails)</span>}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 sm:w-80">
              <SearchBar onSearch={search} onClear={clearSearch} loading={searchLoading} />
            </div>

            {/* Sync button */}
            <button onClick={handleSync} disabled={syncing} className="btn-secondary flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{syncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>

        {/* Search indicator */}
        {searchQuery && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-gray-500">Search results for:</span>
            <span className="font-medium text-gray-900 dark:text-white">"{searchQuery}"</span>
            <button onClick={clearSearch} className="text-primary-600 hover:text-primary-700">
              Clear
            </button>
          </div>
        )}
      </header>

      {/* Email list */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-800">
        {isLoading && !displayEmails.length ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <EmailList emails={displayEmails} onToggleStar={toggleStar} onMarkAsRead={markAsRead} />
        )}
      </div>

      {/* Pagination */}
      {displayPagination && displayPagination.totalPages > 1 && <Pagination pagination={displayPagination} onPageChange={searchQuery ? (page) => search(searchQuery, page) : changePage} />}
    </div>
  );
};

export default Dashboard;
