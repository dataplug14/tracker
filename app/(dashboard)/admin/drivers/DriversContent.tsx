'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Shield, Search, Package, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatDate } from '@/lib/utils/formatters';
import { createClient } from '@/lib/supabase/client';
import type { Profile, UserRoleRecord } from '@/lib/types/database';

type DriverWithRole = Profile & {
  role?: Pick<UserRoleRecord, 'role' | 'is_active'>[];
};

interface DriversContentProps {
  drivers: DriverWithRole[];
  jobCountMap: Record<string, number>;
}

export function DriversContent({ drivers, jobCountMap }: DriversContentProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch = !search || 
      d.display_name.toLowerCase().includes(search.toLowerCase());
    
    const driverRole = d.role?.[0]?.role || 'driver';
    const matchesRole = roleFilter === 'all' || driverRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const supabase = createClient();
      await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);
      router.refresh();
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    setUpdating(userId);
    try {
      const supabase = createClient();
      await supabase
        .from('user_roles')
        .update({ is_active: !isActive })
        .eq('user_id', userId);
      router.refresh();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-dim" />
          <Input
            placeholder="Search drivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          options={[
            { value: 'all', label: 'All Roles' },
            { value: 'driver', label: 'Drivers' },
            { value: 'manager', label: 'Managers' },
            { value: 'owner', label: 'Owners' },
          ]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        />
      </div>

      {/* Drivers Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Driver</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted hidden sm:table-cell">Joined</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted hidden md:table-cell">Jobs</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Role</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-foreground-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver) => {
                const role = driver.role?.[0]?.role || 'driver';
                const isActive = driver.role?.[0]?.is_active ?? true;
                const jobCount = jobCountMap[driver.id] || 0;

                return (
                  <tr key={driver.id} className="table-row">
                    <td className="p-4">
                      <Link 
                        href={`/driver/${driver.id}`}
                        className="flex items-center gap-3 hover:opacity-80"
                      >
                        <Avatar
                          src={driver.avatar_url}
                          alt={driver.display_name}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-foreground">{driver.display_name}</p>
                          {driver.truckers_mp_id && (
                            <p className="text-xs text-foreground-muted">TMP: {driver.truckers_mp_id}</p>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="p-4 text-foreground-muted hidden sm:table-cell">
                      {formatDate(driver.created_at)}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-foreground">
                        <Package className="w-4 h-4 text-foreground-muted" />
                        {jobCount}
                      </div>
                    </td>
                    <td className="p-4">
                      <Select
                        options={[
                          { value: 'driver', label: 'Driver' },
                          { value: 'manager', label: 'Manager' },
                          { value: 'owner', label: 'Owner' },
                        ]}
                        value={role}
                        onChange={(e) => handleRoleChange(driver.id, e.target.value)}
                        disabled={updating === driver.id}
                        className="w-28"
                      />
                    </td>
                    <td className="p-4">
                      <Badge className={isActive ? 'badge-approved' : 'badge-rejected'}>
                        {isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(driver.id, isActive)}
                          disabled={updating === driver.id}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Link href={`/driver/${driver.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredDrivers.length === 0 && (
            <div className="text-center py-12 text-foreground-muted">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No drivers found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
