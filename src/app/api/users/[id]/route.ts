import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError) throw userError;

    // Get user's game sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (sessionsError) throw sessionsError;

    // Get user's win history
    const { data: wins, error: winsError } = await supabase
      .from('win_history')
      .select('*')
      .eq('user_id', id)
      .order('won_at', { ascending: false });

    if (winsError) throw winsError;

    return NextResponse.json({
      user,
      sessions: sessions || [],
      wins: wins || [],
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}
