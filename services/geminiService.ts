import { GoogleGenAI } from "@google/genai";
import type { ContentItem } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume the key is present.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

type ExtractedMetadata = Pick<ContentItem, 'title' | 'description' | 'publishDate'>;

export const extractMetadataFromUrl = async (url: string): Promise<ExtractedMetadata> => {
  try {
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
    const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/);
    
    let parsedJson;
    if (jsonMatch && jsonMatch[1]) {
        try {
            parsedJson = JSON.parse(jsonMatch[1]);
        } catch (e) {
            console.error("Failed to parse JSON from model response:", e);
            try {
                parsedJson = JSON.parse(textResponse);
            } catch (e2) {
                console.error("Failed to parse the whole response string as JSON:", e2);
                parsedJson = {};
            }
        }
    } else {
        try {
            parsedJson = JSON.parse(textResponse);
        } catch(e) {
            console.error("Response is not a JSON markdown block and not a valid JSON string:", e);
            parsedJson = {};
        }
    }
    
    return {
        title: parsedJson.title || '제목을 찾을 수 없습니다',
        description: parsedJson.description || '설명을 찾을 수 없습니다',
        publishDate: parsedJson.publishDate || new Date().toISOString().split('T')[0],
    };

  } catch (error) {
    console.error("Error fetching metadata from Gemini API:", error);
    return {
      title: '메타데이터 분석 실패',
      description: 'URL을 분석하는 중 오류가 발생했습니다. 직접 내용을 입력해주세요.',
      publishDate: new Date().toISOString().split('T')[0],
    };
  }
};
