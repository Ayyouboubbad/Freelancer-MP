import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderAPI, reviewAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import type { Order } from '../types';
import { formatDate, formatCurrency, formatDistanceToNow } from '../utils/dateUtils';
import StarRating from '../components/StarRating';
import {
  ArrowLeft, Clock, CheckCircle, AlertTriangle, RefreshCw, XCircle,
  Package, Upload, Send, Star, Truck, FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['active', 'delivered', 'completed'];

const STATUS_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',     color: 'text-slate-400',   icon: Clock },
  active:    { label: 'In Progress', color: 'text-brand-400',   icon: RefreshCw },
  delivered: { label: 'Delivered',   color: 'text-amber-400',   icon: Truck },
  revision:  { label: 'Revision',    color: 'text-orange-400',  icon: RefreshCw },
  completed: { label: 'Completed',   color: 'text-emerald-400', icon: CheckCircle },
  cancelled: { label: 'Cancelled',   color: 'text-red-400',     icon: XCircle },
  disputed:  { label: 'Disputed',    color: 'text-red-400',     icon: AlertTriangle },
};

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Deliver form
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryFiles, setDeliveryFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Revision form
  const [revisionNote, setRevisionNote] = useState('');

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    orderAPI.getOrder(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => toast.error('Order not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const isClient = user?._id === order?.client?._id;
  const isFreelancer = user?._id === order?.freelancer?._id;
  const meta = order ? STATUS_META[order.status] : null;

  const handleDeliver = async () => {
    if (!order) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('note', deliveryNote);
      if (deliveryFiles) {
        Array.from(deliveryFiles).forEach((f) => formData.append('files', f));
      }
      const { data } = await orderAPI.deliverOrder(order._id, formData);
      setOrder(data.order);
      toast.success('Delivery submitted!');
      setDeliveryNote('');
      setDeliveryFiles(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delivery failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (action: 'accept' | 'revision' | 'cancel') => {
    if (!order) return;
    const note = action === 'revision' ? revisionNote : action === 'cancel' ? 'Cancelled by user' : '';
    if (action === 'cancel' && !window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const { data } = await orderAPI.updateOrderStatus(order._id, { action, note });
      setOrder(data.order);
      toast.success(`Order ${action === 'accept' ? 'completed' : action === 'revision' ? 'revision requested' : 'cancelled'}!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleReview = async () => {
    if (!order || !reviewComment.trim()) return;
    try {
      await reviewAPI.createReview({
        order: order._id,
        gig: order.gig._id || order.gig,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Review submitted!');
      setReviewSubmitted(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Review failed.');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton h-8 w-48 rounded mb-6" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 skeleton h-96 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page text-center py-20">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
        <Link to="/" className="btn-primary mt-4">Go Home</Link>
      </div>
    );
  }

  const stepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="page">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost btn-icon">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="section-title text-2xl">Order Details</h1>
          <p className="text-sm text-slate-400">#{order._id.slice(-8).toUpperCase()}</p>
        </div>
        {meta && (
          <span className={`ml-auto badge ${
            order.status === 'completed' ? 'badge-success' :
            order.status === 'cancelled' || order.status === 'disputed' ? 'badge-danger' :
            order.status === 'delivered' ? 'badge-warning' : 'badge-brand'
          }`}>
            <meta.icon className="w-3 h-3" /> {meta.label}
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gig info */}
          <div className="glass-dark rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <img
                src={order.gig?.images?.[0] || 'https://placehold.co/80x80/1c1c38/6654ef?text=G'}
                alt="" className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link to={`/gig/${typeof order.gig === 'object' ? order.gig._id : order.gig}`}
                  className="text-base font-semibold text-white hover:text-brand-300 transition-colors">
                  {order.gig?.title || 'Gig'}
                </Link>
                <p className="text-sm text-slate-400 mt-1">
                  {isClient ? (
                    <>Freelancer: <Link to={`/profile/${order.freelancer._id}`} className="text-brand-400 hover:text-brand-300">{order.freelancer.name}</Link></>
                  ) : (
                    <>Client: <Link to={`/profile/${order.client._id}`} className="text-brand-400 hover:text-brand-300">{order.client.name}</Link></>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="glass-dark rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Order Progress</h3>
            <div className="step-indicator">
              {STATUS_STEPS.map((step, i) => (
                <React.Fragment key={step}>
                  <div className={`step-dot ${i < stepIdx ? 'completed' : i === stepIdx && order.status !== 'cancelled' ? 'current' : 'upcoming'}`}>
                    {i < stepIdx ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`step-line ${i < stepIdx ? 'completed' : 'upcoming'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {STATUS_STEPS.map((step) => (
                <span key={step} className="text-xs text-slate-500 capitalize">{step}</span>
              ))}
            </div>
          </div>

          {/* Requirements */}
          {order.requirements && (
            <div className="glass-dark rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-400" /> Requirements
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{order.requirements}</p>
            </div>
          )}

          {/* Delivery */}
          {order.delivery && (
            <div className="glass-dark rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" /> Delivery
              </h3>
              {order.delivery.note && (
                <p className="text-sm text-slate-300 mb-3 whitespace-pre-wrap">{order.delivery.note}</p>
              )}
              {order.delivery.files?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {order.delivery.files.map((f, i) => (
                    <a key={i} href={f} target="_blank" rel="noopener noreferrer"
                      className="badge-brand flex items-center gap-1 hover:bg-brand-500/30 transition-colors">
                      <FileText className="w-3 h-3" /> File {i + 1}
                    </a>
                  ))}
                </div>
              )}
              {order.delivery.deliveredAt && (
                <p className="text-xs text-slate-500 mt-2">Delivered {formatDistanceToNow(order.delivery.deliveredAt)}</p>
              )}
            </div>
          )}

          {/* Revision note */}
          {order.status === 'revision' && order.revisionNote && (
            <div className="glass-dark rounded-2xl p-5 border border-orange-500/20">
              <h3 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Revision Requested
              </h3>
              <p className="text-sm text-slate-300">{order.revisionNote}</p>
              <p className="text-xs text-slate-500 mt-2">Revision {order.revisionCount}/{order.package?.revisions || '∞'}</p>
            </div>
          )}

          {/* ── Freelancer: Deliver Form ──────────────────────────── */}
          {isFreelancer && ['active', 'revision'].includes(order.status) && (
            <div className="glass-dark rounded-2xl p-5 border border-brand-500/20">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-brand-400" /> Submit Delivery
              </h3>
              <textarea
                value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)}
                className="input mb-3 min-h-[80px]" placeholder="Describe what you're delivering..."
              />
              <label className="flex items-center gap-2 mb-3 cursor-pointer">
                <span className="btn-secondary btn-sm flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Attach Files
                </span>
                <span className="text-xs text-slate-400">
                  {deliveryFiles ? `${deliveryFiles.length} file(s) selected` : 'No files chosen'}
                </span>
                <input type="file" multiple className="hidden"
                  onChange={(e) => setDeliveryFiles(e.target.files)} />
              </label>
              <button onClick={handleDeliver} disabled={submitting || !deliveryNote.trim()}
                className="btn-primary flex items-center gap-2">
                {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Submitting...' : 'Submit Delivery'}
              </button>
            </div>
          )}

          {/* ── Client: Accept / Revision / Cancel ──────────────── */}
          {isClient && order.status === 'delivered' && (
            <div className="glass-dark rounded-2xl p-5 space-y-4 border border-emerald-500/20">
              <h3 className="text-sm font-semibold text-white">The freelancer has delivered!</h3>
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => handleAction('accept')} className="btn-primary flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Accept & Complete
                </button>
                <button onClick={() => {
                  const note = prompt('Describe the changes you need:');
                  if (note) { setRevisionNote(note); handleAction('revision'); }
                }} className="btn-secondary flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Request Revision
                </button>
              </div>
            </div>
          )}

          {/* ── Client: Leave Review (after completion) ──────────── */}
          {isClient && order.status === 'completed' && !reviewSubmitted && (
            <div className="glass-dark rounded-2xl p-5 border border-amber-500/20">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" /> Leave a Review
              </h3>
              <div className="flex items-center gap-2 mb-3">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} onClick={() => setReviewRating(s)}
                    className={`text-2xl transition-transform hover:scale-110 ${s <= reviewRating ? '' : 'opacity-30'}`}>
                    ⭐
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                className="input mb-3 min-h-[80px]" placeholder="Share your experience..."
              />
              <button onClick={handleReview} disabled={!reviewComment.trim()}
                className="btn-primary flex items-center gap-2">
                <Send className="w-4 h-4" /> Submit Review
              </button>
            </div>
          )}

          {/* Cancel button */}
          {(isClient || isFreelancer) && ['pending', 'active'].includes(order.status) && (
            <button onClick={() => handleAction('cancel')}
              className="btn-danger flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Cancel Order
            </button>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price card */}
          <div className="glass-dark rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Package</span>
                <span className="text-white font-medium capitalize">{order.package?.title || order.package?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Price</span>
                <span className="text-brand-300 font-bold text-lg">{formatCurrency(order.price)}</span>
              </div>
              <div className="divider !my-3" />
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery</span>
                <span className="text-white">{order.package?.deliveryDays || '—'} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Revisions</span>
                <span className="text-white">{order.revisionCount || 0}/{order.package?.revisions || '∞'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deadline</span>
                <span className="text-white">{order.deadline ? formatDate(order.deadline) : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ordered</span>
                <span className="text-white">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment</span>
                <span className={order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-red-400'}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Package features */}
          {order.package?.features?.length > 0 && (
            <div className="glass-dark rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Includes</h3>
              <ul className="space-y-2">
                {order.package.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Participants */}
          <div className="glass-dark rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white mb-3">Participants</h3>
            {[
              { label: 'Client', user: order.client },
              { label: 'Freelancer', user: order.freelancer },
            ].map((p) => (
              <Link key={p.label} to={`/profile/${p.user._id}`}
                className="flex items-center gap-3 hover:bg-white/5 -mx-2 px-2 py-2 rounded-xl transition-colors">
                <img
                  src={p.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user._id}`}
                  alt="" className="w-10 h-10 rounded-full border border-white/10 object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-white">{p.user.name}</p>
                  <p className="text-xs text-slate-500">{p.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
