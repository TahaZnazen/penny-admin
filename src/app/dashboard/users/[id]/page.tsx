'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, User, Wallet, Twitter, Copy, ExternalLink } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import type { User as UserType, GameSession, WinHistory } from '@/lib/types';

interface UserDetailsResponse {
  user: UserType;
  sessions: GameSession[];
  wins: WinHistory[];
}

function getStatusColor(status: string) {
  switch (status) {
    case 'won_jackpot':
      return 'bg-amber-500 text-white';
    case 'won_penny':
      return 'bg-green-500 text-white';
    case 'lost':
      return 'bg-red-500/20 text-red-600';
    case 'expired':
      return 'bg-muted text-muted-foreground';
    case 'pending':
      return 'bg-blue-500/20 text-blue-600';
    case 'spinning':
      return 'bg-purple-500/20 text-purple-600';
    case 'claimed':
      return 'bg-green-500/20 text-green-600';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [data, setData] = useState<UserDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const result = await response.json();

        if (response.ok) {
          setData(result);
        } else {
          toast.error('User not found');
          router.push('/dashboard/users');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast.error('Failed to load user details');
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchUserDetails();
    }
  }, [userId, router]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const claimedWins = data?.wins.filter((w) => w.claimed) || [];
  const unclaimedWins = data?.wins.filter((w) => !w.claimed) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { user, sessions, wins } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5" />
            </div>
            {user.telegram_username || `User ${user.telegram_id}`}
          </h1>
          <p className="text-muted-foreground">
            Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Profile Info and Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Telegram</span>
              </div>
              <div className="text-right">
                <p className="font-medium">{user.telegram_username || 'Not set'}</p>
                <p className="text-xs text-muted-foreground">ID: {user.telegram_id}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Twitter className="h-4 w-4" />
                <span>X (Twitter)</span>
              </div>
              <div>
                {user.x_username ? (
                  <a
                    href={`https://x.com/${user.x_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-500 hover:underline"
                  >
                    @{user.x_username}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">Not linked</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <span>Wallet Address</span>
              </div>
              {user.wallet_address ? (
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted px-2 py-1 text-xs break-all">
                    {user.wallet_address}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => copyToClipboard(user.wallet_address!, 'Wallet address')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <a
                    href={`https://solscan.io/account/${user.wallet_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              ) : (
                <p className="text-muted-foreground">Not set</p>
              )}
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Registered</span>
                <span>{format(new Date(user.created_at), 'PPP')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Spin</span>
                <span>
                  {user.last_spin_at
                    ? formatDistanceToNow(new Date(user.last_spin_at), { addSuffix: true })
                    : 'Never'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Spins</p>
                <p className="text-3xl font-bold">{user.total_spins}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Wins</p>
                <p className="text-3xl font-bold">{user.total_wins}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Penny Wins</p>
                <p className="text-3xl font-bold text-green-500">{user.total_penny_wins}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Jackpots</p>
                <p className="text-3xl font-bold text-amber-500">{user.total_jackpots}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Win Rate</span>
                <span className="font-medium">
                  {user.total_spins > 0
                    ? ((user.total_wins / user.total_spins) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${user.total_spins > 0 ? (user.total_wins / user.total_spins) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Claimed Wins</span>
                <Badge variant="default">{claimedWins.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unclaimed Wins</span>
                <Badge variant="secondary">{unclaimedWins.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Game History and Wins */}
      <Tabs defaultValue="games" className="space-y-4">
        <TabsList>
          <TabsTrigger value="games">Game History ({sessions.length})</TabsTrigger>
          <TabsTrigger value="wins">All Wins ({wins.length})</TabsTrigger>
          <TabsTrigger value="unclaimed">
            Unclaimed ({unclaimedWins.length})
            {unclaimedWins.length > 0 && (
              <span className="ml-1 h-2 w-2 rounded-full bg-red-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="claimed">Claimed ({claimedWins.length})</TabsTrigger>
        </TabsList>

        {/* Game History Tab */}
        <TabsContent value="games">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Game Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Used At</TableHead>
                    <TableHead>Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No games played yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                            {session.game_code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(session.created_at), 'PP p')}
                        </TableCell>
                        <TableCell>
                          {session.used_at
                            ? format(new Date(session.used_at), 'PP p')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {session.expires_at ? (
                            <span
                              className={
                                new Date(session.expires_at) < new Date()
                                  ? 'text-red-500'
                                  : ''
                              }
                            >
                              {formatDistanceToNow(new Date(session.expires_at), {
                                addSuffix: true,
                              })}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Wins Tab */}
        <TabsContent value="wins">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Won At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>TX Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No wins yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    wins.map((win) => (
                      <TableRow key={win.id}>
                        <TableCell>
                          <Badge
                            className={
                              win.win_type === 'jackpot'
                                ? 'bg-amber-500 text-white'
                                : 'bg-green-500 text-white'
                            }
                          >
                            {win.win_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(win.won_at), 'PP p')}</TableCell>
                        <TableCell>
                          <Badge variant={win.claimed ? 'default' : 'secondary'}>
                            {win.claimed ? 'Claimed' : 'Unclaimed'}
                          </Badge>
                          {win.claimed_at && (
                            <span className="block text-xs text-muted-foreground">
                              {format(new Date(win.claimed_at), 'PP')}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {win.reward_amount ? (
                            <span className="font-medium">{win.reward_amount}</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {win.reward_tx_hash ? (
                            <a
                              href={`https://solscan.io/tx/${win.reward_tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-500 hover:underline text-xs"
                            >
                              {win.reward_tx_hash.slice(0, 8)}...
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Unclaimed Wins Tab */}
        <TabsContent value="unclaimed">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Won At</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unclaimedWins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No unclaimed wins
                      </TableCell>
                    </TableRow>
                  ) : (
                    unclaimedWins.map((win) => (
                      <TableRow key={win.id}>
                        <TableCell>
                          <Badge
                            className={
                              win.win_type === 'jackpot'
                                ? 'bg-amber-500 text-white'
                                : 'bg-green-500 text-white'
                            }
                          >
                            {win.win_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(win.won_at), 'PP p')}</TableCell>
                        <TableCell>
                          {win.wallet_address || user.wallet_address ? (
                            <code className="text-xs">
                              {(win.wallet_address || user.wallet_address || '').slice(0, 4)}...
                              {(win.wallet_address || user.wallet_address || '').slice(-4)}
                            </code>
                          ) : (
                            <span className="text-red-500 text-sm">No wallet</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/wins?search=${user.telegram_username || user.telegram_id}`}>
                            <Button size="sm" variant="outline">
                              Manage in Wins
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claimed Wins Tab */}
        <TabsContent value="claimed">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Won At</TableHead>
                    <TableHead>Claimed At</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>TX Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claimedWins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No claimed wins yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    claimedWins.map((win) => (
                      <TableRow key={win.id}>
                        <TableCell>
                          <Badge
                            className={
                              win.win_type === 'jackpot'
                                ? 'bg-amber-500 text-white'
                                : 'bg-green-500 text-white'
                            }
                          >
                            {win.win_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(win.won_at), 'PP p')}</TableCell>
                        <TableCell>
                          {win.claimed_at ? format(new Date(win.claimed_at), 'PP p') : '-'}
                        </TableCell>
                        <TableCell>
                          {win.reward_amount ? (
                            <span className="font-medium">{win.reward_amount}</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {win.reward_tx_hash ? (
                            <a
                              href={`https://solscan.io/tx/${win.reward_tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-500 hover:underline text-xs"
                            >
                              {win.reward_tx_hash.slice(0, 8)}...
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
