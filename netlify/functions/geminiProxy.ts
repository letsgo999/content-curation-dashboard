import { GoogleGenAI, Type } from "@google/genai";
import type { Handler } from "@netlify/functions";

// API 키는 Netlify 환경 변수에서 안전하게 로드됩니다.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "The main title of the article, video, or post. Be concise and accurate."
    },
    description: {
      type: Type.STRING,
      description: "A brief summary of the content, suitable for a preview card. Around 150-250 characters."
    },
    publishDate: {
      type: Type.STRING,
      description: "The original publication date of the content. Format it strictly as 'YYYY-MM-DD'."
    }
  },
  required: ["title", "description"]
};


const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { url } = JSON.parse(event.body || '{}');
    if (!url) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'URL is required' }) 
      };
    }

    const prompt = `주어진 URL(${url})의 웹페이지 콘텐츠를 분석하여 다음 정보를 한국어로 추출해 주세요.

1.  **제목 (title)**:
    - HTML의 <title> 태그에 있는 텍스트를 그대로 가져옵니다.

2.  **설명 (description)**:
    - 1순위: <meta property="og:description"> 태그의 'content' 속성 값을 추출합니다.
    - 2순위: 위 태그가 없을 경우, <meta name="description"> 태그의 'content' 속성 값을 추출합니다.
    - 3순위: 두 태그 모두 없을 경우, 페이지 본문 내용의 첫 부분을 요약하여 150-250자 내외의 설명을 생성합니다.

3.  **발행일 (publishDate)**:
    - 페이지 내에서 콘텐츠가 게시된 날짜를 찾습니다. "게시일", "발행일", "게시자" 등의 키워드 주변 텍스트나, <time> 태그, 또는 <meta property="article:published_time"> 과 같은 메타데이터를 확인합니다.
    - "8월 3, 2025"와 같은 형식의 날짜를 찾으면 반드시 'YYYY-MM-DD' 형식(예: '2025-08-03')으로 변환해야 합니다.
    - 정확한 날짜를 식별할 수 없는 경우, 이 필드를 결과에 포함하지 마세요.

추출된 정보는 반드시 제공된 JSON 스키마 형식에 맞게 반환해야 합니다.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const textResponse = response.text.trim();
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: textResponse,
    };

  } catch (error) {
    console.error("Error in Gemini Proxy function:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request.', details: errorMessage }),
    };
  }
};

export { handler };
