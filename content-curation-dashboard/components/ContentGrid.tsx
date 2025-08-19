import React from 'react';
import type { ContentItem } from '../types';
import ContentCard from './ContentCard';

type ContentGridProps = {
  items: ContentItem[];
  onDelete: (id: string) => void;
  onShare: (url: string, title: string) => void;
};

const ContentGrid: React.FC<ContentGridProps> = ({ items, onDelete, onShare }) => {
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
