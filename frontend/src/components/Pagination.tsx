import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IPaginationProps } from '../types';

const Pagination: React.FC<IPaginationProps> = ({ pagination, onPageChange }) => {
  const { page, totalPages, total, limit } = pagination;

  if (totalPages <= 1) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate page numbers to show
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const showPages = 5;
    let start = Math.max(1, page - Math.floor(showPages / 2));
    const end = Math.min(totalPages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* Info text */}
      <div className="text-sm text-gray-500">
        Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{total}</span> results
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`
                min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors
                ${pageNum === page ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
              `}
            >
              {pageNum}
            </button>
          ))}
        </div>

        {/* Current page indicator (mobile) */}
        <span className="sm:hidden px-3 text-sm text-gray-700 dark:text-gray-300">
          Page {page} of {totalPages}
        </span>

        {/* Next button */}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
