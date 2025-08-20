
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ContentGrid from './components/ContentGrid';
import AddContentModal from './components/AddContentModal';
import { INITIAL_CONTENT_ITEMS } from './constants';
import type { ContentItem, Platform, SortOrder } from './types';

const LOCAL_STORAGE_KEY = 'contentCurationItems';

const App: React.FC = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>(() => {
    try {
      const savedItems = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedItems ? JSON.parse(savedItems) : INITIAL_CONTENT_ITEMS;
    } catch (error) {
      console.error("Could not load content from local storage", error);
      return INITIAL_CONTENT_ITEMS;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Platform | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contentItems));
    } catch (error) {
      console.error("Could not save content to local storage", error);
    }
  }, [contentItems]);


  const handleAddContent = useCallback((newItem: Omit<ContentItem, 'id'>) => {
    const newContentItem: ContentItem = {
      ...newItem,
      id: new Date().getTime().toString(),
    };
    setContentItems(prevItems => [newContentItem, ...prevItems]);
  }, []);

  const handleDeleteContent = useCallback((id: string) => {
    if (window.confirm('정말로 이 콘텐츠를 삭제하시겠습니까?')) {
      setContentItems(prevItems => prevItems.filter(item => item.id !== id));
    }
  }, []);

  const handleShareContent = useCallback(async (url: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `이 콘텐츠를 확인해보세요: ${title}`,
          url: url,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(url).then(() => {
        alert('URL이 클립보드에 복사되었습니다.');
      }).catch(err => {
        console.error('Could not copy text: ', err);
        alert('URL 복사에 실패했습니다.');
      });
    }
  }, []);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') {
      return contentItems;
    }
    return contentItems.filter(item => item.platform === activeFilter);
  }, [contentItems, activeFilter]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const dateA = new Date(a.publishDate).getTime();
      const dateB = new Date(b.publishDate).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [filteredItems, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        onAddContent={() => setIsModalOpen(true)}
      />
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <ContentGrid 
            items={sortedItems} 
            onDelete={handleDeleteContent} 
            onShare={handleShareContent} 
        />
      </main>
      <AddContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddContent={handleAddContent}
      />
    </div>
  );
};

export default App;
