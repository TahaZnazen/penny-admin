import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const winType = searchParams.get('winType') || '';
    const claimed = searchParams.get('claimed');

    let query = supabase
      .from('win_history')
      .select('*, users(telegram_username, wallet_address)');

    // Search filter
    if (search) {
      query = query.or(
        `telegram_username.ilike.%${search}%,wallet_address.ilike.%${search}%,telegram_id.eq.${!isNaN(Number(search)) ? search : 0}`
      );
    }

    // Filter by win type
    if (winType) {
      query = query.eq('win_type', winType);
    }

    // Filter by claimed status
    if (claimed === 'true') {
      query = query.eq('claimed', true);
    } else if (claimed === 'false') {
      query = query.eq('claimed', false);
    }

    query = query.order('won_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    // Generate CSV
    const headers = [
      'ID',
      'Win Type',
      'Username',
      'Telegram ID',
      'Wallet Address',
      'Won At',
      'Claimed',
      'Claimed At',
      'Reward Amount',
      'TX Hash',
    ];

    const rows = (data || []).map((win) => [
      win.id,
      win.win_type,
      win.telegram_username || win.users?.telegram_username || '',
      win.telegram_id,
      win.wallet_address || win.users?.wallet_address || '',
      format(new Date(win.won_at), 'yyyy-MM-dd HH:mm:ss'),
      win.claimed ? 'Yes' : 'No',
      win.claimed_at ? format(new Date(win.claimed_at), 'yyyy-MM-dd HH:mm:ss') : '',
      win.reward_amount || '',
      win.reward_tx_hash || '',
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="win_history_${format(new Date(), 'yyyyMMdd')}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting wins:', error);
    return NextResponse.json(
      { error: 'Failed to export wins' },
      { status: 500 }
    );
  }
}
