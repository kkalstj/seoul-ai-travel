import { NextResponse } from 'next/server';

function getUltraBaseDateTime() {
  var now = new Date();
  var kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  
  var hour = kst.getUTCHours();
  var minute = kst.getUTCMinutes();
  
  if (minute < 40) {
    hour = hour - 1;
    if (hour < 0) {
      hour = 23;
      kst.setUTCDate(kst.getUTCDate() - 1);
    }
  }
  
  var year = kst.getUTCFullYear();
  var month = String(kst.getUTCMonth() + 1).padStart(2, '0');
  var day = String(kst.getUTCDate()).padStart(2, '0');
  var base_date = year + month + day;
  var base_time = String(hour).padStart(2, '0') + '00';
  
  return { base_date, base_time };
}

function getFcstBaseDateTime() {
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

    var ultra = getUltraBaseDateTime();
    var fcst = getFcstBaseDateTime();

    var ultraParams = new URLSearchParams({
      serviceKey: apiKey,
      pageNo: '1',
      numOfRows: '30',
      dataType: 'JSON',
      base_date: ultra.base_date,
      base_time: ultra.base_time,
      nx: '60',
      ny: '127',
    });

    var fcstParams = new URLSearchParams({
      serviceKey: apiKey,
      pageNo: '1',
      numOfRows: '100',
      dataType: 'JSON',
      base_date: fcst.base_date,
      base_time: fcst.base_time,
      nx: '60',
      ny: '127',
    });

    var [ultraRes, fcstRes] = await Promise.all([
      fetch('https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?' + ultraParams.toString(), { next: { revalidate: 600 } }),
      fetch('https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?' + fcstParams.toString(), { next: { revalidate: 1800 } }),
    ]);

    var ultraData = await ultraRes.json();
    var fcstData = await fcstRes.json();

    var ultraWeather: Record<string, string> = {};
    if (ultraData?.response?.body?.items?.item) {
      var ultraItems = ultraData.response.body.items.item;
      for (var i = 0; i < ultraItems.length; i++) {
        ultraWeather[ultraItems[i].category] = ultraItems[i].obsrValue;
      }
    }

    var fcstWeather: Record<string, string> = {};
    if (fcstData?.response?.body?.items?.item) {
      var fcstItems = fcstData.response.body.items.item;
      for (var j = 0; j < fcstItems.length; j++) {
        if (!fcstWeather[fcstItems[j].category]) {
          fcstWeather[fcstItems[j].category] = fcstItems[j].fcstValue;
        }
      }
    }

    var ptyCode = ultraWeather['PTY'] || '0';
    var sky = 'clear';
    if (ptyCode === '1' || ptyCode === '4') sky = 'rain';
    else if (ptyCode === '2') sky = 'sleet';
    else if (ptyCode === '3') sky = 'snow';
    else {
      var skyCode = fcstWeather['SKY'] || '1';
      if (skyCode === '3') sky = 'cloudy';
      else if (skyCode === '4') sky = 'overcast';
    }

    var result = {
      temperature: ultraWeather['T1H'] || fcstWeather['TMP'] || '--',
      sky: sky,
      humidity: ultraWeather['REH'] || fcstWeather['REH'] || '--',
      windSpeed: ultraWeather['WSD'] || fcstWeather['WSD'] || '--',
      pop: fcstWeather['POP'] || '0',
      date: ultra.base_date,
      time: ultra.base_time,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Weather API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
