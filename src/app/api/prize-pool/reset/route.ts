import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    const { data, error } = await supabase.rpc('reset_game_cycle');

    if (error) throw error;

    // Fetch updated state
    const { data: globalState, error: fetchError } = await supabase
      .from('global_state')
      .select('*')
      .eq('id', 1)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json({ success: true, state: globalState });
  } catch (error) {
    console.error('Error resetting game cycle:', error);
    return NextResponse.json(
      { error: 'Failed to reset game cycle' },
      { status: 500 }
    );
  }
}
