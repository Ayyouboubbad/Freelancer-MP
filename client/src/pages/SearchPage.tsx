import React, { useEffect, useState } from 'react';
import { useGigStore } from '../store/gigStore';
import GigGrid from '../components/GigGrid';
import FilterSidebar from '../components/FilterSidebar';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../components/FilterSidebar';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const { gigs, loading, total, page, pages, fetchGigs, searchGigs, setFilters } = useGigStore();

  useEffect(() => {
    if (q) {
      setFilters({ q });
      searchGigs(1);
    } else {
      fetchGigs(1);
    }
  }, [q]);

  const handlePage = (p: number) => q ? searchGigs(p) : fetchGigs(p);

  return (
    <div className="page">
      <div className="mb-6">
        <SearchBar fullWidth />
        {q && (
          <p className="text-slate-400 text-sm mt-3">
            Showing <strong className="text-white">{total}</strong> results for "{q}"
          </p>
        )}
      </div>
      <div className="flex gap-6">
        <FilterSidebar />
        <div className="flex-1 min-w-0">
          <GigGrid gigs={gigs} loading={loading} page={page} pages={pages} onPageChange={handlePage} />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
