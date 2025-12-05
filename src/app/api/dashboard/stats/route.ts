import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get total games count (sum of all user spins)
    const { data: gamesData, error: gamesError } = await supabase
      .from('users')
      .select('total_spins');

    if (gamesError) throw gamesError;

    const totalGames = gamesData?.reduce((sum, user) => sum + (user.total_spins || 0), 0) || 0;

    // Get total wins count
    const { count: totalWins, error: winsError } = await supabase
      .from('win_history')
      .select('*', { count: 'exact', head: true });

    if (winsError) throw winsError;

    // Get global state
    const { data: globalState, error: globalError } = await supabase
      .from('global_state')
      .select('*')
      .eq('id', 1)
      .single();

    if (globalError) throw globalError;

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalGames,
      totalWins: totalWins || 0,
      jackpotsRemaining: globalState?.jackpots_remaining || 0,
      pennyWinsRemaining: globalState?.penny_wins_remaining || 0,
      cycleStartAt: globalState?.cycle_start_at || new Date().toISOString(),
      totalSpinsThisCycle: globalState?.total_spins_this_cycle || 0,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
