import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Vercel Cron 인증 확인
    var authHeader = request.headers.get('authorization');
    if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 아티클 생성 API 호출
    var res = await fetch(new URL('/api/articles/generate', request.url).toString(), {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.CRON_SECRET,
      },
    });

    var data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
