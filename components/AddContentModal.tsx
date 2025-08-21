import React, { useState, useEffect } from 'react';
import { Platform, ContentItem } from '../types';
import { extractMetadataFromUrl } from '../services/geminiService';

type AddContentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddContent: (item: Omit<ContentItem, 'id'>) => Promise<void>;
};

const AddContentModal: React.FC<AddContentModalProps> = ({ isOpen, onClose, onAddContent }) => {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<Platform>(Platform.YouTube);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset form on close
      setUrl('');
      setPlatform(Platform.YouTube);
      setTitle('');
      setDescription('');
      setPublishDate(new Date().toISOString().split('T')[0]);
      setIsLoading(false);
      setIsSubmitting(false);
      setError('');
    }
  }, [isOpen]);

  const handleAnalyzeUrl = async () => {
    if (!url) {
      setError('콘텐츠 URL을 입력해주세요.');
      return;
    }
    setError('');
    setIsLoading(true);
    const metadata = await extractMetadataFromUrl(url);
    setTitle(metadata.title);
    setDescription(metadata.description);
    setPublishDate(metadata.publishDate);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !url) {
      setError('모든 필수 필드를 채워주세요.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      await onAddContent({
        url,
        platform,
        title,
        description,
        publishDate,
        views: 0,
        likes: 0,
        rating: 0,
        author: '신규'
      });
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const detectPlatformFromUrl = (inputUrl: string) => {
    try {
      const hostname = new URL(inputUrl).hostname;
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        setPlatform(Platform.YouTube);
      } else if (hostname.includes('facebook.com')) {
        setPlatform(Platform.Facebook);
      } else if (hostname.includes('kakao.com')) {
        setPlatform(Platform.KakaoTalk);
      } else if (hostname.includes('sonet.kr')) {
        setPlatform(Platform.Blog);
      }
    } catch (e) {
      // Invalid URL, do nothing
    }
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    detectPlatformFromUrl(newUrl);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">새 콘텐츠 추가</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">콘텐츠 URL (URL만 입력하면 자동 정보 가져오기!)</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={handleUrlChange}
                  className="flex-1 block w-full rounded-none rounded-l-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
                <button
                  type="button"
                  onClick={handleAnalyzeUrl}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-l-0 border-blue-600 bg-blue-600 text-white rounded-r-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : "자동 분석"}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700">플랫폼 (자동 감지)</label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value={Platform.YouTube}>유튜브</option>
                <option value={Platform.Facebook}>페이스북</option>
                <option value={Platform.KakaoTalk}>카카오톡</option>
                <option value={Platform.Blog}>블로그</option>
              </select>
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">제목 (자동 추출)</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" required />
              <button type="button" className="text-xs text-blue-600 hover:underline mt-1">수동 편집</button>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">설명 (자동 추출)</label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                required
              />
              <button type="button" className="text-xs text-blue-600 hover:underline mt-1">수동 편집</button>
            </div>
            <div>
              <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700">발행일</label>
              <input
                type="date"
                id="publishDate"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                 <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                        콘텐츠가 추가되면 독자들이 직접 조회 및 좋아요 버튼을 클릭할 수 있습니다. 이 데이터를 기반으로 실제 관심도를 측정하여 인기도 점수가 자동으로 계산됩니다.
                        </p>
                    </div>
                </div>
            </div>
            {error && <p className="mt-2 text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              취소
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-28 bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isSubmitting ? (
                 <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>추가 중...</span>
                </>
              ) : '추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContentModal;
