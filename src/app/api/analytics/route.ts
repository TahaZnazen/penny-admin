import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export async function GET() {
  try {
    const days = 30;
    const startDate = subDays(new Date(), days);

    // Get users registered per day
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', startDate.toISOString());

    if (usersError) throw usersError;

    // Get game sessions per day
    const { data: sessions, error: sessionsError } = await supabase
      .from('game_sessions')
      .select('created_at, status')
      .gte('created_at', startDate.toISOString());

    if (sessionsError) throw sessionsError;

    // Get wins per day
    const { data: wins, error: winsError } = await supabase
      .from('win_history')
      .select('won_at, win_type')
      .gte('won_at', startDate.toISOString());

    if (winsError) throw winsError;

    // Group by day
    const dailyStats: Record<string, { users: number; games: number; wins: number; jackpots: number; penny: number }> = {};

    for (let i = 0; i <= days; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      dailyStats[date] = { users: 0, games: 0, wins: 0, jackpots: 0, penny: 0 };
    }

    // Count users
    users?.forEach((user) => {
      const date = format(new Date(user.created_at), 'yyyy-MM-dd');
      if (dailyStats[date]) {
        dailyStats[date].users++;
      }
    });

    // Count games
    sessions?.forEach((session) => {
      const date = format(new Date(session.created_at), 'yyyy-MM-dd');
      if (dailyStats[date]) {
        dailyStats[date].games++;
      }
    });

    // Count wins
    wins?.forEach((win) => {
      const date = format(new Date(win.won_at), 'yyyy-MM-dd');
      if (dailyStats[date]) {
        dailyStats[date].wins++;
        if (win.win_type === 'jackpot') {
          dailyStats[date].jackpots++;
        } else {
          dailyStats[date].penny++;
        }
      }
    });

    // Convert to array and sort by date
    const chartData = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        ...stats,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get top winners
    const { data: topWinners, error: winnersError } = await supabase
      .from('users')
      .select('id, telegram_username, total_wins, total_penny_wins, total_jackpots')
      .order('total_wins', { ascending: false })
      .limit(10);

    if (winnersError) throw winnersError;

    // Calculate win rates
    const totalGames = sessions?.length || 0;
    const totalWins = wins?.length || 0;
    const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

    return NextResponse.json({
      chartData,
      topWinners: topWinners || [],
      summary: {
        totalGames,
        totalWins,
        winRate: winRate.toFixed(2),
        totalJackpots: wins?.filter((w) => w.win_type === 'jackpot').length || 0,
        totalPennyWins: wins?.filter((w) => w.win_type === 'penny').length || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
