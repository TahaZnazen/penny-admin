'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import type { DashboardStats } from '@/lib/types';

interface PrizeStatusProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

export function PrizeStatus({ stats, isLoading }: PrizeStatusProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prize Pool Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const cycleStart = stats?.cycleStartAt ? new Date(stats.cycleStartAt) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Prize Pool Status
          <Badge variant="outline" className="ml-auto">
            Current Cycle
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Jackpots Remaining</span>
              <span className="text-2xl font-bold text-amber-500">
                {stats?.jackpotsRemaining ?? 0} / 2
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-amber-500 transition-all"
                style={{ width: `${((stats?.jackpotsRemaining ?? 0) / 2) * 100}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Penny Wins Remaining</span>
              <span className="text-2xl font-bold text-green-500">
                {stats?.pennyWinsRemaining ?? 0} / 3
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-green-500 transition-all"
                style={{ width: `${((stats?.pennyWinsRemaining ?? 0) / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
        {cycleStart && (
          <p className="mt-4 text-xs text-muted-foreground">
            Cycle started {formatDistanceToNow(cycleStart, { addSuffix: true })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
