import React, { useState } from 'react';
import { RefreshCw, Send } from 'lucide-react';
import { useEmails, useEmailSearch } from '../hooks/useEmails';
import EmailList from '../components/EmailList';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';

const SentPage: React.FC = () => {
  const { emails, pagination, loading, syncEmails, changePage, toggleStar, markAsRead } = useEmails('[Gmail]/Sent Mail');

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

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Send className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Sent</h1>
            {pagination && <span className="text-sm text-gray-500">({pagination.total} emails)</span>}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 sm:w-80">
              <SearchBar onSearch={search} onClear={clearSearch} loading={searchLoading} placeholder="Search sent emails..." />
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
        ) : displayEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Send className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No sent emails</p>
            <p className="text-sm">Emails you send will appear here</p>
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

export default SentPage;
