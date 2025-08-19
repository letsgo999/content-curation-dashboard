import { GoogleGenAI } from "@google/genai";
import type { Handler } from "@netlify/functions";

// Netlify 환경 변수에서 API 키를 안전하게 가져옵니다.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const handler: Handler = async (event) => {
  // POST 요청만 허용합니다.
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { url } = JSON.parse(event.body || '{}');
    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL is required' }),
      };
    }

    const prompt = `주어진 URL(${url})의 웹페이지를 분석하여 다음 정보를 JSON 형식으로 추출해 주세요.

-   **title**: 웹페이지의 <title> 태그에 있는 정확한 텍스트.
-   **description**: <meta property="og:description"> 또는 <meta name="description"> 태그의 내용. 요약하지 말고 그대로 가져오세요.
-   **publishDate**: 콘텐츠 발행일. 'YYYY-MM-DD' 형식으로 변환해주세요.

응답은 반드시 아래와 같은 JSON 객체 형식이어야 합니다. 다른 설명은 추가하지 마세요.
\`\`\`json
{
  "title": "추출된 제목",
  "description": "추출된 설명",
  "publishDate": "YYYY-MM-DD"
}
\`\`\`
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    let textResponse = response.text.trim();
    // 모델이 응답을 마크다운 코드 블록으로 감싸는 경우가 많으므로, JSON만 추출합니다.
    const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/);
    
    let parsedJson;
    if (jsonMatch && jsonMatch[1]) {
        parsedJson = JSON.parse(jsonMatch[1]);
    } else {
        // 코드 블록이 없는 순수 JSON 응답일 경우를 대비합니다.
        parsedJson = JSON.parse(textResponse);
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsedJson),
    };

  } catch (error) {
    console.error("Error in geminiProxy function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request with Gemini API.' }),
    };
  }
};
