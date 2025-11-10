import React from 'react';
import type { FlightSearchParams } from "../model/searchParams";

interface SearchHistoryProps {
  history: FlightSearchParams[];
  onSelect: (params: FlightSearchParams) => void;
  onClear: () => void;
  isFetching?: boolean;
}

const summarize = (p: FlightSearchParams) => {
  const parts: string[] = [];
  if (p.from || p.to) {
    const from = (p.from || '?').toUpperCase();
    const to = (p.to || '?').toUpperCase();
    parts.push(`${from} → ${to}`);
  }
  if (p.dateFrom) parts.push(p.dateFrom + (p.dateTo ? ` - ${p.dateTo}` : ''));
  if (p.class) parts.push(p.class);
  if (p.seatCount) parts.push(`${p.seatCount} seat${p.seatCount > 1 ? 's' : ''}`);
  if (p.priceRange) parts.push(`€${p.priceRange}`);
  if (p.sort) parts.push(`sort:${p.sort}`);
  return parts.join(' • ') || 'No filters (all flights)';
};

export const SearchHistory: React.FC<SearchHistoryProps> = ({ history, onSelect, onClear, isFetching }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">Search History</h2>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-red-600 hover:text-red-700"
            title="Clear search history"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {history.length === 0 && (
          <p className="text-xs text-gray-500">No searches yet.</p>
        )}
        {history.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(item)}
            disabled={isFetching}
            className="w-full text-left rounded border border-gray-200 bg-white hover:bg-indigo-50 disabled:opacity-50 p-2 transition-colors group"
          >
            <div className="text-xs font-medium text-gray-800 group-hover:text-indigo-700 truncate">
              {summarize(item)}
            </div>
            <div className="text-[10px] text-gray-400 mt-1 flex flex-wrap gap-1">
              {item.page > 1 && <span>page:{item.page}</span>}
            </div>
          </button>
        ))}
      </div>
      {history.length > 0 && (
        <p className="mt-2 text-[10px] text-gray-400">Latest first — max 10 stored</p>
      )}
    </div>
  );
};

export default SearchHistory;
