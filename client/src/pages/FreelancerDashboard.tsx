import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gigAPI, orderAPI, messageAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import type { Gig, Order, Conversation } from '../types';
import LevelBadge from '../components/LevelBadge';
import { formatCurrency, formatDate, formatDistanceToNow } from '../utils/dateUtils';
import {
  Plus, TrendingUp, Package, Star, DollarSign,
  Eye, Trash2, MessageCircle, ArrowRight, Edit2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const FreelancerDashboard = () => {
  const { user } = useAuthStore();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgsLoading, setMsgsLoading] = useState(true);

  useEffect(() => {
    Promise.all([gigAPI.getMyGigs(), orderAPI.getMyOrders({ limit: 5 })])
      .then(([g, o]) => {
        setGigs(g.data.gigs);
        setRecentOrders(o.data.orders);
      })
      .catch(() => toast.error('Failed to load data.'))
      .finally(() => setLoading(false));

    messageAPI.getConversations()
      .then(({ data }) => setConversations(data.conversations?.slice(0, 5) || []))
      .catch(() => {/* silent */})
      .finally(() => setMsgsLoading(false));
  }, []);

  const deleteGig = async (id: string) => {
    if (!window.confirm('Delete this gig?')) return;
    try {
      await gigAPI.deleteGig(id);
      setGigs((prev) => prev.filter((g) => g._id !== id));
      toast.success('Gig deleted.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cannot delete.');
    }
  };

  const earnings         = user?.totalEarnings  || 0;
  const completed        = user?.completedOrders || 0;
  const totalImpressions = gigs.reduce((sum, g) => sum + g.impressions, 0);
  const avgRating        = gigs.length
    ? gigs.reduce((s, g) => s + g.averageRating, 0) / gigs.length : 0;

  // Count total unread messages
  const totalUnread = conversations.reduce((sum, c) => {
    const unread = typeof c.unreadCounts === 'object'
      ? (c.unreadCounts as any)?.[user?._id || ''] || 0 : 0;
    return sum + unread;
  }, 0);

  const getOtherUser = (convo: Conversation) =>
    convo.participants?.find((p) => p._id !== user?._id) || convo.participants?.[0];

  return (
    <div className="page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="section-title text-3xl">Freelancer Dashboard</h1>
          <div className="flex items-center gap-3 mt-2">
            <LevelBadge level={user?.level || 'beginner'} showXP xp={user?.xp} />
            <span className="text-slate-400 text-sm">Keep delivering to level up!</span>
          </div>
        </div>
        <Link to="/dashboard/freelancer/gigs/new" id="create-gig-btn" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Gig
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Earnings',    value: formatCurrency(earnings),          icon: DollarSign, color: 'text-emerald-400' },
          { label: 'Completed Orders',  value: completed,                          icon: Package,    color: 'text-brand-400' },
          { label: 'Avg Rating',        value: `${avgRating.toFixed(1)} ⭐`,      icon: Star,       color: 'text-amber-400' },
          { label: 'Total Impressions', value: totalImpressions.toLocaleString(), icon: TrendingUp, color: 'text-brand-300' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Gigs — spans 2 cols on large */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-dark rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="font-semibold text-white">My Gigs ({gigs.length})</h2>
              <Link to="/dashboard/freelancer/gigs" className="text-brand-400 text-sm hover:text-brand-300">
                Manage all →
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3 p-5">
                {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
              </div>
            ) : gigs.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-slate-400 mb-4">No gigs yet. Create your first!</p>
                <Link to="/dashboard/freelancer/gigs/new" className="btn-primary btn-sm inline-flex gap-2">
                  <Plus className="w-4 h-4" /> Create Gig
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {gigs.slice(0, 5).map((g) => (
                  <div key={g._id} className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                    <img src={g.images[0] || 'https://placehold.co/48x48/1c1c38/6654ef?text=G'}
                      alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{g.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span>⭐ {g.averageRating.toFixed(1)}</span>
                        <span>·</span><span>{g.totalOrders} orders</span>
                        <span>·</span><span>{g.impressions} views</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link to={`/gig/${g._id}`} id={`view-gig-${g._id}`} className="btn-icon btn-ghost !p-1.5" title="View">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link to={`/dashboard/freelancer/gigs/${g._id}/edit`} className="btn-icon btn-ghost !p-1.5 text-brand-400" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button id={`delete-gig-${g._id}`} onClick={() => deleteGig(g._id)}
                        className="btn-icon btn-ghost !p-1.5 text-red-400 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="glass-dark rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="font-semibold text-white">Recent Orders</h2>
            </div>
            <div className="flex flex-col divide-y divide-white/5">
              {loading ? (
                <div className="p-5 flex flex-col gap-3">
                  {[1,2].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm">No orders yet.</div>
              ) : recentOrders.map((o) => (
                <Link key={o._id} to={`/dashboard/freelancer/orders/${o._id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    o.status === 'active'    ? 'bg-brand-500' :
                    o.status === 'delivered' ? 'bg-amber-500' :
                    o.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{o.gig?.title}</p>
                    <p className="text-xs text-slate-500">{o.client?.name} · {formatDate(o.createdAt)}</p>
                  </div>
                  <span className="text-brand-300 text-sm font-bold shrink-0">${o.price}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Messages panel */}
        <div className="glass-dark rounded-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-brand-400" />
              <h2 className="font-semibold text-white">Messages</h2>
              {totalUnread > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">
                  {totalUnread}
                </span>
              )}
            </div>
            <Link to="/messages" className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Conversation list */}
          <div className="flex-1 divide-y divide-white/5">
            {msgsLoading ? (
              <div className="p-5 space-y-3">
                {[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-3">
                  <MessageCircle className="w-6 h-6 text-brand-400" />
                </div>
                <p className="text-sm text-slate-400">No messages yet</p>
                <p className="text-xs text-slate-500 mt-1">Clients will contact you here</p>
              </div>
            ) : (
              conversations.map((convo) => {
                const other = getOtherUser(convo);
                const unread = typeof convo.unreadCounts === 'object'
                  ? (convo.unreadCounts as any)?.[user?._id || ''] || 0 : 0;
                const lastMsg = typeof convo.lastMessage === 'object'
                  ? convo.lastMessage?.text : '';

                return (
                  <Link key={convo._id} to={`/messages/${convo._id}`}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors">
                    {/* Avatar with unread dot */}
                    <div className="relative shrink-0">
                      <img
                        src={other?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?._id}`}
                        alt="" className="w-10 h-10 rounded-full border border-white/10 object-cover"
                      />
                      {unread > 0 && (
                        <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-brand-500 rounded-full border-2 border-surface-900" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${unread > 0 ? 'font-semibold text-white' : 'text-slate-300'}`}>
                          {other?.name || 'User'}
                        </p>
                        <span className="text-xs text-slate-500 shrink-0 ml-2">
                          {convo.lastMessageAt ? formatDistanceToNow(convo.lastMessageAt) : ''}
                        </span>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-slate-300' : 'text-slate-500'}`}>
                        {lastMsg || 'Start chatting...'}
                      </p>
                    </div>

                    {/* Unread count badge */}
                    {unread > 0 && (
                      <span className="shrink-0 min-w-[20px] h-5 rounded-full bg-brand-500 text-white text-xs
                                       flex items-center justify-center font-bold px-1">
                        {unread}
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-4 border-t border-white/5">
            <Link to="/messages"
              className="btn-secondary w-full text-sm flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" /> Open Full Inbox
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
