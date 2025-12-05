import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const winType = searchParams.get('winType') || '';
    const claimed = searchParams.get('claimed');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('win_history')
      .select('*, users(telegram_username, wallet_address)', { count: 'exact' });

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

    // Pagination and ordering
    query = query
      .order('won_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      wins: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error fetching wins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wins' },
      { status: 500 }
    );
  }
}
