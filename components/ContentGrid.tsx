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
      <div className="text-center py-16 bg-red-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-red-700">오류가 발생했습니다</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <p className="text-gray-500 mt-4 text-sm">잠시 후 다시 시도해주시거나 관리자에게 문의하세요.</p>
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
