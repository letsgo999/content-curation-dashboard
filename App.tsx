import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ContentGrid from './components/ContentGrid';
import AddContentModal from './components/AddContentModal';
import { fetchContentItems, addContentItem, deleteContentItem } from './services/airtableService';
import type { ContentItem, Platform, SortOrder } from './types';

const App: React.FC = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Platform | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const items = await fetchContentItems();
        setContentItems(items);
      } catch (err) {
        console.error("Failed to load content from Airtable:", err);
        setError("콘텐츠를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, []);

  const handleAddContent = useCallback(async (newItem: Omit<ContentItem, 'id'>) => {
    try {
      const addedItem = await addContentItem(newItem);
      setContentItems(prevItems => [addedItem, ...prevItems]);
    } catch (err) {
        console.error("Failed to add content:", err);
        alert("콘텐츠 추가에 실패했습니다.");
    }
  }, []);

  const handleDeleteContent = useCallback(async (id: string) => {
    if (window.confirm('정말로 이 콘텐츠를 삭제하시겠습니까?')) {
      try {
        await deleteContentItem(id);
        setContentItems(prevItems => prevItems.filter(item => item.id !== id));
      } catch (err) {
        console.error("Failed to delete content:", err);
        alert("콘텐츠 삭제에 실패했습니다.");
      }
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
  
  const renderContent = () => {
    if (isLoading) {
        return <div className="text-center py-16 text-gray-500">콘텐츠를 불러오는 중입니다...</div>;
    }
    if (error) {
        return <div className="text-center py-16 text-red-500">{error}</div>;
    }
    return <ContentGrid items={sortedItems} onDelete={handleDeleteContent} onShare={handleShareContent} />;
  }

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
        {renderContent()}
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
