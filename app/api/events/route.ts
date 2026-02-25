import { NextResponse } from 'next/server';

export async function GET() {
  try {
    var apiKey = process.env.SEOUL_DATA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    var today = new Date();
    var year = today.getFullYear();
    var month = String(today.getMonth() + 1).padStart(2, '0');
    var day = String(today.getDate()).padStart(2, '0');
    var todayStr = year + '-' + month + '-' + day;

    var url = 'http://openapi.seoul.go.kr:8088/' + apiKey + '/json/culturalEventInfo/1/20/';

    var response = await fetch(url, { next: { revalidate: 3600 } });
    var data = await response.json();

    if (!data.culturalEventInfo || !data.culturalEventInfo.row) {
      return NextResponse.json({ events: [] });
    }

    var events = data.culturalEventInfo.row
      .filter(function(event: any) {
        return event.END_DATE >= todayStr;
      })
      .sort(function(a: any, b: any) {
        return a.STRTDATE > b.STRTDATE ? 1 : -1;
      })
      .slice(0, 10)
      .map(function(event: any) {
        return {
          title: event.TITLE || '',
          category: event.CODENAME || '',
          place: event.PLACE || '',
          startDate: event.STRTDATE ? event.STRTDATE.split(' ')[0] : '',
          endDate: event.END_DATE ? event.END_DATE.split(' ')[0] : '',
          isFree: event.IS_FREE || '',
          link: event.ORG_LINK || event.HMPG_ADDR || '',
          image: event.MAIN_IMG || '',
        };
      });

    return NextResponse.json({ events: events });
  } catch (error: any) {
    console.error('Events API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
