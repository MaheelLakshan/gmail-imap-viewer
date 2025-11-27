import { useState, useCallback, useEffect, useRef } from 'react';
import { emailAPI } from '../services/api';
import { IEmail, IPagination } from '../types';
import toast from 'react-hot-toast';

/**
 * Hook for fetching and managing email list
 */
export const useEmails = (initialFolder: string = 'INBOX') => {
  const [emails, setEmails] = useState<IEmail[]>([]);
  const [pagination, setPagination] = useState<IPagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [folder, setFolder] = useState<string>(initialFolder);

  const fetchEmails = useCallback(
    async (page: number = 1, currentFolder: string = folder): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await emailAPI.getEmails({
          page,
          limit: pagination.limit,
          folder: currentFolder,
        });

        setEmails(response.data.emails);
        setPagination(response.data.pagination);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load emails';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [folder, pagination.limit]
  );

  const syncEmails = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await emailAPI.syncEmails({ folder, limit: 50 });
      toast.success(`Synced ${response.data.synced} emails`);
      await fetchEmails(1);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync emails';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [folder, fetchEmails]);

  const changePage = useCallback(
    (newPage: number): void => {
      fetchEmails(newPage);
    },
    [fetchEmails]
  );

  const changeFolder = useCallback(
    (newFolder: string): void => {
      setFolder(newFolder);
      fetchEmails(1, newFolder);
    },
    [fetchEmails]
  );

  const toggleStar = useCallback(async (emailId: number): Promise<void> => {
    try {
      const response = await emailAPI.toggleStar(emailId);
      setEmails((prev) => prev.map((email) => (email.id === emailId ? { ...email, is_starred: response.data.is_starred } : email)));
    } catch (err) {
      toast.error('Failed to update star');
    }
  }, []);

  const markAsRead = useCallback(async (emailId: number): Promise<void> => {
    try {
      await emailAPI.markAsRead(emailId);
      setEmails((prev) => prev.map((email) => (email.id === emailId ? { ...email, is_read: true } : email)));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, []);

  useEffect(() => {
    fetchEmails(1);
  }, []);

  return {
    emails,
    pagination,
    loading,
    error,
    folder,
    fetchEmails,
    syncEmails,
    changePage,
    changeFolder,
    toggleStar,
    markAsRead,
  };
};

/**
 * Hook for searching emails
 */
export const useEmailSearch = () => {
  const [results, setResults] = useState<IEmail[]>([]);
  const [pagination, setPagination] = useState<IPagination | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');

  const search = useCallback(async (searchQuery: string, page: number = 1): Promise<void> => {
    if (!searchQuery.trim()) {
      setResults([]);
      setPagination(null);
      return;
    }

    setLoading(true);
    setQuery(searchQuery);

    try {
      const response = await emailAPI.searchEmails(searchQuery, { page, limit: 20 });
      setResults(response.data.emails);
      setPagination(response.data.pagination);
    } catch (err) {
      toast.error('Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback((): void => {
    setResults([]);
    setPagination(null);
    setQuery('');
  }, []);

  return {
    results,
    pagination,
    loading,
    query,
    search,
    clearSearch,
  };
};

/**
 * Hook for single email operations
 */
export const useEmail = (emailId: number | null) => {
  const [email, setEmail] = useState<IEmail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmail = useCallback(async (): Promise<void> => {
    if (!emailId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await emailAPI.getEmail(emailId);
      setEmail(response.data.email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load email';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [emailId]);

  useEffect(() => {
    fetchEmail();
  }, [fetchEmail]);

  return { email, loading, error, refetch: fetchEmail };
};

/**
 * Debounce hook
 */
export const useDebounce = <T extends (...args: any[]) => any>(callback: T, delay: number): ((...args: Parameters<T>) => void) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
};
