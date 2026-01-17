'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Plus, Copy, Check, Trash2, Clock, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { formatDate, generateInviteCode } from '@/lib/utils/formatters';
import { createClient } from '@/lib/supabase/client';
import type { Invite } from '@/lib/types/database';

type InviteWithProfiles = Invite & {
  creator?: { display_name: string };
  user?: { display_name: string };
};

interface InvitesContentProps {
  invites: InviteWithProfiles[];
  userId: string;
}

export function InvitesContent({ invites, userId }: InvitesContentProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [maxUses, setMaxUses] = useState('1');
  const [expiryDays, setExpiryDays] = useState('7');
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const supabase = createClient();
      const code = generateInviteCode();
      const expiresAt = expiryDays ? new Date(Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000) : null;

      await supabase.from('invites').insert({
        code,
        created_by: userId,
        max_uses: parseInt(maxUses) || 1,
        expires_at: expiresAt?.toISOString() || null,
      });

      router.refresh();
    } catch (error) {
      console.error('Failed to create invite:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async (code: string) => {
    const url = `${window.location.origin}/register?invite=${code}`;
    await navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const supabase = createClient();
      await supabase.from('invites').delete().eq('id', id);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete invite:', error);
    } finally {
      setDeleting(null);
    }
  };

  const getStatus = (invite: InviteWithProfiles) => {
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return { label: 'Expired', class: 'badge-rejected' };
    }
    if (invite.max_uses && invite.use_count >= invite.max_uses) {
      return { label: 'Used', class: 'bg-foreground-dim/20 text-foreground-dim' };
    }
    return { label: 'Active', class: 'badge-approved' };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Create New Invite */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Plus className="w-5 h-5 inline mr-2" />
            Create New Invite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                Max Uses
              </label>
              <Input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                min="1"
                placeholder="1"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                Expires In (days)
              </label>
              <Input
                type="number"
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                min="1"
                placeholder="7"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreate} isLoading={creating}>
                <Ticket className="w-4 h-4 mr-2" />
                Generate Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invites List */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Ticket className="w-5 h-5 inline mr-2" />
            All Invites ({invites.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Code</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted hidden sm:table-cell">Created</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Uses</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground-muted">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-foreground-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => {
                const status = getStatus(invite);
                return (
                  <tr key={invite.id} className="table-row">
                    <td className="p-4">
                      <code className="text-sm bg-background-tertiary px-2 py-1 rounded text-ets2">
                        {invite.code}
                      </code>
                    </td>
                    <td className="p-4 text-foreground-muted hidden sm:table-cell">
                      <p>{formatDate(invite.created_at)}</p>
                      {invite.creator && (
                        <p className="text-xs">by {invite.creator.display_name}</p>
                      )}
                    </td>
                    <td className="p-4 text-foreground">
                      {invite.use_count} / {invite.max_uses || '∞'}
                    </td>
                    <td className="p-4">
                      <Badge className={status.class}>{status.label}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(invite.code)}
                        >
                          {copied === invite.code ? (
                            <Check className="w-4 h-4 text-success" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(invite.id)}
                          isLoading={deleting === invite.id}
                        >
                          <Trash2 className="w-4 h-4 text-error" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {invites.length === 0 && (
            <div className="text-center py-12 text-foreground-muted">
              <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No invites created yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
