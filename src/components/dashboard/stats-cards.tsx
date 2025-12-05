'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Gamepad2, Trophy, Target } from 'lucide-react';
import type { DashboardStats } from '@/lib/types';

interface StatsCardsProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      description: 'Registered users',
    },
    {
      title: 'Total Games',
      value: stats?.totalGames || 0,
      icon: Gamepad2,
      description: 'Games played all time',
    },
    {
      title: 'Total Wins',
      value: stats?.totalWins || 0,
      icon: Trophy,
      description: 'Total wins awarded',
    },
    {
      title: 'Cycle Spins',
      value: stats?.totalSpinsThisCycle || 0,
      icon: Target,
      description: 'Spins this cycle',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
