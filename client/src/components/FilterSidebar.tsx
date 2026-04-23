import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useGigStore } from '../store/gigStore';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'web-development', label: '💻 Web Development' },
  { value: 'mobile-apps',     label: '📱 Mobile Apps' },
  { value: 'design',          label: '🎨 Design' },
  { value: 'writing',         label: '✍️ Writing' },
  { value: 'marketing',       label: '📣 Marketing' },
  { value: 'video-animation', label: '🎬 Video & Animation' },
  { value: 'music-audio',     label: '🎵 Music & Audio' },
  { value: 'data',            label: '📊 Data' },
  { value: 'business',        label: '💼 Business' },
  { value: 'ai-services',     label: '🤖 AI Services' },
];

const SORTS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: '-averageRating', label: 'Top Rated' },
  { value: '-totalOrders', label: 'Best Selling' },
  { value: 'packages.price', label: 'Price: Low to High' },
  { value: '-packages.price', label: 'Price: High to Low' },
];

const FilterSidebar = () => {
  const { filters, setFilters, resetFilters } = useGigStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        id="filter-toggle"
        onClick={() => setOpen(!open)}
        className="btn-secondary flex items-center gap-2 lg:hidden"
      >
        <SlidersHorizontal className="w-4 h-4" /> Filters
      </button>

      {/* Sidebar */}
      <aside className={`
        lg:flex flex-col gap-5 w-64 shrink-0
        ${open ? 'flex' : 'hidden'}
      `}>
        <div className="glass-dark p-5 rounded-2xl flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Filters</h3>
            <button onClick={resetFilters} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              <X className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <select
              id="filter-category"
              value={filters.category}
              onChange={(e) => setFilters({ category: e.target.value })}
              className="input text-sm"
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Price range */}
          <div>
            <label className="label">Price Range ($)</label>
            <div className="flex gap-2">
              <input id="filter-min-price" type="number" placeholder="Min" min={0}
                value={filters.minPrice}
                onChange={(e) => setFilters({ minPrice: e.target.value ? +e.target.value : '' })}
                className="input text-sm" />
              <input id="filter-max-price" type="number" placeholder="Max" min={0}
                value={filters.maxPrice}
                onChange={(e) => setFilters({ maxPrice: e.target.value ? +e.target.value : '' })}
                className="input text-sm" />
            </div>
          </div>

          {/* Min rating */}
          <div>
            <label className="label">Minimum Rating</label>
            <select id="filter-rating" value={filters.minRating}
              onChange={(e) => setFilters({ minRating: e.target.value ? +e.target.value : '' })}
              className="input text-sm"
            >
              <option value="">Any Rating</option>
              {[4.5, 4, 3.5, 3].map((r) => (
                <option key={r} value={r}>⭐ {r}+</option>
              ))}
            </select>
          </div>

          {/* Delivery days */}
          <div>
            <label className="label">Delivery Time</label>
            <select id="filter-delivery" value={filters.deliveryDays}
              onChange={(e) => setFilters({ deliveryDays: e.target.value ? +e.target.value : '' })}
              className="input text-sm"
            >
              <option value="">Any</option>
              <option value={1}>Up to 1 day</option>
              <option value={3}>Up to 3 days</option>
              <option value={7}>Up to 7 days</option>
              <option value={14}>Up to 14 days</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="label">Sort By</label>
            <select id="filter-sort" value={filters.sort}
              onChange={(e) => setFilters({ sort: e.target.value })}
              className="input text-sm"
            >
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </aside>
    </>
  );
};

interface SearchBarProps { fullWidth?: boolean; }

export const SearchBar = ({ fullWidth }: SearchBarProps) => {
  const navigate = useNavigate();
  const { filters, setFilters } = useGigStore();
  const [input, setInput] = useState(filters.q);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ q: input });
    navigate(`/search?q=${encodeURIComponent(input)}`);
  };

  return (
    <form id="search-form" onSubmit={handleSearch}
      className={`flex items-center gap-2 ${fullWidth ? 'w-full' : 'w-full max-w-xl'}`}
    >
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          id="search-input"
          type="search"
          placeholder="Search for any service..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input pl-10 pr-4"
        />
      </div>
      <button type="submit" id="search-submit" className="btn-primary">
        Search
      </button>
    </form>
  );
};

export default FilterSidebar;
