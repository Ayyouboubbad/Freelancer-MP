import React from 'react';
import GigCard from './GigCard';
import type { Gig } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  gigs: Gig[];
  loading?: boolean;
  page: number;
  pages: number;
  onPageChange: (p: number) => void;
}

const SkeletonCard = () => (
  <div className="glass-dark rounded-2xl overflow-hidden animate-pulse">
    <div className="skeleton h-48 rounded-none" />
    <div className="p-4 flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <div className="skeleton w-7 h-7 rounded-full" />
        <div className="skeleton h-3 w-28 rounded" />
      </div>
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-3 w-3/4 rounded" />
      <div className="skeleton h-6 w-16 rounded ml-auto" />
    </div>
  </div>
);

const GigGrid = ({ gigs, loading, page, pages, onPageChange }: Props) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!gigs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="section-title mb-2">No gigs found</h3>
        <p className="text-slate-400">Try adjusting your filters or search term.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {gigs.map((g) => <GigCard key={g._id} gig={g} />)}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            id="pagination-prev"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="btn-icon btn-secondary disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              id={`pagination-page-${p}`}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                p === page
                  ? 'bg-gradient-brand text-white shadow-glow'
                  : 'bg-surface-700 text-slate-300 hover:bg-surface-600'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            id="pagination-next"
            onClick={() => onPageChange(page + 1)}
            disabled={page === pages}
            className="btn-icon btn-secondary disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default GigGrid;
