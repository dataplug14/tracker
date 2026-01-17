'use client';

import { cn } from '@/lib/utils/formatters';
import Image from 'next/image';

export interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rank?: number;
  className?: string;
}

export function Avatar({ src, alt, size = 'md', rank, className }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl',
  };

  // Get rank border color
  const getRankBorder = () => {
    if (!rank) return 'ring-border';
    if (rank === 1) return 'ring-[#ffd700]';
    if (rank === 2) return 'ring-[#c0c0c0]';
    if (rank === 3) return 'ring-[#cd7f32]';
    if (rank <= 10) return 'ring-[#00d4ff]';
    return 'ring-border';
  };

  // Get initials from alt text
  const getInitials = () => {
    const words = alt.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return alt.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={cn(
        'relative rounded-full ring-2 overflow-hidden bg-background-tertiary flex items-center justify-center',
        sizes[size],
        getRankBorder(),
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
        />
      ) : (
        <span className={cn('font-semibold text-foreground-muted', textSizes[size])}>
          {getInitials()}
        </span>
      )}
    </div>
  );
}
