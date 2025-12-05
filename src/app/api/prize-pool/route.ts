import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('global_state')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching global state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global state' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const updates = await request.json();

    const { data, error } = await supabase
      .from('global_state')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating global state:', error);
    return NextResponse.json(
      { error: 'Failed to update global state' },
      { status: 500 }
    );
  }
}
