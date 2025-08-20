
import { GoogleGenAI, Type } from "@google/genai";
import type { Handler } from "@netlify/functions";
import * as cheerio from 'cheerio';

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
      description: "기사, 비디오 또는 게시물의 기본 제목입니다. 간결하고 정확해야 합니다."
    },
    description: {
      type: Type.STRING,
      description: "콘텐츠에 대한 간략한 요약으로, 미리보기 카드에 적합합니다. 약 150-250자 정도여야 합니다."
    },
    publishDate: {
      type: Type.STRING,
      description: "콘텐츠의 원본 발행일입니다. 'YYYY-MM-DD' 형식으로 엄격하게 지정해야 합니다."
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

    // 1단계: URL에서 HTML 콘텐츠 가져오기
    const fetchResponse = await fetch(url, {
      headers: {
        // 일부 웹사이트는 봇을 차단하므로 일반적인 브라우저 User-Agent를 사용합니다.
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!fetchResponse.ok) {
      return {
        statusCode: 422, // Unprocessable Entity
        body: JSON.stringify({ error: `URL을 가져오는 데 실패했습니다: ${fetchResponse.statusText}` })
      };
    }
    const html = await fetchResponse.text();

    // 2단계: Cheerio를 사용하여 HTML을 파싱하고 우선순위에 따라 메타데이터 추출하기
    const $ = cheerio.load(html);
    
    // 우선순위: Open Graph > 일반 메타 태그 > 제목/H1 태그
    const title =
      $('meta[property="og:title"]').attr('content')?.trim() ||
      $('title').first().text()?.trim() ||
      $('h1').first().text()?.trim();

    // 우선순위: Open Graph > 일반 메타 태그
    const description =
      $('meta[property="og:description"]').attr('content')?.trim() ||
      $('meta[name="description"]').attr('content')?.trim();
    
    // 분석에 불필요한 태그들을 제거하여 본문 텍스트의 품질을 높입니다.
    $('script, style, nav, footer, header, aside, form').remove(); 
    const bodyText = $('body').text().replace(/\s\s+/g, ' ').trim().slice(0, 4000); // API 비용과 성능을 위해 텍스트 크기를 제한합니다.

    // 3단계: 추출된 콘텐츠로 프롬프트 구성하기
    const prompt = `
      아래는 URL "${url}"에서 추출한 정보입니다. 이 내용을 분석하여 JSON 스키마에 따라 한국어로 정보를 제공해주세요.

      추출된 제목: "${title || '없음'}"
      추출된 설명: "${description || '없음'}"
      추출된 본문 일부: "${bodyText}"

      위 내용을 바탕으로 다음 작업을 수행해주세요:
      1.  **title**: 추출된 제목이 유효하고 완전한지 검토하고, 필요한 경우 본문 내용을 참고하여 더 나은 제목으로 수정하거나 생성해주세요.
      2.  **description**: 추출된 설명을 바탕으로 150-250자 내외의 간결하고 매력적인 요약을 생성해주세요. 원본 설명이 이미 훌륭하다면 그대로 사용해도 좋습니다.
      3.  **publishDate**: 본문 내용에서 발행일을 찾아 'YYYY-MM-DD' 형식으로 변환해주세요. 날짜를 찾을 수 없다면 이 필드를 결과에 포함하지 마세요. 일반적인 날짜 형식("YYYY년 MM월 DD일", "YYYY.MM.DD", "MMMM DD, YYYY" 등)을 찾아보세요.

      오직 JSON 객체만 반환해야 합니다. 추가적인 설명이나 코멘트는 포함하지 마세요.
    `;

    // 4단계: Gemini API 호출
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
    console.error("Gemini 프록시 함수 오류:", error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '요청 처리 실패.', details: errorMessage }),
    };
  }
};

export { handler };
