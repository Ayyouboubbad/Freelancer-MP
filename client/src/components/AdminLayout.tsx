import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, AlertTriangle,
  TrendingUp, ScrollText, Shield,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin',           label: 'Overview',   icon: LayoutDashboard, exact: true },
  { to: '/admin/users',     label: 'Users',      icon: Users },
  { to: '/admin/gigs',      label: 'Gigs',       icon: Package },
  { to: '/admin/disputes',  label: 'Disputes',   icon: AlertTriangle },
  { to: '/admin/analytics', label: 'Analytics',  icon: TrendingUp },
];

const AdminLayout = () => {
  const location = useLocation();

  const isActive = (item: typeof NAV_ITEMS[0]) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  return (
    <div className="page">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-glow">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="section-title text-2xl">Admin Panel</h1>
          <p className="text-xs text-slate-500">Platform management & analytics</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <nav className="admin-sidebar">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
