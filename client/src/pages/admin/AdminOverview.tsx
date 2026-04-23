import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api';
import type { Analytics } from '../../types';
import { formatCurrency } from '../../utils/dateUtils';
import {
  Users, Package, ShoppingBag, Star, AlertTriangle, DollarSign,
  Shield, TrendingUp,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';

const MONTH_NAMES = ['', 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const AdminOverview = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(({ data }) => setAnalytics(data.analytics))
      .finally(() => setLoading(false));
  }, []);

  const chartData = analytics?.ordersPerMonth.map((m) => ({
    month: MONTH_NAMES[m._id.month],
    orders: m.count,
    revenue: m.revenue,
  })) || [];

  const stats = analytics ? [
    { label: 'Total Users',     value: analytics.totalUsers,                    icon: Users,        color: 'text-brand-400' },
    { label: 'Freelancers',     value: analytics.totalFreelancers,              icon: Shield,       color: 'text-purple-400' },
    { label: 'Clients',         value: analytics.totalClients,                  icon: Users,        color: 'text-blue-400' },
    { label: 'Total Gigs',      value: analytics.totalGigs,                     icon: Package,      color: 'text-indigo-400' },
    { label: 'Total Orders',    value: analytics.totalOrders,                   icon: ShoppingBag,  color: 'text-cyan-400' },
    { label: 'Completed',       value: analytics.completedOrders,               icon: TrendingUp,   color: 'text-emerald-400' },
    { label: 'Total Revenue',   value: formatCurrency(analytics.totalRevenue),  icon: DollarSign,   color: 'text-amber-400' },
    { label: 'Open Disputes',   value: analytics.openDisputes,                  icon: AlertTriangle,color: 'text-red-400' },
  ] : [];

  if (loading) {
    return (
      <div>
        <div className="skeleton h-8 w-48 rounded mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="section-title text-xl">Platform Overview</h2>
        <p className="section-subtitle">Real-time analytics and metrics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-dark rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Orders per Month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1c1c38', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9' }} />
              <Line type="monotone" dataKey="orders" stroke="#6654ef" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-dark rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Revenue per Month ($)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1c1c38', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9' }} formatter={(v: any) => [`$${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#6654ef" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
