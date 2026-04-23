import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { wishlistAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface Props {
  gigId: string;
  initialSaved?: boolean;
}

const WishlistButton = ({ gigId, initialSaved = false }: Props) => {
  const { user } = useAuthStore();
  const [saved, setSaved] = useState(initialSaved || (user?.wishlist?.includes(gigId) ?? false));
  const [loading, setLoading] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please sign in to save gigs.'); return; }
    setLoading(true);
    try {
      const { data } = await wishlistAPI.toggleWishlist(gigId);
      setSaved(data.action === 'added');
      toast.success(data.action === 'added' ? 'Saved to wishlist!' : 'Removed from wishlist');
    } catch {
      toast.error('Failed to update wishlist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      id={`wishlist-${gigId}`}
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      className={`btn-icon transition-all duration-200 ${
        saved
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-red-400'
      }`}
    >
      <Heart className={`w-4 h-4 ${saved ? 'fill-red-400' : ''}`} />
    </button>
  );
};

export default WishlistButton;
