'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn, getStatusColor, getRarityColor } from '@/lib/utils/formatters';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'status' | 'rarity' | 'game';
  status?: 'pending' | 'approved' | 'rejected';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  game?: 'ets2' | 'ats';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', status, rarity, game, children, ...props }, ref) => {
    let variantStyles = '';

    switch (variant) {
      case 'status':
        variantStyles = status ? getStatusColor(status) : '';
        break;
      case 'rarity':
        variantStyles = rarity ? `border-2 ${getRarityColor(rarity)}` : '';
        break;
      case 'game':
        variantStyles = game === 'ets2' 
          ? 'bg-[var(--ets2-primary)]/20 text-[var(--ets2-primary)] border border-[var(--ets2-primary)]'
          : 'bg-[var(--ats-primary)]/20 text-[var(--ats-primary)] border border-[var(--ats-primary)]';
        break;
      default:
        variantStyles = 'bg-background-tertiary text-foreground-muted border border-border';
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          variantStyles,
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
