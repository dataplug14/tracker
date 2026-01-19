'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/formatters';
import { Avatar } from '@/components/ui/Avatar';
import {
  LayoutDashboard,
  Truck,
  Package,
  Trophy,
  Users,
  Calendar,
  Award,
  Settings,
  Shield,
  ClipboardList,
  UserPlus,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Target,
  Monitor,
  Github,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const driverNav: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: 'My Jobs', href: '/jobs', icon: <Package className="w-5 h-5" /> },
      { label: 'My Garage', href: '/garage', icon: <Truck className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Community',
    items: [
      { label: 'Leaderboard', href: '/leaderboard', icon: <Trophy className="w-5 h-5" /> },
      { label: 'Convoys', href: '/convoys', icon: <Calendar className="w-5 h-5" /> },
      { label: 'Challenges', href: '/challenges', icon: <Target className="w-5 h-5" /> },
      { label: 'Achievements', href: '/achievements', icon: <Award className="w-5 h-5" /> },
    ],
  },
];

const adminNav: NavGroup = {
  title: 'Admin',
  items: [
    { label: 'Job Approvals', href: '/admin/jobs', icon: <ClipboardList className="w-5 h-5" /> },
    { label: 'New Convoy', href: '/admin/convoys/new', icon: <Calendar className="w-5 h-5" /> },
    { label: 'New Challenge', href: '/admin/challenges/new', icon: <Target className="w-5 h-5" /> },
    { label: 'Drivers', href: '/admin/drivers', icon: <Users className="w-5 h-5" /> },
    { label: 'Invites', href: '/admin/invites', icon: <UserPlus className="w-5 h-5" /> },
    { label: 'VTC Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
  ],
};

interface SidebarProps {
  user: {
    display_name: string;
    avatar_url?: string | null;
    role: 'owner' | 'manager' | 'driver';
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(pathname.startsWith('/admin'));

  const isManager = user.role === 'owner' || user.role === 'manager';

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'nav-item flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all',
          isActive && 'active'
        )}
        onClick={() => setIsMobileOpen(false)}
      >
        {item.icon}
        <span className="font-medium">{item.label}</span>
        {item.badge && (
          <span className="ml-auto bg-ets2 text-black text-xs font-bold px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ets2 to-ats flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">VTC Tracker</h1>
            <p className="text-xs text-foreground-muted">Job Management</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {driverNav.map((group, idx) => (
          <div key={idx}>
            {group.title && (
              <h3 className="text-xs font-semibold text-foreground-dim uppercase tracking-wider px-4 mb-2">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map(renderNavItem)}
            </div>
          </div>
        ))}

        {/* Admin Section */}
        {isManager && (
          <div>
            <button
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-foreground-dim uppercase tracking-wider hover:text-foreground-muted transition-colors"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {adminNav.title}
              </span>
              <ChevronDown className={cn('w-4 h-4 transition-transform', isAdminOpen && 'rotate-180')} />
            </button>
            {isAdminOpen && (
              <div className="space-y-1 mt-2">
                {adminNav.items.map(renderNavItem)}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar src={user.avatar_url} alt={user.display_name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{user.display_name}</p>
            <p className="text-xs text-foreground-muted capitalize">{user.role}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="https://github.com/dataplug14/tracker/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-foreground-muted hover:text-foreground bg-background-tertiary rounded-lg transition-colors"
            title="View Source on GitHub"
          >
            <Github className="w-4 h-4" />
          </Link>
          <Link
            href="/settings/device"
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-foreground-muted hover:text-foreground bg-background-tertiary rounded-lg transition-colors"
            title="Link Desktop App"
          >
            <Monitor className="w-4 h-4" />
          </Link>
          <Link
            href="/settings/profile"
            className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-foreground-muted hover:text-foreground bg-background-tertiary rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-foreground-muted hover:text-error bg-background-tertiary rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background-secondary rounded-lg border border-border"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-background-secondary border-r border-border flex flex-col transition-transform lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-foreground-muted hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        {sidebarContent}
      </aside>
    </>
  );
}
