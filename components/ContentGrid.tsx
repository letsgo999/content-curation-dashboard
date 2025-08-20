import React from 'react';
import type { ContentItem } from '../types';
import ContentCard from './ContentCard';

type ContentGridProps = {
  items: ContentItem[];
  isLoading: boolean;
  error: string | null;
  onDelete: (id: string) => void;
  onShare: (url: string, title: string) => void;
};

const ContentGrid: React.FC<ContentGridProps> = ({ items, isLoading, error, onDelete, onShare }) => {
  if (isLoading) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold text-gray-700">콘텐츠를 불러오는 중...</h3>
        <p className="text-gray-500 mt-2">잠시만 기다려주세요.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-red-50 p-6 rounded-lg max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold text-red-700">오류가 발생했습니다</h3>
        <p className="mt-4 text-left whitespace-pre-wrap break-words bg-red-100 p-4 rounded-md font-mono text-sm text-red-900">
          {error}
        </p>
        <p className="text-gray-600 mt-6 text-sm">
            <b>해결 방법:</b> Netlify 프로젝트 설정의 <b>Environment variables</b> 메뉴에서, 위 오류 메시지에 보이는 
            <code>AIRTABLE_BASE_ID</code>와 <code>AIRTABLE_TABLE_NAME</code> 값이 실제 Airtable의 값과 일치하는지 다시 한번 확인해주세요.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold text-gray-700">표시할 콘텐츠가 없습니다.</h3>
        <p className="text-gray-500 mt-2">필터를 변경하거나 새로운 콘텐츠를 추가해보세요.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <ContentCard key={item.id} item={item} onDelete={onDelete} onShare={onShare} />
      ))}
    </div>
  );
};

export default ContentGrid;
