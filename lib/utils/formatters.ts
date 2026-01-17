import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

export function formatCurrency(amount: number, game: 'ets2' | 'ats' = 'ets2'): string {
  const symbol = game === 'ats' ? '$' : '€';
  return `${symbol}${formatNumber(amount)}`;
}

export function formatDistance(km: number): string {
  return `${formatNumber(km)} km`;
}

export function formatDamage(percent: number): string {
  return `${percent.toFixed(1)}%`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function getRankBadge(rank: number): { label: string; className: string } {
  if (rank === 1) return { label: '🥇', className: 'rank-gold' };
  if (rank === 2) return { label: '🥈', className: 'rank-silver' };
  if (rank === 3) return { label: '🥉', className: 'rank-bronze' };
  if (rank <= 10) return { label: `#${rank}`, className: 'rank-diamond' };
  if (rank <= 25) return { label: `#${rank}`, className: 'rank-gold' };
  if (rank <= 50) return { label: `#${rank}`, className: 'rank-silver' };
  return { label: `#${rank}`, className: 'rank-bronze' };
}

export function getStatusColor(status: 'pending' | 'approved' | 'rejected'): string {
  switch (status) {
    case 'pending':
      return 'badge-pending';
    case 'approved':
      return 'badge-approved';
    case 'rejected':
      return 'badge-rejected';
    default:
      return '';
  }
}

export function getRarityColor(rarity: 'common' | 'rare' | 'epic' | 'legendary'): string {
  switch (rarity) {
    case 'common':
      return 'rarity-common';
    case 'rare':
      return 'rarity-rare';
    case 'epic':
      return 'rarity-epic';
    case 'legendary':
      return 'rarity-legendary';
    default:
      return '';
  }
}

export function getGameColors(game: 'ets2' | 'ats'): { primary: string; glow: string } {
  return game === 'ets2'
    ? { primary: 'var(--ets2-primary)', glow: 'glow-ets2' }
    : { primary: 'var(--ats-primary)', glow: 'glow-ats' };
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
