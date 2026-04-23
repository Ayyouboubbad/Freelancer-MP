import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useI18n } from '../i18n';
import NotificationDropdown from './NotificationDropdown';
import { SearchBar } from './FilterSidebar';
import {
  Menu, X, ChevronDown, Globe, Sun, Moon,
  LayoutDashboard, Shield, User, LogOut, Zap, MessageCircle,
} from 'lucide-react';

const LOCALES = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'ar', label: 'AR', flag: '🇸🇦' },
] as const;

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { t, locale, setLocale } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  const dashboardRoute = user?.role === 'admin'
    ? '/admin'
    : user?.role === 'freelancer'
    ? '/dashboard/freelancer'
    : '/dashboard/client';

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="glass border-b border-white/5 rounded-none backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" id="nav-logo" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-brand rounded-xl flex items-center justify-center shadow-glow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white hidden sm:block">
              Freelancer<span className="text-gradient">MP</span>
            </span>
          </Link>

          {/* Search — hide on auth pages */}
          {!['/login', '/register'].includes(location.pathname) && (
            <div className="flex-1 max-w-md hidden md:block">
              <SearchBar />
            </div>
          )}

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Language */}
            <div className="relative hidden sm:block">
              <button id="lang-toggle" onClick={() => setLangOpen(!langOpen)}
                className="btn-ghost btn-icon flex items-center gap-1 text-sm">
                <Globe className="w-4 h-4" />
                {LOCALES.find(l => l.code === locale)?.label}
                <ChevronDown className="w-3 h-3" />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-11 glass-dark border border-white/10 rounded-xl overflow-hidden shadow-card-hover z-50 animate-slide-down">
                  {LOCALES.map((l) => (
                    <button key={l.code} id={`lang-${l.code}`}
                      onClick={() => { setLocale(l.code); setLangOpen(false); }}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm w-full hover:bg-white/5 transition-colors ${locale === l.code ? 'text-brand-400' : 'text-slate-300'}`}
                    >
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark mode */}
            <button id="darkmode-toggle" onClick={toggleDark} className="btn-ghost btn-icon hidden sm:flex">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            {user && <NotificationDropdown />}

            {/* Messages icon with unread badge */}
            {user && (
              <Link to="/messages" id="nav-messages"
                className="relative btn-ghost btn-icon hidden sm:flex">
                <MessageCircle className="w-4 h-4" />
              </Link>
            )}

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button id="user-menu-btn" onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user._id}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-brand-500/50 object-cover"
                  />
                  <span className="text-sm font-medium text-slate-200 hidden md:block">{user.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 w-52 glass-dark border border-white/10 rounded-2xl overflow-hidden shadow-card-hover z-50 animate-slide-down">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                    </div>
                    {[
                      { to: dashboardRoute,      icon: LayoutDashboard, label: t.nav.dashboard },
                      { to: `/profile/${user._id}`, icon: User,          label: t.nav.profile },
                      ...(user.role === 'admin'
                        ? [{ to: '/admin', icon: Shield, label: t.nav.admin }]
                        : []),
                    ].map((item) => (
                      <Link key={item.to} to={item.to} id={`nav-${item.label.toLowerCase().replace(/\s/g,'-')}`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <item.icon className="w-4 h-4 text-brand-400" />
                        {item.label}
                      </Link>
                    ))}
                    <button id="nav-logout" onClick={() => { setProfileOpen(false); logout(); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full border-t border-white/5"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" id="nav-login" className="btn-ghost btn-sm">{t.nav.login}</Link>
                <Link to="/register" id="nav-register" className="btn-primary btn-sm">{t.nav.register}</Link>
              </div>
            )}

            {/* Mobile menu */}
            <button id="nav-mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}
              className="btn-ghost btn-icon md:hidden">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 px-4 py-4 flex flex-col gap-3 animate-slide-down">
            <SearchBar fullWidth />
            <div className="flex gap-2">
              {LOCALES.map((l) => (
                <button key={l.code} onClick={() => setLocale(l.code)}
                  className={`btn-sm ${locale === l.code ? 'btn-primary' : 'btn-secondary'}`}>
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
