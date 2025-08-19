import type { ContentItem } from '../types';

type ExtractedMetadata = Pick<ContentItem, 'title' | 'description' | 'publishDate'>;

export const extractMetadataFromUrl = async (url: string): Promise<ExtractedMetadata> => {
  try {
    const response = await fetch('/.netlify/functions/geminiProxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
       const errorBody = await response.text();
       console.error("Proxy function error response:", errorBody);
       throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      title: data.title || '제목을 찾을 수 없습니다',
      description: data.description || '설명을 찾을 수 없습니다',
      publishDate: data.publishDate || new Date().toISOString().split('T')[0],
    };
  } catch (error) {
    console.error("Error fetching metadata from proxy:", error);
    // Return a default error object
    return {
      title: '메타데이터 분석 실패',
      description: 'URL을 분석하는 중 오류가 발생했습니다. 직접 내용을 입력해주세요.',
      publishDate: new Date().toISOString().split('T')[0],
    };
  }
};
