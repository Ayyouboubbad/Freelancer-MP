import React, { useEffect, useState } from 'react';
import { reviewAPI } from '../api';
import type { Review } from '../types';
import StarRating from './StarRating';
import { formatDate } from '../utils/dateUtils';
import { Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const GigReviews = ({ gigId }: { gigId: string }) => {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await reviewAPI.getGigReviews(gigId, { page, limit: 5 });
        setReviews(data.reviews);
        setTotal(data.total);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gigId, page]);

  const report = async (id: string) => {
    try {
      await reviewAPI.reportReview(id, { reason: 'Inappropriate content' });
      toast.success('Review reported.');
    } catch { toast.error('Failed to report.'); }
  };

  if (loading) return <div className="skeleton h-40 rounded-2xl" />;

  if (!reviews.length) {
    return <p className="text-slate-400 py-8 text-center">No reviews yet. Be the first!</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-400">{total} review{total !== 1 ? 's' : ''}</p>
      {reviews.map((r) => (
        <div key={r._id} className="glass-dark p-5 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={r.reviewer?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.reviewer?._id}`}
                alt={r.reviewer?.name} className="w-9 h-9 rounded-full border border-white/10 object-cover" />
              <div>
                <p className="text-sm font-semibold text-white">{r.reviewer?.name}</p>
                <p className="text-xs text-slate-500">{r.reviewer?.country} · {formatDate(r.createdAt)}</p>
              </div>
            </div>
            <StarRating rating={r.rating} size="sm" count={undefined} />
          </div>
          <p className="text-sm text-slate-300">{r.comment}</p>
          {user && user._id !== r.reviewer?._id && (
            <button onClick={() => report(r._id)}
              className="self-end flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors">
              <Flag className="w-3 h-3" /> Report
            </button>
          )}
        </div>
      ))}
      {total > reviews.length && (
        <button onClick={() => setPage(page + 1)} className="btn-outline btn-sm self-center mt-2">
          Load more reviews
        </button>
      )}
    </div>
  );
};

export default GigReviews;
