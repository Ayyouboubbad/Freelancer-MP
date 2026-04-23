import React from 'react';
import { Link } from 'react-router-dom';
import type { Gig } from '../types';
import StarRating from './StarRating';
import WishlistButton from './WishlistButton';
import LevelBadge from './LevelBadge';
import { Clock, ShoppingBag } from 'lucide-react';

interface Props { gig: Gig; }

const GigCard = ({ gig }: Props) => {
  const basePackage = gig.packages.find((p) => p.name === 'basic') || gig.packages[0];

  return (
    <Link
      to={`/gig/${gig._id}`}
      id={`gig-card-${gig._id}`}
      className="card block group overflow-hidden animate-fade-in"
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <img
          src={gig.images[0] || 'https://placehold.co/400x250/1c1c38/6654ef?text=No+Image'}
          alt={gig.title}
          className="gig-img group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {gig.isFeatured && (
          <span className="absolute top-3 left-3 badge-brand text-xs font-bold shadow-lg">
            ✨ Featured
          </span>
        )}
        <div className="absolute top-3 right-3">
          <WishlistButton gigId={gig._id} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3">
        {/* Seller */}
        <div className="flex items-center gap-2">
          <img
            src={gig.seller?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${gig.seller?._id}`}
            alt={gig.seller?.name}
            className="w-7 h-7 rounded-full border border-white/10 object-cover"
          />
          <span className="text-sm text-slate-300 font-medium truncate">{gig.seller?.name}</span>
          {gig.seller?.level && <LevelBadge level={gig.seller.level} />}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-brand-300 transition-colors">
          {gig.title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <StarRating rating={gig.averageRating} size="sm" showValue count={gig.totalReviews} />
          </span>
          <span className="flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" />
            {gig.totalOrders} orders
          </span>
          {basePackage?.deliveryDays && (
            <span className="flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              {basePackage.deliveryDays}d
            </span>
          )}
        </div>

        {/* Price footer */}
        <div className="divider !my-0" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Starting at</span>
          <span className="text-lg font-display font-bold text-gradient">
            ${basePackage?.price ?? 0}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GigCard;
