import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { txHash, amount } = await request.json();

    const { data, error } = await supabase
      .from('win_history')
      .update({
        claimed: true,
        claimed_at: new Date().toISOString(),
        reward_tx_hash: txHash || null,
        reward_amount: amount || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, win: data });
  } catch (error) {
    console.error('Error claiming win:', error);
    return NextResponse.json(
      { error: 'Failed to claim win' },
      { status: 500 }
    );
  }
}
