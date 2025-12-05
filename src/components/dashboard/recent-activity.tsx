'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import type { GameSession, WinHistory } from '@/lib/types';

interface RecentActivityProps {
  sessions: GameSession[];
  wins: WinHistory[];
  isLoading: boolean;
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
    case 'claimed':
      return 'bg-purple-500/20 text-purple-600';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function RecentActivity({ sessions, wins, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Wins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Recent Games</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            <div className="space-y-1 p-4 pt-0">
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No recent games
                </p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {session.users?.telegram_username || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {session.game_code}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Wins</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            <div className="space-y-1 p-4 pt-0">
              {wins.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No recent wins
                </p>
              ) : (
                wins.map((win) => (
                  <div
                    key={win.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {win.telegram_username || win.users?.telegram_username || 'Unknown User'}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          win.win_type === 'jackpot'
                            ? 'border-amber-500 text-amber-500'
                            : 'border-green-500 text-green-500'
                        }
                      >
                        {win.win_type}
                      </Badge>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={win.claimed ? 'default' : 'secondary'}>
                        {win.claimed ? 'Claimed' : 'Unclaimed'}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(win.won_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
