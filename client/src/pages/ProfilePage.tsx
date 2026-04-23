import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userAPI, messageAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import type { PublicProfile } from '../types';
import LevelBadge from '../components/LevelBadge';
import StarRating from '../components/StarRating';
import GigCard from '../components/GigCard';
import { formatDate, formatCurrency } from '../utils/dateUtils';
import {
  MapPin, Globe, Calendar, Clock, CheckCircle, Star,
  MessageCircle, Package, DollarSign, Award, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', CA: '🇨🇦', UK: '🇬🇧', VN: '🇻🇳', AE: '🇦🇪', FR: '🇫🇷',
  DE: '🇩🇪', IN: '🇮🇳', BR: '🇧🇷', JP: '🇯🇵', AU: '🇦🇺', MA: '🇲🇦',
};

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user: me } = useAuthStore();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gigs' | 'reviews'>('gigs');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    userAPI.getPublicProfile(id)
      .then(({ data }) => setProfile(data.profile))
      .catch(() => toast.error('Profile not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleContact = async () => {
    if (!me || !profile) return;
    try {
      const { data } = await messageAPI.getOrCreateConversation({ participantId: profile._id });
      window.location.href = `/messages/${data.conversation._id}`;
    } catch {
      toast.error('Could not start conversation.');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="profile-header animate-pulse">
          <div className="w-28 h-28 rounded-full bg-surface-700" />
          <div className="flex-1 space-y-3">
            <div className="skeleton h-7 w-48 rounded" />
            <div className="skeleton h-4 w-72 rounded" />
            <div className="skeleton h-4 w-40 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page text-center py-20">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
        <p className="text-slate-400 mb-6">This profile doesn't exist or has been removed.</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  const isOwn = me?._id === profile._id;
  const isFreelancer = profile.role === 'freelancer';

  return (
    <div className="page">
      {/* Profile Header */}
      <div className="profile-header mb-8">
        <div className="relative">
          <img
            src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile._id}`}
            alt={profile.name}
            className="profile-avatar"
          />
          {profile.isAvailable && isFreelancer && (
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-surface-800" title="Available" />
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white">{profile.name}</h1>
            {profile.isVerified && (
              <span title="Verified"><CheckCircle className="w-5 h-5 text-blue-400" /></span>
            )}
            {isFreelancer && <LevelBadge level={profile.level} />}
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm text-slate-400 justify-center md:justify-start flex-wrap">
            {profile.country && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {COUNTRY_FLAGS[profile.country] || ''} {profile.country}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Member since {formatDate(profile.createdAt)}
            </span>
            {profile.responseTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {profile.responseTime} avg. response
              </span>
            )}
          </div>

          {profile.bio && (
            <p className="mt-3 text-slate-300 text-sm leading-relaxed max-w-2xl">{profile.bio}</p>
          )}

          {/* Languages */}
          {profile.languages?.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              {profile.languages.map((l) => (
                <span key={l} className="badge-gray">{l}</span>
              ))}
            </div>
          )}

          {/* Skills */}
          {isFreelancer && profile.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.skills.map((s) => (
                <span key={s} className="tag">{s}</span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mt-5 justify-center md:justify-start">
            {isOwn ? (
              <Link to="/settings" className="btn-primary flex items-center gap-2">
                Edit Profile
              </Link>
            ) : me ? (
              <button onClick={handleContact} className="btn-primary flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Contact
              </button>
            ) : null}
          </div>
        </div>

        {/* Freelancer stats column */}
        {isFreelancer && (
          <div className="shrink-0 grid grid-cols-2 gap-3 md:flex md:flex-col md:gap-2">
            {[
              { icon: Star, label: 'Rating', value: `${profile.averageRating} ⭐`, color: 'text-amber-400' },
              { icon: Package, label: 'Completed', value: profile.completedOrders, color: 'text-brand-400' },
              { icon: DollarSign, label: 'Earned', value: formatCurrency(profile.totalEarnings), color: 'text-emerald-400' },
              { icon: Award, label: 'Level', value: profile.level, color: 'text-purple-400' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 bg-surface-800/50 px-3 py-2 rounded-xl">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-sm font-semibold text-white capitalize">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs for freelancers */}
      {isFreelancer && (
        <>
          <div className="tab-list mb-6 w-fit">
            <button
              className={`tab-btn ${activeTab === 'gigs' ? 'active' : ''}`}
              onClick={() => setActiveTab('gigs')}
            >
              Gigs ({profile.gigs?.length || 0})
            </button>
            <button
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({profile.totalReviews})
            </button>
          </div>

          {activeTab === 'gigs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.gigs?.length > 0 ? (
                profile.gigs.map((gig) => <GigCard key={gig._id} gig={gig} />)
              ) : (
                <div className="col-span-full text-center py-12 glass-dark rounded-2xl">
                  <p className="text-slate-400">No gigs yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {profile.reviews?.length > 0 ? (
                profile.reviews.map((r) => (
                  <div key={r._id} className="glass-dark rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={r.reviewer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.reviewer._id}`}
                        alt="" className="w-10 h-10 rounded-full border border-white/10"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{r.reviewer.name}</p>
                        <p className="text-xs text-slate-500">{formatDate(r.createdAt)}</p>
                      </div>
                      <div className="ml-auto">
                        <StarRating rating={r.rating} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{r.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 glass-dark rounded-2xl">
                  <p className="text-slate-400">No reviews yet.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfilePage;
