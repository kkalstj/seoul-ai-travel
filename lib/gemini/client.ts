import { GoogleGenerativeAI } from '@google/generative-ai';

// 서버 사이드에서만 사용 (API Route에서 호출)
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  return new GoogleGenerativeAI(apiKey);
}

export async function generateRecommendation(
  prompt: string,
  placesContext: string
) {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const systemPrompt = `당신은 서울 여행 전문 AI 가이드입니다.
사용자의 요청에 맞는 여행 코스를 추천해주세요.

아래는 추천에 사용할 수 있는 실제 장소 데이터입니다:
${placesContext}

응답 규칙:
1. 반드시 위 데이터에 있는 장소만 추천하세요.
2. 각 장소의 id를 반드시 포함하세요.
3. 아래 JSON 형식으로 응답하세요:

{
  "title": "코스 제목",
  "description": "코스 설명",
  "days": [
    {
      "day": 1,
      "theme": "테마",
      "places": [
        {
          "id": "장소 UUID",
          "name": "장소명",
          "type": "restaurant|accommodation|attraction",
          "time": "09:00",
          "duration": "1시간",
          "tip": "방문 팁"
        }
      ]
    }
  ]
}`;

  const result = await model.generateContent([systemPrompt, prompt]);
  const response = result.response;
  return response.text();
}