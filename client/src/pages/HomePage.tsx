import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGigStore } from '../store/gigStore';
import GigGrid from '../components/GigGrid';
import { SearchBar } from '../components/FilterSidebar';
import { ArrowRight, Zap, Shield, Clock, Star, Users, TrendingUp } from 'lucide-react';

const CATEGORIES = [
  { label: 'Web Development', icon: '💻', value: 'web-development' },
  { label: 'Mobile Apps',     icon: '📱', value: 'mobile-apps' },
  { label: 'Design',          icon: '🎨', value: 'design' },
  { label: 'Writing',         icon: '✍️', value: 'writing' },
  { label: 'Marketing',       icon: '📣', value: 'marketing' },
  { label: 'Video & Animation', icon: '🎬', value: 'video-animation' },
  { label: 'Music & Audio',   icon: '🎵', value: 'music-audio' },
  { label: 'AI Services',     icon: '🤖', value: 'ai-services' },
];

const STATS = [
  { icon: Users,      value: '10K+',  label: 'Active Freelancers' },
  { icon: TrendingUp, value: '50K+',  label: 'Projects Completed' },
  { icon: Star,       value: '4.9/5', label: 'Average Rating' },
  { icon: Shield,     value: '100%',  label: 'Secure Payments' },
];

const HomePage = () => {
  const { gigs, loading, total, page, pages, fetchGigs, setFilters } = useGigStore();

  useEffect(() => {
    fetchGigs(1);
  }, []);

  const handlePageChange = (p: number) => fetchGigs(p);

  const handleCategory = (cat: string) => {
    setFilters({ category: cat });
    fetchGigs(1);
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero py-24 px-4">
        {/* Glow orbs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-800/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="badge-brand text-sm animate-fade-in">
            <Zap className="w-3.5 h-3.5" /> Trusted by 50,000+ businesses
          </div>
          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white leading-tight animate-slide-up">
            Find Extraordinary<br />
            <span className="text-gradient">Freelance Talent</span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl animate-slide-up">
            Connect with expert freelancers for any project. Quality work, delivered on time, every time.
          </p>
          <div className="w-full max-w-2xl animate-slide-up">
            <SearchBar fullWidth />
          </div>
          <div className="flex flex-wrap gap-2 justify-center animate-fade-in text-sm text-slate-400">
            <span>Popular:</span>
            {['React Developer', 'UI Design', 'Logo Design', 'SEO', 'Copywriting'].map((s) => (
              <Link key={s} to={`/search?q=${s}`} className="hover:text-brand-300 transition-colors underline underline-offset-2">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-surface-800/50 border-y border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center text-center gap-1">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center mb-2">
                <Icon className="w-5 h-5 text-brand-400" />
              </div>
              <span className="text-2xl font-display font-bold text-white">{value}</span>
              <span className="text-sm text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="page">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">Browse Categories</h2>
            <p className="section-subtitle">Find the perfect service for your needs</p>
          </div>
          <Link to="/search" className="btn-outline btn-sm hidden sm:flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              id={`category-${cat.value}`}
              onClick={() => handleCategory(cat.value)}
              className="glass-dark p-4 rounded-2xl flex flex-col items-center gap-2 text-center
                         hover:bg-brand-500/10 hover:border-brand-500/30 transition-all duration-200 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs text-slate-300 font-medium leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Gig listing */}
      <section className="page pt-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">Latest Gigs</h2>
            <p className="section-subtitle">{total.toLocaleString()} services available</p>
          </div>
        </div>
        <GigGrid
          gigs={gigs}
          loading={loading}
          page={page}
          pages={pages}
          onPageChange={handlePageChange}
        />
      </section>

      {/* Trust section */}
      <section className="bg-gradient-hero border-t border-white/5 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <h2 className="section-title text-3xl">Why Choose FreelancerMP?</h2>
          <div className="grid sm:grid-cols-3 gap-5 w-full mt-4">
            {[
              { icon: Shield, title: 'Secure Payments', desc: 'Your payment is held safely until you approve the delivery.' },
              { icon: Star,   title: 'Verified Talent', desc: 'Every freelancer is reviewed and rated by real clients.' },
              { icon: Clock,  title: 'On-Time Delivery', desc: 'Our level system rewards freelancers who deliver on schedule.' },
            ].map((f) => (
              <div key={f.title} className="glass p-6 rounded-2xl flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center">
                  <f.icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
          <Link to="/register" id="cta-register" className="btn-primary btn-lg mt-4">
            Start Hiring Today <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
