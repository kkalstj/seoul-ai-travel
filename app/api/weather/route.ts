import { NextResponse } from 'next/server';

function getBaseDateTime() {
  var now = new Date();
  var kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  
  var hour = kst.getUTCHours();
  var baseTimeMap = [2, 5, 8, 11, 14, 17, 20, 23];
  var baseHour = 23;
  
  for (var i = baseTimeMap.length - 1; i >= 0; i--) {
    if (hour >= baseTimeMap[i] + 1) {
      baseHour = baseTimeMap[i];
      break;
    }
  }
  
  if (hour < 3) {
    kst.setUTCDate(kst.getUTCDate() - 1);
    baseHour = 23;
  }
  
  var year = kst.getUTCFullYear();
  var month = String(kst.getUTCMonth() + 1).padStart(2, '0');
  var day = String(kst.getUTCDate()).padStart(2, '0');
  var base_date = year + month + day;
  var base_time = String(baseHour).padStart(2, '0') + '00';
  
  return { base_date, base_time };
}

export async function GET() {
  try {
    var apiKey = process.env.KMA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    var { base_date, base_time } = getBaseDateTime();
    
    var params = new URLSearchParams({
      serviceKey: apiKey,
      pageNo: '1',
      numOfRows: '100',
      dataType: 'JSON',
      base_date: base_date,
      base_time: base_time,
      nx: '60',
      ny: '127',
    });

    var url = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?' + params.toString();
    
    var response = await fetch(url, { next: { revalidate: 1800 } });
    var data = await response.json();

    if (!data.response || !data.response.body || !data.response.body.items) {
      return NextResponse.json({ error: 'No data from KMA', raw: data }, { status: 500 });
    }

    var items = data.response.body.items.item;
    
    var weather: Record<string, string> = {};
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!weather[item.category]) {
        weather[item.category] = item.fcstValue;
      }
    }

    var skyCode = weather['SKY'] || '1';
    var ptyCode = weather['PTY'] || '0';
    var sky = 'clear';
    if (ptyCode === '1' || ptyCode === '4') sky = 'rain';
    else if (ptyCode === '2') sky = 'sleet';
    else if (ptyCode === '3') sky = 'snow';
    else if (skyCode === '3') sky = 'cloudy';
    else if (skyCode === '4') sky = 'overcast';

    var result = {
      temperature: weather['TMP'] || weather['T1H'] || '--',
      sky: sky,
      humidity: weather['REH'] || '--',
      windSpeed: weather['WSD'] || '--',
      precipitation: weather['PCP'] || '없음',
      pop: weather['POP'] || '0',
      date: base_date,
      time: base_time,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Weather API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
