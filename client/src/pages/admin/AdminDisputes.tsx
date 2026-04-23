import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api';
import type { Dispute } from '../../types';
import { formatDate, formatCurrency } from '../../utils/dateUtils';
import {
  AlertTriangle, CheckCircle, Scale, X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_BADGE: Record<string, string> = {
  open: 'badge-danger',
  under_review: 'badge-warning',
  resolved_client: 'badge-success',
  resolved_freelancer: 'badge-success',
  closed: 'badge-gray',
};

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Resolve modal
  const [resolving, setResolving] = useState<Dispute | null>(null);
  const [favorOf, setFavorOf] = useState<'client' | 'freelancer'>('client');
  const [resolution, setResolution] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadDisputes = (p: number) => {
    setLoading(true);
    adminAPI.getDisputes({ page: p, limit: 15, status: statusFilter || undefined })
      .then(({ data }) => { setDisputes(data.disputes); setTotal(data.total); setPage(p); })
      .catch(() => toast.error('Failed to load disputes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDisputes(1); }, [statusFilter]);

  const handleResolve = async () => {
    if (!resolving || !resolution.trim()) { toast.error('Please provide a resolution note.'); return; }
    setSubmitting(true);
    try {
      const { data } = await adminAPI.resolveDispute(resolving._id, { resolution, favorOf });
      setDisputes(disputes.map(d => d._id === resolving._id ? data.dispute : d));
      toast.success('Dispute resolved!');
      setResolving(null);
      setResolution('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resolve.');
    } finally {
      setSubmitting(false);
    }
  };

  const pages = Math.ceil(total / 15);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="section-title text-xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" /> Disputes ({total})
        </h2>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-40 text-sm !py-2">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="under_review">Under Review</option>
          <option value="resolved_client">Resolved (Client)</option>
          <option value="resolved_freelancer">Resolved (Freelancer)</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))
        ) : disputes.length === 0 ? (
          <div className="glass-dark rounded-2xl py-16 text-center">
            <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No disputes found.</p>
          </div>
        ) : (
          disputes.map((d) => (
            <div key={d._id} className="glass-dark rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={STATUS_BADGE[d.status] || 'badge-gray'}>
                      {d.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-500">#{d._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{d.reason}</p>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>Raised by: <strong className="text-white">{d.raisedBy?.name}</strong></span>
                    <span>Against: <strong className="text-white">{d.against?.name}</strong></span>
                    <span>Order: {formatCurrency(typeof d.order === 'object' ? d.order.price : 0)}</span>
                    <span>{formatDate(d.createdAt)}</span>
                  </div>
                  {d.resolution && (
                    <div className="mt-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <p className="text-xs text-emerald-400 font-semibold mb-1">Resolution:</p>
                      <p className="text-sm text-slate-300">{d.resolution}</p>
                    </div>
                  )}
                </div>
                {d.status === 'open' && (
                  <button onClick={() => setResolving(d)}
                    className="btn-primary btn-sm flex items-center gap-2 shrink-0">
                    <Scale className="w-4 h-4" /> Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => loadDisputes(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-brand-500 text-white' : 'bg-surface-700 text-slate-400 hover:bg-surface-600'}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      {resolving && (
        <div className="modal-overlay" onClick={() => setResolving(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="modal-title !mb-0">Resolve Dispute</h3>
              <button onClick={() => setResolving(null)} className="btn-ghost btn-icon">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 glass rounded-xl">
              <p className="text-sm text-slate-300">{resolving.reason}</p>
              <p className="text-xs text-slate-500 mt-1">
                {resolving.raisedBy?.name} vs {resolving.against?.name}
              </p>
            </div>

            <div className="mb-4">
              <label className="label">Decide in favor of</label>
              <div className="flex gap-3">
                {(['client', 'freelancer'] as const).map((f) => (
                  <button key={f} onClick={() => setFavorOf(f)}
                    className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                      favorOf === f
                        ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                        : 'border-white/10 text-slate-400 hover:bg-white/5'
                    }`}>
                    {f === 'client' ? '👤 Client' : '🧑‍💻 Freelancer'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="label">Resolution Note *</label>
              <textarea value={resolution} onChange={(e) => setResolution(e.target.value)}
                className="input min-h-[80px]" placeholder="Explain the resolution decision..." />
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setResolving(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleResolve} disabled={submitting || !resolution.trim()}
                className="btn-primary flex items-center gap-2">
                {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <CheckCircle className="w-4 h-4" />}
                {submitting ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
