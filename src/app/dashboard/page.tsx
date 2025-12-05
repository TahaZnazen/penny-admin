'use client';

import { useEffect, useState } from 'react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { PrizeStatus } from '@/components/dashboard/prize-status';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import type { DashboardStats, GameSession, WinHistory } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [wins, setWins] = useState<WinHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/recent-activity'),
        ]);

        const statsData = await statsRes.json();
        const activityData = await activityRes.json();

        if (statsRes.ok) {
          setStats(statsData);
        }

        if (activityRes.ok) {
          setSessions(activityData.recentSessions || []);
          setWins(activityData.recentWins || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Penny Slot Bot activity
        </p>
      </div>

      <StatsCards stats={stats} isLoading={isLoading} />

      <PrizeStatus stats={stats} isLoading={isLoading} />

      <RecentActivity sessions={sessions} wins={wins} isLoading={isLoading} />
    </div>
  );
}
