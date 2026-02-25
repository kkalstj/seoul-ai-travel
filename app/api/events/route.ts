import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

var genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

var translationCache: Record<string, any[]> = {};

async function translateEvents(events: any[], locale: string) {
  if (locale === 'ko') return events;

  var cacheKey = locale + '_' + events.map(function(e) { return e.title; }).join('|');
  if (translationCache[cacheKey]) return translationCache[cacheKey];

  try {
    var langMap: Record<string, string> = {
      en: 'English',
      ja: 'Japanese',
      zh: 'Simplified Chinese',
    };

    var targetLang = langMap[locale] || 'English';

    var eventsText = events.map(function(e, i) {
      return i + '|' + e.title + '|' + e.category + '|' + e.place;
    }).join('\n');

    var model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    var prompt = 'Translate the following Korean event data to ' + targetLang + '. Each line has format: index|title|category|place. Return ONLY the translated lines in the exact same format. Do not add any explanation.\n\n' + eventsText;

    var result = await model.generateContent(prompt);
    var responseText = result.response.text().trim();
    var lines = responseText.split('\n');

    var translated = events.map(function(event, i) {
      var line = lines[i];
      if (line) {
        var parts = line.split('|');
        if (parts.length >= 4) {
          return {
            ...event,
            title: parts[1].trim(),
            category: parts[2].trim(),
            place: parts[3].trim(),
          };
        }
      }
      return event;
    });

    translationCache[cacheKey] = translated;
    return translated;
  } catch (err) {
    console.error('Translation error:', err);
    return events;
  }
}

export async function GET(request: Request) {
  try {
    var apiKey = process.env.SEOUL_DATA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    var url = new URL(request.url);
    var locale = url.searchParams.get('locale') || 'ko';

    var today = new Date();
    var year = today.getFullYear();
    var month = String(today.getMonth() + 1).padStart(2, '0');
    var day = String(today.getDate()).padStart(2, '0');
    var todayStr = year + '-' + month + '-' + day;

    var apiUrl = 'http://openapi.seoul.go.kr:8088/' + apiKey + '/json/culturalEventInfo/1/20/';

    var response = await fetch(apiUrl, { next: { revalidate: 3600 } });
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

    var translatedEvents = await translateEvents(events, locale);

    return NextResponse.json({ events: translatedEvents });
  } catch (error: any) {
    console.error('Events API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
