import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gigAPI, orderAPI, messageAPI } from '../api';
import type { Gig } from '../types';
import StarRating from '../components/StarRating';
import WishlistButton from '../components/WishlistButton';
import LevelBadge from '../components/LevelBadge';
import GigReviews from '../components/GigReviews';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { Clock, RefreshCw, CheckCircle, MessageCircle, ChevronDown, ChevronUp, Globe } from 'lucide-react';

const TABS = ['Overview', 'Packages', 'Reviews', 'About Seller'];

const GigDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState(0);
  const [tab, setTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await gigAPI.getGig(id!);
        setGig(data.gig);
      } catch {
        toast.error('Gig not found.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return; }
    if (!gig) return;
    setOrdering(true);
    try {
      const pkg = gig.packages[selectedPkg];
      const { data } = await orderAPI.placeOrder({
        gigId: gig._id,
        packageName: pkg.name,
        requirements: '',
      });
      toast.success('Order placed! 🎉');
      navigate(`/dashboard/${user.role === 'client' ? 'client' : 'freelancer'}/orders/${data.order._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setOrdering(false);
    }
  };

  const handleContactSeller = async () => {
    if (!user) { navigate('/login'); return; }
    if (!gig) return;
    const sellerId = typeof gig.seller === 'object' ? gig.seller._id : gig.seller;
    if (sellerId === user._id) {
      toast.error("You can't message yourself.");
      return;
    }
    setContacting(true);
    try {
      const { data } = await messageAPI.getOrCreateConversation({ participantId: sellerId });
      navigate(`/messages/${data.conversation._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not start conversation.');
    } finally {
      setContacting(false);
    }
  };


  if (loading) {
    return (
      <div className="page grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="skeleton h-8 w-3/4 rounded" />
          <div className="skeleton h-72 rounded-2xl" />
          <div className="skeleton h-40 rounded-2xl" />
        </div>
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    );
  }

  if (!gig) return null;

  const pkg = gig.packages[selectedPkg];

  return (
    <div className="page grid lg:grid-cols-3 gap-8">
      {/* Left */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-2xl text-white leading-snug mb-3">{gig.title}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <img src={gig.seller?.avatar || ''} alt={gig.seller?.name}
                className="w-8 h-8 rounded-full border border-white/10 object-cover" />
              <span className="text-slate-300 font-medium">{gig.seller?.name}</span>
              <LevelBadge level={gig.seller?.level || 'beginner'} />
            </div>
            <StarRating rating={gig.averageRating} count={gig.totalReviews} size="sm" />
            <span className="text-slate-500 text-sm">{gig.totalOrders} orders</span>
            <div className="ml-auto">
              <WishlistButton gigId={gig._id} />
            </div>
          </div>
        </div>

        {/* Image gallery */}
        {gig.images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gig.images.map((img, i) => (
              <img key={i} src={img} alt={`${gig.title} ${i + 1}`}
                className="w-full h-52 object-cover rounded-2xl border border-white/5" />
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/5">
          {TABS.map((t, i) => (
            <button key={t} id={`gig-tab-${i}`} onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-xl transition-colors ${
                tab === i ? 'text-brand-300 border-b-2 border-brand-500' : 'text-slate-400 hover:text-slate-200'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="animate-fade-in">
          {tab === 0 && (
            <div className="glass-dark p-6 rounded-2xl">
              <h2 className="font-semibold text-white mb-4">About This Gig</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">{gig.description}</p>

              {gig.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {gig.tags.map((tag) => (
                    <span key={tag} className="badge-gray"># {tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 1 && (
            <div className="grid sm:grid-cols-3 gap-4">
              {gig.packages.map((p, i) => (
                <button key={p.name} id={`pkg-${p.name}`} onClick={() => setSelectedPkg(i)}
                  className={`text-left p-5 rounded-2xl border-2 transition-all flex flex-col gap-3 ${
                    selectedPkg === i
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-white/10 glass-dark hover:border-white/20'
                  }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white capitalize">{p.name}</span>
                    <span className="text-xl font-display font-bold text-gradient">${p.price}</span>
                  </div>
                  <p className="text-sm text-slate-400">{p.description}</p>
                  <div className="flex gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.deliveryDays}d</span>
                    <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" />{p.revisions} rev.</span>
                  </div>
                  <ul className="flex flex-col gap-1.5 mt-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          )}

          {tab === 2 && <GigReviews gigId={gig._id} />}

          {tab === 3 && (
            <div className="glass-dark p-6 rounded-2xl flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <img src={gig.seller?.avatar || ''} alt={gig.seller?.name}
                  className="w-16 h-16 rounded-2xl border border-white/10 object-cover" />
                <div>
                  <p className="font-semibold text-white">{gig.seller?.name}</p>
                  <LevelBadge level={gig.seller?.level || 'beginner'} showXP xp={gig.seller?.xp} />
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                    <Globe className="w-3 h-3" /> {gig.seller?.country}
                  </div>
                </div>
              </div>
              <p className="text-slate-300 text-sm">{gig.seller?.bio}</p>
              {gig.seller?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {gig.seller.skills.map((s) => <span key={s} className="badge-gray">{s}</span>)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FAQ */}
        {gig.faqs.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-white">FAQ</h3>
            {gig.faqs.map((f, i) => (
              <div key={i} className="glass-dark rounded-xl overflow-hidden">
                <button id={`faq-${i}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-center justify-between w-full px-5 py-4 text-left">
                  <span className="text-sm font-medium text-white">{f.question}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-slate-400 border-t border-white/5 pt-3 animate-fade-in">
                    {f.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Order card */}
      <div className="lg:sticky lg:top-24 h-fit">
        <div className="glass-dark rounded-2xl border border-white/10 overflow-hidden shadow-card-hover">
          {/* Package selector tabs */}
          <div className="flex border-b border-white/5">
            {gig.packages.map((p, i) => (
              <button key={p.name} onClick={() => setSelectedPkg(i)}
                className={`flex-1 py-3 text-xs font-semibold capitalize transition-colors ${
                  selectedPkg === i ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:bg-white/5'
                }`}>
                {p.name}
              </button>
            ))}
          </div>

          <div className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">{pkg.title}</span>
              <span className="text-2xl font-display font-bold text-gradient">${pkg.price}</span>
            </div>
            <p className="text-sm text-slate-400">{pkg.description}</p>
            <div className="flex gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-400" />{pkg.deliveryDays}-day delivery</span>
              <span className="flex items-center gap-1.5"><RefreshCw className="w-4 h-4 text-brand-400" />{pkg.revisions} revisions</span>
            </div>
            <ul className="flex flex-col gap-2">
              {pkg.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />{f}
                </li>
              ))}
            </ul>

            <button id="order-now-btn" onClick={handleOrder} disabled={ordering}
              className="btn-primary w-full btn-lg mt-2">
              {ordering ? '⏳ Placing Order...' : `Order Now — $${pkg.price}`}
            </button>
            <button id="contact-seller-btn" onClick={handleContactSeller} disabled={contacting}
              className="btn-secondary w-full flex items-center justify-center gap-2">
              {contacting
                ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                : <MessageCircle className="w-4 h-4" />}
              {contacting ? 'Opening...' : 'Contact Seller'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetailPage;
