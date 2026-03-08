import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    var { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // 1. 사용자 관련 데이터 삭제
    await supabaseAdmin.from('reviews').delete().eq('user_id', userId);
    await supabaseAdmin.from('favorites').delete().eq('user_id', userId);
    await supabaseAdmin.from('course_places').delete().in(
      'course_id',
      (await supabaseAdmin.from('courses').select('id').eq('user_id', userId)).data?.map(function(c: any) { return c.id; }) || []
    );
    await supabaseAdmin.from('courses').delete().eq('user_id', userId);
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    // 2. Auth 사용자 삭제
    var { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
