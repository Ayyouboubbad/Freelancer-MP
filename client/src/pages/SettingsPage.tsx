import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../api';
import { formatDate } from '../utils/dateUtils';
import {
  User, Shield, Bell, Camera, Plus, X, Save,
  Eye, EyeOff, Check, Globe, MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'profile' | 'security' | 'preferences';

const COUNTRIES = [
  'US', 'CA', 'UK', 'FR', 'DE', 'IN', 'BR', 'JP', 'AU', 'AE', 'VN', 'MA',
  'ES', 'IT', 'NL', 'SE', 'NO', 'PL', 'TR', 'EG', 'NG', 'ZA', 'KE',
];

const SettingsPage = () => {
  const { user, setUser } = useAuthStore();
  const [tab, setTab] = useState<Tab>('profile');

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [country, setCountry] = useState(user?.country || '');
  const [languages, setLanguages] = useState<string[]>(user?.languages || []);
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [responseTime, setResponseTime] = useState(user?.responseTime || '');
  const [langInput, setLangInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Security form state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const addTag = (type: 'lang' | 'skill') => {
    if (type === 'lang' && langInput.trim()) {
      if (!languages.includes(langInput.trim())) {
        setLanguages([...languages, langInput.trim()]);
      }
      setLangInput('');
    }
    if (type === 'skill' && skillInput.trim()) {
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const handleProfileSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('bio', bio);
      formData.append('country', country);
      formData.append('languages', JSON.stringify(languages));
      formData.append('skills', JSON.stringify(skills));
      formData.append('isAvailable', String(isAvailable));
      formData.append('responseTime', responseTime);
      if (avatarFile) formData.append('avatar', avatarFile);

      const { data } = await authAPI.updateProfile(formData);
      setUser(data.user);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPwd.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPwd(true);
    try {
      await authAPI.changePassword({ currentPassword: currentPwd, newPassword: newPwd });
      toast.success('Password changed successfully!');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Password change failed.');
    } finally {
      setChangingPwd(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'profile', label: 'Edit Profile', icon: User },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'preferences', label: 'Preferences', icon: Bell },
  ];

  return (
    <div className="page">
      <div className="mb-8">
        <h1 className="section-title text-3xl">Settings</h1>
        <p className="section-subtitle">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-64 shrink-0">
          <div className="glass-dark rounded-2xl p-3 flex lg:flex-col gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`admin-nav-item w-full ${tab === t.key ? 'active' : ''}`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* ── Profile Tab ─────────────────────────────────────────────── */}
          {tab === 'profile' && (
            <div className="glass-dark rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-display font-bold text-white">Edit Profile</h2>

              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <img
                    src={avatarPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?._id}`}
                    alt="" className="w-24 h-24 rounded-full border-4 border-brand-500/30 object-cover"
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400">JPG, PNG or GIF. Max 5MB.</p>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="label">Full Name</label>
                <input
                  id="settings-name" value={name} onChange={(e) => setName(e.target.value)}
                  className="input" maxLength={60}
                />
              </div>

              {/* Bio */}
              <div>
                <label className="label">Bio</label>
                <textarea
                  id="settings-bio" value={bio} onChange={(e) => setBio(e.target.value)}
                  className="input min-h-[100px] resize-y" maxLength={500}
                  placeholder="Tell clients about yourself..."
                />
                <p className="text-xs text-slate-500 mt-1">{bio.length}/500</p>
              </div>

              {/* Country */}
              <div>
                <label className="label flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Country</label>
                <select id="settings-country" value={country} onChange={(e) => setCountry(e.target.value)} className="input">
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Languages */}
              <div>
                <label className="label flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Languages</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {languages.map((l) => (
                    <span key={l} className="tag">
                      {l}
                      <button onClick={() => setLanguages(languages.filter((x) => x !== l))} className="tag-remove">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={langInput} onChange={(e) => setLangInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('lang'))}
                    className="input flex-1" placeholder="Add language..."
                  />
                  <button onClick={() => addTag('lang')} className="btn-secondary"><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Skills (freelancer only) */}
              {user?.role === 'freelancer' && (
                <div>
                  <label className="label">Skills</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {skills.map((s) => (
                      <span key={s} className="tag">
                        {s}
                        <button onClick={() => setSkills(skills.filter((x) => x !== s))} className="tag-remove">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('skill'))}
                      className="input flex-1" placeholder="Add skill..."
                    />
                    <button onClick={() => addTag('skill')} className="btn-secondary"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              )}

              {/* Availability (freelancer only) */}
              {user?.role === 'freelancer' && (
                <div className="flex items-center justify-between glass p-4 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-white">Available for work</p>
                    <p className="text-xs text-slate-400">Show as available on your profile</p>
                  </div>
                  <button
                    id="settings-availability"
                    onClick={() => setIsAvailable(!isAvailable)}
                    className={`w-12 h-7 rounded-full transition-all duration-300 ${isAvailable ? 'bg-brand-500' : 'bg-surface-600'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              )}

              {/* Response Time */}
              {user?.role === 'freelancer' && (
                <div>
                  <label className="label">Average Response Time</label>
                  <select value={responseTime} onChange={(e) => setResponseTime(e.target.value)} className="input">
                    <option value="">Select...</option>
                    <option value="< 1 hour">Less than 1 hour</option>
                    <option value="1-3 hours">1-3 hours</option>
                    <option value="< 24 hours">Less than 24 hours</option>
                    <option value="1-2 days">1-2 days</option>
                  </select>
                </div>
              )}

              {/* Save */}
              <div className="flex justify-end pt-2">
                <button id="settings-save" onClick={handleProfileSave} disabled={saving}
                  className="btn-primary flex items-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* ── Security Tab ────────────────────────────────────────────── */}
          {tab === 'security' && (
            <div className="glass-dark rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-display font-bold text-white">Change Password</h2>

              <div>
                <label className="label">Current Password</label>
                <div className="relative">
                  <input
                    id="current-password" type={showPwd ? 'text' : 'password'}
                    value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)}
                    className="input pr-10"
                  />
                  <button onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">New Password</label>
                <input
                  id="new-password" type={showPwd ? 'text' : 'password'}
                  value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
                  className="input" placeholder="Min. 8 characters"
                />
                {newPwd && newPwd.length < 8 && (
                  <p className="error-msg">Password must be at least 8 characters</p>
                )}
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <input
                  id="confirm-password" type={showPwd ? 'text' : 'password'}
                  value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
                  className="input"
                />
                {confirmPwd && confirmPwd !== newPwd && (
                  <p className="error-msg">Passwords do not match</p>
                )}
              </div>

              <div className="flex justify-end">
                <button onClick={handlePasswordChange} disabled={changingPwd || !currentPwd || !newPwd || newPwd !== confirmPwd}
                  className="btn-primary flex items-center gap-2">
                  {changingPwd ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Shield className="w-4 h-4" />}
                  {changingPwd ? 'Changing...' : 'Change Password'}
                </button>
              </div>

              {/* Account info */}
              <div className="divider" />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Account Information</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Email</span>
                  <span className="text-white">{user?.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Role</span>
                  <span className="text-white capitalize">{user?.role}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Member since</span>
                  <span className="text-white">{user?.createdAt ? formatDate(user.createdAt) : '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Preferences Tab ──────────────────────────────────────────── */}
          {tab === 'preferences' && (
            <div className="glass-dark rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-display font-bold text-white">Notification Preferences</h2>
              <p className="text-sm text-slate-400">Choose what notifications you'd like to receive.</p>

              {[
                { key: 'orders', label: 'Order Updates', desc: 'New orders, deliveries, and status changes' },
                { key: 'messages', label: 'Messages', desc: 'New messages from conversations' },
                { key: 'reviews', label: 'Reviews', desc: 'When someone leaves a review' },
                { key: 'promotions', label: 'Promotions', desc: 'Tips, offers, and platform news' },
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between glass p-4 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-white">{pref.label}</p>
                    <p className="text-xs text-slate-400">{pref.desc}</p>
                  </div>
                  <button className="w-12 h-7 rounded-full bg-brand-500 transition-all duration-300">
                    <div className="w-5 h-5 bg-white rounded-full shadow translate-x-6 transition-transform duration-300" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
