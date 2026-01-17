'use client';

import { Bell, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-foreground-muted">{subtitle}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Add Job */}
          <Link href="/jobs/new">
            <Button size="sm" className="hidden sm:flex">
              <Plus className="w-4 h-4 mr-2" />
              New Job
            </Button>
          </Link>

          {/* Search */}
          <button className="p-2 text-foreground-muted hover:text-foreground hover:bg-background-tertiary rounded-lg transition-colors">
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-foreground-muted hover:text-foreground hover:bg-background-tertiary rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-ets2 rounded-full pulse-alert" />
          </button>
        </div>
      </div>
    </header>
  );
}
