import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    var locale = request.nextUrl.searchParams.get('locale') || 'ko';

    var { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('locale', locale)
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) throw error;

    return NextResponse.json({ articles: data || [] });
  } catch (error: any) {
    console.error('Articles fetch error:', error);
    return NextResponse.json({ articles: [] });
  }
}
