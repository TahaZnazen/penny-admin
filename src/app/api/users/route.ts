import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const hasWallet = searchParams.get('hasWallet');
    const hasX = searchParams.get('hasX');
    const activeRecently = searchParams.get('activeRecently');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Search filter
    if (search) {
      query = query.or(
        `telegram_username.ilike.%${search}%,x_username.ilike.%${search}%,wallet_address.ilike.%${search}%`
      );
    }

    // Has wallet filter
    if (hasWallet === 'true') {
      query = query.not('wallet_address', 'is', null);
    }

    // Has X account filter
    if (hasX === 'true') {
      query = query.not('x_username', 'is', null);
    }

    // Active in last 7 days filter
    if (activeRecently === 'true') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query = query.gte('last_spin_at', sevenDaysAgo.toISOString());
    }

    // Pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      users: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
