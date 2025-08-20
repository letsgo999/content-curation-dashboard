import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ContentGrid from './components/ContentGrid';
import AddContentModal from './components/AddContentModal';
import { fetchContentItems, createContentItem, removeContentItem } from './services/contentService';
import type { ContentItem, Platform, SortOrder } from './types';

const App: React.FC = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Platform | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const getDetailedErrorMessage = (err: unknown, defaultMessage: string): string => {
    if (err instanceof Error) {
        try {
            // Error from service often is "API request failed: 500 {\"error\":\"...\"}"
            const jsonPart = err.message.substring(err.message.indexOf('{'));
            if (jsonPart) {
                const errorObj = JSON.parse(jsonPart);
                return errorObj.error || defaultMessage;
            }
        } catch (e) {
            // If parsing fails, return the original error message
            return err.message;
        }
        return err.message;
    }
    return defaultMessage;
  };


  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        const items = await fetchContentItems();
        setContentItems(items);
        setError(null);
      } catch (err) {
        const detailedError = getDetailedErrorMessage(err, '콘텐츠를 불러오는 데 실패했습니다.');
        setError(`오류: ${detailedError}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, []);

  const handleAddContent = useCallback(async (newItem: Omit<ContentItem, 'id'>) => {
    try {
      const addedItem = await createContentItem(newItem);
      setContentItems(prevItems => [addedItem, ...prevItems]);
    } catch (err) {
      const detailedError = getDetailedErrorMessage(err, '콘텐츠 추가에 실패했습니다. 다시 시도해주세요.');
      console.error("Failed to add content:", err);
      alert(`콘텐츠 추가 실패: ${detailedError}`);
    }
  }, []);

  const handleDeleteContent = useCallback(async (id: string) => {
    if (window.confirm('정말로 이 콘텐츠를 삭제하시겠습니까?')) {
      try {
        await removeContentItem(id);
        setContentItems(prevItems => prevItems.filter(item => item.id !== id));
      } catch (err) {
        const detailedError = getDetailedErrorMessage(err, '콘텐츠 삭제에 실패했습니다. 다시 시도해주세요.');
        console.error("Failed to delete content:", err);
        alert(`콘텐츠 삭제 실패: ${detailedError}`);
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
            isLoading={isLoading}
            error={error}
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
