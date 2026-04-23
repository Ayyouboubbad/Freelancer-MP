import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api';
import type { Gig } from '../../types';
import { formatCurrency } from '../../utils/dateUtils';
import {
  Package, Star, Eye, Sparkles, SparkleIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminGigs = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');

  const loadGigs = (p: number) => {
    setLoading(true);
    adminAPI.getAdminGigs({ page: p, limit: 15, isActive: activeFilter || undefined })
      .then(({ data }) => { setGigs(data.gigs); setTotal(data.total); setPage(p); })
      .catch(() => toast.error('Failed to load gigs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadGigs(1); }, [activeFilter]);

  const toggleFeature = async (gigId: string) => {
    try {
      const { data } = await adminAPI.featureGig(gigId);
      setGigs(gigs.map(g => g._id === gigId ? { ...g, isFeatured: data.isFeatured } : g));
      toast.success(data.isFeatured ? 'Gig featured!' : 'Gig unfeatured');
    } catch { toast.error('Failed to toggle feature.'); }
  };

  const pages = Math.ceil(total / 15);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="section-title text-xl flex items-center gap-2">
          <Package className="w-5 h-5 text-brand-400" /> Gigs ({total})
        </h2>
        <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}
          className="input w-36 text-sm !py-2">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="glass-dark rounded-2xl overflow-hidden overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Gig</th>
              <th>Seller</th>
              <th>Category</th>
              <th>Price (from)</th>
              <th>Rating</th>
              <th>Orders</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j}><div className="skeleton h-5 w-16 rounded" /></td>
                  ))}
                </tr>
              ))
            ) : gigs.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-slate-400">No gigs found.</td></tr>
            ) : (
              gigs.map((g) => (
                <tr key={g._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img src={g.images?.[0] || 'https://placehold.co/40x40/1c1c38/6654ef?text=G'}
                        alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0" />
                      <span className="font-medium text-white truncate max-w-[200px]">{g.title}</span>
                    </div>
                  </td>
                  <td className="text-slate-400 text-xs">
                    {typeof g.seller === 'object' ? g.seller.name : '—'}
                  </td>
                  <td><span className="badge-gray">{g.category}</span></td>
                  <td className="text-brand-300 font-semibold">
                    {g.packages?.[0] ? formatCurrency(g.packages[0].price) : '—'}
                  </td>
                  <td>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3" /> {g.averageRating?.toFixed(1) || '—'}
                    </span>
                  </td>
                  <td className="text-slate-300">{g.totalOrders}</td>
                  <td>
                    <button onClick={() => toggleFeature(g._id)}
                      className={`p-1.5 rounded-lg transition-all ${g.isFeatured ? 'bg-amber-500/20 text-amber-400' : 'bg-surface-700 text-slate-500 hover:text-slate-300'}`}>
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </td>
                  <td>
                    <Link to={`/gig/${g._id}`} className="btn-sm btn-ghost flex items-center gap-1">
                      <Eye className="w-3 h-3" /> View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => loadGigs(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-brand-500 text-white' : 'bg-surface-700 text-slate-400 hover:bg-surface-600'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGigs;
