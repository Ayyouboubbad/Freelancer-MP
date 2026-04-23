import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, Zap } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      {/* Background glows */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center max-w-lg animate-scale-in">
        {/* Animated 404 number */}
        <div className="relative mb-6">
          <p className="text-[9rem] md:text-[12rem] font-display font-black leading-none select-none
                         bg-gradient-to-br from-brand-400 via-purple-400 to-brand-600
                         bg-clip-text text-transparent opacity-20">
            404
          </p>
          {/* Icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-glow animate-float">
              <Zap className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn-primary btn-lg flex items-center gap-2 w-full sm:w-auto justify-center">
            <Home className="w-5 h-5" /> Go Home
          </Link>
          <Link to="/search" className="btn-secondary btn-lg flex items-center gap-2 w-full sm:w-auto justify-center">
            <Search className="w-5 h-5" /> Browse Gigs
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-ghost btn-lg flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-5 h-5" /> Go Back
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-6 border-t border-white/5">
          <p className="text-sm text-slate-500 mb-3">Popular pages</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { to: '/login',    label: 'Sign In' },
              { to: '/register', label: 'Join Free' },
              { to: '/search',   label: 'Find Services' },
            ].map((link) => (
              <Link key={link.to} to={link.to}
                className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-brand-300
                           hover:bg-brand-500/10 border border-white/5 hover:border-brand-500/20 transition-all">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
