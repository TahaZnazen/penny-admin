import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get recent game sessions with user info
    const { data: recentSessions, error: sessionsError } = await supabase
      .from('game_sessions')
      .select('*, users(telegram_username)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (sessionsError) throw sessionsError;

    // Get recent wins
    const { data: recentWins, error: winsError } = await supabase
      .from('win_history')
      .select('*, users(telegram_username)')
      .order('won_at', { ascending: false })
      .limit(5);

    if (winsError) throw winsError;

    // Get recent users
    const { data: recentUsers, error: usersError } = await supabase
      .from('users')
      .select('id, telegram_username, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (usersError) throw usersError;

    return NextResponse.json({
      recentSessions: recentSessions || [],
      recentWins: recentWins || [],
      recentUsers: recentUsers || [],
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}
