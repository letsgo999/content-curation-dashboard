
import { GoogleGenAI, Type } from "@google/genai";
import type { Handler } from "@netlify/functions";
import * as cheerio from 'cheerio';

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
      return { statusCode: 400, body: JSON.stringify({ error: 'URL is required' }) };
    }

    const fetchResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!fetchResponse.ok) {
      return {
        statusCode: 422,
        body: JSON.stringify({ error: `URL을 가져오는 데 실패했습니다: ${fetchResponse.statusText}` })
      };
    }
    const html = await fetchResponse.text();
    const $ = cheerio.load(html);

    let extractedTitle = '';
    let extractedDescription = '';
    let extractedPublishDate = '';
    
    const hostname = new URL(url).hostname;

    // --- 플랫폼별 맞춤 스크래핑 로직 ---

    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      // Method 1: Most reliable - Parse structured data from ytInitialData
      try {
        const scriptTagHtml = $('script').filter((i, el) => {
          const scriptContent = $(el).html();
          return scriptContent?.includes('var ytInitialData =') || false;
        }).html();

        if (scriptTagHtml) {
          const jsonString = scriptTagHtml.substring(scriptTagHtml.indexOf('{'), scriptTagHtml.lastIndexOf('}') + 1);
          const ytData = JSON.parse(jsonString);
          const contents = ytData.contents?.twoColumnWatchNextResults?.results?.results?.contents;
          
          if (contents && Array.isArray(contents)) {
              const primaryInfo = contents.find((c: any) => c.videoPrimaryInfoRenderer)?.videoPrimaryInfoRenderer;
              const secondaryInfo = contents.find((c: any) => c.videoSecondaryInfoRenderer)?.videoSecondaryInfoRenderer;

              if (primaryInfo?.title?.runs) {
                extractedTitle = primaryInfo.title.runs.map((run: any) => run.text).join('');
              }

              if (secondaryInfo?.attributedDescription?.content) {
                  extractedDescription = secondaryInfo.attributedDescription.content;
              } else if (secondaryInfo?.description?.runs) {
                  extractedDescription = secondaryInfo.description.runs.map((run: any) => run.text).join('');
              }
          }
        }
      } catch (e) {
          console.error("YouTube JSON 파싱 실패:", e);
      }

      // Method 2 (Fallback): Use specific meta tags which are generally accurate
      if (!extractedTitle) {
          extractedTitle = $('meta[property="og:title"]').attr('content')?.trim();
      }
      if (!extractedDescription) {
          extractedDescription = $('meta[property="og:description"]').attr('content')?.trim();
      }
      // This meta tag is usually very reliable for the date in YYYY-MM-DD format.
      if (!extractedPublishDate) {
        extractedPublishDate = $('meta[itemprop="uploadDate"]').attr('content')?.trim() || '';
      }

    } else if (hostname.includes('kakao.com')) {
      extractedTitle = $('strong.tit_card').first().text().trim();
      extractedDescription = $('p.desc_card').first().text().trim();
    }

    // --- 일반 스크래핑 (폴백) ---
    if (!extractedTitle) {
      extractedTitle =
        $('meta[property="og:title"]').attr('content')?.trim() ||
        $('title').first().text()?.trim();
    }
    if (!extractedDescription) {
      extractedDescription =
        $('meta[property="og:description"]').attr('content')?.trim() ||
        $('meta[name="description"]').attr('content')?.trim();
    }

    // --- Gemini AI를 위한 본문 텍스트 정리 ---
    $('script, style, nav, footer, header, aside, form').remove();
    const bodyText = $('body').text().replace(/\s\s+/g, ' ').trim().slice(0, 3000);

    // --- Gemini AI 프롬프트 구성 ---
    const prompt = `
      URL "${url}"에서 아래와 같이 정보를 추출했습니다. 이 정보를 바탕으로 JSON 스키마에 맞춰 결과물을 생성해주세요.

      추출된 제목: "${extractedTitle || '없음'}"
      추출된 설명: "${(extractedDescription || '').slice(0, 1500) || '없음'}"
      ${extractedPublishDate ? `추출된 발행일: "${extractedPublishDate}"` : ''}
      추출된 본문 일부 (설명/날짜 보완용): "${bodyText}"

      지시사항:
      1.  **title**: '추출된 제목'을 최우선으로 사용하세요. 만약 이것이 비어있거나 "YouTube"처럼 너무 일반적인 경우, 본문 내용을 참고하여 더 적절한 제목을 만드세요.
      2.  **description**: '추출된 설명'을 최우선으로 사용하세요. 내용이 충분하다면 그대로 사용하고, 너무 길 경우 최대 250자 내외로 자연스럽게 요약하세요. '추출된 설명'이 없다면, '추출된 본문 일부'를 참고하여 새로 생성하세요.
      3.  **publishDate**: '추출된 발행일'이 있다면, 'YYYY-MM-DD' 형식으로 변환하여 사용하세요. 없다면, '추출된 본문 일부'에서 발행일을 찾아 'YYYY-MM-DD' 형식으로 변환해주세요. 날짜를 찾을 수 없다면 이 필드를 결과에 포함하지 마세요.

      오직 JSON 객체만 반환해야 합니다. 다른 설명은 절대 추가하지 마세요.
    `;

    // Gemini API 호출
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
