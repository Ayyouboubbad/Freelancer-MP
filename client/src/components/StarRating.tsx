import React from 'react';
import { Star } from 'lucide-react';

interface Props {
  rating: number;   // 0–5 (decimals ok)
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  count?: number;
}

const StarRating = ({ rating, size = 'sm', showValue = true, count }: Props) => {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };

  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sizes[size]} ${
            i <= Math.round(rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-600 fill-transparent'
          }`}
        />
      ))}
      {showValue && (
        <span className="text-sm font-semibold text-slate-300 ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-slate-500">({count})</span>
      )}
    </span>
  );
};

export default StarRating;
