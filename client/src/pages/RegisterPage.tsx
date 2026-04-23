import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap, BriefcaseBusiness, UserRound } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { fetchMe } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' as 'client' | 'freelancer' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.register(form);
      await fetchMe();
      toast.success('Account created! Welcome 🎉');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-hero relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="glass-dark p-8 rounded-3xl border border-white/10 shadow-card-hover">
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-glow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <h1 className="font-display font-bold text-2xl text-white">Create Your Account</h1>
              <p className="text-slate-400 text-sm mt-1">Join 50,000+ professionals on FreelancerMP</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Role selector */}
            <div>
              <label className="label">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'client',     icon: BriefcaseBusiness, label: 'Hire Talent' },
                  { value: 'freelancer', icon: UserRound,          label: 'Sell Services' },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    id={`role-${r.value}`}
                    onClick={() => setForm({ ...form, role: r.value as 'client' | 'freelancer' })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      form.role === r.value
                        ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                        : 'border-white/10 bg-surface-700 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <r.icon className="w-6 h-6" />
                    <span className="text-sm font-semibold">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="reg-name">Full Name</label>
              <input id="reg-name" type="text" className="input" placeholder="Jane Doe"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div>
              <label className="label" htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div>
              <label className="label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <input id="reg-password" type={showPass ? 'text' : 'password'} className="input pr-12"
                  placeholder="Min 8 characters" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength */}
              <div className="flex gap-1 mt-2">
                {[8, 12, 16].map((n, i) => (
                  <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${
                    form.password.length >= n
                      ? i === 0 ? 'bg-red-500' : i === 1 ? 'bg-amber-500' : 'bg-emerald-500'
                      : 'bg-surface-600'
                  }`} />
                ))}
              </div>
            </div>

            <button id="register-submit" type="submit" className="btn-primary w-full btn-lg" disabled={loading}>
              {loading
                ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                : 'Create Free Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" id="register-login-link" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
