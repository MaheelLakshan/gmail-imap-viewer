import React, { useState, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { ISearchBarProps } from '../types';
import { useDebounce } from '../hooks/useEmails';

const SearchBar: React.FC<ISearchBarProps> = ({ onSearch, onClear, loading, placeholder = 'Search emails...' }) => {
  const [query, setQuery] = useState<string>('');

  const debouncedSearch = useDebounce((value: string) => {
    if (value.trim().length >= 2) {
      onSearch(value);
    }
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length >= 2) {
      debouncedSearch(value);
    } else if (value.length === 0) {
      onClear();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      onSearch(query);
    }
  };

  const handleClear = (): void => {
    setQuery('');
    onClear();
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     dark:bg-gray-800 dark:border-gray-600 dark:text-white
                     placeholder-gray-400"
        />

        {loading && <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />}

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full 
                       hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {query.length > 0 && query.length < 2 && <p className="absolute mt-1 text-xs text-gray-500">Type at least 2 characters to search</p>}
    </form>
  );
};

export default SearchBar;
