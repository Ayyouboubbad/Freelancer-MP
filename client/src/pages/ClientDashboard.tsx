import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import type { Order } from '../types';
import { formatDate, formatCurrency } from '../utils/dateUtils';
import { Package, Clock, CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',    className: 'badge-warning', icon: Clock },
  active:    { label: 'In Progress',className: 'badge-brand',   icon: RefreshCw },
  delivered: { label: 'Delivered', className: 'badge-success',  icon: CheckCircle },
  revision:  { label: 'Revision',  className: 'badge-warning',  icon: RefreshCw },
  completed: { label: 'Completed', className: 'badge-success',  icon: CheckCircle },
  cancelled: { label: 'Cancelled', className: 'badge-danger',   icon: XCircle },
  disputed:  { label: 'Disputed',  className: 'badge-danger',   icon: AlertCircle },
};

const OrderTimeline = ({ status }: { status: string }) => {
  const steps = ['active', 'delivered', 'completed'];
  const idx = steps.indexOf(status);
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`w-2 h-2 rounded-full ${i <= idx ? 'bg-brand-500' : 'bg-surface-600'}`} />
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 min-w-[16px] ${i < idx ? 'bg-brand-500' : 'bg-surface-600'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const ClientDashboard = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await orderAPI.getMyOrders({ status: statusFilter || undefined, limit: 20 });
        setOrders(data.orders);
      } finally { setLoading(false); }
    };
    load();
  }, [statusFilter]);

  const activeCount    = orders.filter((o) => o.status === 'active').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const totalSpent     = orders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + o.price, 0);

  return (
    <div className="page">
      <div className="mb-8">
        <h1 className="section-title text-3xl">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="section-subtitle">Here's your buying activity at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Orders',    value: activeCount,                   icon: Package },
          { label: 'Completed',        value: completedCount,                icon: CheckCircle },
          { label: 'Total Orders',     value: orders.length,                 icon: RefreshCw },
          { label: 'Total Spent',      value: formatCurrency(totalSpent),    icon: Clock },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <s.icon className="w-5 h-5 text-brand-400 mb-2" />
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Orders */}
      <div className="glass-dark rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="font-semibold text-white">My Orders</h2>
          <select id="order-status-filter" value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-40 text-sm py-2">
            <option value="">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {[1,2,3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-slate-400">No orders yet.</p>
            <Link to="/" className="btn-primary btn-sm mt-4 inline-flex">Browse Gigs</Link>

          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status];
              const StatusIcon = cfg?.icon || Clock;
              return (
                <Link key={order._id} to={`/dashboard/client/orders/${order._id}`}
                  id={`order-row-${order._id}`}
                  className="flex items-center gap-4 p-5 hover:bg-white/5 transition-colors">
                  <img src={order.gig?.images?.[0] || 'https://placehold.co/60x60/1c1c38/6654ef?text=G'}
                    alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{order.gig?.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {order.freelancer?.name} · {formatDate(order.createdAt)}
                    </p>
                    <OrderTimeline status={order.status} />
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={cfg?.className}><StatusIcon className="w-3 h-3" />{cfg?.label}</span>
                    <span className="text-brand-300 font-bold text-sm">${order.price}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
